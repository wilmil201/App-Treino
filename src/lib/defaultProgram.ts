import type { Program } from './types'

let counter = 0
const id = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${counter++}`

/**
 * Programa do atleta. "Rampa" = séries de aquecimento com carga crescente antes do
 * trabalho principal. "Mind Set" = série final fixa, repetida por 4 séries até a
 * falha muscular — é essa que conta como o top set do levantamento-base do dia.
 */
export function buildDefaultProgram(): Program {
  return {
    dia1: [
      { id: id('ex'), name: 'Esteira', detail: '10 minutos — aquecimento', isMain: false, kind: 'aerobico' },
      { id: id('ex'), name: 'Agachamento (rampa)', detail: '30kg x15 / 50kg x12 / 60kg x8', isMain: false },
      {
        id: id('ex'),
        name: 'Agachamento (Mind Set)',
        detail: '75kg — 4 séries até a falha',
        isMain: true,
        liftCategory: 'agachamento',
      },
      { id: id('ex'), name: 'Búlgaro', detail: '2x10', isMain: false },
      { id: id('ex'), name: 'Extensora', detail: '3x12', isMain: false },
      { id: id('ex'), name: 'Abdutora', detail: '4x10', isMain: false },
      { id: id('ex'), name: 'Adutora', detail: '4x10', isMain: false },
      { id: id('ex'), name: 'Panturrilha', detail: '3x10', isMain: false },
    ],
    dia2: [
      { id: id('ex'), name: 'Peck Deck', detail: '3x15 — aquecimento', isMain: false },
      { id: id('ex'), name: 'Elevação lateral (aquecimento)', detail: '3x15 — aquecimento', isMain: false },
      { id: id('ex'), name: 'Tríceps pulley (aquecimento)', detail: '3x15 — aquecimento', isMain: false },
      { id: id('ex'), name: 'Supino pausado (rampa)', detail: '20kg x15 / 40kg x10 / 55kg x5 / 65kg x2', isMain: false },
      {
        id: id('ex'),
        name: 'Supino pausado (Mind Set)',
        detail: '75kg — 4 séries até a falha',
        isMain: true,
        liftCategory: 'supino',
      },
      { id: id('ex'), name: 'Supino inclinado', detail: '2x15', isMain: false },
      { id: id('ex'), name: 'Crossover', detail: '2x15', isMain: false },
      { id: id('ex'), name: 'Desenvolvimento de ombro', detail: '2x15', isMain: false },
      { id: id('ex'), name: 'Elevação lateral', detail: '2x15', isMain: false },
      { id: id('ex'), name: 'Tríceps testa', detail: '3x12', isMain: false },
      { id: id('ex'), name: 'Tríceps pulley', detail: '3x12', isMain: false },
    ],
    dia3: [
      { id: id('ex'), name: 'Bike', detail: '10 minutos — aquecimento', isMain: false, kind: 'aerobico' },
      { id: id('ex'), name: 'Terra (rampa)', detail: '50kg x12 / 70kg x8 / 90kg x6 / 110kg x4 / 125kg x2', isMain: false },
      {
        id: id('ex'),
        name: 'Terra (Mind Set)',
        detail: '135kg — 4 séries até a falha',
        isMain: true,
        liftCategory: 'terra',
      },
      { id: id('ex'), name: 'Remada curvada', detail: '2x15', isMain: false },
      { id: id('ex'), name: 'Barra fixa', detail: '2x8', isMain: false },
      { id: id('ex'), name: 'Puxada alta pegada neutra', detail: '2x10', isMain: false },
      { id: id('ex'), name: 'Remada baixa', detail: '2x10', isMain: false },
      { id: id('ex'), name: 'Feixe posterior de ombro (Crossover)', detail: '4x15', isMain: false },
      { id: id('ex'), name: 'Rosca direta', detail: '4x15', isMain: false },
      { id: id('ex'), name: 'Rosca alternada', detail: '4x15', isMain: false },
      { id: id('ex'), name: 'Martelo', detail: '4x15', isMain: false },
      { id: id('ex'), name: 'Antebraço', detail: '2x15', isMain: false },
    ],
  }
}
