import type { Program, ProgramExercise } from './types'
import { generateId } from './id'
import { diffDays } from './dates'

/**
 * HIIT de 100 (Stoppani) — programa fechado de 6 semanas que o atleta trouxe pronto,
 * diferente do gerador genérico por objetivo: estrutura, exercícios e divisão de dias
 * são fixos; só a carga (a partir do 10RM de cada um) e o intervalo entre séries do
 * bloco principal (que encolhe semana a semana, 60s → 10-20s) variam.
 */
export interface Hiit100Cargas10RM {
  supino: number
  agachamento: number
  terra: number
  meioDesenvolvimento: number
}

export interface Hiit100Config {
  /** Data ISO do início da semana 1. */
  startDate: string
  cargas10RM: Hiit100Cargas10RM
}

export const HIIT100_TOTAL_WEEKS = 6

export interface Hiit100WeekInfo {
  /** 1-6, nunca passa de 6 (programa fica "concluído" depois disso). */
  semana: number
  concluido: boolean
  intervaloLabel: string
  focoLabel: string
}

const INTERVALO_POR_SEMANA: Record<number, string> = {
  1: '60s',
  2: '50s',
  3: '40s',
  4: '30s',
  5: '20s',
  6: '10–20s',
}

const FOCO_POR_SEMANA: Record<number, string> = {
  1: 'séries 1-3 explosivas, 4-6 controladas, 7-10 livre',
  2: 'séries 1-3 explosivas, 4-6 controladas, 7-10 livre',
  3: 'séries 1-3 explosivas, 4-6 controladas, 7-10 livre',
  4: 'qualquer velocidade — o objetivo agora é só completar as 100 reps',
  5: 'qualquer velocidade — o objetivo agora é só completar as 100 reps',
  6: 'qualquer velocidade — o objetivo agora é só completar as 100 reps',
}

/** Semana atual do protocolo, calculada a partir da data de início — igual ao padrão
 * já usado pro mesociclo/ciclo ondulatório (dates.ts): nunca fica congelada num texto
 * salvo, sempre recalculada a partir de hoje. */
export function getHiit100Week(startDateISO: string, todayISOStr: string): Hiit100WeekInfo {
  const dias = Math.max(0, diffDays(startDateISO, todayISOStr))
  const semanaBruta = Math.floor(dias / 7) + 1
  const concluido = semanaBruta > HIIT100_TOTAL_WEEKS
  const semana = concluido ? HIIT100_TOTAL_WEEKS : Math.max(1, semanaBruta)
  return { semana, concluido, intervaloLabel: INTERVALO_POR_SEMANA[semana], focoLabel: FOCO_POR_SEMANA[semana] }
}

function round5(v: number): number {
  return Math.round(v / 5) * 5
}

function pct50(v: number): number {
  return round5(v * 0.5)
}

/** Bloco principal "HIIT de 100" (10x10) + as 3 séries adicionais (2 a 10RM até a
 * falha + 1 drop set a 50%) que o vêm logo depois no plano original. Quando o 10RM
 * do exercício não foi declarado (puxada aberta, tríceps polia, panturrilha,
 * encolhimento, rosca direta — o próprio documento já marca como "estimar"), usa a
 * orientação de estimativa em vez de inventar um número. */
function hiitBlock(name: string, tenRM: number | undefined, estimateNote?: string): ProgramExercise[] {
  const carga50 = tenRM ? pct50(tenRM) : undefined
  const cargaText = carga50 ? `${carga50}kg (50% do seu 10RM de ${tenRM}kg)` : estimateNote ?? 'estimar ~50% do seu 10RM nesse exercício'
  const rmText = tenRM ? `${tenRM}kg` : 'seu 10RM real nesse exercício'
  const dropText = carga50 ? `${carga50}kg` : '50% do 10RM'
  return [
    {
      id: generateId('ex'),
      name: `${name} — HIIT de 100`,
      detail: `10 séries x 10 reps (100 reps no total) @ ${cargaText}. Semanas 1-3: séries 1-3 explosivas, 4-6 controladas, 7-10 livre; semanas 4-6: qualquer velocidade, foco em completar as 100. Intervalo entre séries encolhe a cada semana (60s → 10-20s) — ver o card do protocolo pra semana atual.`,
      isMain: true,
    },
    {
      id: generateId('ex'),
      name: `${name} — séries adicionais`,
      detail: `2 séries a ${rmText} (10RM) até a falha (~5-7 reps) + 1 drop set a ${dropText} até a falha — 1min entre séries.`,
      isMain: false,
    },
  ]
}

