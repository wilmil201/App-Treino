import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import { DIAS, type Day, type ExerciseLog, type SetLog, type Workout } from '../lib/types'
import { generateId } from '../lib/id'
import { todayISO, todayWeekdayDay, getCicloOndulatorio, formatDateBR } from '../lib/dates'
import { workoutVolume, epley1RM, getMaxE1RM } from '../lib/calculations'
import { suggestMainLift, suggestAccessory } from '../lib/suggestions'
import { LIFT_LABEL } from '../lib/liftLabels'
import { Card, PrimaryButton } from '../components/ui'
import { CycleBanner } from '../components/CycleBanner'
import { ExerciseCard, type ExerciseSuggestionView } from '../components/ExerciseCard'

function formatVolume(v: number): string {
  return v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })
}

export function RegistrarPage() {
  const { program, workouts, upsertWorkout } = useData()
  const { showToast } = useToast()

  const today = todayISO()
  const existing = workouts.find((w) => w.date === today)

  const [selectedDay, setSelectedDay] = useState<Day>(existing?.day ?? todayWeekdayDay())
  const [weightExpanded, setWeightExpanded] = useState(true)
  const [weightDraft, setWeightDraft] = useState(existing?.bodyWeight ? String(existing.bodyWeight) : '')
  const [notesDraft, setNotesDraft] = useState(existing?.notes ?? '')

  const day = existing?.day ?? selectedDay

  const workout: Workout = useMemo(() => {
    if (existing) return existing
    const exercises: ExerciseLog[] = program[day].map((ex) => ({
      exerciseId: ex.id,
      name: ex.name,
      isMain: ex.isMain,
      liftCategory: ex.liftCategory,
      sets: [],
    }))
    return {
      id: generateId('workout'),
      date: today,
      day,
      exercises,
      finished: false,
    }
  }, [existing, program, day, today])

  const cicloStart = workouts.length > 0 ? [...workouts].map((w) => w.date).sort()[0] : null
  const ciclo = getCicloOndulatorio(cicloStart, today)

  const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)
  const totalVolume = workoutVolume(workout)

  function commit(updated: Workout, toastMessage?: string) {
    upsertWorkout(updated)
    if (toastMessage) showToast(toastMessage)
  }

  function updateExerciseSets(exerciseId: string, updater: (sets: SetLog[]) => SetLog[], toastMessage?: string) {
    const exercises = workout.exercises.map((ex) => (ex.exerciseId === exerciseId ? { ...ex, sets: updater(ex.sets) } : ex))
    commit({ ...workout, day, exercises }, toastMessage)
  }

  function handleAddSet(exerciseId: string, set: SetLog) {
    const exercise = workout.exercises.find((e) => e.exerciseId === exerciseId)
    let toastMessage = 'Série salva'
    let toastKind: 'sucesso' | 'recorde' = 'sucesso'

    if (exercise?.liftCategory) {
      const priorFromHistory = getMaxE1RM(workouts, exercise.liftCategory)
      const priorFromToday = exercise.sets.reduce((max, s) => Math.max(max, epley1RM(s.load, s.reps)), 0)
      const priorMax = Math.max(priorFromHistory, priorFromToday)
      const newE1RM = epley1RM(set.load, set.reps)
      if (priorMax > 0 && newE1RM > priorMax) {
        toastMessage = `Novo recorde em ${LIFT_LABEL[exercise.liftCategory]}: ${Math.round(newE1RM)}kg e1RM!`
        toastKind = 'recorde'
      }
    }

    updateExerciseSets(exerciseId, (sets) => [...sets, set], undefined)
    showToast(toastMessage, toastKind)
  }

  function handleUpdateSet(exerciseId: string, setId: string, patch: Partial<SetLog>) {
    updateExerciseSets(
      exerciseId,
      (sets) => sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)),
      'Série atualizada',
    )
  }

  function handleDeleteSet(exerciseId: string, setId: string) {
    updateExerciseSets(exerciseId, (sets) => sets.filter((s) => s.id !== setId), 'Série removida')
  }

  function handleSaveDayInfo() {
    const parsedWeight = weightDraft === '' ? undefined : Number(weightDraft)
    commit({ ...workout, day, bodyWeight: parsedWeight, notes: notesDraft || undefined }, 'Peso corporal e observações salvos')
  }

  function handleFinish() {
    if (totalSets === 0) return
    commit(
      { ...workout, day, finished: true, summary: { totalSets, totalVolume, finishedAt: new Date().toISOString() } },
      `Treino finalizado e salvo, ${totalSets} séries, ${formatVolume(totalVolume)}kg de volume`,
    )
  }

  return (
    <div className="pb-4">
      <h1 className="mb-4 text-xl font-bold">Registrar treino</h1>

      <CycleBanner ciclo={ciclo} />

      <div className="mb-4 grid grid-cols-3 gap-2">
        {DIAS.map((d) => (
          <button
            key={d.key}
            type="button"
            disabled={!!existing}
            onClick={() => setSelectedDay(d.key)}
            aria-pressed={day === d.key}
            className={`rounded-xl border px-2 py-2.5 text-sm font-semibold transition ${
              day === d.key
                ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                : 'border-slate-700 bg-slate-900 text-slate-300'
            } ${existing ? 'opacity-60' : 'active:bg-slate-800'}`}
          >
            {d.label}
          </button>
        ))}
      </div>
      <p className="-mt-3 mb-4 text-xs text-slate-500">{formatDateBR(today)}{existing ? ' · dia já registrado, fixo' : ''}</p>

      <Card className="mb-4">
        <button
          type="button"
          className="flex w-full items-center justify-between"
          onClick={() => setWeightExpanded((v) => !v)}
        >
          <span className="font-semibold">Peso corporal e observações</span>
          <span className="text-slate-400">{weightExpanded ? '▲' : '▼'}</span>
        </button>
        {weightExpanded && (
          <div className="mt-3 space-y-3">
            <div>
              <label className="mb-1 block text-xs text-slate-400" htmlFor="bodyweight">
                Peso corporal (kg)
              </label>
              <input
                id="bodyweight"
                type="number"
                inputMode="decimal"
                step={0.1}
                value={weightDraft}
                onChange={(e) => setWeightDraft(e.target.value)}
                onBlur={handleSaveDayInfo}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
                placeholder="ex: 88,5"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400" htmlFor="notes">
                Observações do dia
              </label>
              <textarea
                id="notes"
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                onBlur={handleSaveDayInfo}
                rows={2}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
                placeholder="sono, dor, disposição..."
              />
            </div>
          </div>
        )}
      </Card>

      {workout.finished && (
        <div className="mb-4 rounded-2xl border border-emerald-600 bg-emerald-500/10 p-4 text-emerald-300">
          <p className="font-semibold">✓ Treino finalizado e salvo</p>
          <p className="text-sm text-emerald-200/90">
            {totalSets} séries, {formatVolume(totalVolume)}kg de volume total
          </p>
        </div>
      )}

      <div className="space-y-4">
        {workout.exercises.map((ex) => {
          const detail = program[day].find((p) => p.id === ex.exerciseId)?.detail
          let suggestion: ExerciseSuggestionView | null = null
          if (ex.liftCategory) {
            const s = suggestMainLift(ex.liftCategory, workouts, program, ciclo)
            if (s.hasHistory) {
              suggestion = { suggestedLoad: s.suggestedLoad, targetReps: s.targetReps, targetRpe: s.isDeload ? undefined : s.targetRpe, note: s.note }
            }
          } else {
            const s = suggestAccessory(ex.name, workouts)
            if (s.hasHistory) {
              suggestion = { suggestedLoad: s.suggestedLoad, note: s.note }
            }
          }
          return (
            <ExerciseCard
              key={ex.exerciseId}
              exercise={ex}
              detail={detail}
              suggestion={suggestion}
              onAddSet={(set) => handleAddSet(ex.exerciseId, set)}
              onUpdateSet={(setId, patch) => handleUpdateSet(ex.exerciseId, setId, patch)}
              onDeleteSet={(setId) => handleDeleteSet(ex.exerciseId, setId)}
            />
          )
        })}
      </div>

      <div className="mt-5">
        <PrimaryButton disabled={totalSets === 0} onClick={handleFinish}>
          {workout.finished ? 'Atualizar treino finalizado' : 'Finalizar treino'}
        </PrimaryButton>
        {totalSets === 0 && <p className="mt-2 text-center text-xs text-slate-500">Registre ao menos 1 série para finalizar</p>}
      </div>
    </div>
  )
}
