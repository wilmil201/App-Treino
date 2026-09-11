import type { Day, Program, ProgramExercise } from './types'
import { DAY_SLOTS } from './schedule'
import { EQUIPMENT_RANK, EXERCISE_LIBRARY, type Equipment, type JointTag, type MuscleGroup } from './exerciseLibrary'
import { generateId } from './id'

export type Objetivo = 'hipertrofia' | 'forca' | 'condicionamento'
export type Nivel = 'iniciante' | 'intermediario' | 'avancado'
export type SplitKey = 'perna_peito_costas' | 'push_pull_legs' | 'upper_lower'

export interface Questionnaire {
  objetivo: Objetivo
  nivel: Nivel
  equipamento: Equipment
  limitacoes: JointTag[]
  divisao: SplitKey
}

const SPLITS: Record<SplitKey, Record<Day, MuscleGroup[]>> = {
  perna_peito_costas: {
    dia1: ['quadriceps', 'posterior', 'gluteos', 'panturrilha'],
    dia2: ['peito', 'ombro', 'triceps'],
    dia3: ['costas', 'biceps', 'core'],
  },
  push_pull_legs: {
    dia1: ['peito', 'ombro', 'triceps'],
    dia2: ['costas', 'biceps', 'core'],
    dia3: ['quadriceps', 'posterior', 'gluteos', 'panturrilha'],
  },
  upper_lower: {
    dia1: ['peito', 'costas', 'ombro', 'biceps', 'triceps'],
    dia2: ['quadriceps', 'posterior', 'gluteos', 'panturrilha', 'core'],
    dia3: ['peito', 'costas', 'quadriceps', 'posterior', 'ombro'],
  },
}

const ACCESSORIES_BY_NIVEL: Record<Nivel, number> = { iniciante: 4, intermediario: 5, avancado: 6 }

const SCHEME_MAIN: Record<Objetivo, string> = {
  hipertrofia: '4x8-10 @ RPE alvo da semana',
  forca: '5x5 @ RPE alvo da semana',
  condicionamento: '3x15 @ RPE alvo da semana',
}
const SCHEME_ACCESSORY: Record<Objetivo, string> = {
  hipertrofia: '3x10-12',
  forca: '3x8',
  condicionamento: '3x15-20',
}

export const SPLIT_LABEL: Record<SplitKey, string> = {
  perna_peito_costas: 'Perna / Peito / Costas',
  push_pull_legs: 'Push / Pull / Legs (empurrar/puxar/pernas)',
  upper_lower: 'Upper / Lower / Full (superior/inferior/corpo todo)',
}

function usable(equipment: Equipment, maxEquipment: Equipment): boolean {
  return EQUIPMENT_RANK[equipment] <= EQUIPMENT_RANK[maxEquipment]
}

function conflicts(avoid: JointTag[] | undefined, limitacoes: JointTag[]): boolean {
  if (!avoid || avoid.length === 0) return false
  return avoid.some((a) => limitacoes.includes(a))
}

export function generateProgram(q: Questionnaire): Program {
  const groupsByDay = SPLITS[q.divisao]
  const accessoryCount = ACCESSORIES_BY_NIVEL[q.nivel]
  const usedNames = new Set<string>()

  const program = {} as Program

  for (const day of DAY_SLOTS) {
    const groups = groupsByDay[day]
    const pool = EXERCISE_LIBRARY.filter(
      (ex) => groups.includes(ex.group) && usable(ex.equipment, q.equipamento) && !conflicts(ex.avoid, q.limitacoes) && !usedNames.has(ex.name),
    )

    const exercises: ProgramExercise[] = []

    // 1) levantamento principal do dia, se houver um composto com categoria disponível
    const mainCandidate = pool.find((ex) => ex.compound && ex.liftCategory)
    if (mainCandidate) {
      exercises.push({
        id: generateId('ex'),
        name: mainCandidate.name,
        detail: SCHEME_MAIN[q.objetivo],
        isMain: true,
        liftCategory: mainCandidate.liftCategory,
      })
      usedNames.add(mainCandidate.name)
    }

    // 2) acessórios, distribuindo pelos grupos musculares do dia
    const remainingPool = pool.filter((ex) => ex.name !== mainCandidate?.name)
    let groupIdx = 0
    let guard = 0
    while (exercises.length < accessoryCount + (mainCandidate ? 1 : 0) && guard < 200) {
      guard++
      const group = groups[groupIdx % groups.length]
      groupIdx++
      const candidate = remainingPool.find((ex) => ex.group === group && !usedNames.has(ex.name))
      if (candidate) {
        exercises.push({
          id: generateId('ex'),
          name: candidate.name,
          detail: SCHEME_ACCESSORY[q.objetivo],
          isMain: false,
        })
        usedNames.add(candidate.name)
      }
      // se nenhum grupo tem mais candidatos, encerra
      const anyLeft = remainingPool.some((ex) => !usedNames.has(ex.name))
      if (!anyLeft) break
    }

    program[day] = exercises
  }

  return program
}
