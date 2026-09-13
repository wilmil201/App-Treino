import { useState } from 'react'
import { COACH_TIPS, COACH_TIPS_SOURCE } from '../lib/coachTips'
import { Card } from './ui'

export function CoachTipsCard() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  return (
    <Card className="border-amber-700/60 bg-amber-500/5">
      <p className="mb-1 font-semibold text-amber-300">Dicas de planejamento e recuperação</p>
      <p className="mb-3 text-xs text-slate-400">
        Não é uma rotina pra marcar — é orientação de como distribuir a semana e a temporada.
      </p>
      <ul className="space-y-2">
        {COACH_TIPS.map((tip) => {
          const isOpen = expanded[tip.id] ?? false
          return (
            <li key={tip.id} className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
              <button
                type="button"
                onClick={() => setExpanded((e) => ({ ...e, [tip.id]: !isOpen }))}
                className="flex w-full items-center justify-between gap-2 text-left"
              >
                <span className="text-sm font-medium text-slate-200">{tip.titulo}</span>
                <span className="shrink-0 text-xs text-slate-500">{isOpen ? '▲' : '▼'}</span>
              </button>
              {isOpen && <p className="mt-1.5 text-xs text-slate-400">{tip.texto}</p>}
            </li>
          )
        })}
      </ul>
      <p className="mt-3 text-[11px] text-slate-500">{COACH_TIPS_SOURCE}</p>
    </Card>
  )
}
