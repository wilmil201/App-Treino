export interface ChecklistItem {
  id: string
  nome: string
  /** Por que esse exercício/drill importa especificamente para o jiu-jitsu. */
  aplicacao: string
  videoQuery: string
}

export interface ChecklistGroup {
  key: string
  label: string
  itens: ChecklistItem[]
}
