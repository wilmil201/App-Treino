import type { Anamnese, AthleteProfile, LiftCategory, NivelExperiencia, ObjetivoTreino, Workout } from './types'
import type { CicloOndulatorio } from './dates'
import { getLastFeedbackForCategory, getLiftSessions } from './calculations'
import { getExerciseSessions, getLastFeedbackForExercise } from './exerciseHistory'

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

/** Escalonamento simples e conservador da carga declarada na anamnese ao longo do
 * ciclo ondulatório de 4 semanas — só usado enquanto não há nenhuma sessão real
 * registrada; assim que existir histórico, a sugestão passa a se basear só nele. */
function scaleForWeek(baseLoad: number, semana: 1 | 2 | 3 | 4): number {
  if (semana === 1) return baseLoad
  if (semana === 2) return round25(baseLoad * 1.025)
  if (semana === 3) return round25(baseLoad * 1.05)
  return round25(baseLoad * 0.7) // semana 4 = deload
}

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
  /** Reps de referência (a última que o atleta realmente fez), só para exibição — nunca usada para extrapolar carga entre esquemas de rep diferentes. */
  reps?: number
  note: string
  basedOn?: { date: string; load: number; reps: number; rpe: number }
}

/**
 * Sugestão de carga para a próxima sessão de um levantamento principal.
 *
 * Sempre parte da última carga REAL que o atleta registrou (não de uma
 * estimativa teórica de 1RM extrapolada para outro número de reps — isso
 * podia gerar cargas que a pessoa nunca provou conseguir levantar). Os
 * ajustes são incrementos pequenos e diretamente justificados pelo
 * histórico de RPE das últimas sessões — e pelo feedback que o atleta deu
 * ao finalizar o exercício (se não completou o planejado por fadiga ou
 * carga pesada, a sugestão nunca sobe).
 */
export function suggestMainLift(category: LiftCategory, workouts: Workout[], ciclo: CicloOndulatorio, anamnese?: Anamnese): LiftSuggestion {
  const sessions = getLiftSessions(workouts, category)
  const lastFeedback = getLastFeedbackForCategory(workouts, category)

  if (sessions.length === 0) {
    const baseline = anamnese?.mainLifts[category]
    if (!baseline) {
      return {
        category,
        hasHistory: false,
        isCalibration: true,
        isDeload: ciclo.isDeload,
        suggestedLoad: null,
        note: buildCalibrationNote(anamnese?.profile),
      }
    }
    const suggestedLoad = scaleForWeek(baseline.load, ciclo.semana)
    return {
      category,
      hasHistory: true,
      isDeload: ciclo.isDeload,
      suggestedLoad,
      reps: baseline.reps,
      note: `Baseado na sua ficha de anamnese (${baseline.load}kg x${baseline.reps}), ajustado para a semana ${ciclo.semana}/4 do ciclo${
        ciclo.isDeload ? ' (deload)' : ''
      }. Assim que você registrar uma sessão real, a sugestão passa a se basear nela.`,
    }
  }

  const last = sessions[sessions.length - 1]
  const basedOn = { date: last.date, load: last.topSet.load, reps: last.topSet.reps, rpe: last.topSet.rpe }

  if (ciclo.isDeload) {
    return {
      category,
      hasHistory: true,
      isDeload: true,
      suggestedLoad: round25(last.topSet.load * 0.6),
      reps: last.topSet.reps,
      note: `Semana de deload: reduza a carga e o volume em relação à sua última sessão (${last.topSet.load}kg x${last.topSet.reps} @ RPE ${last.topSet.rpe}). RPE alvo ≤ 6.`,
      basedOn,
    }
  }

  // Ponto de partida: a mesma carga que o atleta realmente usou e conseguiu completar.
  let suggestedLoad = last.topSet.load
  let note = `Repita a carga da sua última sessão (${last.topSet.load}kg x${last.topSet.reps} @ RPE ${last.topSet.rpe}) — alvo desta semana: ${ciclo.rpeAlvo}.`

  if (sessions.length >= 2) {
    const last2 = sessions.slice(-2)
    const allHigh = last2.every((s) => s.topSet.rpe >= 9.5)
    const allLow = last2.every((s) => s.topSet.rpe <= 7)
    if (allHigh) {
      suggestedLoad = round25(last.topSet.load * 0.925)
      note = `Reduza ~5–10% em relação à sua última carga (${last.topSet.load}kg): RPE ≥ 9,5 nas últimas 2 sessões (fadiga acumulada).`
    } else if (allLow) {
      suggestedLoad = round25(last.topSet.load + 3.75)
      note = `Suba 2,5–5kg em relação à sua última carga (${last.topSet.load}kg): RPE ≤ 7 nas últimas 2 sessões (sobrando margem).`
    }
  }

  if ((category === 'agachamento' || category === 'terra') && last.topSet.rpe >= 10) {
    suggestedLoad = Math.min(suggestedLoad, last.topSet.load)
    note = 'Carga limitada: última sessão chegou à falha real (RPE 10). Priorize técnica antes de subir.'
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

  return { category, hasHistory: true, isDeload: false, suggestedLoad, reps: last.topSet.reps, note, basedOn }
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
