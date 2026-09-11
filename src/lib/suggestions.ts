import type { LiftCategory, Program, Workout } from './types'
import type { CicloOndulatorio } from './dates'
import { getLiftSessions } from './calculations'
import { getExerciseSessions } from './exerciseHistory'
import { loadForTarget, trueOneRepMax } from './rpeChart'

function round25(v: number): number {
  return Math.round(v / 2.5) * 2.5
}

export function parseTargetReps(detail: string | undefined): number {
  if (!detail) return 5
  const match = detail.match(/(\d+)\s*x\s*(\d+)/i)
  if (match) return Number(match[2])
  return 5
}

function targetRpeForSemana(semana: 1 | 2 | 3 | 4): number {
  if (semana === 1) return 7
  if (semana === 2) return 7.75
  if (semana === 3) return 8.25
  return 6 // deload
}

export interface LiftSuggestion {
  category: LiftCategory
  hasHistory: boolean
  isDeload: boolean
  targetReps: number
  targetRpe: number
  suggestedLoad: number | null
  note: string
  basedOn?: { date: string; load: number; reps: number; rpe: number }
}

/** Sugestão de carga para a próxima sessão de um levantamento principal, combinando
 * a semana do ciclo ondulatório com os alertas de autorregulação (RPE das últimas sessões). */
export function suggestMainLift(category: LiftCategory, workouts: Workout[], program: Program, ciclo: CicloOndulatorio): LiftSuggestion {
  const sessions = getLiftSessions(workouts, category)
  const targetReps = parseTargetReps(
    Object.values(program)
      .flat()
      .find((ex) => ex.liftCategory === category)?.detail,
  )
  const targetRpe = targetRpeForSemana(ciclo.semana)

  if (sessions.length === 0) {
    return {
      category,
      hasHistory: false,
      isDeload: ciclo.isDeload,
      targetReps,
      targetRpe,
      suggestedLoad: null,
      note: 'Sem histórico ainda. Registre uma sessão para começar a receber sugestões de carga.',
    }
  }

  const last = sessions[sessions.length - 1]
  const oneRepMax = trueOneRepMax(last.topSet.load, last.topSet.reps, last.topSet.rpe)

  if (ciclo.isDeload) {
    return {
      category,
      hasHistory: true,
      isDeload: true,
      targetReps,
      targetRpe,
      suggestedLoad: round25(oneRepMax * 0.75),
      note: 'Semana de deload: reduza a carga e o volume. RPE alvo ≤ 6.',
      basedOn: { date: last.date, load: last.topSet.load, reps: last.topSet.reps, rpe: last.topSet.rpe },
    }
  }

  let suggestedLoad = loadForTarget(oneRepMax, targetReps, targetRpe)
  let note = `Baseado no seu último top set (${last.topSet.load}kg x${last.topSet.reps} @ RPE ${last.topSet.rpe}) e no alvo desta semana (${ciclo.rpeAlvo}).`

  if (sessions.length >= 2) {
    const last2 = sessions.slice(-2)
    const allHigh = last2.every((s) => s.topSet.rpe >= 9.5)
    const allLow = last2.every((s) => s.topSet.rpe <= 7)
    if (allHigh) {
      suggestedLoad = round25(suggestedLoad * 0.925)
      note = 'Ajustado para baixo: RPE ≥ 9,5 nas últimas 2 sessões (fadiga acumulada).'
    } else if (allLow) {
      suggestedLoad = round25(suggestedLoad + 3.75)
      note = 'Ajustado para cima: RPE ≤ 7 nas últimas 2 sessões (sobrando margem).'
    }
  }

  if ((category === 'agachamento' || category === 'terra') && last.topSet.rpe >= 10) {
    suggestedLoad = Math.min(suggestedLoad, last.topSet.load)
    note = 'Carga limitada: última sessão chegou à falha real (RPE 10). Priorize técnica.'
  }

  return {
    category,
    hasHistory: true,
    isDeload: false,
    targetReps,
    targetRpe,
    suggestedLoad,
    note,
    basedOn: { date: last.date, load: last.topSet.load, reps: last.topSet.reps, rpe: last.topSet.rpe },
  }
}

export interface AccessorySuggestion {
  hasHistory: boolean
  suggestedLoad: number | null
  note: string
  basedOn?: { date: string; load: number; reps: number; rpe: number }
}

/** Progressão dupla simples (double progression) para exercícios acessórios sem categoria de levantamento. */
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
    note = 'RPE baixo na última sessão — pode subir a carga.'
  } else if (last.rpe >= 9) {
    delta = 0
    note = 'RPE alto na última sessão — mantenha ou reduza levemente.'
  } else {
    delta = 0
    note = 'RPE dentro do alvo — mantenha a carga.'
  }
  return {
    hasHistory: true,
    suggestedLoad: round25(last.load + delta),
    note,
    basedOn: { date: last.date, load: last.load, reps: last.reps, rpe: last.rpe },
  }
}
