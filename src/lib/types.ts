/** Identificadores abstratos dos 3 treinos semanais — a que dia real da semana cada um
 * corresponde é definido pelo atleta (ver DaySchedule em lib/schedule.ts), não é fixo. */
export type Day = 'dia1' | 'dia2' | 'dia3'

export type LiftCategory = 'agachamento' | 'supino' | 'terra'

/** 'forca' (padrão) é logado por carga/reps/RPE; 'aerobico' é logado por duração/esforço —
 * não faz sentido pedir carga e reps de uma esteira ou bike. */
export type ExerciseKind = 'forca' | 'aerobico'

export interface ProgramExercise {
  id: string
  name: string
  detail: string
  isMain: boolean
  liftCategory?: LiftCategory
  kind?: ExerciseKind
  /** Exercícios alternativos definidos pelo atleta, caso não possa/saiba fazer este. */
  substitutes?: string[]
}

export type Program = Record<Day, ProgramExercise[]>

export interface SetLog {
  id: string
  load: number
  reps: number
  rpe: number
}

/** Entrada de série aeróbica: duração em minutos + esforço percebido (mesma escala de RPE 1-10). */
export interface CardioSetLog {
  id: string
  durationMin: number
  rpe: number
}

export type FeedbackMotivo = 'fadiga' | 'dor' | 'carga_pesada' | 'falta_tempo' | 'equipamento' | 'outro'

/** Feedback do atleta ao finalizar um exercício — por que não completou o planejado,
 * quando é o caso. Alimenta a sugestão de carga da próxima sessão e os alertas. */
export interface ExerciseFeedback {
  completou: boolean
  motivo?: FeedbackMotivo
  observacao?: string
}

export interface ExerciseLog {
  exerciseId: string
  name: string
  isMain: boolean
  liftCategory?: LiftCategory
  kind?: ExerciseKind
  sets: SetLog[]
  cardioSets?: CardioSetLog[]
  feedback?: ExerciseFeedback
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

export interface AnamneseBaseline {
  load: number
  reps: number
}

export type ObjetivoTreino = 'forca' | 'hipertrofia' | 'resistencia' | 'emagrecimento' | 'performance_esportiva'
export type NivelExperiencia = 'iniciante' | 'intermediario' | 'avancado'

/** Perfil do atleta — objetivo de treino, esporte praticado e nível de experiência.
 * Usado para dar orientação tecnicamente fundamentada (faixa de reps/RPE) quando ainda
 * não existe nenhuma carga de referência para um exercício. */
export interface AthleteProfile {
  objetivo: ObjetivoTreino
  esporte?: string
  nivel: NivelExperiencia
}

/** Cargas de partida declaradas pelo atleta antes de qualquer sessão registrada — usadas
 * para já calcular e sugerir carga desde o primeiro treino, em vez de começar do zero. */
export interface Anamnese {
  profile?: AthleteProfile
  mainLifts: Partial<Record<LiftCategory, AnamneseBaseline>>
  /** Chave = nome do exercício, normalizado (trim + minúsculas), igual ao usado no histórico. */
  accessories: Record<string, AnamneseBaseline>
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

export interface WarmupSubItem {
  nome: string
  dosagem: string
  videoUrl?: string
}

export interface WarmupStep {
  id: string
  ordem: number
  nome: string
  descricao: string
  videoQuery: string
  itens?: WarmupSubItem[]
}

export interface AppState {
  program: Program
  workouts: Workout[]
  jjSessions: JJSession[]
}
