import { useState } from 'react'
import { EQUIPMENT_LABEL, HOME_MOBILITY_ROUTINE, ROUTINE_TOTAL_DURATION, type RoutineEquipment } from '../lib/mobilityRoutine'
import { youtubeSearchUrl } from '../lib/youtube'
import { Card } from './ui'

const EQUIPMENT_STYLE: Record<RoutineEquipment, string> = {
  tatame: 'border-slate-600 bg-slate-800 text-slate-300',
  bola_suica: 'border-amber-600 bg-amber-500/10 text-amber-300',
  saco_bater: 'border-rose-600 bg-rose-500/10 text-rose-300',
  nenhum: 'border-slate-700 bg-slate-900 text-slate-400',
}

export function MobilityRoutineSession() {
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const totalItens = HOME_MOBILITY_ROUTINE.reduce((sum, b) => sum + b.itens.length, 0)
  const totalDone = Object.values(checked).filter(Boolean).length

  return (
    <div className="space-y-4">
      <Card className="border-emerald-700/60 bg-emerald-500/5">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-emerald-300">Sessão completa</p>
          <p className="text-sm text-slate-300">
            {totalDone}/{totalItens}
          </p>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Duração estimada: {ROUTINE_TOTAL_DURATION} · tatame, bola suíça e saco de bater. Pode fazer em casa, em
          qualquer dia — não substitui o aquecimento antes do treino de jiu-jitsu.
        </p>
      </Card>

      {HOME_MOBILITY_ROUTINE.map((block) => {
        const doneInBlock = block.itens.filter((it) => checked[it.id]).length
        return (
          <Card key={block.key}>
            <div className="mb-1 flex items-center justify-between">
              <p className="font-semibold text-slate-100">{block.titulo}</p>
              <span className="text-xs text-slate-500">{block.duracaoEstimada}</span>
            </div>
            <p className="mb-3 text-xs text-slate-400">{block.objetivo}</p>
            <ul className="space-y-2">
              {block.itens.map((item) => (
                <li key={item.id} className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 shrink-0 accent-emerald-500"
                    checked={!!checked[item.id]}
                    onChange={(e) => setChecked((c) => ({ ...c, [item.id]: e.target.checked }))}
                    aria-label={`Marcar ${item.nome} como concluído`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-sm font-medium text-slate-200">{item.nome}</p>
                      {item.equipamento !== 'nenhum' && (
                        <span className={`rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${EQUIPMENT_STYLE[item.equipamento]}`}>
                          {EQUIPMENT_LABEL[item.equipamento]}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs font-semibold text-sky-300">{item.dosagem}</p>
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
            {doneInBlock === block.itens.length && (
              <p className="mt-2 text-xs font-semibold text-emerald-400">✓ Bloco concluído</p>
            )}
          </Card>
        )
      })}

      {totalDone > 0 && (
        <button
          type="button"
          onClick={() => setChecked({})}
          className="w-full text-center text-xs text-slate-500 underline decoration-dotted"
        >
          limpar progresso
        </button>
      )}
    </div>
  )
}
