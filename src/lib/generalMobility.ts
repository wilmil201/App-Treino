import type { ChecklistGroup } from './checklist'

/**
 * Mobilidade e estabilidade geral para treino de força (agachamento, terra, supino,
 * desenvolvimento, puxadas) — não é conteúdo de jiu-jitsu. Curado a partir do e-book
 * "Mobilidade e Estabilização" (Dr. Keyner Luiz / metodologia IRC Gymnastics).
 * Cada articulação foi classificada pelo material como predominantemente mobilidade
 * ou estabilidade — essa classificação está em `enfase`.
 */
export const GENERAL_MOBILITY_GROUPS: ChecklistGroup[] = [
  {
    key: 'tornozelo',
    label: 'Tornozelo (mobilidade)',
    itens: [
      {
        id: 'gm-triangulo',
        nome: 'Triângulo (calcanhares juntos)',
        aplicacao: 'Mobilidade de tornozelo e alongamento de cadeia posterior — amplitude necessária para agachar com profundidade e manter o pé estável no terra.',
        videoQuery: 'exercício triângulo mobilidade tornozelo calcanhares juntos',
      },
      {
        id: 'gm-dorsiflexao-band',
        nome: 'Mobilidade de tornozelo na banda (dorsiflexão)',
        aplicacao: 'Ganho de dorsiflexão — falta de amplitude aqui costuma ser a causa de joelho caindo pra dentro no agachamento.',
        videoQuery: 'ankle dorsiflexion band mobilization squat',
      },
      {
        id: 'gm-slackline',
        nome: 'Equilíbrio em linha estreita (10-12cm entre os pés)',
        aplicacao: 'Mobilidade de tornozelo associada a equilíbrio — transferência para estabilidade de base sob carga.',
        videoQuery: 'slackline balance ankle mobility exercise',
      },
      {
        id: 'gm-mobilidade-lateral-tornozelo',
        nome: 'Mobilidade lateral de tornozelo',
        aplicacao: 'Trabalha o tornozelo em mais de um plano de movimento, não só flexão/extensão.',
        videoQuery: 'lateral ankle mobility exercise multiplane',
      },
    ],
  },
  {
    key: 'joelho',
    label: 'Joelho (estabilidade)',
    itens: [
      {
        id: 'gm-bulgarian-squat',
        nome: 'Agachamento búlgaro (bulgarian squat)',
        aplicacao: 'Estabilidade unilateral de joelho — reduz assimetria entre pernas e protege contra valgo dinâmico.',
        videoQuery: 'bulgarian split squat exercise',
      },
      {
        id: 'gm-squat-band',
        nome: 'Agachamento com banda no joelho',
        aplicacao: 'Ativa glúteo médio e ensina o joelho a resistir ao colapso para dentro durante o agachamento.',
        videoQuery: 'squat with resistance band around knees',
      },
      {
        id: 'gm-clamshell',
        nome: 'Clamshell',
        aplicacao: 'Estabilidade de joelho e core via ativação de glúteo médio — base de proteção articular antes de cargas pesadas.',
        videoQuery: 'clamshell exercise glute activation',
      },
      {
        id: 'gm-subida-band',
        nome: 'Subida em caixote com banda',
        aplicacao: 'Estabilidade de joelho em movimento unilateral com resistência — a banda sempre do lado oposto ao ponto fixo.',
        videoQuery: 'box step up resistance band knee stability',
      },
    ],
  },
  {
    key: 'quadril',
    label: 'Quadril (mobilidade)',
    itens: [
      {
        id: 'gm-mobilidade-quadril-band',
        nome: 'Mobilidade de quadril na banda',
        aplicacao: 'Amplitude de quadril necessária para profundidade segura no agachamento e para tirar a barra do chão no terra.',
        videoQuery: 'hip mobility resistance band exercise',
      },
      {
        id: 'gm-brooks-gluteo',
        nome: 'Brooks glúteo',
        aplicacao: 'Mobilidade de quadril com ativação de glúteo — movimento deve ser feito lentamente e sob controle.',
        videoQuery: 'brooks glute mobility exercise',
      },
      {
        id: 'gm-alongamento-gluteo',
        nome: 'Alongamento de glúteo (no chão ou na caixa)',
        aplicacao: 'Libera a rotação externa de quadril travada — quem sente aperto no fundo do agachamento costuma precisar disso.',
        videoQuery: 'glute stretch figure four hip mobility',
      },
      {
        id: 'gm-scorpion',
        nome: 'Scorpion',
        aplicacao: 'Mobilidade rotacional de quadril combinada com extensão de coluna torácica.',
        videoQuery: 'scorpion stretch hip mobility exercise',
      },
    ],
  },
  {
    key: 'lombar-core',
    label: 'Lombar e core (estabilidade)',
    itens: [
      {
        id: 'gm-corretivo-terra',
        nome: 'Corretivo do levantamento terra (bastão nas 3 costas)',
        aplicacao: 'O bastão deve tocar cabeça, torácica e sacro ao mesmo tempo durante o movimento — perder um dos 3 pontos é sinal de erro técnico na dobradiça de quadril (hip hinge).',
        videoQuery: 'deadlift hip hinge dowel drill correction',
      },
      {
        id: 'gm-prancha-band',
        nome: 'Prancha com banda (plank band)',
        aplicacao: 'Fortalecimento de core com ênfase em oblíquos — estabilidade de tronco sob carga externa.',
        videoQuery: 'plank with resistance band core exercise',
      },
      {
        id: 'gm-rotacao-tronco-band',
        nome: 'Rotação de tronco com banda',
        aplicacao: 'Fortalecimento de core em padrão rotacional — transfere para controle de tronco no agachamento e supino.',
        videoQuery: 'standing trunk rotation band exercise core',
      },
      {
        id: 'gm-squat-rotacao',
        nome: 'Agachamento com rotação',
        aplicacao: 'Estabilidade de tronco e fortalecimento de core integrado ao padrão de agachamento.',
        videoQuery: 'squat with rotation core exercise',
      },
    ],
  },
  {
    key: 'toracica',
    label: 'Coluna torácica (mobilidade)',
    itens: [
      {
        id: 'gm-mobilidade-toracica-foam',
        nome: 'Mobilidade torácica no foam roller',
        aplicacao: 'Extensão torácica — essencial para manter a barra sobre a base de apoio no agachamento e posicionar bem o supino.',
        videoQuery: 'thoracic spine mobility foam roller extension',
      },
      {
        id: 'gm-mobilidade-wallball',
        nome: 'Mobilidade torácica na bola (abraçar a bola)',
        aplicacao: 'Mobilidade torácica e de ombro combinadas — libera rotação necessária para desenvolvimento e arremesso.',
        videoQuery: 'thoracic mobility medicine ball exercise',
      },
      {
        id: 'gm-mobilidade-rotacional-toracica',
        nome: 'Mobilidade rotacional torácica',
        aplicacao: 'Rotação de tronco isolada da lombar — protege a lombar em movimentos rotacionais.',
        videoQuery: 'thoracic rotation mobility exercise quadruped',
      },
      {
        id: 'gm-extensao-coluna',
        nome: 'Extensão de coluna',
        aplicacao: 'Fortalece os eretores para sustentar mobilidade e força na coluna torácica.',
        videoQuery: 'spine extension exercise back strengthening',
      },
    ],
  },
  {
    key: 'ombro-escapula',
    label: 'Ombro e escápula (estabilidade)',
    itens: [
      {
        id: 'gm-yTW',
        nome: 'Y, T, W (banda ou peso leve)',
        aplicacao: 'Melhora a estabilidade escapular em diferentes ângulos — base de proteção de ombro antes de qualquer trabalho de empurrar/puxar pesado.',
        videoQuery: 'Y T W raise shoulder stability exercise',
      },
      {
        id: 'gm-manguito-rotador',
        nome: 'Fortalecimento de manguito rotador (rotação externa)',
        aplicacao: 'Sempre trabalhado em rotação externa — protege o ombro em supino e desenvolvimento.',
        videoQuery: 'rotator cuff external rotation band exercise',
      },
      {
        id: 'gm-serratil-parede',
        nome: 'Ativação de serrátil na parede',
        aplicacao: 'Estabilidade de ombro pela ativação do serrátil anterior — base do controle escapular.',
        videoQuery: 'serratus anterior wall activation exercise',
      },
      {
        id: 'gm-trapezio-inferior',
        nome: 'Fortalecimento de trapézio inferior',
        aplicacao: 'Ângulo de ~130° é o de máxima ativação do trapézio inferior — estabiliza a escápula em puxadas acima da cabeça.',
        videoQuery: 'lower trapezius strengthening exercise band',
      },
      {
        id: 'gm-open-book',
        nome: 'Open book',
        aplicacao: 'Mobilidade de ombro e torácica combinadas — libera rotação externa de ombro deitado.',
        videoQuery: 'open book stretch shoulder thoracic mobility',
      },
    ],
  },
  {
    key: 'punho',
    label: 'Punho (mobilidade)',
    itens: [
      {
        id: 'gm-mobilidade-punho-1',
        nome: 'Mobilidade de punho — flexão/extensão em apoio',
        aplicacao: 'Amplitude de punho em carga — protege contra dor de punho em supino, desenvolvimento e apoio de mãos.',
        videoQuery: 'wrist mobility exercise weight bearing flexion extension',
      },
      {
        id: 'gm-mobilidade-punho-2',
        nome: 'Mobilidade de punho — rotação sob apoio',
        aplicacao: 'Complementa a mobilidade de punho trabalhando rotação, não só flexão/extensão.',
        videoQuery: 'wrist mobility rotation weight bearing exercise',
      },
    ],
  },
]

export const GENERAL_MOBILITY_SOURCE =
  'Curado do e-book "Mobilidade e Estabilização" (Dr. Keyner Luiz / IRC Gymnastics) — foco em treino de força, não jiu-jitsu.'
