import type { Anamnese, Day, NivelExperiencia, ObjetivoTreino, Program, ProgramExercise } from './types'
import { DAY_SLOTS } from './schedule'
import { EQUIPMENT_RANK, EXERCISE_LIBRARY, type Equipment, type JointTag, type MuscleGroup } from './exerciseLibrary'
import { generateId } from './id'
import { ACCESSORY_SETS_BY_OBJETIVO, MAIN_SETS_BY_OBJETIVO, REP_RANGE_BY_OBJETIVO, repSchemeText } from './objetivoGuidance'

export type { NivelExperiencia as Nivel }
export type SplitKey = 'perna_peito_costas' | 'push_pull_legs' | 'upper_lower'

export interface Questionnaire {
  objetivo: ObjetivoTreino
  nivel: NivelExperiencia
  equipamento: Equipment
  limitacoes: JointTag[]
  divisao: SplitKey
  /** Bloco de condicionamento metabólico ao final de cada dia — independente do
   * objetivo principal, porque "força + condicionamento geral" é uma combinação
   * real que um objetivo único não representa sozinho. */
  condicionamentoExtra: boolean
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

const ACCESSORIES_BY_NIVEL: Record<NivelExperiencia, number> = { iniciante: 4, intermediario: 5, avancado: 6 }

export const SPLIT_LABEL: Record<SplitKey, string> = {
  perna_peito_costas: 'Perna / Peito / Costas',
  push_pull_legs: 'Push / Pull / Legs (empurrar/puxar/pernas)',
  upper_lower: 'Upper / Lower / Full (superior/inferior/corpo todo)',
}

/**
 * Templates de finisher de condicionamento por nível de equipamento — formato HIIT
 * padrão (trabalho/descanso em intervalo), não "faça cardio". Registrado como
 * exercício aeróbico (duração + esforço), igual ao resto do app.
 */
const CONDICIONAMENTO_FINISHER: Record<Equipment, { name: string; detail: string }> = {
  academia: {
    name: 'Finisher — bike ou remo ergômetro',
    detail: '8-10 rounds de 30s forte / 30s leve (intervalado) — ~8-10min ao final do treino',
  },
  casa: {
    name: 'Finisher — circuito com halteres',
    detail: '4-5 rounds: 10 agachamentos + 10 remadas + 10 afundos, sem pausa entre exercícios, 60s entre rounds',
  },
  peso_corporal: {
    name: 'Finisher — circuito peso corporal',
    detail: '8-10 rounds de 30s trabalho / 30s descanso: alterne burpee, mountain climber, agachamento com salto',
  },
}

function usable(equipment: Equipment, maxEquipment: Equipment): boolean {
  return EQUIPMENT_RANK[equipment] <= EQUIPMENT_RANK[maxEquipment]
}

function conflicts(avoid: JointTag[] | undefined, limitacoes: JointTag[]): boolean {
  if (!avoid || avoid.length === 0) return false
  return avoid.some((a) => limitacoes.includes(a))
}

function round25(v: number): number {
  return Math.round(v / 2.5) * 2.5
}

/**
 * Detalhe da série de aquecimento (rampa) antes do levantamento principal — 3 séries
 * crescentes até perto da carga de trabalho. Usa a carga declarada na anamnese quando
 * existir (3 passos reais, arredondados a 2,5kg); sem anamnese, fica só a orientação,
 * sem inventar um número.
 */
function buildRampDetail(baselineLoad: number | undefined): string {
  if (!baselineLoad) {
    return '3 séries crescentes de aquecimento até perto da carga de trabalho — comece leve e suba a cada série.'
  }
  const steps = [0.5, 0.7, 0.85].map((pct) => round25(baselineLoad * pct))
  return `Aquecimento: ${steps[0]}kg x8 / ${steps[1]}kg x5 / ${steps[2]}kg x3 antes da série principal.`
}

export function generateProgram(q: Questionnaire, anamnese?: Anamnese): Program {
  const groupsByDay = SPLITS[q.divisao]
  const accessoryCount = ACCESSORIES_BY_NIVEL[q.nivel]
  const mainSets = MAIN_SETS_BY_OBJETIVO[q.objetivo]
  const accessorySets = ACCESSORY_SETS_BY_OBJETIVO[q.objetivo]
  const mainRepRange = REP_RANGE_BY_OBJETIVO[q.objetivo]
  const usedNames = new Set<string>()

  const program = {} as Program

  for (const day of DAY_SLOTS) {
    const groups = groupsByDay[day]
    const pool = EXERCISE_LIBRARY.filter(
      (ex) => groups.includes(ex.group) && usable(ex.equipment, q.equipamento) && !conflicts(ex.avoid, q.limitacoes) && !usedNames.has(ex.name),
    )

    const exercises: ProgramExercise[] = []

    // 1) série de aquecimento + levantamento principal do dia, se houver um composto com categoria disponível
    const mainCandidate = pool.find((ex) => ex.compound && ex.liftCategory)
    if (mainCandidate) {
      const baseline = mainCandidate.liftCategory ? anamnese?.mainLifts[mainCandidate.liftCategory] : undefined
      exercises.push({
        id: generateId('ex'),
        name: `${mainCandidate.name} (aquecimento)`,
        detail: buildRampDetail(baseline?.load),
        isMain: false,
      })
      exercises.push({
        id: generateId('ex'),
        name: mainCandidate.name,
        detail: repSchemeText(mainSets, mainRepRange),
        isMain: true,
        liftCategory: mainCandidate.liftCategory,
      })
      usedNames.add(mainCandidate.name)
    }

    // 2) acessórios, distribuindo pelos grupos musculares do dia
    const remainingPool = pool.filter((ex) => ex.name !== mainCandidate?.name)
    let groupIdx = 0
    let guard = 0
    const targetCount = accessoryCount + (mainCandidate ? 2 : 0)
    while (exercises.length < targetCount && guard < 200) {
      guard++
      const group = groups[groupIdx % groups.length]
      groupIdx++
      const candidate = remainingPool.find((ex) => ex.group === group && !usedNames.has(ex.name))
      if (candidate) {
        exercises.push({
          id: generateId('ex'),
          name: candidate.name,
          detail: repSchemeText(accessorySets, REP_RANGE_BY_OBJETIVO[q.objetivo]),
          isMain: false,
        })
        usedNames.add(candidate.name)
      }
      // se nenhum grupo tem mais candidatos, encerra
      const anyLeft = remainingPool.some((ex) => !usedNames.has(ex.name))
      if (!anyLeft) break
    }

    // 3) finisher de condicionamento metabólico, se marcado — combina com qualquer objetivo
    if (q.condicionamentoExtra) {
      const finisher = CONDICIONAMENTO_FINISHER[q.equipamento]
      exercises.push({
        id: generateId('ex'),
        name: finisher.name,
        detail: finisher.detail,
        isMain: false,
        kind: 'aerobico',
      })
    }

    program[day] = exercises
  }

  return program
}
