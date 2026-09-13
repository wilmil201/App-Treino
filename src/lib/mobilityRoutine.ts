import { SACO_BATER_REFERENCE_VIDEO } from './referenceVideos'

export type RoutineEquipment = 'tatame' | 'bola_suica' | 'saco_bater' | 'nenhum'

export interface RoutineItem {
  id: string
  nome: string
  /** Série x reps ou duração — sempre uma dosagem concreta, não "faça algumas repetições". */
  dosagem: string
  equipamento: RoutineEquipment
  aplicacao: string
  videoQuery: string
  videoUrl?: string
  /** true = videoUrl é uma compilação com vários drills, não um clipe exclusivo deste item. */
  videoIsCompilation?: boolean
}

export interface RoutineBlock {
  key: string
  titulo: string
  objetivo: string
  duracaoEstimada: string
  itens: RoutineItem[]
}

const EQUIPMENT_LABEL: Record<RoutineEquipment, string> = {
  tatame: 'Tatame',
  bola_suica: 'Bola suíça',
  saco_bater: 'Saco de bater',
  nenhum: 'Sem equipamento',
}

export { EQUIPMENT_LABEL }

/**
 * Rotina de mobilidade e drills para treinar em casa (tatame, bola suíça e saco de
 * bater), cobrindo quadril, ombros, pulsos, tornozelos, pescoço, core/abdômen e
 * agilidade. Estrutura RAMP (Raise–Activate/Mobilize–Potentiate) — protocolo padrão
 * de preparação física (Ian Jeffreys): eleva temperatura, mobiliza as articulações
 * na ordem extremidades→tronco→quadril→tornozelo, ativa o sistema nervoso com
 * agilidade, fecha com respiração. Separada do aquecimento pré-treino de jiu-jitsu
 * (que continua como está) — esta é uma sessão completa própria, de ~30 minutos.
 */
