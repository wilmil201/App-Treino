import type { Workout } from './types'
import { addDays, formatDateBR } from './dates'

export interface RecoverySuggestion {
  restDays: number
  nextDateISO: string
  nextDateLabel: string
  reason: string
}

const OVERLOAD_MOTIVOS = new Set(['fadiga', 'carga_pesada'])

/**
 * Sugere quantos dias de descanso o atleta deveria dar antes do próximo treino do
 * mesmo grupo/dia, com base no esforço (RPE médio dos exercícios principais) e no
 * feedback que ele deu ao finalizar cada exercício deste treino.
 */
export function suggestNextSessionTiming(workout: Workout): RecoverySuggestion {
  const hadDor = workout.exercises.some((ex) => ex.feedback?.motivo === 'dor')
  const hadOverload = workout.exercises.some((ex) => ex.feedback && !ex.feedback.completou && OVERLOAD_MOTIVOS.has(ex.feedback.motivo ?? ''))

  const mainSets = workout.exercises.filter((ex) => ex.isMain).flatMap((ex) => ex.sets)
  const avgRpe = mainSets.length > 0 ? mainSets.reduce((sum, s) => sum + s.rpe, 0) / mainSets.length : null

  let restDays = 2
  let reason = 'Esforço dentro do esperado — o intervalo padrão de descanso já é suficiente.'

  if (hadDor) {
    restDays = 4
    reason = 'Você relatou dor neste treino. Dê mais tempo de recuperação e avalie trocar o exercício ou buscar orientação profissional antes de repetir.'
  } else if (hadOverload || (avgRpe !== null && avgRpe >= 9.5)) {
    restDays = 3
    reason = 'Fadiga alta neste treino (não completou o planejado e/ou RPE muito alto) — dê um dia a mais de descanso antes de repetir este grupo.'
  } else if (avgRpe !== null && avgRpe <= 7) {
    restDays = 2
    reason = 'Esforço controlado (RPE baixo) — o intervalo padrão de descanso já é suficiente.'
  }

  const nextDateISO = addDays(workout.date, restDays)
  return { restDays, nextDateISO, nextDateLabel: formatDateBR(nextDateISO), reason }
}
