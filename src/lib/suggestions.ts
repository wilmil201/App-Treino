import type { Anamnese, AthleteProfile, LiftCategory, NivelExperiencia, ObjetivoTreino, Workout } from './types'
import type { CicloOndulatorio } from './dates'
import { getBestRecord, getLastFeedbackForCategory, getLiftSessions } from './calculations'
import { getExerciseSessions, getLastFeedbackForExercise } from './exerciseHistory'
import { estimateOneRepMax, loadForTarget } from './rpeChart'

function round25(v: number): number {
  return Math.round(v / 2.5) * 2.5
}

/** Motivos de não-conclusão que indicam sobrecarga real (a carga/volume estava acima do que o corpo aguentava). */
const OVERLOAD_MOTIVOS = new Set(['fadiga', 'carga_pesada'])

/**
 * Faixas de repetições/RPE/descanso por objetivo de treino — diretrizes padrão de
 * prescrição de força e condicionamento (linha NSCA/ACSM), não um valor inventado.
 * Servem só de orientação para a série de calibração; não determinam uma carga.
 */
const GUIDANCE_BY_OBJETIVO: Record<ObjetivoTreino, { repRange: string; rpeRange: string; descanso: string }> = {
  forca: { repRange: '3–6', rpeRange: '8–9', descanso: '3–5 min' },
  hipertrofia: { repRange: '8–12', rpeRange: '7–9', descanso: '60–90s' },
  resistencia: { repRange: '15–20', rpeRange: '6–8', descanso: '30–45s' },
  emagrecimento: { repRange: '12–15', rpeRange: '6–8', descanso: '30–45s (priorize densidade de treino)' },
  performance_esportiva: { repRange: '6–10', rpeRange: '7–8', descanso: '60–90s (priorize qualidade/velocidade do movimento)' },
}

/** Mesmas faixas de GUIDANCE_BY_OBJETIVO, em número — usadas pra de fato calcular a
 * progressão (reps-alvo, incremento de dupla progressão), não só exibir num texto. */
const REP_RANGE_BY_OBJETIVO: Record<ObjetivoTreino, [number, number]> = {
  forca: [3, 6],
  hipertrofia: [8, 12],
  resistencia: [15, 20],
  emagrecimento: [12, 15],
  performance_esportiva: [6, 10],
}

/** Centro da faixa de RPE de cada objetivo — usado como referência da onda ondulatória
 * de 4 semanas (em vez de uma única onda universal igual pra todo mundo). */
const OBJETIVO_RPE_CENTER: Record<ObjetivoTreino, number> = {
  forca: 8.5,
  hipertrofia: 8,
  resistencia: 7,
  emagrecimento: 7,
  performance_esportiva: 7.5,
}

/** Deslocamento da onda ondulatória de 4 semanas em relação ao centro de RPE do
 * objetivo — mesma forma de onda pra todo objetivo (acumulação leve → moderada →
 * intensificação → deload), só recentrada. */
const WEEK_RPE_OFFSET: Record<1 | 2 | 3 | 4, number> = { 1: -1, 2: -0.25, 3: 0.25, 4: -2 }

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v))
}

/** Reps-alvo real do atleta, puxado gentilmente pra dentro da faixa do objetivo quando
 * ele sai muito fora dela — nunca inventa um esquema, só evita ficar preso num número
 * de reps que não serve mais ao objetivo declarado (ex.: objetivo é força mas o
 * atleta vinha fazendo 12 reps porque era isso que o programa antigo pedia). */
function clampRepsToObjetivo(actualReps: number, objetivo: ObjetivoTreino | undefined): number {
  if (!objetivo) return actualReps
  const [min, max] = REP_RANGE_BY_OBJETIVO[objetivo]
  return clamp(actualReps, min, max)
}

const OBJETIVO_LABEL: Record<ObjetivoTreino, string> = {
  forca: 'força',
  hipertrofia: 'hipertrofia',
  resistencia: 'resistência muscular / condicionamento',
  emagrecimento: 'emagrecimento',
  performance_esportiva: 'performance esportiva',
}

