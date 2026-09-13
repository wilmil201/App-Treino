import type { ChecklistGroup } from './checklist'

/**
 * Mobilidade específica para jiu-jitsu, por região do corpo, mais agilidade.
 * Cada exercício foi escolhido pela aplicação direta ao jogo (guarda, passagem,
 * raspagem, defesa de finalização), não como mobilidade genérica de academia.
 */
export const MOBILITY_GROUPS: ChecklistGroup[] = [
  {
    key: 'quadril',
    label: 'Quadril',
    itens: [
      {
        id: 'shrimping',
        nome: 'Shrimping / Ebi (fuga de quadril)',
        aplicacao: 'O movimento de quadril mais fundamental do jiu-jitsu — base para fugir de posições e reter guarda.',
        videoQuery: 'shrimping ebi jiu-jitsu hip escape',
      },
      {
        id: 'borboleta',
        nome: 'Alongamento borboleta',
        aplicacao: 'Mobilidade de quadril e virilha — essencial para quem joga guarda aberta e butterfly.',
        videoQuery: 'alongamento borboleta mobilidade quadril jiu-jitsu',
      },
      {
        id: 'hip-switch',
        nome: '90/90 hip switch',
        aplicacao: 'Rotação interna/externa de quadril usada em passagem de guarda e raspagens.',
        videoQuery: '90 90 hip switch mobility drill',
      },
      {
        id: 'ponte-unilateral',
        nome: 'Elevação de quadril unilateral',
        aplicacao: 'Ativação de glúteo e estabilidade de quadril para bridging e upa.',
        videoQuery: 'single leg hip thrust ativação glúteo',
      },
    ],
  },
  {
    key: 'ombro',
    label: 'Ombros',
    itens: [
      {
        id: 'rotacao-ombro',
        nome: 'Rotação de ombro e círculos de braço',
        aplicacao: 'Mobilidade geral de ombro para grip fighting e framing.',
        videoQuery: 'shoulder circles arm rotation warm up',
      },
      {
        id: 'wall-slides',
        nome: 'Wall slides',
        aplicacao: 'Controle escapular usado em frames e defesa de finalizações de ombro.',
        videoQuery: 'wall slides shoulder mobility exercise',
      },
      {
        id: 'alongamento-cruzado',
        nome: 'Alongamento cruzado de ombro',
        aplicacao: 'Alonga a musculatura usada em raspagens e escapes por baixo.',
        videoQuery: 'cross body shoulder stretch',
      },
    ],
  },
  {
    key: 'pulso',
    label: 'Pulsos',
    itens: [
      {
        id: 'rotacao-pulso',
        nome: 'Rotação de pulso e fechamento de punho',
        aplicacao: 'Prepara o pulso para grip fighting intenso e ajuda a prevenir torções.',
        videoQuery: 'wrist circles mobility warm up',
      },
      {
        id: 'extensao-flexao-pulso',
        nome: 'Extensão/flexão de pulso assistida',
        aplicacao: 'Protege contra lesão de pulso em finalizações e disputa de pegada.',
        videoQuery: 'wrist flexor extensor stretch grappling',
      },
      {
        id: 'apoio-rotacao-palma',
        nome: 'Apoio de mãos com rotação de palma',
        aplicacao: 'Carrega o pulso em posição de guarda e base, estilo animal flow.',
        videoQuery: 'hand wrist rotation animal flow bjj',
      },
    ],
  },
  {
    key: 'tornozelo',
    label: 'Tornozelos',
    itens: [
      {
        id: 'rotacao-tornozelo',
        nome: 'Rotação de tornozelo',
        aplicacao: 'Equilíbrio em quedas, guarda borboleta e trabalho de base.',
        videoQuery: 'ankle circles mobility warm up',
      },
      {
        id: 'mobilizacao-panturrilha',
        nome: 'Mobilização de tornozelo em apoio de joelhos (knee to wall)',
        aplicacao: 'Amplitude de tornozelo importante para passagem e retenção de guarda de pé.',
        videoQuery: 'ankle mobility knee to wall exercise',
      },
    ],
  },
  {
    key: 'pescoco',
    label: 'Pescoço',
    itens: [
      {
        id: 'isometria-pescoco',
        nome: 'Isometria de pescoço (4 direções)',
        aplicacao: 'Fortalece contra guilhotinas e mata-leões — reduz o risco de lesão cervical.',
        videoQuery: 'neck isometric exercises 4 way',
      },
      {
        id: 'ponte-pescoco',
        nome: 'Ponte de pescoço controlada',
        aplicacao: 'Fortalece para sobreviver à pressão de raspagem de cabeça e escape de montada.',
        videoQuery: 'neck bridge exercise wrestling controlled',
      },
    ],
  },
  {
    key: 'core',
    label: 'Core (estabilidade)',
    itens: [
      {
        id: 'hollow-body',
        nome: 'Hollow body hold',
        aplicacao: 'Base para inversões, granby roll e guarda pesada.',
        videoQuery: 'hollow body hold exercise',
      },
      {
        id: 'prancha',
        nome: 'Prancha e prancha lateral',
        aplicacao: 'Estabilidade de tronco sob pressão contínua.',
        videoQuery: 'prancha abdominal exercicio isometrico',
      },
      {
        id: 'ponte-upa',
        nome: 'Ponte (bridge / upa)',
        aplicacao: 'O movimento central de fuga de montada.',
        videoQuery: 'bridge upa jiu-jitsu exercise',
      },
    ],
  },
  {
    key: 'abdomen',
    label: 'Abdômen (dinâmico)',
    itens: [
      {
        id: 'elevacao-pernas',
        nome: 'Elevação de pernas',
        aplicacao: 'Fortalece flexores de quadril e abdômen inferior — usado ao puxar na guarda.',
        videoQuery: 'leg raises exercise',
      },
      {
        id: 'russian-twist',
        nome: 'Russian twist',
        aplicacao: 'Força rotacional para raspagens e projeções.',
        videoQuery: 'russian twist exercise',
      },
      {
        id: 'dead-bug',
        nome: 'Dead bug (anti-rotação)',
        aplicacao: 'Resiste à quebra de postura que o oponente tenta impor.',
        videoQuery: 'dead bug exercise anti rotation core',
      },
      {
        id: 'v-up',
        nome: 'V-up / abdominal dinâmico',
        aplicacao: 'Força de flexão de tronco explosiva.',
        videoQuery: 'v-up exercise abdominal',
      },
    ],
  },
  {
    key: 'agilidade',
    label: 'Agilidade',
    itens: [
      {
        id: 'escada-agilidade',
        nome: 'Escada de agilidade / cone drills',
        aplicacao: 'Coordenação e velocidade de pés para transições.',
        videoQuery: 'agility ladder cone drills',
      },
      {
        id: 'shoot-lift',
        nome: 'Shoot and lift',
        aplicacao: 'Entrada de queda explosiva com confiança para finalizar.',
        videoQuery: 'shoot and lift single leg drill wrestling',
      },
      {
        id: 'sprawl',
        nome: 'Sprawl drill',
        aplicacao: 'Defesa de queda rápida e recomposição de base.',
        videoQuery: 'sprawl drill wrestling defense',
      },
    ],
  },
]
