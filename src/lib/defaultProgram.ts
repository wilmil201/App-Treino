import type { Program } from './types'

let counter = 0
const id = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${counter++}`

export function buildDefaultProgram(): Program {
  return {
    segunda: [
      { id: id('ex'), name: 'Agachamento livre', detail: '4x5 @ RPE alvo da semana', isMain: true, liftCategory: 'agachamento' },
      { id: id('ex'), name: 'Supino fechado', detail: '3x8', isMain: false },
      { id: id('ex'), name: 'Remada curvada', detail: '3x10', isMain: false },
      { id: id('ex'), name: 'Prancha abdominal', detail: '3x40s', isMain: false },
    ],
    quarta: [
      { id: id('ex'), name: 'Supino reto barra', detail: '4x5 @ RPE alvo da semana', isMain: true, liftCategory: 'supino' },
      { id: id('ex'), name: 'Levantamento terra romeno', detail: '3x8', isMain: false },
      { id: id('ex'), name: 'Puxada frontal', detail: '3x10', isMain: false },
      { id: id('ex'), name: 'Elevação lateral', detail: '3x15', isMain: false },
    ],
    sexta: [
      { id: id('ex'), name: 'Levantamento terra', detail: '3x5 @ RPE alvo da semana', isMain: true, liftCategory: 'terra' },
      { id: id('ex'), name: 'Agachamento frontal', detail: '3x6', isMain: false },
      { id: id('ex'), name: 'Supino inclinado com halteres', detail: '3x10', isMain: false },
      { id: id('ex'), name: 'Prancha lateral', detail: '3x30s cada lado', isMain: false },
    ],
  }
}