const NIVEL_HINT: Record<NivelExperiencia, string> = {
  iniciante: 'comece com a menor carga disponível (barra vazia ou menor anilha)',
  intermediario: 'comece com uma carga moderada, próxima da que usa em exercícios parecidos',
  avancado: 'pode iniciar mais perto do que estima suportar, ajustando pela técnica',
}

/**
 * Protocolo de calibração: a orientação correta quando não existe NENHUM dado (nem
 * sessão registrada, nem anamnese) para um exercício. Nunca inventa uma carga —
 * define como o atleta deve calibrar na própria sessão, com faixa de reps/RPE
 * tecnicamente fundamentada no objetivo declarado.
 */
function buildCalibrationNote(profile: AthleteProfile | undefined): string {
  if (!profile) {
    return 'Sem carga de referência ainda. Comece leve e suba a carga a cada série até a última ficar exigente mas com técnica limpa (RPE ~7–8) — preencha sua ficha de anamnese em Programa (objetivo, esporte e nível) para receber uma faixa de repetições ajustada ao seu caso.'
  }
  const g = GUIDANCE_BY_OBJETIVO[profile.objetivo]
  return `Sem carga de referência ainda. Protocolo de calibração (objetivo: ${OBJETIVO_LABEL[profile.objetivo]}): ${
    NIVEL_HINT[profile.nivel]
  } e suba a cada série até a última ficar exigente mas com técnica limpa — mire ${g.repRange} repetições, RPE ${g.rpeRange}, descanso de ${g.descanso}. Anote a carga usada: a próxima sugestão parte daí.`
}

/** RPE alvo numérico de cada semana do ciclo ondulatório quando não há objetivo declarado
 * (fallback universal — some assim que a anamnese tiver o objetivo preenchido). */
const WEEK_TARGET_RPE_FALLBACK: Record<1 | 2 | 3 | 4, number> = { 1: 7, 2: 7.75, 3: 8.25, 4: 6 }

/** RPE-alvo da semana do ciclo ondulatório, centrado no objetivo declarado na anamnese
 * (força pede RPE mais alto que resistência, por exemplo) — sem objetivo, usa a onda
 * universal de antes. */
function resolveTargetRpe(week: 1 | 2 | 3 | 4, objetivo: ObjetivoTreino | undefined): number {
  if (!objetivo) return WEEK_TARGET_RPE_FALLBACK[week]
  if (week === 4) return 6 // deload é sempre leve, independente de objetivo
  return clamp(OBJETIVO_RPE_CENTER[objetivo] + WEEK_RPE_OFFSET[week], 6, 9.5)
}

/** RPE assumido ao converter a carga declarada na anamnese em 1RM estimado — a
 * anamnese só pergunta "carga x reps que você já consegue fazer", sem pedir RPE,
 * então assumimos um esforço desafiador-mas-não-máximo (RPE 8) como padrão razoável. */
const ANAMNESE_ASSUMED_RPE = 8

function norm(name: string): string {
  return name.trim().toLowerCase()
}

export interface LiftSuggestion {
  category: LiftCategory
  hasHistory: boolean
  /** Não há carga alguma (nem sessão, nem anamnese) — a nota é um protocolo de calibração, não uma sugestão numérica. */
  isCalibration?: boolean
  isDeload: boolean
  suggestedLoad: number | null
  /** Reps-alvo do cálculo — sempre o número de reps que o atleta realmente faz nesse levantamento (última sessão ou anamnese), nunca um esquema inventado. */
  reps?: number
  note: string
  basedOn?: { date: string; load: number; reps: number; rpe: number }
}

