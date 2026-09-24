import type { LiftCategory } from './types'
import { EXERCISE_LIBRARY, type LibExercise } from './exerciseLibrary'

/** Alternativas padrão para os 3 levantamentos-base, caso o atleta não possa/saiba fazer o original. */
const BY_LIFT_CATEGORY: Record<LiftCategory, string[]> = {
  agachamento: ['Leg press', 'Agachamento no smith', 'Agachamento búlgaro', 'Hack squat'],
  supino: ['Supino com halteres', 'Supino no smith', 'Crucifixo com halteres', 'Flexão de braço'],
  terra: ['Levantamento terra sumô', 'Levantamento terra romeno', 'Hip thrust', 'Bom dia (good morning)'],
}

/**
 * Alternativas para acessórios comuns, por palavra-chave no nome do exercício.
 * Cobre por nome todo exercício do programa padrão (defaultProgram.ts) — cada um foi
 * conferido aqui pra nunca cair sem substituto (era o caso de "Barra fixa" antes: só
 * existia entrada pra "puxada", e "barra fixa" não contém essa palavra).
 * ORDEM IMPORTA: entradas mais específicas (várias palavras) vêm antes das genéricas,
 * porque a busca para no primeiro match.
 */
const BY_KEYWORD: { match: string[]; subs: string[] }[] = [
  // --- multi-palavra / mais específicas primeiro ---
  { match: ['feixe posterior'], subs: ['Crucifixo invertido (feixe posterior)', 'Face pull (cabo)', 'Remada aberta'] },
  { match: ['agachamento frontal'], subs: ['Leg press', 'Agachamento goblet com halter'] },
  { match: ['supino inclinado'], subs: ['Supino inclinado no smith', 'Crucifixo inclinado com halteres'] },
  { match: ['terra romeno'], subs: ['Mesa flexora', 'Stiff com halteres'] },
  { match: ['prancha lateral'], subs: ['Prancha lateral com joelho apoiado', 'Dead bug lateral'] },
  { match: ['elevação lateral', 'elevacao lateral'], subs: ['Elevação lateral no cabo', 'Crucifixo invertido'] },
  { match: ['rosca direta'], subs: ['Rosca alternada com halteres', 'Rosca martelo'] },
  { match: ['rosca alternada'], subs: ['Rosca direta com barra', 'Rosca martelo'] },
  { match: ['triceps testa', 'tríceps testa'], subs: ['Tríceps pulley', 'Mergulho no banco'] },
  { match: ['triceps pulley', 'tríceps pulley'], subs: ['Tríceps testa', 'Mergulho no banco'] },
  { match: ['peck deck'], subs: ['Crucifixo com halteres', 'Crossover (cabo)'] },
  { match: ['barra fixa'], subs: ['Puxada frontal (pegada neutra)', 'Remada baixa (cabo)', 'Puxada com elástico (em casa)'] },

  // --- 1 palavra / mais genéricas ---
  { match: ['remada'], subs: ['Remada baixa (cabo)', 'Remada unilateral com halter', 'Puxada frontal'] },
  { match: ['puxada'], subs: ['Barra fixa (assistida ou livre)', 'Remada baixa (cabo)'] },
  { match: ['prancha'], subs: ['Prancha com apoio nos joelhos', 'Dead bug', 'Abdominal na polia'] },
  { match: ['búlgaro', 'bulgaro'], subs: ['Afundo (passada)', 'Leg press', 'Agachamento goblet com halter'] },
  { match: ['extensora'], subs: ['Leg press', 'Afundo (passada)', 'Agachamento goblet com halter'] },
  { match: ['abdutora'], subs: ['Abdução de quadril com elástico em pé', 'Ponte com abdução de quadril'] },
  { match: ['adutora'], subs: ['Adução de quadril com elástico', 'Agachamento sumô'] },
  { match: ['panturrilha'], subs: ['Panturrilha em pé (peso corporal)', 'Panturrilha sentada (máquina)'] },
  { match: ['crossover'], subs: ['Peck deck', 'Crucifixo com halteres'] },
  { match: ['desenvolvimento'], subs: ['Desenvolvimento com halteres', 'Elevação lateral + frontal combinadas', 'Arnold press'] },
  { match: ['martelo'], subs: ['Rosca alternada com halteres', 'Rosca direta com barra'] },
  { match: ['antebraço', 'antebraco'], subs: ['Rosca de punho (wrist curl)', 'Prancha com barra (grip isométrico)'] },
]

function stripAccents(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function norm(s: string): string {
  return stripAccents(s.toLowerCase()).replace(/\(.*?\)/g, '').trim()
}

/**
 * Respaldo genérico: acha o exercício mais parecido na biblioteca (por nome) e
 * devolve outros exercícios do MESMO grupo muscular. Cobre exercícios que o
 * atleta cadastrou por conta própria e não estão na lista de palavras-chave acima
 * — sem isso, um exercício customizado nunca teria substituto sugerido.
 */
function librarySubstitutes(exerciseName: string): string[] {
  const target = norm(exerciseName)
  if (!target) return []

  const matched = EXERCISE_LIBRARY.find((lib) => {
    const libNorm = stripAccents(lib.name.toLowerCase())
    return libNorm.includes(target) || target.includes(norm(lib.name))
  })
  if (!matched) return []

  return EXERCISE_LIBRARY.filter((lib: LibExercise) => lib.group === matched.group && lib.name !== matched.name)
    .map((lib) => lib.name)
    .slice(0, 4)
}

/** Sugestões automáticas de substituição — por categoria de levantamento principal,
 * depois por palavra-chave no nome, e por fim por grupo muscular na biblioteca. */
export function getBuiltInSubstitutes(exercise: { name: string; liftCategory?: LiftCategory }): string[] {
  if (exercise.liftCategory) return BY_LIFT_CATEGORY[exercise.liftCategory]

  const lower = stripAccents(exercise.name.toLowerCase())
  for (const entry of BY_KEYWORD) {
    if (entry.match.some((m) => lower.includes(stripAccents(m)))) return entry.subs
  }

  return librarySubstitutes(exercise.name)
}
