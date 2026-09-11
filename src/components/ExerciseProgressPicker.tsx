import { useState } from 'react'
import { getExerciseSessions } from '../lib/exerciseHistory'
import { youtubeSearchUrl } from '../lib/youtube'
import { formatDateBR } from '../lib/dates'
import type { Workout } from '../lib/types'
import { Card } from './ui'
import { LineChart } from './LineChart'

export function ExerciseProgressPicker({ workouts, exerciseNames }: { workouts: Workout[]; exerciseNames: string[] }) {
  const [selected, setSelected] = useState(exerciseNames[0] ?? '')
  const [metric, setMetric] = useState<'load' | 'e1rm'>('load')

  if (exerciseNames.length === 0) {
    return (
      <Card>
        <p className="text-sm text-slate-400">Finalize um treino para ver a evolução de cada exercício aqui.</p>
      </Card>
    )
  }

  const sessions = getExerciseSessions(workouts, selected)
  const data = sessions.map((s) => ({
    label: formatDateBR(s.date).slice(0, 5),
    value: metric === 'load' ? s.load : s.e1rm,
  }))
  const last = sessions[sessions.length - 1]

  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          aria-label="Escolher exercício"
          className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
        >
          {exerciseNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <a
          href={youtubeSearchUrl(selected)}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 whitespace-nowrap rounded-lg border border-slate-700 px-2.5 py-2 text-xs font-medium text-emerald-400 active:bg-slate-800"
        >
          ▶ ver execução
        </a>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setMetric('load')}
          aria-pressed={metric === 'load'}
          className={`rounded-lg border px-2 py-1.5 text-xs font-semibold ${
            metric === 'load' ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300' : 'border-slate-700 bg-slate-900 text-slate-300'
          }`}
        >
          Carga do top set
        </button>
        <button
          type="button"
          onClick={() => setMetric('e1rm')}
          aria-pressed={metric === 'e1rm'}
          className={`rounded-lg border px-2 py-1.5 text-xs font-semibold ${
            metric === 'e1rm' ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300' : 'border-slate-700 bg-slate-900 text-slate-300'
          }`}
        >
          e1RM (Epley)
        </button>
      </div>

      <LineChart data={data} color="#a78bfa" unit="kg" />
      {last && (
        <p className="mt-2 text-xs text-slate-500">
          última sessão: {last.load}kg x{last.reps} @ RPE {last.rpe}
        </p>
      )}
    </Card>
  )
}
