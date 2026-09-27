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

/** Bloco B da anamnese — qual "motor" de decisão rege a experiência do atleta:
 * só jiu-jitsu, só musculação, ou os dois juntos (motor integrado, com prioridade
 * de recuperação entre os dois). Não remove nem esconde nenhuma aba do app — só
 * direciona recomendações e o alerta de sobreposição de volume no mesmo dia. */
export type MotorPrincipal = 'jiu_jitsu' | 'musculacao' | 'combinacao'

/** Bloco A — tempo de prática consistente de atividade física, usado como um dos
 * sinais de nível (junto com a auto-classificação iniciante/intermediário/avançado). */
export type TempoPratica = 'sedentario' | 'ate_6_meses' | '6_meses_a_2_anos' | '2_anos_ou_mais'

export type Sexo = 'masculino' | 'feminino'
export type NivelEstresse = 'baixo' | 'medio' | 'alto'

/** Articulações do checklist de lesão da anamnese (Bloco A) — lista própria, distinta
 * de JointTag (exerciseLibrary.ts), que serve pra filtrar exercícios no gerador. */
export type Articulacao = 'ombro' | 'joelho' | 'coluna' | 'quadril' | 'tornozelo' | 'punho'

/** Bloco C — específico de jiu-jitsu, só relevante quando motorPrincipal inclui jiu-jitsu. */
export interface JJAnamnese {
  faixa?: string
  compete: boolean
  categoriaPeso?: string
  frequenciaSemanal?: number
}

/** Perfil do atleta — anamnese completa (Blocos A-E). Só `motorPrincipal` e `nivel`
 * são obrigatórios pra função; o resto é opcional e vai enriquecendo a recomendação
 * conforme o atleta preenche. */
export interface AthleteProfile {
  /** Bloco B — qual motor rege a experiência. */
  motorPrincipal: MotorPrincipal
  /** Objetivo específico de musculação — só relevante quando motorPrincipal inclui musculação. */
  objetivo: ObjetivoTreino
  esporte?: string
  nivel: NivelExperiencia
  // Bloco A — identificação e saúde geral
  idade?: number
  sexo?: Sexo
  pesoCorporalKg?: number
  alturaCm?: number
  lesoes?: Articulacao[]
  lesoesObs?: string
  tempoPratica?: TempoPratica
  // Bloco C — jiu-jitsu
  jj?: JJAnamnese
  // Bloco D — musculação
  diasDisponiveisSemana?: number
  tempoPorSessaoMin?: number
  equipamentoDisponivel?: import('./exerciseLibrary').Equipment
  gruposPrioritarios?: import('./exerciseLibrary').MuscleGroup[]
  // Bloco E — rotina e recuperação
  horasSonoMedia?: number
  nivelEstresse?: NivelEstresse
  sinaisOvertraining?: boolean
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
/** Categoria de róla pelo Método Se7e — duração define o estímulo bioenergético predominante. */
export type RolaCategoria = 'muito_curto' | 'curto' | 'longo' | 'tempo_competicao'

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
  categoria?: RolaCategoria
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
