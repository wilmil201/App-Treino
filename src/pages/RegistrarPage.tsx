import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import type { CardioSetLog, Day, ExerciseFeedback, ExerciseLog, SetLog, Workout } from '../lib/types'
import { DAY_SLOTS, slotLabel } from '../lib/schedule'
import { generateId } from '../lib/id'
import { todayISO, todayWeekdayDay, getCicloOndulatorio, formatDateBR } from '../lib/dates'
import { workoutVolume, epley1RM, getMaxE1RM } from '../lib/calculations'
import { suggestMainLift, suggestAccessory } from '../lib/suggestions'
import { suggestNextSessionTiming } from '../lib/recovery'
import { LIFT_LABEL } from '../lib/liftLabels'
import { Card, PrimaryButton } from '../components/ui'
import { CycleBanner } from '../components/CycleBanner'
import { ExerciseCard, type ExerciseSuggestionView } from '../components/ExerciseCard'

function formatVolume(v: number): string {
  return v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })
}

export function RegistrarPage() {
  const { program, workouts, schedule, anamnese, upsertWorkout } = useData()
  const { showToast } = useToast()

  const today = todayISO()
  const existing = workouts.find((w) => w.date === today)

  const [selectedDay, setSelectedDay] = useState<Day>(existing?.day ?? todayWeekdayDay(schedule))
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
      kind: ex.kind,
      sets: [],
      cardioSets: [],
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

  const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length + (ex.cardioSets?.length ?? 0), 0)
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

  function updateExerciseCardioSets(exerciseId: string, updater: (sets: CardioSetLog[]) => CardioSetLog[], toastMessage?: string) {
    const exercises = workout.exercises.map((ex) =>
      ex.exerciseId === exerciseId ? { ...ex, cardioSets: updater(ex.cardioSets ?? []) } : ex,
    )
    commit({ ...workout, day, exercises }, toastMessage)
  }

  function handleAddCardioSet(exerciseId: string, set: CardioSetLog) {
    updateExerciseCardioSets(exerciseId, (sets) => [...sets, set], 'Registro salvo')
  }

  function handleUpdateCardioSet(exerciseId: string, setId: string, patch: Partial<CardioSetLog>) {
    updateExerciseCardioSets(
      exerciseId,
      (sets) => sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)),
      'Registro atualizado',
    )
  }

  function handleDeleteCardioSet(exerciseId: string, setId: string) {
    updateExerciseCardioSets(exerciseId, (sets) => sets.filter((s) => s.id !== setId), 'Registro removido')
  }

  function handleSwapExercise(exerciseId: string, newName: string) {
    const exercises = workout.exercises.map((ex) => (ex.exerciseId === exerciseId ? { ...ex, name: newName } : ex))
    commit({ ...workout, day, exercises }, `Exercício trocado para: ${newName}`)
  }

  function handleSaveFeedback(exerciseId: string, feedback: ExerciseFeedback) {
    const exercises = workout.exercises.map((ex) => (ex.exerciseId === exerciseId ? { ...ex, feedback } : ex))
    commit({ ...workout, day, exercises }, feedback.completou ? 'Exercício finalizado' : 'Feedback registrado')
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
        {DAY_SLOTS.map((d) => (
          <button
            key={d}
            type="button"
            disabled={!!existing}
            onClick={() => setSelectedDay(d)}
            aria-pressed={day === d}
            className={`rounded-xl border px-2 py-2.5 text-sm font-semibold transition ${
              day === d
                ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                : 'border-slate-700 bg-slate-900 text-slate-300'
            } ${existing ? 'opacity-60' : 'active:bg-slate-800'}`}
          >
            {slotLabel(schedule, d)}
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
          {(() => {
            const rec = suggestNextSessionTiming(workout)
            return (
              <p className="mt-2 border-t border-emerald-700/40 pt-2 text-sm text-emerald-200/90">
                📅 Próxima sessão recomendada: <span className="font-semibold">{rec.nextDateLabel}</span> ({rec.restDays} dias de descanso)
                <br />
                <span className="text-xs text-emerald-300/70">{rec.reason}</span>
              </p>
            )
          })()}
        </div>
      )}

      <div className="space-y-4">
        {workout.exercises.map((ex) => {
          const programExercise = program[day].find((p) => p.id === ex.exerciseId)
          const detail = programExercise?.detail
          let suggestion: ExerciseSuggestionView | null = null
          if (ex.kind === 'aerobico') {
            // exercícios aeróbicos usam duração/esforço, não carga — sem sugestão de carga aqui.
          } else if (ex.liftCategory) {
            const s = suggestMainLift(ex.liftCategory, workouts, ciclo, anamnese)
            if (s.hasHistory || s.isCalibration) {
              suggestion = { suggestedLoad: s.suggestedLoad, reps: s.reps, note: s.note, isCalibration: s.isCalibration }
            }
          } else {
            const s = suggestAccessory(ex.name, workouts, anamnese)
            if (s.hasHistory || s.isCalibration) {
              suggestion = { suggestedLoad: s.suggestedLoad, reps: s.reps, note: s.note, isCalibration: s.isCalibration }
            }
          }
          return (
            <ExerciseCard
              key={ex.exerciseId}
              exercise={ex}
              detail={detail}
              suggestion={suggestion}
              customSubstitutes={programExercise?.substitutes ?? []}
              onAddSet={(set) => handleAddSet(ex.exerciseId, set)}
              onUpdateSet={(setId, patch) => handleUpdateSet(ex.exerciseId, setId, patch)}
              onDeleteSet={(setId) => handleDeleteSet(ex.exerciseId, setId)}
              onAddCardioSet={(set) => handleAddCardioSet(ex.exerciseId, set)}
              onUpdateCardioSet={(setId, patch) => handleUpdateCardioSet(ex.exerciseId, setId, patch)}
              onDeleteCardioSet={(setId) => handleDeleteCardioSet(ex.exerciseId, setId)}
              onSwapExercise={(newName) => handleSwapExercise(ex.exerciseId, newName)}
              onSaveFeedback={(feedback) => handleSaveFeedback(ex.exerciseId, feedback)}
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
