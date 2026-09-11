import { useState } from 'react'
import type { ExerciseLog, SetLog } from '../lib/types'
import { generateId } from '../lib/id'
import { youtubeSearchUrl } from '../lib/youtube'
import { Badge, Card } from './ui'

export interface ExerciseSuggestionView {
  suggestedLoad: number | null
  targetReps?: number
  targetRpe?: number
  note: string
}

interface Props {
  exercise: ExerciseLog
  detail?: string
  suggestion?: ExerciseSuggestionView | null
  onAddSet: (set: SetLog) => void
  onUpdateSet: (setId: string, patch: Partial<SetLog>) => void
  onDeleteSet: (setId: string) => void
}

function NumberField({
  value,
  onCommit,
  placeholder,
  step = 1,
  min = 0,
  max,
  ariaLabel,
  commitOn = 'blur',
}: {
  value: string
  onCommit: (value: string) => void
  placeholder: string
  step?: number
  min?: number
  max?: number
  ariaLabel: string
  /** 'blur' debounces persistence for already-saved rows; 'change' commits every keystroke for the not-yet-saved new-set row. */
  commitOn?: 'blur' | 'change'
}) {
  const [draft, setDraft] = useState(value)
  return (
    <input
      type="number"
      inputMode="decimal"
      aria-label={ariaLabel}
      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-2 py-2 text-center text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
      placeholder={placeholder}
      step={step}
      min={min}
      max={max}
      value={draft}
      onChange={(e) => {
        setDraft(e.target.value)
        if (commitOn === 'change') onCommit(e.target.value)
      }}
      onBlur={() => {
        if (commitOn === 'blur' && draft !== value) onCommit(draft)
      }}
    />
  )
}

export function ExerciseCard({ exercise, detail, suggestion, onAddSet, onUpdateSet, onDeleteSet }: Props) {
  const [newSet, setNewSet] = useState({ load: '', reps: '', rpe: '' })
  const [resetKey, setResetKey] = useState(0)

  const canAdd = newSet.load !== '' && newSet.reps !== '' && newSet.rpe !== ''

  const handleAdd = () => {
    if (!canAdd) return
    onAddSet({
      id: generateId('set'),
      load: Number(newSet.load),
      reps: Number(newSet.reps),
      rpe: Number(newSet.rpe),
    })
    setNewSet({ load: '', reps: '', rpe: '' })
    setResetKey((k) => k + 1)
  }

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-slate-100">{exercise.name}</h3>
            {exercise.isMain && <Badge tone="emerald">principal</Badge>}
          </div>
          {detail && <p className="mt-0.5 text-xs text-slate-400">{detail}</p>}
        </div>
        <a
          href={youtubeSearchUrl(exercise.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 whitespace-nowrap rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs font-medium text-emerald-400 active:bg-slate-800"
        >
          ▶ ver execução
        </a>
      </div>

      {suggestion && (
        <div className="rounded-lg border border-sky-700/60 bg-sky-500/10 p-2.5">
          <p className="text-sm font-semibold text-sky-300">
            💡 Sugestão:{' '}
            {suggestion.suggestedLoad !== null
              ? `${suggestion.suggestedLoad}kg${suggestion.targetReps ? ` x${suggestion.targetReps}` : ''}${
                  suggestion.targetRpe ? ` @ RPE ${suggestion.targetRpe}` : ''
                }`
              : 'sem sugestão ainda'}
          </p>
          <p className="text-xs text-sky-200/80">{suggestion.note}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[280px] table-fixed border-separate border-spacing-y-1.5 text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400">
              <th className="w-10 font-medium">Série</th>
              <th className="font-medium">Carga (kg)</th>
              <th className="font-medium">Reps</th>
              <th className="font-medium">RPE</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {exercise.sets.map((set, idx) => (
              <tr key={set.id}>
                <td className="text-center text-slate-400">{idx + 1}</td>
                <td className="px-0.5">
                  <NumberField
                    value={String(set.load)}
                    step={0.5}
                    ariaLabel={`Carga da série ${idx + 1}`}
                    placeholder="kg"
                    onCommit={(v) => onUpdateSet(set.id, { load: Number(v) || 0 })}
                  />
                </td>
                <td className="px-0.5">
                  <NumberField
                    value={String(set.reps)}
                    ariaLabel={`Repetições da série ${idx + 1}`}
                    placeholder="reps"
                    onCommit={(v) => onUpdateSet(set.id, { reps: Number(v) || 0 })}
                  />
                </td>
                <td className="px-0.5">
                  <NumberField
                    value={String(set.rpe)}
                    step={0.5}
                    min={1}
                    max={10}
                    ariaLabel={`RPE da série ${idx + 1}`}
                    placeholder="RPE"
                    onCommit={(v) => onUpdateSet(set.id, { rpe: Number(v) || 0 })}
                  />
                </td>
                <td className="text-center">
                  <button
                    type="button"
                    aria-label={`Remover série ${idx + 1}`}
                    onClick={() => onDeleteSet(set.id)}
                    className="text-slate-500 active:text-red-400"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
            <tr>
              <td className="text-center text-slate-500">{exercise.sets.length + 1}</td>
              <td className="px-0.5">
                <NumberField
                  key={`new-load-${resetKey}`}
                  value={newSet.load}
                  step={0.5}
                  ariaLabel="Carga da nova série"
                  placeholder="kg"
                  commitOn="change"
                  onCommit={(v) => setNewSet((s) => ({ ...s, load: v }))}
                />
              </td>
              <td className="px-0.5">
                <NumberField
                  key={`new-reps-${resetKey}`}
                  value={newSet.reps}
                  ariaLabel="Repetições da nova série"
                  placeholder="reps"
                  commitOn="change"
                  onCommit={(v) => setNewSet((s) => ({ ...s, reps: v }))}
                />
              </td>
              <td className="px-0.5">
                <NumberField
                  key={`new-rpe-${resetKey}`}
                  value={newSet.rpe}
                  step={0.5}
                  min={1}
                  max={10}
                  ariaLabel="RPE da nova série"
                  placeholder="RPE"
                  commitOn="change"
                  onCommit={(v) => setNewSet((s) => ({ ...s, rpe: v }))}
                />
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      <button
        type="button"
        disabled={!canAdd}
        onClick={handleAdd}
        className="w-full rounded-lg border border-emerald-600/50 bg-emerald-500/10 py-2 text-sm font-semibold text-emerald-400 active:bg-emerald-500/20 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-transparent disabled:text-slate-500"
      >
        + Adicionar série
      </button>
    </Card>
  )
}
