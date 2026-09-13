export interface CoachTip {
  id: string
  titulo: string
  texto: string
}

/**
 * Dicas de periodização e recuperação de Rafael Ribeiro (faixa preta 3º grau,
 * especialista em biomecânica, colunista GracieMag), do e-book "8 Dicas para você
 * não morrer no gás nos treinos". As dicas 1 (aquecimento) e 6 (velocidade) já
 * estão implementadas como o Aquecimento RR e o Drill de velocidade — aqui ficam
 * as demais, que são orientação de planejamento, não uma rotina executável.
 */
export const COACH_TIPS: CoachTip[] = [
  {
    id: 'volume-rolas',
    titulo: 'Controle a quantidade de rolas por semana',
    texto:
      'Não treine no máximo todos os dias — o corpo não recupera. Alterne dias fortes, moderados e leves, tanto no número de rolas quanto na intensidade de cada uma.',
  },
  {
    id: 'tapering',
    titulo: 'Reduza o volume perto da competição',
    texto:
      'Na semana de "polimento" (tapering), corte o volume semanal de treino pela metade — não dê "gás" extra no final. O trabalho pesado já foi feito antes.',
  },
  {
    id: 'alinhamento-fisico-tatame',
    titulo: 'Alinhe a preparação física ao tatame',
    texto:
      'Longe de competição: treino físico mais forte, volume/intensidade no tatame menores. Perto da competição: inverta — mais tatame, treino físico focado em velocidade com menos fadiga.',
  },
  {
    id: 'objetivos-especificos',
    titulo: 'Treine objetivos específicos numa luta',
    texto:
      'Dê metas de tempo e posição na rola (ex.: da meia-guarda, 30s para fazer 5 pontos ou finalizar). Isso força tomada de decisão rápida em vez de rola sem direção.',
  },
  {
    id: 'simular-competicao',
    titulo: 'Simule a competição antes de competir',
    texto:
      'Reproduza tempos reais de luta e descanso, pontuação e arbitragem, e o número de combates previsto no dia. Depois converse sobre o que funcionou — treino teórico também é treino.',
  },
  {
    id: 'sono',
    titulo: 'Durma bem',
    texto:
      'O sono é o principal mecanismo de recuperação — repara microlesões, produz GH e afeta diretamente concentração e estresse. Evite telas 2h antes de dormir e refeições pesadas próximo da hora de deitar.',
  },
]

export const COACH_TIPS_SOURCE =
  'Rafael Ribeiro — faixa preta 3º grau, especialista em biomecânica, colunista GracieMag, criador da MetodologiaRR.'