export const HOME_MOBILITY_ROUTINE: RoutineBlock[] = [
  {
    key: 'elevar',
    titulo: '1. Elevar',
    objetivo: 'Sobe a frequência cardíaca e a temperatura corporal antes de mobilizar as articulações a fundo.',
    duracaoEstimada: '~3 min',
    itens: [
      {
        id: 'corrida-estacionaria',
        nome: 'Corrida estacionária ou polichinelo',
        dosagem: '2 minutos contínuos',
        equipamento: 'tatame',
        aplicacao: 'Ativação cardiovascular geral — prepara o corpo pra mobilidade específica que vem a seguir.',
        videoQuery: 'jumping jacks high knees warm up',
      },
      {
        id: 'skip-joelhos',
        nome: 'Elevação de joelhos alternada (skip)',
        dosagem: '1 minuto',
        equipamento: 'tatame',
        aplicacao: 'Ativa quadril e coordenação — base para os drills de troca de nível do jiu-jitsu.',
        videoQuery: 'high knees skip drill warm up',
      },
    ],
  },
  {
    key: 'mobilidade',
    titulo: '2. Mobilidade articular específica',
    objetivo: 'Amplitude de movimento nas articulações mais exigidas pelo jiu-jitsu, na ordem pescoço → pulsos → ombros → core → quadril → tornozelo.',
    duracaoEstimada: '~12 min',
    itens: [
      {
        id: 'isometria-pescoco',
        nome: 'Isometria de pescoço (4 direções)',
        dosagem: '10s por direção x 2 séries',
        equipamento: 'tatame',
        aplicacao: 'Fortalece contra guilhotinas e mata-leões — reduz o risco de lesão cervical.',
        videoQuery: 'neck isometric exercises 4 way',
      },
      {
        id: 'rotacao-pulso',
        nome: 'Rotação de pulso e fechamento de punho',
        dosagem: '10 reps por sentido',
        equipamento: 'tatame',
        aplicacao: 'Prepara o pulso para grip fighting intenso e ajuda a prevenir torções.',
        videoQuery: 'wrist circles mobility warm up',
      },
      {
        id: 'rotacao-ombro',
        nome: 'Rotação de ombro e círculos de braço',
        dosagem: '10 reps por sentido',
        equipamento: 'tatame',
        aplicacao: 'Mobilidade geral de ombro para grip fighting e framing.',
        videoQuery: 'shoulder circles arm rotation warm up',
      },
      {
        id: 'wall-slides',
        nome: 'Wall slides',
        dosagem: '10 reps',
        equipamento: 'tatame',
        aplicacao: 'Controle escapular usado em frames e defesa de finalizações de ombro.',
        videoQuery: 'wall slides shoulder mobility exercise',
      },
      {
        id: 'prancha',
        nome: 'Prancha abdominal',
        dosagem: '30s x 2 séries',
        equipamento: 'tatame',
        aplicacao: 'Estabilidade de tronco sob pressão contínua.',
        videoQuery: 'prancha abdominal exercicio isometrico',
      },
      {
        id: 'dead-bug',
        nome: 'Dead bug (anti-rotação)',
        dosagem: '8 reps por lado',
        equipamento: 'tatame',
        aplicacao: 'Resiste à quebra de postura que o oponente tenta impor.',
        videoQuery: 'dead bug exercise anti rotation core',
      },
      {
        id: 'shrimping',
        nome: 'Shrimping / Ebi (fuga de quadril)',
        dosagem: '8 reps por lado',
        equipamento: 'tatame',
        aplicacao: 'O movimento de quadril mais fundamental do jiu-jitsu — base da fuga de posições e retenção de guarda.',
        videoQuery: 'shrimping ebi jiu-jitsu hip escape',
      },
      {
        id: 'hip-switch',
        nome: '90/90 hip switch',
        dosagem: '8 reps por lado',
        equipamento: 'tatame',
        aplicacao: 'Rotação interna/externa de quadril usada em passagem de guarda e raspagens.',
        videoQuery: '90 90 hip switch mobility drill',
      },
      {
        id: 'rotacao-tornozelo',
        nome: 'Rotação de tornozelo',
        dosagem: '10 reps por pé',
        equipamento: 'tatame',
        aplicacao: 'Equilíbrio em quedas, guarda borboleta e trabalho de base.',
        videoQuery: 'ankle circles mobility warm up',
      },
    ],
  },
  {
    key: 'equipamento',
    titulo: '3. Drills com equipamento',
    objetivo: 'Padrões de movimento do jiu-jitsu treinados sozinho, com bola suíça e saco de bater.',
    duracaoEstimada: '~10 min',
    itens: [
      {
        id: 'ponte-bola',
        nome: 'Ponte na bola suíça',
        dosagem: '10 reps',
        equipamento: 'bola_suica',
        aplicacao: 'Core e quadril em superfície instável — transferência direta para base e escape de montada.',
        videoQuery: 'swiss ball bridge exercise',
      },
      {
        id: 'fuga-quadril-bola',
        nome: 'Fuga de quadril com pernas na bola',
        dosagem: '8 reps por lado',
        equipamento: 'bola_suica',
        aplicacao: 'Adiciona instabilidade ao shrimp, exigindo mais controle de quadril.',
        videoQuery: 'stability ball hip escape drill',
      },
      {
        id: 'passagem-saco',
        nome: 'Drill de passagem de guarda no saco (kick pass / X-pass)',
        dosagem: '5 reps por lado',
        equipamento: 'saco_bater',
        aplicacao: 'Treina o footwork de passagem de guarda em pé, sozinho.',
        videoQuery: 'guard passing drill heavy bag jiu-jitsu',
        videoUrl: SACO_BATER_REFERENCE_VIDEO.url,
        videoIsCompilation: true,
      },
      {
        id: 'entrada-queda-saco',
        nome: 'Entrada de queda (shoot) no saco',
        dosagem: '5 reps por lado',
        equipamento: 'saco_bater',
        aplicacao: 'Repetição de entrada de queda com alvo fixo — constrói confiança e timing.',
        videoQuery: 'takedown entry heavy bag drill',
        videoUrl: SACO_BATER_REFERENCE_VIDEO.url,
        videoIsCompilation: true,
      },
    ],
  },
  {
    key: 'agilidade',
    titulo: '4. Agilidade',
    objetivo: 'Coordenação e velocidade de transição, feito ainda com o sistema nervoso fresco.',
    duracaoEstimada: '~5 min',
    itens: [
      {
        id: 'escada-agilidade',
        nome: 'Escada de agilidade ou cone drills',
        dosagem: '4 a 6 passagens',
        equipamento: 'tatame',
        aplicacao: 'Coordenação e velocidade de pés para transições.',
        videoQuery: 'agility ladder cone drills',
      },
      {
        id: 'sprawl',
        nome: 'Sprawl drill',
        dosagem: '8 reps',
        equipamento: 'tatame',
        aplicacao: 'Defesa de queda rápida e recomposição de base.',
        videoQuery: 'sprawl drill wrestling defense',
      },
    ],
  },
  {
    key: 'fechamento',
    titulo: '5. Fechamento',
    objetivo: 'Desacelera o sistema nervoso e fecha a sessão.',
    duracaoEstimada: '~2 min',
    itens: [
      {
        id: 'respiracao',
        nome: 'Respiração diafragmática (4s inspira / 6s expira, nasal)',
        dosagem: '1 minuto',
        equipamento: 'nenhum',
        aplicacao: 'Desativa o sistema nervoso simpático depois do esforço — fecha a sessão em vez de terminar abrupto.',
        videoQuery: 'respiração diafragmática exercício',
      },
      {
        id: 'alongamento-final',
        nome: 'Alongamento leve (quadril ou ombro, o que sentir mais tenso)',
        dosagem: '1 minuto',
        equipamento: 'tatame',
        aplicacao: 'Fecha a sessão focando na região que pedir mais atenção naquele dia.',
        videoQuery: 'alongamento quadril ombro leve',
      },
    ],
  },
]

export const ROUTINE_TOTAL_DURATION = '~30-32 minutos'
