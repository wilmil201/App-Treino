import { useState } from 'react'
import type { LiftCategory, ProgramExercise } from '../lib/types'
import { youtubeSearchUrl } from '../lib/youtube'
import { Card } from './ui'

const LIFT_OPTIONS: { key: LiftCategory; label: string }[] = [
  { key: 'agachamento', label: 'Agachamento' },
  { key: 'supino', label: 'Supino' },
  { key: 'terra', label: 'Terra' },
]

export function ProgramExerciseRow({
  exercise,
  onCommit,
  onDelete,
}: {
  exercise: ProgramExercise
  onCommit: (patch: Partial<ProgramExercise>) => void
  onDelete: () => void
}) {
  const [name, setName] = useState(exercise.name)
  const [detail, setDetail] = useState(exercise.detail)

  return (
    <Card className="space-y-2.5">
      <div className="flex items-start gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => name !== exercise.name && onCommit({ name })}
          aria-label="Nome do exercício"
          className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 font-medium text-slate-100 focus:border-emerald-500 focus:outline-none"
          placeholder="Nome do exercício"
        />
        <button type="button" aria-label="Remover exercício" onClick={onDelete} className="shrink-0 px-2 text-slate-500 active:text-red-400">
          ✕
        </button>
      </div>
      {exercise.name.trim() && (
        <a
          href={youtubeSearchUrl(exercise.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-xs font-medium text-emerald-400"
        >
          ▶ ver execução
        </a>
      )}
      <input
        value={detail}
        onChange={(e) => setDetail(e.target.value)}
        onBlur={() => detail !== exercise.detail && onCommit({ detail })}
        aria-label="Detalhe de séries/reps"
        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 focus:border-emerald-500 focus:outline-none"
        placeholder="ex: 4x6 @ RPE 8"
      />
      <label className="flex items-center gap-2 text-sm text-slate-300">
        <input
          type="checkbox"
          className="h-4 w-4 accent-emerald-500"
          checked={exercise.isMain}
          onChange={(e) => onCommit({ isMain: e.target.checked, liftCategory: e.target.checked ? exercise.liftCategory ?? 'agachamento' : undefined })}
        />
        Levantamento principal
      </label>
      {exercise.isMain && (
        <div className="grid grid-cols-3 gap-2">
          {LIFT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => onCommit({ liftCategory: opt.key })}
              aria-pressed={exercise.liftCategory === opt.key}
              className={`rounded-lg border px-2 py-1.5 text-xs font-semibold ${
                exercise.liftCategory === opt.key
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                  : 'border-slate-700 bg-slate-900 text-slate-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </Card>
  )
}
