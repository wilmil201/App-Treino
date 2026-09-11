export type Day = 'segunda' | 'quarta' | 'sexta'

export const DIAS: { key: Day; label: string; weekday: number }[] = [
  { key: 'segunda', label: 'Segunda', weekday: 1 },
  { key: 'quarta', label: 'Quarta', weekday: 3 },
  { key: 'sexta', label: 'Sexta', weekday: 5 },
]

export type LiftCategory = 'agachamento' | 'supino' | 'terra'

export interface ProgramExercise {
  id: string
  name: string
  detail: string
  isMain: boolean
  liftCategory?: LiftCategory
}

export type Program = Record<Day, ProgramExercise[]>

export interface SetLog {
  id: string
  load: number
  reps: number
  rpe: number
}

export interface ExerciseLog {
  exerciseId: string
  name: string
  isMain: boolean
  liftCategory?: LiftCategory
  sets: SetLog[]
}

export interface WorkoutSummary {
  totalSets: number
  totalVolume: number
  finishedAt: string
}

export interface Workout {
  id: string
  date: string // ISO yyyy-mm-dd
  day: Day
  bodyWeight?: number
  notes?: string
  exercises: ExerciseLog[]
  finished: boolean
  summary?: WorkoutSummary
}

export type JJSessionType = 'sessao1' | 'sessao2' | 'drill'
export type JJIntensity = 'forte' | 'moderado' | 'leve'

export interface JJSession {
  id: string
  date: string
  type: JJSessionType
  mesocicloIndex: number
  intensity?: JJIntensity
  duration?: number
  rounds?: number
  rpe?: number
  gas?: number
  drillSeries?: number
  drillReps?: number
}

export interface WarmupStep {
  id: string
  ordem: number
  nome: string
  descricao: string
  videoQuery: string
}

export interface AppState {
  program: Program
  workouts: Workout[]
  jjSessions: JJSession[]
}
