/**
 * Modelos de periodização — base conceitual: Jim Stoppani, "Enciclopédia de
 * Musculação e Força" (síntese de domínio, não texto/tabelas literais da obra).
 * Os 3 modelos manipulam a mesma variável (RPE-alvo por semana dentro do
 * mesociclo de 4 semanas) de formas diferentes; a semana 4 é sempre deload nos
 * 3 — isso não é negociável por modelo, é a camada de segurança contra a fase
 * de exaustão da Síndrome da Adaptação Geral (Selye).
 */
export type PeriodizacaoModel = 'classica' | 'linear_invertida' | 'ondulada'

export const PERIODIZACAO_LABEL: Record<PeriodizacaoModel, string> = {
  classica: 'Clássica',
  linear_invertida: 'Linear invertida',
  ondulada: 'Ondulada',
}

export const PERIODIZACAO_DESC: Record<PeriodizacaoModel, string> = {
  classica: 'Volume alto/intensidade baixa no início, intensidade sobe e volume cai ao longo do mesociclo. Progressão linear clássica de força e potência.',
  linear_invertida:
    'Começa com intensidade alta/volume baixo e progride pra volume alto/intensidade baixa — útil quando você precisa de um pico de força cedo no calendário.',
  ondulada:
    'Alterna intensidade alta e baixa entre semanas em vez de progressão linear — mais variação de estímulo, bem suportada para força e hipertrofia simultâneas.',
}

/** Deslocamento do RPE-alvo em relação ao centro do objetivo, por semana do
 * mesociclo (1-3) — a semana 4 é sempre deload (RPE fixo 6), por isso não entra
 * aqui, é tratada à parte em resolveTargetRpe. */
export const RPE_OFFSET_BY_MODEL: Record<PeriodizacaoModel, Record<1 | 2 | 3, number>> = {
  // volume alto/intensidade baixa -> intensidade sobe, volume cai
  classica: { 1: -1.25, 2: -0.5, 3: 0.5 },
  // intensidade alta cedo -> cai progressivamente, volume sobe
  linear_invertida: { 1: 0.5, 2: -0.25, 3: -1 },
  // zigue-zague: pesado -> leve -> moderado, sem tendência linear
  ondulada: { 1: 0.25, 2: -1, 3: 0 },
}

/** Rótulo curto pra cabeçalho do banner (o RPE numérico exato varia por objetivo, ver
 * resolveTargetRpe em suggestions.ts — aqui é só a caracterização qualitativa da semana). */
export const WEEK_SHORT_LABEL_BY_MODEL: Record<PeriodizacaoModel, Record<1 | 2 | 3 | 4, string>> = {
  classica: { 1: 'Volume alto', 2: 'Acumulação', 3: 'Intensificação', 4: 'Deload' },
  linear_invertida: { 1: 'Pico adiantado', 2: 'Intensidade moderada', 3: 'Volume subindo', 4: 'Deload' },
  ondulada: { 1: 'Semana pesada', 2: 'Semana leve', 3: 'Semana moderada', 4: 'Deload' },
}

export const WEEK_DESCRICAO_BY_MODEL: Record<PeriodizacaoModel, Record<1 | 2 | 3 | 4, string>> = {
  classica: {
    1: 'Semana 1 · volume alto, intensidade baixa (acumulação)',
    2: 'Semana 2 · acumulação moderada',
    3: 'Semana 3 · intensificação, volume caindo',
    4: 'Semana 4 · deload',
  },
  linear_invertida: {
    1: 'Semana 1 · intensidade alta, volume baixo (pico adiantado)',
    2: 'Semana 2 · intensidade moderada',
    3: 'Semana 3 · volume subindo, intensidade caindo',
    4: 'Semana 4 · deload',
  },
  ondulada: {
    1: 'Semana 1 · pesada',
    2: 'Semana 2 · leve',
    3: 'Semana 3 · moderada',
    4: 'Semana 4 · deload',
  },
}
