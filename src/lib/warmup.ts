import type { WarmupStep } from './types'

/**
 * Aquecimento RR — protocolo de 7 blocos de Rafael Ribeiro (faixa preta 3º grau,
 * especialista em biomecânica, colunista GracieMag, criador do MAMP System e da
 * MetodologiaRR), do e-book "8 Dicas para você não morrer no gás nos treinos".
 * Vídeos e dosagens são os indicados pelo próprio autor no material.
 */
export const WARMUP_SOURCE =
  'Aquecimento RR — Rafael Ribeiro (faixa preta 3º grau, especialista em biomecânica, colunista GracieMag).'

export const WARMUP_STEPS: WarmupStep[] = [
  {
    id: 'liberacao-miofascial',
    ordem: 1,
    nome: 'Liberação miofascial',
    descricao: 'Libera a tensão da fáscia nos músculos, deixando o movimento mais solto e leve — menos fadiga e menor risco de lesão.',
    videoQuery: 'liberação miofascial rolo de espuma aquecimento',
  },
  {
    id: 'mobilidade',
    ordem: 2,
    nome: 'Mobilidade',
    descricao: 'Mobiliza as articulações e nutre com líquido sinovial, aumentando a amplitude e protegendo contra lesões. 10 repetições de cada.',
    videoQuery: 'mobilidade articular aquecimento jiu-jitsu',
    itens: [
      { nome: 'Acetábulo', dosagem: '10 reps', videoUrl: 'https://youtu.be/D05FuT2HLZs' },
      { nome: 'Mobilidade de quadril — climber', dosagem: '10 reps', videoUrl: 'https://youtu.be/jL86_cp8ONo' },
      { nome: 'Quadril ida e volta', dosagem: '10 reps', videoUrl: 'https://youtu.be/VMf8Guqo3kE' },
      { nome: 'Tripla extensão', dosagem: '10 reps', videoUrl: 'https://youtu.be/pkvXN5YqBZ8' },
    ],
  },
  {
    id: 'alongamento-dinamico',
    ordem: 3,
    nome: 'Alongamentos dinâmicos',
    descricao: 'Alongamentos com movimento (balísticos), sem fase estática — eleva a temperatura corporal. 20 repetições de cada.',
    videoQuery: 'alongamento dinâmico aquecimento treino',
    itens: [
      { nome: 'Puxada de pé e dedo no teto', dosagem: '20 reps', videoUrl: 'https://www.youtube.com/watch?v=-wQb-tOzdv8&feature=youtu.be' },
      { nome: 'Rotação de braços para frente', dosagem: '20 reps', videoUrl: 'https://youtu.be/5mNcbWcHRPw' },
      { nome: 'Rotação de braços para trás', dosagem: '20 reps', videoUrl: 'https://youtu.be/0bX1z49l6Lo' },
    ],
  },
  {
    id: 'estabilidade-estatica',
    ordem: 4,
    nome: 'Estabilidade estática',
    descricao: 'Pranchas e pontes — início do trabalho de ativação muscular geral. Uma série até o cansaço.',
    videoQuery: 'exercícios de estabilidade estática core',
    itens: [
      { nome: 'Prancha lateral', dosagem: 'até o cansaço', videoUrl: 'https://youtu.be/gdymaeOebMQ' },
      { nome: 'Avião estático', dosagem: 'até o cansaço', videoUrl: 'https://youtu.be/OR4DZdttrDE' },
    ],
  },
  {
    id: 'ativacao-especifica',
    ordem: 5,
    nome: 'Ativações específicas',
    descricao: 'Aumenta o estímulo neural em músculos específicos. Uma série até cansar o músculo.',
    videoQuery: 'ativação muscular específica antes do treino',
    itens: [{ nome: 'Elevação pélvica', dosagem: 'até cansar', videoUrl: 'https://youtu.be/3SFKoHxJblU' }],
  },
  {
    id: 'estabilidade-dinamica',
    ordem: 6,
    nome: 'Estabilidade dinâmica',
    descricao: 'Trabalha a estabilidade do corpo em movimento — controle da força gerada durante o movimento.',
    videoQuery: 'exercícios de estabilidade dinâmica funcional',
    itens: [
      { nome: 'Avião dinâmico', dosagem: '8-10 reps', videoUrl: 'https://youtu.be/z0H1tYtabZs' },
      { nome: 'Caminhada com as mãos', dosagem: '8-10 reps', videoUrl: 'https://youtu.be/NeltgagliWI' },
    ],
  },
  {
    id: 'ativacao-central',
    ordem: 7,
    nome: 'Ativação central',
    descricao: 'Toque final: produz velocidade com a maior estimulação neural possível — saltos pliométricos e estímulos reativos/cognitivos.',
    videoQuery: 'ativação do sistema nervoso central antes de treinar',
    itens: [{ nome: 'Drop', dosagem: '3-5 reps', videoUrl: 'https://youtu.be/g_v-3zBW0iQ' }],
  },
]