/**
 * Sugestão de carga para a próxima sessão de um levantamento principal.
 *
 * Duas mudanças-chave em relação à versão anterior:
 *
 * 1. O 1RM usado no cálculo vem da SESSÃO MAIS RECENTE (recalculado a cada vez a
 *    partir do último top set real), não do maior e1RM de toda a história. Usar o
 *    pico histórico prendia a sugestão num número congelado — como o ciclo
 *    ondulatório de 4 semanas repete os mesmos RPEs-alvo, a carga sugerida acabava
 *    repetindo a cada 4 semanas em vez de evoluir. Recalcular a partir do mais
 *    recente é a prática padrão de autorregulação por RPE (RTS/Tuchscherer): seu
 *    1RM "de agora" é o que a última sessão realmente mostrou.
 * 2. O RPE-alvo da semana e a faixa de reps agora vêm do objetivo declarado na
 *    anamnese (força pede RPE mais alto e reps mais baixas que resistência, por
 *    exemplo) — antes o objetivo só era usado uma vez, no texto de calibração, e
 *    nunca mais influenciava o cálculo.
 *
 * Camada de segurança que sempre pode ANULAR a matemática pra baixo (nunca pra
 * cima): RPE 10 real em agachamento/terra, feedback de não-conclusão por fadiga/
 * carga pesada/dor — o feedback manda mais que a fórmula. Quando a sessão foi
 * "limpa" (sem nenhum desses sinais) mas a fórmula sugeriria repetir ou cair a
 * carga, aplicamos um piso mínimo de sobrecarga progressiva — sessão limpa sempre
 * anda pra frente, nunca fica parada.
 */
