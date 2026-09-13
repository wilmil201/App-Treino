import { useState } from 'react'
import { WARMUP_SOURCE, WARMUP_STEPS } from '../lib/warmup'
import { youtubeSearchUrl } from '../lib/youtube'
import { Card } from './ui'

export function WarmupChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const total = WARMUP_STEPS.length
  const done = Object.values(checked).filter(Boolean).length

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <p className="font-semibold">Aquecimento RR</p>
        <span className="text-xs text-slate-400">
          {done}/{total}
        </span>
      </div>
      <ul className="space-y-2">
        {WARMUP_STEPS.map((step) => (
          <li key={step.id} className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 shrink-0 accent-emerald-500"
              checked={!!checked[step.id]}
              onChange={(e) => setChecked((c) => ({ ...c, [step.id]: e.target.checked }))}
              aria-label={`Marcar ${step.nome} como concluída`}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-200">
                {step.ordem}. {step.nome}
              </p>
              <p className="text-xs text-slate-500">{step.descricao}</p>
              {step.itens && step.itens.length > 0 ? (
                <ul className="mt-1.5 space-y-1">
                  {step.itens.map((item) => (
                    <li key={item.nome} className="flex flex-wrap items-baseline gap-x-1.5 text-xs">
                      <a
                        href={item.videoUrl ?? youtubeSearchUrl(item.nome)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-emerald-400 underline decoration-dotted"
                      >
                        ▶ {item.nome}
                      </a>
                      <span className="text-slate-500">— {item.dosagem}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <a
                  href={youtubeSearchUrl(step.videoQuery)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-xs font-medium text-emerald-400"
                >
                  ▶ ver referência
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] text-slate-500">{WARMUP_SOURCE}</p>
    </Card>
  )
}
