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

/** RPE alvo numérico de cada semana do ciclo ondulatório — usado na tabela de %1RM. */
const WEEK_TARGET_RPE: Record<1 | 2 | 3 | 4, number> = { 1: 7, 2: 7.75, 3: 8.25, 4: 6 }

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
 * Calculada a partir do 1RM real do atleta (o melhor e1RM já registrado em
 * qualquer sessão — nunca um número inventado) usando a tabela de %1RM por
 * RPE x reps (Tuchscherer/RTS): dado o 1RM, o número de reps que o atleta
 * de fato faz no levantamento e o RPE alvo da semana do ciclo ondulatório,
 * a carga é calculada, não chutada.
 *
 * Duas camadas de segurança sempre podem ANULAR a matemática pra baixo
 * (nunca pra cima): (1) se a última sessão chegou a RPE 10 num agachamento
 * ou terra, a carga fica travada na última usada; (2) se o atleta relatou
 * não ter completado por fadiga, carga pesada ou dor, a sugestão nunca sobe
 * em relação à última carga real usada — o feedback manda mais que a fórmula.
 */
export function suggestMainLift(category: LiftCategory, workouts: Workout[], ciclo: CicloOndulatorio, anamnese?: Anamnese): LiftSuggestion {
  const sessions = getLiftSessions(workouts, category)
  const lastFeedback = getLastFeedbackForCategory(workouts, category)
  const targetRpe = WEEK_TARGET_RPE[ciclo.semana]

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

  // 1RM: prioriza o melhor e1RM já registrado (dado real); só usa a anamnese
  // (assumindo RPE 8, já que ela não pergunta RPE) enquanto não há sessão nenhuma.
  const oneRepMax = bestRecord ? bestRecord.e1rm : estimateOneRepMax(baseline!.load, baseline!.reps, ANAMNESE_ASSUMED_RPE)
  const oneRepMaxSource = bestRecord
    ? `1RM estimado: ${Math.round(oneRepMax)}kg (seu melhor e1RM registrado, em ${bestRecord.date})`
    : `1RM estimado: ${Math.round(oneRepMax)}kg (baseado na sua ficha de anamnese: ${baseline!.load}kg x${baseline!.reps})`

  // Reps-alvo: o número de reps que o atleta realmente faz nesse levantamento
  // (última sessão, ou o declarado na anamnese) — nunca um esquema inventado.
  const targetReps = sessions.length > 0 ? sessions[sessions.length - 1].topSet.reps : baseline!.reps

  if (!sessions.length) {
    const suggestedLoad = loadForTarget(oneRepMax, targetReps, ciclo.isDeload ? 6 : targetRpe)
    return {
      category,
      hasHistory: true,
      isDeload: ciclo.isDeload,
      suggestedLoad,
      reps: targetReps,
      note: `${oneRepMaxSource}. Semana ${ciclo.semana}/4${ciclo.isDeload ? ' (deload)' : ''}: carga calculada para ${targetReps} reps @ RPE ${
        ciclo.isDeload ? 6 : targetRpe
      }. Assim que você registrar uma sessão real, o 1RM passa a vir dela.`,
    }
  }

  const last = sessions[sessions.length - 1]
  const basedOn = { date: last.date, load: last.topSet.load, reps: last.topSet.reps, rpe: last.topSet.rpe }

  let suggestedLoad = loadForTarget(oneRepMax, targetReps, ciclo.isDeload ? 6 : targetRpe)
  let note = `${oneRepMaxSource}. Semana ${ciclo.semana}/4${ciclo.isDeload ? ' (deload)' : ''}: carga calculada para ${targetReps} reps @ RPE ${
    ciclo.isDeload ? 6 : targetRpe
  }.`

  if (ciclo.isDeload) {
    // Camada de segurança extra no deload: nunca ultrapassa a última carga real usada.
    suggestedLoad = Math.min(suggestedLoad, last.topSet.load)
    return { category, hasHistory: true, isDeload: true, suggestedLoad, reps: targetReps, note, basedOn }
  }

  if ((category === 'agachamento' || category === 'terra') && last.topSet.rpe >= 10) {
    suggestedLoad = Math.min(suggestedLoad, last.topSet.load)
    note = `Carga limitada: última sessão (${last.topSet.load}kg) chegou à falha real (RPE 10). Priorize técnica antes de subir — ${oneRepMaxSource}.`
  }

  // O feedback do atleta manda mais do que a matemática do RPE: se ele disse
  // que não completou por fadiga/carga pesada, a sugestão nunca sobe.
  if (lastFeedback && lastFeedback.date === last.date && !lastFeedback.feedback.completou) {
    if (OVERLOAD_MOTIVOS.has(lastFeedback.feedback.motivo ?? '')) {
      suggestedLoad = Math.min(suggestedLoad, last.topSet.load)
      note = `Você não completou todas as séries na última sessão (${last.topSet.load}kg) por ${
        lastFeedback.feedback.motivo === 'fadiga' ? 'fadiga' : 'carga pesada'
      }. Mantenha a mesma carga ou reduza antes de tentar subir de novo.`
    } else if (lastFeedback.feedback.motivo === 'dor') {
      suggestedLoad = Math.min(suggestedLoad, last.topSet.load)
      note = `Você relatou dor na última sessão. Mantenha a carga e avalie trocar por um substituto — veja o alerta no Painel.`
    }
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

/** Progressão dupla simples: parte sempre da carga que o atleta realmente usou por último,
 * e também respeita o feedback dado ao finalizar o exercício (não completou = não sobe). */
export function suggestAccessory(exerciseName: string, workouts: Workout[], anamnese?: Anamnese): AccessorySuggestion {
  const sessions = getExerciseSessions(workouts, exerciseName)
  const lastFeedback = getLastFeedbackForExercise(workouts, exerciseName)

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
  let delta = 0
  let note: string
  if (last.rpe <= 7) {
    delta = last.load >= 40 ? 2.5 : 1.25
    note = `RPE baixo na última sessão (${last.load}kg x${last.reps}) — pode subir a carga.`
  } else if (last.rpe >= 9) {
    delta = 0
    note = `RPE alto na última sessão (${last.load}kg x${last.reps}) — mantenha ou reduza levemente.`
  } else {
    delta = 0
    note = `RPE dentro do alvo — mantenha a carga da última sessão (${last.load}kg x${last.reps}).`
  }

  if (lastFeedback && lastFeedback.date === last.date && !lastFeedback.feedback.completou) {
    if (OVERLOAD_MOTIVOS.has(lastFeedback.feedback.motivo ?? '')) {
      delta = 0
      note = `Você não completou as séries planejadas na última sessão (${
        lastFeedback.feedback.motivo === 'fadiga' ? 'fadiga' : 'carga pesada'
      }). Mantenha a mesma carga.`
    } else if (lastFeedback.feedback.motivo === 'dor') {
      delta = 0
      note = 'Você relatou dor na última sessão. Mantenha a carga e avalie trocar por um substituto.'
    }
  }

  return {
    hasHistory: true,
    suggestedLoad: round25(last.load + delta),
    reps: last.reps,
    note,
    basedOn: { date: last.date, load: last.load, reps: last.reps, rpe: last.rpe },
  }
}