export function suggestMainLift(category: LiftCategory, workouts: Workout[], ciclo: CicloOndulatorio, anamnese?: Anamnese): LiftSuggestion {
  const sessions = getLiftSessions(workouts, category)
  const lastFeedback = getLastFeedbackForCategory(workouts, category)
  const objetivo = anamnese?.profile?.objetivo
  const targetRpe = resolveTargetRpe(ciclo.semana, objetivo)

  const bestRecord = getBestRecord(workouts, category)
  const baseline = anamnese?.mainLifts[category]

  if (!bestRecord && !baseline) {
    return {
      category,
      hasHistory: false,
      isCalibration: true,
      isDeload: ciclo.isDeload,
      suggestedLoad: null,
      note: buildCalibrationNote(anamnese?.profile),
    }
  }

  if (!sessions.length) {
    // Ainda sem sessão real: 1RM vem da anamnese (assumindo RPE 8, já que ela não pergunta RPE).
    const oneRepMax = estimateOneRepMax(baseline!.load, baseline!.reps, ANAMNESE_ASSUMED_RPE)
    const targetReps = clampRepsToObjetivo(baseline!.reps, objetivo)
    const suggestedLoad = loadForTarget(oneRepMax, targetReps, ciclo.isDeload ? 6 : targetRpe)
    return {
      category,
      hasHistory: true,
      isDeload: ciclo.isDeload,
      suggestedLoad,
      reps: targetReps,
      note: `1RM estimado: ${Math.round(oneRepMax)}kg (baseado na sua ficha de anamnese: ${baseline!.load}kg x${baseline!.reps}). Semana ${
        ciclo.semana
      }/4${ciclo.isDeload ? ' (deload)' : ''}: carga calculada para ${targetReps} reps @ RPE ${
        ciclo.isDeload ? 6 : targetRpe
      }. Assim que você registrar uma sessão real, o 1RM passa a vir dela.`,
    }
  }

  const last = sessions[sessions.length - 1]
  const basedOn = { date: last.date, load: last.topSet.load, reps: last.topSet.reps, rpe: last.topSet.rpe }

  // 1RM "de agora": recalculado a partir do top set mais recente, não do pico histórico.
  const oneRepMax = estimateOneRepMax(last.topSet.load, last.topSet.reps, last.topSet.rpe)
  const oneRepMaxSource = `1RM estimado: ${Math.round(oneRepMax)}kg (a partir da sua última sessão, ${last.date}: ${last.topSet.load}kg x${
    last.topSet.reps
  } @ RPE ${last.topSet.rpe})${bestRecord && bestRecord.e1rm > oneRepMax ? ` · seu recorde é ${Math.round(bestRecord.e1rm)}kg, em ${bestRecord.date}` : ''}`

  const targetReps = clampRepsToObjetivo(last.topSet.reps, objetivo)

  let suggestedLoad = loadForTarget(oneRepMax, targetReps, ciclo.isDeload ? 6 : targetRpe)
  let note = `${oneRepMaxSource}. Semana ${ciclo.semana}/4${ciclo.isDeload ? ' (deload)' : ''}: carga calculada para ${targetReps} reps @ RPE ${
    ciclo.isDeload ? 6 : targetRpe
  }.`

  if (ciclo.isDeload) {
    // Camada de segurança extra no deload: nunca ultrapassa a última carga real usada.
    suggestedLoad = Math.min(suggestedLoad, last.topSet.load)
    return { category, hasHistory: true, isDeload: true, suggestedLoad, reps: targetReps, note, basedOn }
  }

  const rpe10naFalha = (category === 'agachamento' || category === 'terra') && last.topSet.rpe >= 10
  const naoCompletou = lastFeedback && lastFeedback.date === last.date && !lastFeedback.feedback.completou
  const overload = naoCompletou && OVERLOAD_MOTIVOS.has(lastFeedback!.feedback.motivo ?? '')
  const dor = naoCompletou && lastFeedback!.feedback.motivo === 'dor'

  if (rpe10naFalha) {
    suggestedLoad = Math.min(suggestedLoad, last.topSet.load)
    note = `Carga limitada: última sessão (${last.topSet.load}kg) chegou à falha real (RPE 10). Priorize técnica antes de subir — ${oneRepMaxSource}.`
  } else if (overload) {
    suggestedLoad = Math.min(suggestedLoad, last.topSet.load)
    note = `Você não completou todas as séries na última sessão (${last.topSet.load}kg) por ${
      lastFeedback!.feedback.motivo === 'fadiga' ? 'fadiga' : 'carga pesada'
    }. Mantenha a mesma carga ou reduza antes de tentar subir de novo.`
  } else if (dor) {
    suggestedLoad = Math.min(suggestedLoad, last.topSet.load)
    note = 'Você relatou dor na última sessão. Mantenha a carga e avalie trocar por um substituto — veja o alerta no Painel.'
  } else if (suggestedLoad <= last.topSet.load) {
    // Sessão limpa (sem sinal de sobrecarga/dor/falha) mas a fórmula sugeriria repetir
    // ou cair a carga — aplica um piso mínimo de progressão. Sessão limpa sempre anda
    // pra frente; é isso que evita a sugestão ficar "replicando" o treino anterior.
    suggestedLoad = round25(last.topSet.load + 2.5)
    note = `${oneRepMaxSource}. Sessão anterior limpa (sem sobrecarga, sem dor) — aplicando progressão mínima sobre os ${last.topSet.load}kg da última vez.`
  }

  return { category, hasHistory: true, isDeload: false, suggestedLoad, reps: targetReps, note, basedOn }
}

export interface AccessorySuggestion {
  hasHistory: boolean
  /** Não há carga alguma (nem sessão, nem anamnese) — a nota é um protocolo de calibração, não uma sugestão numérica. */
  isCalibration?: boolean
  suggestedLoad: number | null
  reps?: number
  note: string
  basedOn?: { date: string; load: number; reps: number; rpe: number }
}

/** Faixa de reps e RPE-alvo padrão quando não há objetivo declarado na anamnese —
 * hipertrofia geral é o default mais razoável pra trabalho acessório sem contexto. */
const DEFAULT_ACCESSORY_RANGE: [number, number] = [8, 12]
const DEFAULT_ACCESSORY_RPE_CENTER = 8

/**
 * Dupla progressão real: dentro da faixa de reps do objetivo, primeiro sobe reps
 * mantendo a carga; ao bater o topo da faixa com RPE controlado, sobe a carga e
 * volta pro fundo da faixa. É a mesma lógica que a versão anterior descrevia mas
 * não aplicava de fato — antes, RPE 7–9 (a faixa mais comum de trabalho) sempre
 * resultava em "mantenha", então a sugestão nunca evoluía sessão após sessão.
 */
