export interface ReferenceVideo {
  id: string
  titulo: string
  url: string
}

/** Vídeos gerais de mobilidade e drills de jiu-jitsu selecionados pelo atleta —
 * conteúdo variado, sem ligação exclusiva a um exercício específico da biblioteca. */
export const GENERAL_REFERENCE_VIDEOS: ReferenceVideo[] = [
  { id: 'ref-1', titulo: 'Drills e mobilidade para jiu-jitsu', url: 'https://youtu.be/pcgo4QnByVk' },
  { id: 'ref-2', titulo: 'Drills e mobilidade para jiu-jitsu', url: 'https://youtu.be/HXAYAYFroUU' },
  { id: 'ref-3', titulo: 'Drills e mobilidade para jiu-jitsu', url: 'https://youtu.be/DsDhuasT_qU' },
  { id: 'ref-4', titulo: 'Drills e mobilidade para jiu-jitsu', url: 'https://youtu.be/zboFYX9cxJE' },
  { id: 'ref-5', titulo: 'Drills e mobilidade para jiu-jitsu', url: 'https://youtu.be/kiMu_Nb_SYM' },
]

/** Confirmado pelo atleta: compilação de drills de saco de pancadas — aplicado como
 * referência geral em todos os itens de "saco de bater" da biblioteca e da rotina. */
export const SACO_BATER_REFERENCE_VIDEO: ReferenceVideo = {
  id: 'saco-21-drills',
  titulo: '21 drills de jiu-jitsu com saco de pancadas em 8 minutos',
  url: 'https://youtu.be/tNyHVHsu-XQ',
}
