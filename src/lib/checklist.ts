export interface ChecklistItem {
  id: string
  nome: string
  /** Como executar — descrição concreta da posição/movimento, pra identificar o exercício mesmo sem vídeo. */
  execucao?: string
  /** Por que esse exercício/drill importa especificamente para o jiu-jitsu. */
  aplicacao: string
  /** Link direto de um vídeo específico já conferido — preferível a uma busca genérica. */
  videoUrl?: string
  /** Fallback: usado só quando não há videoUrl, abre uma busca no YouTube. */
  videoQuery: string
  /** true = videoUrl é uma compilação com vários drills, não um clipe exclusivo deste item. */
  videoIsCompilation?: boolean
}

export interface ChecklistGroup {
  key: string
  label: string
  itens: ChecklistItem[]
}
