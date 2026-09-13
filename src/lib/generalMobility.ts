import type { ChecklistGroup } from './checklist'

/**
 * Mobilidade e estabilidade geral para treino de força (agachamento, terra, supino,
 * desenvolvimento, puxadas) — não é conteúdo de jiu-jitsu. Curado a partir do e-book
 * "Mobilidade e Estabilização" (Dr. Keyner Luiz / metodologia IRC Gymnastics), que
 * traz ~90 exercícios com fotos. Cada item aqui tem uma descrição de execução
 * (`execucao`) baseada na foto/posição do livro, pra dar pra identificar o exercício
 * mesmo se a busca de vídeo não trouxer exatamente o mesmo clipe (nomes como "KL
 * Diagonal" ou "Brooks Glúteo" são específicos do programa e nem sempre têm vídeo
 * público com esse nome exato).
 */
export const GENERAL_MOBILITY_GROUPS: ChecklistGroup[] = [
  {
    key: 'tornozelo',
    label: 'Tornozelo (mobilidade)',
    itens: [
      {
        id: 'gm-triangulo',
        nome: 'Triângulo (calcanhares juntos)',
        execucao:
          'Mãos e pés apoiados no chão, quadril elevado (como um "cachorro olhando pra baixo"), calcanhares encostados um no outro.',
        aplicacao: 'Mobilidade de tornozelo e alongamento de cadeia posterior — amplitude necessária pra agachar com profundidade e manter o pé estável no terra.',
        videoQuery: 'exercício triângulo mobilidade tornozelo calcanhares juntos downward dog',
      },
      {
        id: 'gm-dorsiflexao-band',
        nome: 'Mobilidade de tornozelo na banda (dorsiflexão)',
        execucao:
          'Em afundo (meio-ajoelhado), com uma banda elástica presa baixa atrás do tornozelo da perna da frente puxando para trás; leve o joelho à frente sobre o pé sem tirar o calcanhar do chão.',
        aplicacao: 'Ganho de dorsiflexão — falta de amplitude aqui costuma ser a causa de joelho caindo pra dentro no agachamento.',
        videoQuery: 'banded ankle dorsiflexion mobilization half kneeling',
      },
      {
        id: 'gm-slackline',
        nome: 'Equilíbrio em linha estreita',
        execucao: 'Em pé, um pé na frente do outro sobre uma linha reta no chão, com 10 a 12cm de distância entre eles — mantenha o equilíbrio parado.',
        aplicacao: 'Mobilidade de tornozelo associada a equilíbrio — transferência para estabilidade de base sob carga.',
        videoQuery: 'slackline balance ankle mobility exercise',
      },
      {
        id: 'gm-mobilidade-lateral-tornozelo',
        nome: 'Mobilidade lateral de tornozelo',
        execucao: 'Em posição de agachamento lateral (afundo pro lado), desloque o peso do corpo de um pé para o outro, rolando a lateral do tornozelo de apoio.',
        aplicacao: 'Trabalha o tornozelo em mais de um plano de movimento, não só flexão/extensão.',
        videoQuery: 'lateral ankle mobility exercise multiplane lateral lunge',
      },
    ],
  },
  {
    key: 'joelho',
    label: 'Joelho (estabilidade)',
    itens: [
      {
        id: 'gm-bulgarian-squat',
        nome: 'Agachamento búlgaro',
        execucao: 'Pé de trás apoiado num banco/caixa, agache com a perna da frente até o joelho de trás quase tocar o chão.',
        aplicacao: 'Estabilidade unilateral de joelho — reduz assimetria entre pernas e protege contra valgo dinâmico.',
        videoQuery: 'bulgarian split squat exercise',
      },
      {
        id: 'gm-squat-band',
        nome: 'Agachamento com banda no joelho',
        execucao: 'Banda elástica ao redor dos dois joelhos; agache empurrando ativamente os joelhos para fora contra a resistência da banda.',
        aplicacao: 'Ativa glúteo médio e ensina o joelho a resistir ao colapso para dentro durante o agachamento.',
        videoQuery: 'squat with resistance band around knees',
      },
      {
        id: 'gm-clamshell',
        nome: 'Clamshell',
        execucao: 'Deitado de lado, joelhos dobrados e pés juntos; abra o joelho de cima como uma concha, sem girar o quadril para trás.',
        aplicacao: 'Estabilidade de joelho e core via ativação de glúteo médio — base de proteção articular antes de cargas pesadas.',
        videoQuery: 'clamshell exercise glute activation',
      },
      {
        id: 'gm-subida-band',
        nome: 'Subida em caixote com banda',
        execucao: 'Banda presa num ponto fixo do lado oposto ao caixote; suba no caixote controlando o joelho pra ele não cair pra dentro puxado pela banda.',
        aplicacao: 'Estabilidade de joelho em movimento unilateral com resistência — a banda sempre do lado oposto ao ponto fixo.',
        videoQuery: 'box step up resistance band knee stability',
      },
      {
        id: 'gm-hip-drop',
        nome: 'Hip drop (queda pélvica)',
        execucao: 'Em pé sobre um step/caixa baixa com um pé, deixe o quadril do lado livre "cair" abaixo do nível do step e volte a nivelar contraindo o glúteo do pé de apoio.',
        aplicacao: 'Estabilidade de joelho e controle pélvico lateral — evita que o joelho de apoio caia pra dentro quando o quadril do outro lado cede.',
        videoQuery: 'hip drop step exercise pelvic control',
      },
      {
        id: 'gm-afundo-360',
        nome: 'Afundo 360°',
        execucao: 'Em pé, faça afundos (lunges) em sequência para frente, lateral, diagonal e para trás, voltando ao centro entre cada um, como se estivesse ao redor de um relógio.',
        aplicacao: 'Coordenação, equilíbrio e lateralidade — prepara o joelho pra receber carga em múltiplas direções, não só no plano do agachamento.',
        videoQuery: 'lunge matrix 360 multi directional lunge exercise',
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
        execucao: 'Banda presa num ponto fixo baixo e passada por trás do quadril/coxa; faça movimentos de vai-e-vem ou circulares levando o quadril contra a resistência da banda.',
        aplicacao: 'Amplitude de quadril necessária para profundidade segura no agachamento e para tirar a barra do chão no terra.',
        videoQuery: 'hip mobility resistance band exercise',
      },
      {
        id: 'gm-brooks-gluteo',
        nome: 'Brooks glúteo',
        execucao: 'Em quatro apoios, leve um joelho em círculo (para fora, para cima, para frente) mantendo o quadril estável — movimento lento e controlado.',
        aplicacao: 'Mobilidade de quadril com ativação de glúteo — o retorno do movimento deve ser feito lentamente, sob controle.',
        videoQuery: 'brooks glute mobility exercise quadruped hip circle',
      },
      {
        id: 'gm-alongamento-gluteo',
        nome: 'Alongamento de glúteo (chão ou caixa)',
        execucao: 'Sentado, uma perna dobrada à frente do corpo em "4" e a outra estendida atrás; incline o tronco à frente. Na variação na caixa, a perna de apoio fica elevada pra quem tem dificuldade de descer ao chão.',
        aplicacao: 'Libera a rotação externa de quadril travada — quem sente aperto no fundo do agachamento costuma precisar disso.',
        videoQuery: 'glute stretch figure four hip mobility',
      },
      {
        id: 'gm-scorpion',
        nome: 'Scorpion',
        execucao: 'Deitado de bruços, braços abertos em cruz; leve um pé cruzando por cima do corpo em direção à mão oposta, girando o quadril, sem tirar o peito do chão.',
        aplicacao: 'Mobilidade rotacional de quadril combinada com extensão de coluna torácica.',
        videoQuery: 'scorpion stretch hip mobility exercise',
      },
      {
        id: 'gm-ground-spider',
        nome: 'Ground spider',
        execucao: 'Apoiado em prancha (ou quatro apoios), leve um pé para fora, ao lado da mão do mesmo lado, girando o quadril e alcançando o teto com o braço correspondente.',
        aplicacao: 'Mobilidade de quadril, core e estabilidade de ombro no mesmo movimento — padrão tipo "spiderman" com rotação de tronco.',
        videoQuery: 'spiderman lunge with rotation hip mobility exercise',
      },
      {
        id: 'gm-afundo-diagonal-rotacao',
        nome: 'Afundo diagonal com rotação de quadril',
        execucao: 'Dê um passo diagonal para trás terminando numa posição de afundo, girando levemente o quadril e o tronco na direção da passada.',
        aplicacao: 'Alonga a cadeia interna da coxa/quadril na diagonal — um plano de movimento que o agachamento tradicional não cobre.',
        videoQuery: 'diagonal lunge with rotation hip mobility exercise',
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
        execucao: 'Segure um bastão encostado na cabeça, na coluna torácica e no sacro (3 pontos) e execute o hip hinge do terra sem perder o contato de nenhum dos 3 pontos.',
        aplicacao: 'Perder um dos 3 pontos é sinal de erro técnico na dobradiça de quadril (hip hinge) — arredondar as costas ou perder a posição do sacro.',
        videoQuery: 'deadlift hip hinge dowel drill correction',
      },
      {
        id: 'gm-prancha-band',
        nome: 'Prancha com banda (plank band)',
        execucao: 'Em prancha de antebraços, segure uma banda elástica esticada entre as mãos (ou presa à frente) e resista à rotação que ela tenta causar no tronco.',
        aplicacao: 'Fortalecimento de core com ênfase em oblíquos — estabilidade de tronco sob carga externa.',
        videoQuery: 'plank with resistance band core exercise',
      },
      {
        id: 'gm-rotacao-tronco-band',
        nome: 'Rotação de tronco com banda',
        execucao: 'Em pé, banda presa num ponto fixo lateral na altura do peito; gire o tronco puxando a banda de um lado para o outro, quadril relativamente estável.',
        aplicacao: 'Fortalecimento de core em padrão rotacional — transfere para controle de tronco no agachamento e supino.',
        videoQuery: 'standing trunk rotation band exercise core',
      },
      {
        id: 'gm-squat-rotacao',
        nome: 'Agachamento com rotação',
        execucao: 'Segurando um peso ou banda à frente do peito, agache e, ao subir, gire o tronco levando o peso para um lado; alterne os lados.',
        aplicacao: 'Estabilidade de tronco e fortalecimento de core integrado ao padrão de agachamento.',
        videoQuery: 'squat with rotation core exercise',
      },
      {
        id: 'gm-afundo-rotacao',
        nome: 'Afundo com rotação',
        execucao: 'Em posição de afundo, com a banda presa a um ponto fixo lateral, gire o tronco levando os braços na direção oposta ao ponto fixo — a banda fica sempre do lado oposto ao movimento.',
        aplicacao: 'Melhora a execução do afundo somada a trabalho de core rotacional — atenção redobrada à posição da banda, que fica sempre do lado oposto ao ponto fixo.',
        videoQuery: 'lunge with rotation band core exercise',
      },
      {
        id: 'gm-rollow-band',
        nome: 'Rollow com banda',
        execucao: 'Deitado de costas ou em prancha, segure as pontas de uma banda esticada à frente e "role" o tronco de um lado para o outro resistindo à rotação, quadril estável.',
        aplicacao: 'Fortalecimento de core com ênfase em oblíquos, em fase mais dinâmica que a prancha estática.',
        videoQuery: 'rollout band core exercise anti rotation',
      },
      {
        id: 'gm-lenhador',
        nome: 'Lenhador (woodchopper)',
        execucao: 'Em pé, banda presa alta ou baixa de um lado; puxe na diagonal cruzando o corpo (de cima pra baixo ou de baixo pra cima), girando tronco e quadril como um golpe de machado.',
        aplicacao: 'Fortalecimento de oblíquos e trabalho de cadeias diagonais — padrão de força rotacional funcional.',
        videoQuery: 'woodchopper band exercise core rotation',
      },
      {
        id: 'gm-spike-plank',
        nome: 'Spike plank',
        execucao: 'Em prancha, com uma banda cruzando o corpo na diagonal, mantenha a posição resistindo à rotação que a banda impõe no ombro e no core.',
        aplicacao: 'Estabilidade de ombro e fortalecimento de core no mesmo exercício, sob resistência rotacional.',
        videoQuery: 'plank anti rotation band shoulder core exercise',
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
        execucao: 'Deitado de costas sobre o rolo de espuma posicionado na altura das omoplatas, joelhos dobrados e pés no chão; estenda a coluna torácica para trás sobre o rolo.',
        aplicacao: 'Extensão torácica — essencial para manter a barra sobre a base de apoio no agachamento e posicionar bem o supino.',
        videoQuery: 'thoracic spine mobility foam roller extension',
      },
      {
        id: 'gm-mobilidade-wallball',
        nome: 'Mobilidade torácica na bola (abraçar a bola)',
        execucao: 'Ajoelhado, incline o tronco à frente "abraçando" uma wallball/bola medicinal no chão com os dois braços, depois gire o tronco levando um braço para cima.',
        aplicacao: 'Mobilidade torácica e de ombro combinadas — libera rotação necessária para desenvolvimento e arremesso.',
        videoQuery: 'thoracic mobility medicine ball exercise kneeling rotation',
      },
      {
        id: 'gm-mobilidade-rotacional-toracica',
        nome: 'Mobilidade rotacional torácica',
        execucao: 'Em quatro apoios, uma mão atrás da cabeça; gire o cotovelo em direção ao teto abrindo o peito, depois volte cruzando por baixo do corpo.',
        aplicacao: 'Rotação de tronco isolada da lombar — protege a lombar em movimentos rotacionais.',
        videoQuery: 'thoracic rotation mobility exercise quadruped open book',
      },
      {
        id: 'gm-extensao-coluna',
        nome: 'Extensão de coluna',
        execucao: 'Deitado de bruços, mãos ao lado do corpo ou atrás da cabeça; eleve o peito do chão estendendo a coluna, sem forçar a lombar.',
        aplicacao: 'Fortalece os eretores para sustentar mobilidade e força na coluna torácica.',
        videoQuery: 'spine extension exercise back strengthening prone',
      },
      {
        id: 'gm-mobilidade-toracica-band',
        nome: 'Mobilidade torácica com banda (apoio)',
        execucao: 'Em quatro apoios com uma banda elástica bem tensionada passando pelas costas/tronco, sustente a posição de extensão torácica por cerca de 10 segundos apoiado na tensão da banda.',
        aplicacao: 'A banda precisa ter tensão suficiente pra sustentar e aliviar os apoios durante a extensão — ajuda a manter a posição sem compensar com os braços.',
        videoQuery: 'banded thoracic extension mobilization quadruped',
      },
      {
        id: 'gm-mobilidade-bastao',
        nome: 'Mobilidade no bastão',
        execucao: 'Segurando um bastão com as duas mãos e pegada larga, passe-o por cima da cabeça e por trás das costas, mantendo os braços o mais estendidos possível.',
        aplicacao: 'Mobilidade de ombro e torácica juntas — sem compensar arqueando a lombar.',
        videoQuery: 'shoulder dislocates dowel mobility exercise',
      },
    ],
  },
  {
    key: 'ombro-escapula',
    label: 'Ombro e escápula (estabilidade)',
    itens: [
      {
        id: 'gm-ytwl',
        nome: 'Y, T, W, L (parede ou banco)',
        execucao: 'Deitado de bruços num banco (ou em pé encostado na parede), eleve os braços formando as letras Y, T, W e L em sequência, sem encostar o corpo.',
        aplicacao: 'Melhora a estabilidade escapular em diferentes ângulos — base de proteção de ombro antes de qualquer trabalho de empurrar/puxar pesado.',
        videoQuery: 'Y T W L raise shoulder stability exercise prone',
      },
      {
        id: 'gm-manguito-rotador',
        nome: 'Fortalecimento de manguito rotador (rotação externa)',
        execucao: 'Cotovelo colado ao corpo e dobrado a 90°, segurando a banda; gire o antebraço para fora afastando a mão do corpo, sem mover o cotovelo do lugar.',
        aplicacao: 'Sempre trabalhado em rotação externa — protege o ombro em supino e desenvolvimento.',
        videoQuery: 'rotator cuff external rotation band exercise',
      },
      {
        id: 'gm-serratil-parede',
        nome: 'Ativação de serrátil na parede',
        execucao: 'De frente para a parede, braços estendidos à frente apoiados nela; empurre a parede afastando as omoplatas uma da outra (protração), sem dobrar os cotovelos.',
        aplicacao: 'Estabilidade de ombro pela ativação do serrátil anterior — base do controle escapular.',
        videoQuery: 'serratus anterior wall activation exercise',
      },
      {
        id: 'gm-trapezio-inferior',
        nome: 'Fortalecimento de trapézio inferior (bilateral e unilateral)',
        execucao: 'Em apoio (banco ou chão), eleve os braços na diagonal acima da cabeça formando um ângulo de aproximadamente 130° — pode ser com os dois braços ou um de cada vez.',
        aplicacao: 'O ângulo de ~130° é o de máxima ativação do trapézio inferior — estabiliza a escápula em puxadas acima da cabeça.',
        videoQuery: 'lower trapezius strengthening exercise band 130 degrees',
      },
      {
        id: 'gm-open-book',
        nome: 'Open book',
        execucao: 'Deitado de lado, joelhos dobrados à frente, braços estendidos juntos à frente do corpo; abra o braço de cima como um livro, girando o tronco, até encostar a mão no chão do outro lado.',
        aplicacao: 'Mobilidade de ombro e torácica combinadas — libera rotação externa de ombro deitado.',
        videoQuery: 'open book stretch shoulder thoracic mobility',
      },
      {
        id: 'gm-moinho',
        nome: 'Moinho (windmill)',
        execucao: 'Em pé, pernas afastadas, braços abertos em cruz; incline o tronco à frente girando, levando uma mão em direção ao pé oposto enquanto a outra sobe em direção ao teto.',
        aplicacao: 'Estabilidade de ombro e alongamento de cadeia posterior e lateral ao mesmo tempo.',
        videoQuery: 'windmill stretch exercise shoulder stability',
      },
      {
        id: 'gm-standing-lunge-rotation',
        nome: 'Standing/lunge rotation com banda',
        execucao: 'Em pé ou em posição de afundo, banda presa num ponto fixo lateral na altura do peito; gire o tronco puxando o braço através do corpo, ombro e tronco girando juntos.',
        aplicacao: 'Mobilidade rotacional de ombro e tronco — a base de apoio (em pé ou em afundo) muda a exigência de estabilidade.',
        videoQuery: 'standing rotation band shoulder mobility exercise',
      },
      {
        id: 'gm-shoulder-blade-circle',
        nome: 'Shoulder blade circle (prancha ou barra)',
        execucao: 'Em prancha de mãos (ou pendurado na barra), sem dobrar os cotovelos, faça círculos aproximando e afastando as omoplatas.',
        aplicacao: 'Mobilidade de ombro e estabilidade escapular pura, isolando o movimento da escápula do movimento do cotovelo.',
        videoQuery: 'shoulder blade circles scapular control plank exercise',
      },
      {
        id: 'gm-cat-rotation',
        nome: 'Cat rotation',
        execucao: 'Em quatro apoios, passe um braço por baixo do corpo cruzando para o lado oposto (como "enfiar a linha na agulha"), depois abra o mesmo braço para cima girando o tronco.',
        aplicacao: 'Mobilidade rotacional de tronco e ombro — variação do clássico "thread the needle".',
        videoQuery: 'thread the needle cat rotation thoracic shoulder mobility',
      },
      {
        id: 'gm-alongamento-cruzado-pretzel',
        nome: 'Alongamento cruzado (pretzel)',
        execucao: 'Deitado de lado, joelhos dobrados à frente; gire o tronco e o braço de cima para trás em direção ao chão do outro lado, alongando peito e ombro numa posição de torção.',
        aplicacao: 'Alongamento de peito e ombro em posição de torção — libera rotação interna excessiva que trava o supino e o desenvolvimento.',
        videoQuery: 'pretzel stretch chest shoulder rotation',
      },
      {
        id: 'gm-spike-overreach',
        nome: 'Spike rotacional / overreach',
        execucao: 'Em apoio unilateral ou prancha, gire o tronco levando um braço para cima em rotação completa, estendendo ao máximo antes de voltar.',
        aplicacao: 'Combina mobilidade rotacional de ombro com um pouco de força — um exercício "completo" de ativação e mobilidade de ombro.',
        videoQuery: 'thread the needle rotation reach shoulder mobility exercise',
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
        execucao: 'Em quatro apoios, mãos no chão; incline o peso do corpo para frente e para trás sobre as mãos, sentindo o punho flexionar e estender sob carga.',
        aplicacao: 'Amplitude de punho em carga — protege contra dor de punho em supino, desenvolvimento e apoio de mãos.',
        videoQuery: 'wrist mobility exercise weight bearing flexion extension',
      },
      {
        id: 'gm-mobilidade-punho-2',
        nome: 'Mobilidade de punho — rotação sob apoio',
        execucao: 'Em quatro apoios, mãos no chão; gire o peso do corpo em pequenos círculos sobre as mãos apoiadas, trabalhando a rotação do punho.',
        aplicacao: 'Complementa a mobilidade de punho trabalhando rotação, não só flexão/extensão.',
        videoQuery: 'wrist mobility rotation weight bearing exercise',
      },
    ],
  },
]

export const GENERAL_MOBILITY_SOURCE =
  'Curado do e-book "Mobilidade e Estabilização" (Dr. Keyner Luiz / IRC Gymnastics) — foco em treino de força, não jiu-jitsu. Nomes específicos do programa (ex.: Brooks Glúteo, KL Diagonal) podem não ter vídeo público exato — a descrição de execução é a referência principal.'
