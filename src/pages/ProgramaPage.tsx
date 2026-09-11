import { useState } from 'react'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import type { Day, Program, ProgramExercise } from '../lib/types'
import { DAY_SLOTS, WEEKDAY_NAMES, slotLabel, type DaySchedule } from '../lib/schedule'
import { generateId } from '../lib/id'
import { Card, PrimaryButton, SecondaryButton, SectionTitle } from '../components/ui'
import { ProgramExerciseRow } from '../components/ProgramExerciseRow'
import { BackupSection } from '../components/BackupSection'
import { WorkoutGeneratorWizard } from '../components/WorkoutGeneratorWizard'

const SLOT_TITLE: Record<Day, string> = { dia1: 'Treino 1', dia2: 'Treino 2', dia3: 'Treino 3' }

export function ProgramaPage() {
  const { program, schedule, saveProgram, saveSchedule, resetProgram } = useData()
  const { showToast } = useToast()
  const [day, setDay] = useState<Day>('dia1')
  const [confirmReset, setConfirmReset] = useState(false)
  const [showWizard, setShowWizard] = useState(false)

  const exercises = program[day]

  function updateDay(updater: (exs: ProgramExercise[]) => ProgramExercise[], toastMessage = 'Programa atualizado') {
    saveProgram({ ...program, [day]: updater(exercises) })
    showToast(toastMessage)
  }

  function handleAdd() {
    updateDay(
      (exs) => [...exs, { id: generateId('ex'), name: 'Novo exercício', detail: '', isMain: false }],
      'Exercício adicionado',
    )
  }

  function handleReset() {
    resetProgram()
    setConfirmReset(false)
    showToast('Programa padrão restaurado')
  }

  function handleWeekdayChange(slot: Day, weekday: number) {
    const conflictSlot = DAY_SLOTS.find((s) => s !== slot && schedule[s] === weekday)
    if (conflictSlot) {
      showToast(`${WEEKDAY_NAMES[weekday]} já está em uso por ${SLOT_TITLE[conflictSlot]}`, 'info')
      return
    }
    const next: DaySchedule = { ...schedule, [slot]: weekday }
    saveSchedule(next)
    showToast('Dias de treino atualizados')
  }

  function handleApplyGenerated(generated: Program) {
    saveProgram(generated)
    setShowWizard(false)
    showToast('Treino gerado aplicado com sucesso')
  }

  return (
    <div className="pb-4">
      <h1 className="mb-4 text-xl font-bold">Programa</h1>

      <Card className="mb-6 border-emerald-700/60 bg-emerald-500/5">
        <p className="mb-1 font-semibold text-emerald-300">Não tem um treino pronto?</p>
        <p className="mb-3 text-xs text-slate-400">
          Responda um questionário rápido e o app monta um programa de 3 dias sob medida para você.
        </p>
        <PrimaryButton onClick={() => setShowWizard(true)}>🧭 Gerar treino automaticamente</PrimaryButton>
      </Card>

      {showWizard && (
        <WorkoutGeneratorWizard schedule={schedule} onApply={handleApplyGenerated} onClose={() => setShowWizard(false)} />
      )}

      <SectionTitle>Dias de treino</SectionTitle>
      <Card className="mb-6 space-y-3">
        <p className="text-xs text-slate-400">
          Defina em qual dia da semana cai cada um dos seus 3 treinos. O app usa isso para pré-selecionar o treino certo
          automaticamente quando você abre a aba Registrar.
        </p>
        {DAY_SLOTS.map((slot) => (
          <div key={slot} className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-slate-200">{SLOT_TITLE[slot]}</span>
            <select
              value={schedule[slot]}
              onChange={(e) => handleWeekdayChange(slot, Number(e.target.value))}
              aria-label={`Dia da semana de ${SLOT_TITLE[slot]}`}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
            >
              {WEEKDAY_NAMES.map((name, idx) => (
                <option key={name} value={idx}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        ))}
      </Card>

      <div className="mb-4 grid grid-cols-3 gap-2">
        {DAY_SLOTS.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDay(d)}
            aria-pressed={day === d}
            className={`rounded-xl border px-2 py-2.5 text-sm font-semibold transition ${
              day === d ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300' : 'border-slate-700 bg-slate-900 text-slate-300'
            }`}
          >
            {slotLabel(schedule, d)}
          </button>
        ))}
      </div>

      <SectionTitle>Exercícios de {slotLabel(schedule, day)}</SectionTitle>
      <div className="mb-4 space-y-3">
        {exercises.map((ex) => (
          <ProgramExerciseRow
            key={ex.id}
            exercise={ex}
            onCommit={(patch) => updateDay((exs) => exs.map((e) => (e.id === ex.id ? { ...e, ...patch } : e)))}
            onDelete={() => updateDay((exs) => exs.filter((e) => e.id !== ex.id), 'Exercício removido')}
          />
        ))}
        {exercises.length === 0 && (
          <Card>
            <p className="text-sm text-slate-400">Nenhum exercício cadastrado para este dia.</p>
          </Card>
        )}
      </div>

      <SecondaryButton onClick={handleAdd} className="mb-8">
        + Adicionar exercício
      </SecondaryButton>

      {!confirmReset ? (
        <SecondaryButton onClick={() => setConfirmReset(true)} className="mb-8 border-red-800 text-red-300">
          Restaurar programa padrão
        </SecondaryButton>
      ) : (
        <Card className="mb-8 border-red-700 bg-red-500/5">
          <p className="mb-3 text-sm text-red-200">
            Tem certeza? Isso substitui todos os exercícios editados nos 3 treinos pelo programa padrão de fábrica.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <SecondaryButton onClick={() => setConfirmReset(false)}>Cancelar</SecondaryButton>
            <PrimaryButton onClick={handleReset} className="bg-red-500 text-white">
              Confirmar
            </PrimaryButton>
          </div>
        </Card>
      )}

      <BackupSection />
    </div>
  )
}
