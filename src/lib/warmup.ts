import type { WarmupStep } from './types'

export const WARMUP_STEPS: WarmupStep[] = [
  {
    id: 'liberacao-miofascial',
    ordem: 1,
    nome: 'Liberação miofascial',
    descricao: 'Rolo de espuma ou bola em panturrilha, quadríceps, posterior e costas.',
    videoQuery: 'liberação miofascial aquecimento antes do treino',
  },
  {
    id: 'mobilidade',
    ordem: 2,
    nome: 'Mobilidade articular',
    descricao: 'Mobilidade de tornozelo, quadril, coluna torácica e ombros.',
    videoQuery: 'mobilidade articular aquecimento jiu-jitsu',
  },
  {
    id: 'alongamento-dinamico',
    ordem: 3,
    nome: 'Alongamento dinâmico',
    descricao: 'Balanços de perna, leg swings, agachamento com rotação.',
    videoQuery: 'alongamento dinâmico aquecimento treino',
  },
  {
    id: 'estabilidade-estatica',
    ordem: 4,
    nome: 'Estabilidade estática',
    descricao: 'Prancha, prancha lateral e exercícios isométricos de core.',
    videoQuery: 'exercícios de estabilidade estática core',
  },
  {
    id: 'ativacao-especifica',
    ordem: 5,
    nome: 'Ativação específica',
    descricao: 'Ativação de glúteo, manguito rotador e cadeia posterior.',
    videoQuery: 'ativação muscular específica antes do treino',
  },
  {
    id: 'estabilidade-dinamica',
    ordem: 6,
    nome: 'Estabilidade dinâmica',
    descricao: 'Agachamento unilateral, afundo com giro, exercícios em apoio instável.',
    videoQuery: 'exercícios de estabilidade dinâmica funcional',
  },
  {
    id: 'ativacao-central',
    ordem: 7,
    nome: 'Ativação central',
    descricao: 'Exercícios de potência leve e coordenação para preparar o sistema nervoso central.',
    videoQuery: 'ativação do sistema nervoso central antes de treinar',
  },
]