function aux(name: string, rm: '10RM' | '15RM'): ProgramExercise {
  return { id: generateId('ex'), name, detail: `3 séries até a falha a ${rm}, 1min entre séries.`, isMain: false }
}

function bodyweightAcc(name: string): ProgramExercise {
  return { id: generateId('ex'), name, detail: '3 séries x 15 reps, peso corporal, 30s entre séries.', isMain: false }
}

function finisher(name: string, detail: string): ProgramExercise {
  return { id: generateId('ex'), name: `Finalizador Tabata — ${name}`, detail, isMain: false, kind: 'aerobico' }
}

/** Monta o Program completo (dia1 = Segunda, dia2 = Quarta, dia3 = Sexta) do HIIT de
 * 100, fiel à divisão do documento original: peito/costas/abdômen, perna/tríceps/
 * panturrilha, ombro/trapézio/bíceps/antebraço. */
export function buildHiit100Program(cargas: Hiit100Cargas10RM): Program {
  const program = {} as Program

  program.dia1 = [
    ...hiitBlock('Supino', cargas.supino),
    aux('Supino inclinado com halteres', '10RM'),
    aux('Crucifixo com halteres', '15RM'),
    ...hiitBlock('Puxada aberta', undefined, 'estimar ~20-25kg (teste na 1ª sessão e ajuste pro seu 50% real)'),
    aux('Remada curvada com barra', '10RM'),
    aux('Extensão de ombro (máquina/cabo)', '15RM'),
    bodyweightAcc('Infra-abdominal'),
    bodyweightAcc('Supra-abdominal'),
    finisher(
      'Terra + rosca + meio desenvolvimento',
      '8 séries x 20s trabalho / 10s descanso, alternando entre os 3 exercícios com halteres leves, execução explosiva.',
    ),
  ]

  program.dia2 = [
    ...hiitBlock('Agachamento', cargas.agachamento),
    aux('Leg press', '10RM'),
    aux('Cadeira extensora', '15RM'),
    aux('Mesa flexora', '15RM'),
    ...hiitBlock('Tríceps na polia', undefined, 'estimar ~10-12kg (teste na 1ª sessão e ajuste pro seu 50% real)'),
    aux('Tríceps polia (pegada reta)', '15RM'),
    ...hiitBlock('Panturrilha em pé', undefined, 'estimar ~30-40kg (teste na 1ª sessão e ajuste pro seu 50% real)'),
    aux('Panturrilha sentado', '15RM'),
    finisher('Swing com kettlebell', '8 séries x 20s trabalho / 10s descanso, kettlebell leve.'),
  ]

  program.dia3 = [
    ...hiitBlock('Meio desenvolvimento', cargas.meioDesenvolvimento),
    aux('Elevação lateral com halteres', '10RM'),
    aux('Crucifixo invertido', '15RM'),
    ...hiitBlock('Encolhimento com halteres', undefined, 'estimar ~15kg (teste na 1ª sessão e ajuste pro seu 50% real)'),
    ...hiitBlock('Rosca direta com halteres', undefined, 'estimar ~8kg (teste na 1ª sessão e ajuste pro seu 50% real)'),
    aux('Rosca inclinada', '15RM'),
    aux('Rosca punho (antebraço)', '15RM'),
    finisher('Clean com halteres', '8 séries x 20s trabalho / 10s descanso, halteres leves, execução explosiva.'),
  ]

  return program
}
