import type { LiftCategory } from './types'

export type MuscleGroup =
  | 'quadriceps'
  | 'posterior'
  | 'gluteos'
  | 'panturrilha'
  | 'peito'
  | 'costas'
  | 'ombro'
  | 'biceps'
  | 'triceps'
  | 'core'

export type Equipment = 'peso_corporal' | 'casa' | 'academia'
export type JointTag = 'joelho' | 'ombro' | 'lombar' | 'punho'

export interface LibExercise {
  name: string
  group: MuscleGroup
  equipment: Equipment
  compound?: boolean
  liftCategory?: LiftCategory
  avoid?: JointTag[]
}

export const EQUIPMENT_RANK: Record<Equipment, number> = { peso_corporal: 0, casa: 1, academia: 2 }

export const EXERCISE_LIBRARY: LibExercise[] = [
  // Quadríceps
  { name: 'Agachamento livre', group: 'quadriceps', equipment: 'academia', compound: true, liftCategory: 'agachamento', avoid: ['joelho', 'lombar'] },
  { name: 'Agachamento goblet com halter', group: 'quadriceps', equipment: 'casa', compound: true, avoid: ['joelho'] },
  { name: 'Agachamento livre (peso corporal)', group: 'quadriceps', equipment: 'peso_corporal', avoid: ['joelho'] },
  { name: 'Leg press', group: 'quadriceps', equipment: 'academia', avoid: ['joelho'] },
  { name: 'Cadeira extensora', group: 'quadriceps', equipment: 'academia', avoid: ['joelho'] },
  { name: 'Agachamento búlgaro', group: 'quadriceps', equipment: 'casa', avoid: ['joelho'] },
  { name: 'Afundo (passada)', group: 'quadriceps', equipment: 'peso_corporal', avoid: ['joelho'] },

  // Posterior de coxa
  { name: 'Levantamento terra romeno', group: 'posterior', equipment: 'academia', avoid: ['lombar'] },
  { name: 'Stiff com halteres', group: 'posterior', equipment: 'casa', avoid: ['lombar'] },
  { name: 'Mesa flexora', group: 'posterior', equipment: 'academia' },
  { name: 'Elevação de quadril unilateral (peso corporal)', group: 'posterior', equipment: 'peso_corporal' },

  // Glúteos
  { name: 'Hip thrust', group: 'gluteos', equipment: 'academia' },
  { name: 'Elevação pélvica (peso corporal)', group: 'gluteos', equipment: 'peso_corporal' },
  { name: 'Abdução de quadril (cadeira abdutora)', group: 'gluteos', equipment: 'academia', avoid: ['joelho'] },

  // Panturrilha
  { name: 'Panturrilha em pé (máquina)', group: 'panturrilha', equipment: 'academia' },
  { name: 'Panturrilha em pé (peso corporal)', group: 'panturrilha', equipment: 'peso_corporal' },

  // Peito
  { name: 'Supino reto barra', group: 'peito', equipment: 'academia', compound: true, liftCategory: 'supino', avoid: ['ombro'] },
  { name: 'Supino com halteres', group: 'peito', equipment: 'casa', compound: true, avoid: ['ombro'] },
  { name: 'Flexão de braço', group: 'peito', equipment: 'peso_corporal', avoid: ['punho'] },
  { name: 'Supino inclinado com halteres', group: 'peito', equipment: 'academia' },
  { name: 'Crossover (cabo)', group: 'peito', equipment: 'academia' },
  { name: 'Peck deck', group: 'peito', equipment: 'academia' },

  // Costas (inclui levantamento terra, âncora do dia de costas)
  { name: 'Levantamento terra', group: 'costas', equipment: 'academia', compound: true, liftCategory: 'terra', avoid: ['lombar'] },
  { name: 'Remada curvada com barra', group: 'costas', equipment: 'academia', avoid: ['lombar'] },
  { name: 'Remada unilateral com halter', group: 'costas', equipment: 'casa' },
  { name: 'Remada baixa (cabo)', group: 'costas', equipment: 'academia' },
  { name: 'Puxada frontal (pegada neutra)', group: 'costas', equipment: 'academia', avoid: ['ombro'] },
  { name: 'Barra fixa (assistida ou livre)', group: 'costas', equipment: 'peso_corporal', avoid: ['ombro'] },

  // Ombro
  { name: 'Desenvolvimento com halteres', group: 'ombro', equipment: 'casa', avoid: ['ombro'] },
  { name: 'Elevação lateral', group: 'ombro', equipment: 'casa' },
  { name: 'Elevação frontal', group: 'ombro', equipment: 'casa' },
  { name: 'Crucifixo invertido (feixe posterior)', group: 'ombro', equipment: 'academia' },

  // Bíceps
  { name: 'Rosca direta com barra', group: 'biceps', equipment: 'academia' },
  { name: 'Rosca alternada com halteres', group: 'biceps', equipment: 'casa' },
  { name: 'Rosca martelo', group: 'biceps', equipment: 'casa' },

  // Tríceps
  { name: 'Tríceps pulley', group: 'triceps', equipment: 'academia' },
  { name: 'Tríceps testa', group: 'triceps', equipment: 'academia', avoid: ['ombro'] },
  { name: 'Mergulho no banco', group: 'triceps', equipment: 'peso_corporal', avoid: ['ombro', 'punho'] },

  // Core
  { name: 'Prancha abdominal', group: 'core', equipment: 'peso_corporal' },
  { name: 'Abdominal supra', group: 'core', equipment: 'peso_corporal', avoid: ['lombar'] },
  { name: 'Elevação de pernas', group: 'core', equipment: 'peso_corporal', avoid: ['lombar'] },
]
