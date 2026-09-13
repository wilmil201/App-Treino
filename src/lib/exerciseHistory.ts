import type { ExerciseFeedback, Workout } from './types'
import { topSet, exerciseVolume, epley1RM } from './calculations'

export interface ExerciseSessionPoint {
  date: string
  load: number
  reps: number
  rpe: number
  e1rm: number
  volume: number
}

function norm(name: string): string {
  return name.trim().toLowerCase()
}

/** Todas as sessões (ordem cronológica) em que um exercício (por nome) apareceu com pelo menos 1 série. */
export function getExerciseSessions(workouts: Workout[], exerciseName: string): ExerciseSessionPoint[] {
  const target = norm(exerciseName)
  const finished = [...workouts].filter((w) => w.finished).sort((a, b) => a.date.localeCompare(b.date))
  const points: ExerciseSessionPoint[] = []
  for (const w of finished) {
    const ex = w.exercises.find((e) => norm(e.name) === target)
    if (!ex || ex.sets.length === 0) continue
    const top = topSet(ex.sets)
    if (!top) continue
    points.push({
      date: w.date,
      load: top.load,
      reps: top.reps,
      rpe: top.rpe,
      e1rm: epley1RM(top.load, top.reps),
      volume: exerciseVolume(ex.sets),
    })
  }
  return points
}

/** Feedback mais recente (completou/motivo) registrado para um exercício por nome,
 * independente de ter séries registradas (pode ter sido pulado por completo). */
export function getLastFeedbackForExercise(workouts: Workout[], exerciseName: string): { date: string; feedback: ExerciseFeedback } | null {
  const target = norm(exerciseName)
  const finished = [...workouts].filter((w) => w.finished).sort((a, b) => b.date.localeCompare(a.date))
  for (const w of finished) {
    const ex = w.exercises.find((e) => norm(e.name) === target)
    if (ex?.feedback) return { date: w.date, feedback: ex.feedback }
  }
  return null
}

/** Lista de nomes de exercícios distintos já registrados (com pelo menos 1 série), mais recentes primeiro por uso. */
export function listLoggedExerciseNames(workouts: Workout[]): string[] {
  const seen = new Map<string, string>() // key normalizado -> nome original mais recente
  const finished = [...workouts].filter((w) => w.finished).sort((a, b) => a.date.localeCompare(b.date))
  for (const w of finished) {
    for (const ex of w.exercises) {
      if (ex.sets.length === 0) continue
      seen.set(norm(ex.name), ex.name)
    }
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b, 'pt-BR'))
}
