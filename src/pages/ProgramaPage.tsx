import { useState } from 'react'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import { DIAS, type Day, type ProgramExercise } from '../lib/types'
import { generateId } from '../lib/id'
import { Card, PrimaryButton, SecondaryButton, SectionTitle } from '../components/ui'
import { ProgramExerciseRow } from '../components/ProgramExerciseRow'
import { BackupSection } from '../components/BackupSection'

export function ProgramaPage() {
  const { program, saveProgram, resetProgram } = useData()
  const { showToast } = useToast()
  const [day, setDay] = useState<Day>('segunda')
  const [confirmReset, setConfirmReset] = useState(false)

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

  return (
    <div className="pb-4">
      <h1 className="mb-4 text-xl font-bold">Programa</h1>

      <div className="mb-4 grid grid-cols-3 gap-2">
        {DIAS.map((d) => (
          <button
            key={d.key}
            type="button"
            onClick={() => setDay(d.key)}
            aria-pressed={day === d.key}
            className={`rounded-xl border px-2 py-2.5 text-sm font-semibold transition ${
              day === d.key ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300' : 'border-slate-700 bg-slate-900 text-slate-300'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <SectionTitle>Exercícios de {DIAS.find((d) => d.key === day)?.label}</SectionTitle>
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
            Tem certeza? Isso substitui todos os exercícios editados nos 3 dias pelo programa padrão de fábrica.
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
