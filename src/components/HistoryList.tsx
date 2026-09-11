import { useMemo, useState } from 'react'
import type { JJSession, Workout } from '../lib/types'
import { workoutVolume } from '../lib/calculations'
import { formatDateBR } from '../lib/dates'
import { Card } from './ui'

type HistoryEvent =
  | { kind: 'treino'; date: string; workout: Workout }
  | { kind: 'jiujitsu'; date: string; session: JJSession }

const DIA_LABEL: Record<Workout['day'], string> = { segunda: 'Segunda', quarta: 'Quarta', sexta: 'Sexta' }
const JJ_TYPE_LABEL: Record<JJSession['type'], string> = { sessao1: 'Sessão 1', sessao2: 'Sessão 2', drill: 'Drill de velocidade' }

function monthLabel(dateISO: string): string {
  const d = new Date(dateISO + 'T00:00:00')
  const label = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function monthKey(dateISO: string): string {
  return dateISO.slice(0, 7)
}

export function HistoryList({ workouts, jjSessions }: { workouts: Workout[]; jjSessions: JJSession[] }) {
  const [openMonths, setOpenMonths] = useState<Record<string, boolean>>({})

  const groups = useMemo(() => {
    const events: HistoryEvent[] = [
      ...workouts.filter((w) => w.finished).map((w): HistoryEvent => ({ kind: 'treino', date: w.date, workout: w })),
      ...jjSessions.map((s): HistoryEvent => ({ kind: 'jiujitsu', date: s.date, session: s })),
    ].sort((a, b) => b.date.localeCompare(a.date))

    const map = new Map<string, HistoryEvent[]>()
    for (const ev of events) {
      const key = monthKey(ev.date)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(ev)
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]))
  }, [workouts, jjSessions])

  if (groups.length === 0) {
    return (
      <Card>
        <p className="text-sm text-slate-400">Nenhuma sessão registrada ainda.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {groups.map(([key, events], idx) => {
        const isOpen = openMonths[key] ?? idx === 0
        return (
          <Card key={key}>
            <button
              type="button"
              className="flex w-full items-center justify-between"
              onClick={() => setOpenMonths((m) => ({ ...m, [key]: !isOpen }))}
            >
              <span className="font-semibold">{monthLabel(events[0].date)}</span>
              <span className="text-xs text-slate-400">
                {events.length} {events.length === 1 ? 'registro' : 'registros'} {isOpen ? '▲' : '▼'}
              </span>
            </button>
            {isOpen && (
              <ul className="mt-3 space-y-2">
                {events.map((ev, i) => (
                  <li key={i} className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5 text-sm">
                    {ev.kind === 'treino' ? (
                      <>
                        <p className="font-medium text-slate-200">
                          {formatDateBR(ev.date)} · Musculação · {DIA_LABEL[ev.workout.day]}
                        </p>
                        <p className="text-xs text-slate-400">
                          {ev.workout.summary?.totalSets ?? ev.workout.exercises.reduce((s, e) => s + e.sets.length, 0)} séries ·{' '}
                          {Math.round(workoutVolume(ev.workout)).toLocaleString('pt-BR')}kg de volume
                          {ev.workout.bodyWeight ? ` · ${ev.workout.bodyWeight}kg corporal` : ''}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium text-slate-200">
                          {formatDateBR(ev.date)} · Jiu-Jitsu · {JJ_TYPE_LABEL[ev.session.type]}
                        </p>
                        <p className="text-xs text-slate-400">
                          {[
                            ev.session.intensity,
                            ev.session.duration ? `${ev.session.duration}min` : null,
                            ev.session.rounds ? `${ev.session.rounds} rounds` : null,
                            ev.session.rpe ? `RPE ${ev.session.rpe}` : null,
                            ev.session.gas !== undefined ? `gás ${ev.session.gas}/10` : null,
                          ]
                            .filter(Boolean)
                            .join(' · ') || 'sem detalhes'}
                        </p>
                      </>
                    )}
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
