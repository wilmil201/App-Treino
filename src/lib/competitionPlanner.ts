import type { RolaCategoria } from './types'
import { addDays, diffDays, startOfISOWeek } from './dates'

/**
 * Planejador de macrociclo por data de competição — Método Se7e (seção 8 do
 * material: "Modelo de periodização de 16 semanas rumo à competição"). O livro
 * descreve um exemplo fixo de 16 semanas com 4 fases; aqui generalizamos pra
 * qualquer prazo, mantendo a MESMA proporção entre fases do exemplo original
 * (4:5:4:3 semanas em 16 = 25%/31%/25%/19%) e a mesma lógica de progressão:
 * começa com volume alto/intensidade baixa (Longos), termina com volume
 * baixo/intensidade máxima (Tempo de competição).
 *
 * O livro assume ~5 sessões/semana (aula todo dia útil); este app rastreia
 * tipicamente 2 sessões reais por semana (sessao1/sessao2) — por isso a
 * "frequência de Tempo de competição por semana" foi escalada proporcionalmente
 * (ex.: o livro pede Tempo de competição em 3 de 5 dias na fase final ≈ 60%;
 * aqui isso vira as 2 sessões da semana, ou seja, praticamente toda sessão).
 */

export type CompetitionPhase = 'base_aerobia' | 'acidose' | 'transicao' | 'especificidade_maxima'

export const PHASE_LABEL: Record<CompetitionPhase, string> = {
  base_aerobia: 'Base aeróbia',
  acidose: 'Acidose',
  transicao: 'Transição',
  especificidade_maxima: 'Especificidade máxima',
}

export const PHASE_DESC: Record<CompetitionPhase, string> = {
  base_aerobia: 'Volume alto, intensidade baixa — predomínio de rolas longos, com toques de curtos/muito curtos pra já familiarizar o organismo.',
  acidose: 'Pico de estresse metabólico — predomínio de rolas curtos e muito curtos, mais recuperação entre estímulos.',
  transicao: 'Mistura consciente de todas as categorias, alternando a cada sessão — "Tempo de competição" já entra com mais frequência.',
  especificidade_maxima: 'Reta final — quase todas as sessões em "Tempo de competição" (tempo e intervalo exatos da sua categoria), intensidade próxima da real.',
}

export interface CompetitionWeekPlan {
  weekNumber: number
  weekStart: string
  weeksToGo: number
  phase: CompetitionPhase
  enfase: RolaCategoria
  tempoCompeticaoPorSemana: 0 | 1 | 2
}

const PHASE_PROPORTIONS: { phase: CompetitionPhase; weight: number }[] = [
  { phase: 'base_aerobia', weight: 4 },
  { phase: 'acidose', weight: 5 },
  { phase: 'transicao', weight: 4 },
  { phase: 'especificidade_maxima', weight: 3 },
]

const TEMPO_COMPETICAO_POR_FASE: Record<CompetitionPhase, 0 | 1 | 2> = {
  base_aerobia: 1,
  acidose: 0,
  transicao: 1,
  especificidade_maxima: 2,
}

/** Distribui `totalWeeks` semanas entre as 4 fases mantendo a proporção 4:5:4:3, com no mínimo 1 semana por fase quando possível. */
function distributePhaseWeeks(totalWeeks: number): CompetitionPhase[] {
  if (totalWeeks <= 0) return []
  const totalWeight = PHASE_PROPORTIONS.reduce((s, p) => s + p.weight, 0)
  const counts = PHASE_PROPORTIONS.map((p) => Math.max(1, Math.round((p.weight / totalWeight) * totalWeeks)))

  // ajusta arredondamento pra bater exatamente com totalWeeks
  let diff = totalWeeks - counts.reduce((s, c) => s + c, 0)
  let i = counts.length - 1
  while (diff !== 0) {
    if (diff > 0) {
      counts[i] += 1
      diff -= 1
    } else if (counts[i] > 1) {
      counts[i] -= 1
      diff += 1
    }
    i = i === 0 ? counts.length - 1 : i - 1
  }

  // prazos muito curtos: colapsa tudo pra especificidade máxima (faz sentido treinar específico quando falta pouco)
  if (totalWeeks < PHASE_PROPORTIONS.length) {
    return Array.from({ length: totalWeeks }, () => 'especificidade_maxima' as CompetitionPhase)
  }

  const sequence: CompetitionPhase[] = []
  PHASE_PROPORTIONS.forEach((p, idx) => {
    for (let w = 0; w < counts[idx]; w++) sequence.push(p.phase)
  })
  return sequence
}

function enfaseForPhase(phase: CompetitionPhase, weekIndexInPhase: number): RolaCategoria {
  if (phase === 'base_aerobia') return 'longo'
  if (phase === 'acidose') return 'curto'
  if (phase === 'especificidade_maxima') return 'tempo_competicao'
  // transição: alterna categorias entre as semanas (Alternância Consciente)
  const rotation: RolaCategoria[] = ['longo', 'curto', 'muito_curto']
  return rotation[weekIndexInPhase % rotation.length]
}

/**
 * Monta o plano semana a semana da data de hoje até a competição (inclusive).
 * Retorna null se a data da competição já passou.
 */
export function buildCompetitionPlan(competitionDateISO: string, todayISO: string): CompetitionWeekPlan[] | null {
  const daysToGo = diffDays(todayISO, competitionDateISO)
  if (daysToGo < 0) return null

  const totalWeeks = Math.max(1, Math.ceil((daysToGo + 1) / 7))
  const phases = distributePhaseWeeks(totalWeeks)

  const firstWeekStart = startOfISOWeek(todayISO)
  const plan: CompetitionWeekPlan[] = []
  let weekIndexInPhase = 0
  let currentPhase: CompetitionPhase | null = null

  for (let w = 0; w < phases.length; w++) {
    const phase = phases[w]
    weekIndexInPhase = phase === currentPhase ? weekIndexInPhase + 1 : 0
    currentPhase = phase
    const weekStart = addDays(firstWeekStart, w * 7)
    plan.push({
      weekNumber: w + 1,
      weekStart,
      weeksToGo: phases.length - w,
      phase,
      enfase: enfaseForPhase(phase, weekIndexInPhase),
      tempoCompeticaoPorSemana: TEMPO_COMPETICAO_POR_FASE[phase],
    })
  }
  return plan
}

/** Retorna o plano da semana atual (a que contém `todayISO`), se houver um macrociclo de competição ativo. */
export function currentWeekPlan(plan: CompetitionWeekPlan[] | null, todayISO: string): CompetitionWeekPlan | null {
  if (!plan) return null
  const weekStart = startOfISOWeek(todayISO)
  return plan.find((w) => w.weekStart === weekStart) ?? plan[0] ?? null
}
