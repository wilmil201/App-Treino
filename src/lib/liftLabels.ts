import type { LiftCategory } from './types'

export const LIFT_LABEL: Record<LiftCategory, string> = {
  agachamento: 'Agachamento',
  supino: 'Supino',
  terra: 'Levantamento terra',
}

export const LIFT_COLOR: Record<LiftCategory, string> = {
  agachamento: '#34d399',
  supino: '#38bdf8',
  terra: '#f472b6',
}
