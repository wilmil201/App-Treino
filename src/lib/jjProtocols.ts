export const SESSION_PROTOCOLS: Record<number, { sessao1: string; sessao2: string }> = {
  0: {
    sessao1: 'Técnica + rola contínua de baixa intensidade (zona 2), foco em respiração e posicionamento.',
    sessao2: 'Técnica + rola intervalada leve, prioridade em manter ritmo constante do início ao fim.',
  },
  1: {
    sessao1: 'Técnica + rola em blocos de alta intensidade, com pausas curtas entre rounds.',
    sessao2: 'Técnica + rola com rounds curtos e descanso reduzido, simulando acúmulo de fadiga/lactato.',
  },
  2: {
    sessao1: 'Técnica situacional + rola por posição específica (guarda, passagem, finalização).',
    sessao2: 'Rola de referência em ritmo de competição — simulado de luta completo.',
  },
}
