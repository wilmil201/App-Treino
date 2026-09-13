import { useEffect, useState } from 'react'
import type { CardioSetLog, ExerciseFeedback, ExerciseLog, FeedbackMotivo, SetLog } from '../lib/types'
import { generateId } from '../lib/id'
import { youtubeSearchUrl } from '../lib/youtube'
import { getBuiltInSubstitutes } from '../lib/substitutes'
import { Badge, Card } from './ui'

export interface ExerciseSuggestionView {
  suggestedLoad: number | null
  reps?: number
  note: string
}

interface Props {
  exercise: ExerciseLog
  detail?: string
  suggestion?: ExerciseSuggestionView | null
  customSubstitutes?: string[]
  onAddSet: (set: SetLog) => void
  onUpdateSet: (setId: string, patch: Partial<SetLog>) => void
  onDeleteSet: (setId: string) => void
  onAddCardioSet: (set: CardioSetLog) => void
  onUpdateCardioSet: (setId: string, patch: Partial<CardioSetLog>) => void
  onDeleteCardioSet: (setId: string) => void
  onSwapExercise?: (newName: string) => void
  onSaveFeedback?: (feedback: ExerciseFeedback) => void
}

const MOTIVOS: { key: FeedbackMotivo; label: string }[] = [
  { key: 'fadiga', label: 'Fadiga/cansaço' },
  { key: 'dor', label: 'Dor/desconforto' },
  { key: 'carga_pesada', label: 'Carga muito pesada' },
  { key: 'falta_tempo', label: 'Falta de tempo' },
  { key: 'equipamento', label: 'Equipamento indisponível' },
  { key: 'outro', label: 'Outro' },
]

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

