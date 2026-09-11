import type { LiftCategory, Workout } from './types'
import type { CicloOndulatorio } from './dates'
import { getLiftSessions } from './calculations'
import { getExerciseSessions } from './exerciseHistory'

function round25(v: number): number {
  return Math.round(v / 2.5) * 2.5
}

export interface LiftSuggestion {
  category: LiftCategory
  hasHistory: boolean
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
 * histórico de RPE das últimas sessões.
 */
export function suggestMainLift(category: LiftCategory, workouts: Workout[], ciclo: CicloOndulatorio): LiftSuggestion {
  const sessions = getLiftSessions(workouts, category)

  if (sessions.length === 0) {
    return {
      category,
      hasHistory: false,
      isDeload: ciclo.isDeload,
      suggestedLoad: null,
      note: 'Sem histórico ainda. Registre uma sessão para começar a receber sugestões de carga.',
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

  return { category, hasHistory: true, isDeload: false, suggestedLoad, reps: last.topSet.reps, note, basedOn }
}

export interface AccessorySuggestion {
  hasHistory: boolean
  suggestedLoad: number | null
  reps?: number
  note: string
  basedOn?: { date: string; load: number; reps: number; rpe: number }
}

/** Progressão dupla simples: parte sempre da carga que o atleta realmente usou por último. */
export function suggestAccessory(exerciseName: string, workouts: Workout[]): AccessorySuggestion {
  const sessions = getExerciseSessions(workouts, exerciseName)
  if (sessions.length === 0) {
    return { hasHistory: false, suggestedLoad: null, note: 'Sem histórico ainda.' }
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
  return {
    hasHistory: true,
    suggestedLoad: round25(last.load + delta),
    reps: last.reps,
    note,
    basedOn: { date: last.date, load: last.load, reps: last.reps, rpe: last.rpe },
  }
}
