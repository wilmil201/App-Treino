import type { LiftCategory } from './types'

/** Alternativas padrão para os 3 levantamentos-base, caso o atleta não possa/saiba fazer o original. */
const BY_LIFT_CATEGORY: Record<LiftCategory, string[]> = {
  agachamento: ['Leg press', 'Agachamento no smith', 'Agachamento búlgaro', 'Hack squat'],
  supino: ['Supino com halteres', 'Supino no smith', 'Crucifixo com halteres', 'Flexão de braço'],
  terra: ['Levantamento terra sumô', 'Levantamento terra romeno', 'Hip thrust', 'Bom dia (good morning)'],
}

/** Alternativas para acessórios comuns, por palavra-chave no nome do exercício. */
const BY_KEYWORD: { match: string[]; subs: string[] }[] = [
  { match: ['remada'], subs: ['Remada baixa (cabo)', 'Remada unilateral com halter', 'Puxada frontal'] },
  { match: ['puxada'], subs: ['Barra fixa (assistida ou livre)', 'Remada baixa (cabo)'] },
  { match: ['elevação lateral', 'elevacao lateral'], subs: ['Elevação lateral no cabo', 'Crucifixo invertido'] },
  { match: ['prancha lateral'], subs: ['Prancha lateral com joelho apoiado', 'Dead bug lateral'] },
  { match: ['prancha'], subs: ['Prancha com apoio nos joelhos', 'Dead bug', 'Abdominal na polia'] },
  { match: ['agachamento frontal'], subs: ['Leg press', 'Agachamento goblet'] },
  { match: ['supino inclinado'], subs: ['Supino inclinado no smith', 'Crucifixo inclinado com halteres'] },
  { match: ['terra romeno'], subs: ['Mesa flexora', 'Stiff com halteres'] },
]

/** Sugestões automáticas de substituição — baseado na categoria de levantamento principal
 * quando existir, senão por palavra-chave no nome do exercício. */
export function getBuiltInSubstitutes(exercise: { name: string; liftCategory?: LiftCategory }): string[] {
  if (exercise.liftCategory) return BY_LIFT_CATEGORY[exercise.liftCategory]
  const lower = exercise.name.toLowerCase()
  for (const entry of BY_KEYWORD) {
    if (entry.match.some((m) => lower.includes(m))) return entry.subs
  }
  return []
}