function progressAccessory(
  last: { load: number; reps: number; rpe: number },
  objetivo: ObjetivoTreino | undefined,
): { load: number; reps: number; note: string } {
  const [min, max] = objetivo ? REP_RANGE_BY_OBJETIVO[objetivo] : DEFAULT_ACCESSORY_RANGE
  const rpeCenter = objetivo ? OBJETIVO_RPE_CENTER[objetivo] : DEFAULT_ACCESSORY_RPE_CENTER
  const increment = last.load >= 40 ? 2.5 : 1.25

  if (last.rpe > rpeCenter + 1.5) {
    return {
      load: last.load,
      reps: Math.max(min, last.reps - 1),
      note: `RPE bem acima do alvo (${last.rpe}) na última sessão (${last.load}kg x${last.reps}) — mantenha a carga, reduza um pouco as reps se precisar.`,
    }
  }

  if (last.reps < max) {
    return {
      load: last.load,
      reps: last.reps + 1,
      note: `Dentro do alvo na última sessão (${last.load}kg x${last.reps}) — suba para ${last.reps + 1} reps mantendo a carga.`,
    }
  }

  const nextLoad = round25(last.load + increment)
  return {
    load: nextLoad,
    reps: min,
    note: `Bateu o topo da faixa (${last.reps} reps) com técnica na última sessão (${last.load}kg) — sobe a carga para ${nextLoad}kg e volta para ${min} reps.`,
  }
}

/** Sugestão de carga/reps pra exercícios acessórios, com dupla progressão real
 * dentro da faixa de reps do objetivo declarado na anamnese, e sempre respeitando
 * o feedback dado ao finalizar o exercício (não completou/dor = não sobe). */
export function suggestAccessory(exerciseName: string, workouts: Workout[], anamnese?: Anamnese): AccessorySuggestion {
  const sessions = getExerciseSessions(workouts, exerciseName)
  const lastFeedback = getLastFeedbackForExercise(workouts, exerciseName)
  const objetivo = anamnese?.profile?.objetivo

  if (sessions.length === 0) {
    const baseline = anamnese?.accessories[norm(exerciseName)]
    if (!baseline) {
      return { hasHistory: false, isCalibration: true, suggestedLoad: null, note: buildCalibrationNote(anamnese?.profile) }
    }
    return {
      hasHistory: true,
      suggestedLoad: baseline.load,
      reps: baseline.reps,
      note: `Baseado na sua ficha de anamnese (${baseline.load}kg x${baseline.reps}). Assim que você registrar uma sessão real, a sugestão passa a se basear nela.`,
    }
  }

  const last = sessions[sessions.length - 1]
  const basedOn = { date: last.date, load: last.load, reps: last.reps, rpe: last.rpe }

  if (lastFeedback && lastFeedback.date === last.date && !lastFeedback.feedback.completou) {
    if (OVERLOAD_MOTIVOS.has(lastFeedback.feedback.motivo ?? '')) {
      return {
        hasHistory: true,
        suggestedLoad: last.load,
        reps: last.reps,
        note: `Você não completou as séries planejadas na última sessão (${
          lastFeedback.feedback.motivo === 'fadiga' ? 'fadiga' : 'carga pesada'
        }). Mantenha a mesma carga e reps.`,
        basedOn,
      }
    }
    if (lastFeedback.feedback.motivo === 'dor') {
      return {
        hasHistory: true,
        suggestedLoad: last.load,
        reps: last.reps,
        note: 'Você relatou dor na última sessão. Mantenha a carga e avalie trocar por um substituto.',
        basedOn,
      }
    }
  }

  const progression = progressAccessory(last, objetivo)
  return { hasHistory: true, suggestedLoad: progression.load, reps: progression.reps, note: progression.note, basedOn }
}
