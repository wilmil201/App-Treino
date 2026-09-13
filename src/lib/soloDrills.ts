import type { ChecklistGroup } from './checklist'
import { SACO_BATER_REFERENCE_VIDEO } from './referenceVideos'

/** Drills solo (sem parceiro) com elástico, bola suíça e saco de bater — para treinar
 * padrões de movimento do jiu-jitsu fora do tatame/sem companheiro de treino. */
export const SOLO_DRILL_GROUPS: ChecklistGroup[] = [
  {
    key: 'elastico',
    label: 'Elástico',
    itens: [
      {
        id: 'shrimp-elastico',
        nome: 'Shrimping com elástico',
        aplicacao: 'Resistência no movimento de fuga de quadril — desenvolve potência e controle do shrimp.',
        videoQuery: 'resistance band shrimping jiu-jitsu drill',
      },
      {
        id: 'stand-up-elastico',
        nome: 'Technical stand-up com elástico',
        aplicacao: 'Carga extra na base técnica de levantar do chão sob pressão.',
        videoQuery: 'technical stand up resistance band drill',
      },
      {
        id: 'pull-apart',
        nome: 'Band pull-apart',
        aplicacao: 'Saúde de ombro e postura de guarda/framing.',
        videoQuery: 'band pull apart exercise shoulder',
      },
      {
        id: 'puxada-rotacional',
        nome: 'Puxada rotacional com elástico',
        aplicacao: 'Potência rotacional para raspagens e projeções.',
        videoQuery: 'band rotational pull exercise',
      },
    ],
  },
  {
    key: 'bola_suica',
    label: 'Bola suíça',
    itens: [
      {
        id: 'ponte-bola',
        nome: 'Ponte na bola',
        aplicacao: 'Core e quadril em superfície instável — transferência direta para base e escape de montada.',
        videoQuery: 'swiss ball bridge exercise',
      },
      {
        id: 'fuga-quadril-bola',
        nome: 'Fuga de quadril com pernas na bola',
        aplicacao: 'Adiciona instabilidade ao movimento de shrimp, exigindo mais controle de quadril.',
        videoQuery: 'stability ball hip escape drill',
      },
      {
        id: 'passagem-bola',
        nome: 'Passagem de bola (mão-pé)',
        aplicacao: 'Transferência de força pelo core — imita o controle usado na retenção de guarda.',
        videoQuery: 'swiss ball exercise hand to foot pass',
      },
      {
        id: 'equilibrio-bola',
        nome: 'Equilíbrio dinâmico na bola',
        aplicacao: 'Transferível para scrambles e transições de posição.',
        videoQuery: 'stability ball balance exercise',
      },
    ],
  },
  {
    key: 'saco_bater',
    label: 'Saco de bater',
    itens: [
      {
        id: 'passagem-saco',
        nome: 'Drill de passagem de guarda (kick pass / X-pass)',
        aplicacao: 'Treina o footwork de passagem de guarda em pé, sozinho.',
        videoQuery: 'guard passing drill heavy bag jiu-jitsu',
        videoUrl: SACO_BATER_REFERENCE_VIDEO.url,
        videoIsCompilation: true,
      },
      {
        id: 'entrada-queda-saco',
        nome: 'Entrada de queda (shoot) no saco',
        aplicacao: 'Repetição de entrada de queda com alvo fixo — constrói confiança e timing.',
        videoQuery: 'takedown entry heavy bag drill',
        videoUrl: SACO_BATER_REFERENCE_VIDEO.url,
        videoIsCompilation: true,
      },
      {
        id: 'finalizacao-saco',
        nome: 'Drill de finalização (mecânica de chave)',
        aplicacao: 'Repetição da mecânica de finalização sem depender de parceiro.',
        videoQuery: 'submission drill heavy bag armbar mechanics',
        videoUrl: SACO_BATER_REFERENCE_VIDEO.url,
        videoIsCompilation: true,
      },
      {
        id: 'troca-posicao-saco',
        nome: 'Troca de posição / pressão em cima',
        aplicacao: 'Simula transições de montada/100kg mantendo pressão no saco.',
        videoQuery: 'top pressure position change heavy bag drill',
        videoUrl: SACO_BATER_REFERENCE_VIDEO.url,
        videoIsCompilation: true,
      },
    ],
  },
]