export function ExerciseCard({
  exercise,
  detail,
  suggestion,
  customSubstitutes = [],
  onAddSet,
  onUpdateSet,
  onDeleteSet,
  onAddCardioSet,
  onUpdateCardioSet,
  onDeleteCardioSet,
  onSwapExercise,
  onSaveFeedback,
}: Props) {
  const isAerobico = exercise.kind === 'aerobico'
  const cardioSets = exercise.cardioSets ?? []

  const [newSet, setNewSet] = useState(() => ({
    load: suggestion?.suggestedLoad != null ? String(suggestion.suggestedLoad) : '',
    reps: suggestion?.reps != null ? String(suggestion.reps) : '',
    rpe: '',
  }))
  const [newCardio, setNewCardio] = useState({ durationMin: '', rpe: '' })
  const [resetKey, setResetKey] = useState(0)
  const [showSubstitutes, setShowSubstitutes] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [naoCompletouOpen, setNaoCompletouOpen] = useState(false)
  const [motivoDraft, setMotivoDraft] = useState<FeedbackMotivo | null>(null)
  const [obsDraft, setObsDraft] = useState('')

  const canAdd = newSet.load !== '' && newSet.reps !== '' && newSet.rpe !== ''
  const canAddCardio = newCardio.durationMin !== '' && newCardio.rpe !== ''

  // A sugestão às vezes só fica disponível depois da primeira montagem do card
  // (ex: o app já estava montado quando o atleta preenche a ficha de anamnese
  // no onboarding). Preenche os campos de nova série assim que ela chegar,
  // mas só se o atleta ainda não tiver digitado nada — e força a remontagem
  // do NumberField (via resetKey) pra ele pegar o novo valor inicial.
  useEffect(() => {
    if (isAerobico) return
    if (suggestion?.suggestedLoad == null) return
    if (newSet.load !== '' || newSet.reps !== '') return
    setNewSet({ load: String(suggestion.suggestedLoad), reps: suggestion.reps != null ? String(suggestion.reps) : '', rpe: '' })
    setResetKey((k) => k + 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAerobico, suggestion?.suggestedLoad, suggestion?.reps])

  const substituteOptions = [...customSubstitutes, ...getBuiltInSubstitutes(exercise)].filter(
    (s, idx, arr) => arr.indexOf(s) === idx && s.toLowerCase() !== exercise.name.toLowerCase(),
  )

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

  const handleAddCardio = () => {
    if (!canAddCardio) return
    onAddCardioSet({
      id: generateId('cardio'),
      durationMin: Number(newCardio.durationMin),
      rpe: Number(newCardio.rpe),
    })
    setNewCardio({ durationMin: '', rpe: '' })
    setResetKey((k) => k + 1)
  }

  function handleCompletou() {
    onSaveFeedback?.({ completou: true })
    setFeedbackOpen(false)
    setNaoCompletouOpen(false)
  }

  function handleSalvarNaoCompletou() {
    if (!motivoDraft) return
    onSaveFeedback?.({ completou: false, motivo: motivoDraft, observacao: obsDraft.trim() || undefined })
    setFeedbackOpen(false)
    setNaoCompletouOpen(false)
  }

  function reabrirFeedback() {
    setMotivoDraft(exercise.feedback?.motivo ?? null)
    setObsDraft(exercise.feedback?.observacao ?? '')
    setNaoCompletouOpen(exercise.feedback ? !exercise.feedback.completou : false)
    setFeedbackOpen(true)
  }

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-slate-100">{exercise.name}</h3>
            {exercise.isMain && <Badge tone="emerald">principal</Badge>}
            {isAerobico && <Badge tone="default">aeróbico</Badge>}
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

      {onSwapExercise && substituteOptions.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowSubstitutes((v) => !v)}
            className="text-xs font-medium text-slate-400 underline decoration-dotted active:text-slate-200"
          >
            🔄 Não consigo/não sei fazer este — ver substitutos
          </button>
          {showSubstitutes && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {substituteOptions.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => {
                    onSwapExercise(sub)
                    setShowSubstitutes(false)
                  }}
                  className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-300 active:bg-slate-800"
                >
                  {sub}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {!isAerobico && suggestion && (
        <div className="rounded-lg border border-sky-700/60 bg-sky-500/10 p-2.5">
          <p className="text-sm font-semibold text-sky-300">
            💡 Sugestão:{' '}
            {suggestion.suggestedLoad !== null
              ? `${suggestion.suggestedLoad}kg${suggestion.reps ? ` x${suggestion.reps}` : ''}`
              : 'sem sugestão ainda'}
          </p>
          <p className="text-xs text-sky-200/80">{suggestion.note}</p>
        </div>
      )}

      {isAerobico ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[280px] table-fixed border-separate border-spacing-y-1.5 text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400">
                <th className="w-10 font-medium">#</th>
                <th className="font-medium">Duração (min)</th>
                <th className="font-medium">Esforço (RPE)</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {cardioSets.map((set, idx) => (
                <tr key={set.id}>
                  <td className="text-center text-slate-400">{idx + 1}</td>
                  <td className="px-0.5">
                    <NumberField
                      value={String(set.durationMin)}
                      ariaLabel={`Duração do registro ${idx + 1}`}
                      placeholder="min"
                      onCommit={(v) => onUpdateCardioSet(set.id, { durationMin: Number(v) || 0 })}
                    />
                  </td>
                  <td className="px-0.5">
                    <NumberField
                      value={String(set.rpe)}
                      step={0.5}
                      min={1}
                      max={10}
                      ariaLabel={`Esforço do registro ${idx + 1}`}
                      placeholder="RPE"
                      onCommit={(v) => onUpdateCardioSet(set.id, { rpe: Number(v) || 0 })}
                    />
                  </td>
                  <td className="text-center">
                    <button
                      type="button"
                      aria-label={`Remover registro ${idx + 1}`}
                      onClick={() => onDeleteCardioSet(set.id)}
                      className="text-slate-500 active:text-red-400"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                <td className="text-center text-slate-500">{cardioSets.length + 1}</td>
                <td className="px-0.5">
                  <NumberField
                    key={`new-duration-${resetKey}`}
                    value={newCardio.durationMin}
                    ariaLabel="Duração do novo registro"
                    placeholder="min"
                    commitOn="change"
                    onCommit={(v) => setNewCardio((s) => ({ ...s, durationMin: v }))}
                  />
                </td>
                <td className="px-0.5">
                  <NumberField
                    key={`new-cardio-rpe-${resetKey}`}
                    value={newCardio.rpe}
                    step={0.5}
                    min={1}
                    max={10}
                    ariaLabel="Esforço do novo registro"
                    placeholder="RPE"
                    commitOn="change"
                    onCommit={(v) => setNewCardio((s) => ({ ...s, rpe: v }))}
                  />
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
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
      )}

      <button
        type="button"
        disabled={isAerobico ? !canAddCardio : !canAdd}
        onClick={isAerobico ? handleAddCardio : handleAdd}
        className="w-full rounded-lg border border-emerald-600/50 bg-emerald-500/10 py-2 text-sm font-semibold text-emerald-400 active:bg-emerald-500/20 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-transparent disabled:text-slate-500"
      >
        + Adicionar {isAerobico ? 'registro' : 'série'}
      </button>

      {onSaveFeedback && (
        <div className="border-t border-slate-800 pt-3">
          {!feedbackOpen && exercise.feedback && (
            <button
              type="button"
              onClick={reabrirFeedback}
              className={`w-full rounded-lg border px-3 py-2 text-left text-xs ${
                exercise.feedback.completou
                  ? 'border-emerald-700/60 bg-emerald-500/10 text-emerald-300'
                  : 'border-amber-700/60 bg-amber-500/10 text-amber-300'
              }`}
            >
              {exercise.feedback.completou
                ? '✓ Exercício finalizado — completou o planejado'
                : `⚠ Exercício finalizado — não completou (${MOTIVOS.find((m) => m.key === exercise.feedback?.motivo)?.label ?? exercise.feedback.motivo})`}
              <span className="ml-1 underline decoration-dotted">editar</span>
            </button>
          )}

          {!feedbackOpen && !exercise.feedback && (
            <button
              type="button"
              onClick={() => setFeedbackOpen(true)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 text-sm font-semibold text-slate-300 active:bg-slate-800"
            >
              ✓ Finalizar exercício
            </button>
          )}

          {feedbackOpen && (
            <div className="space-y-2.5 rounded-lg border border-slate-700 bg-slate-900/60 p-3">
              <p className="text-sm font-medium text-slate-200">Completou as séries planejadas?</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCompletou}
                  className="rounded-lg border border-emerald-600/60 bg-emerald-500/10 py-2 text-sm font-semibold text-emerald-300 active:bg-emerald-500/20"
                >
                  Sim
                </button>
                <button
                  type="button"
                  onClick={() => setNaoCompletouOpen(true)}
                  aria-pressed={naoCompletouOpen}
                  className="rounded-lg border border-amber-600/60 bg-amber-500/10 py-2 text-sm font-semibold text-amber-300 active:bg-amber-500/20"
                >
                  Não
                </button>
              </div>

              {naoCompletouOpen && (
                <div className="space-y-2.5">
                  <p className="text-xs text-slate-400">Por que não completou?</p>
                  <div className="flex flex-wrap gap-1.5">
                    {MOTIVOS.map((m) => (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => setMotivoDraft(m.key)}
                        aria-pressed={motivoDraft === m.key}
                        className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                          motivoDraft === m.key
                            ? 'border-amber-500 bg-amber-500/20 text-amber-200'
                            : 'border-slate-700 bg-slate-900 text-slate-400'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={obsDraft}
                    onChange={(e) => setObsDraft(e.target.value)}
                    rows={2}
                    placeholder="Observação (opcional)"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={!motivoDraft}
                    onClick={handleSalvarNaoCompletou}
                    className="w-full rounded-lg border border-amber-600/60 bg-amber-500/10 py-2 text-sm font-semibold text-amber-300 active:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Salvar feedback
                  </button>
                </div>
              )}

              <button type="button" onClick={() => setFeedbackOpen(false)} className="w-full text-center text-xs text-slate-500">
                cancelar
              </button>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
