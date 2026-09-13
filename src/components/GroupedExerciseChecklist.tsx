import { useState } from 'react'
import type { ChecklistGroup } from '../lib/checklist'
import { youtubeSearchUrl } from '../lib/youtube'
import { Card } from './ui'

export function GroupedExerciseChecklist({ groups }: { groups: ChecklistGroup[] }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const totalItens = groups.reduce((sum, g) => sum + g.itens.length, 0)
  const totalDone = Object.values(checked).filter(Boolean).length

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        {totalDone}/{totalItens} concluídos
      </p>
      {groups.map((group) => {
        const isOpen = expanded[group.key] ?? false
        const doneInGroup = group.itens.filter((it) => checked[it.id]).length
        return (
          <Card key={group.key}>
            <button
              type="button"
              onClick={() => setExpanded((e) => ({ ...e, [group.key]: !isOpen }))}
              className="flex w-full items-center justify-between"
            >
              <p className="font-semibold text-slate-100">{group.label}</p>
              <span className="text-xs text-slate-400">
                {doneInGroup}/{group.itens.length} {isOpen ? '▲' : '▼'}
              </span>
            </button>
            {isOpen && (
              <ul className="mt-3 space-y-2">
                {group.itens.map((item) => (
                  <li key={item.id} className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 shrink-0 accent-emerald-500"
                      checked={!!checked[item.id]}
                      onChange={(e) => setChecked((c) => ({ ...c, [item.id]: e.target.checked }))}
                      aria-label={`Marcar ${item.nome} como concluído`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-200">{item.nome}</p>
                      {item.execucao && <p className="mt-0.5 text-xs text-sky-300">{item.execucao}</p>}
                      <p className="text-xs text-slate-500">{item.aplicacao}</p>
                      <a
                        href={item.videoUrl ?? youtubeSearchUrl(item.videoQuery)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-xs font-medium text-emerald-400"
                      >
                        {item.videoUrl
                          ? item.videoIsCompilation
                            ? '▶ ver compilação (cobre vários drills)'
                            : '▶ ver vídeo'
                          : '▶ ver referência (busca)'}
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )
      })}
    </div>
  )
}
