import { useState } from 'react'
import type { Anamnese, LiftCategory, Program, ProgramExercise } from '../lib/types'
import { DAY_SLOTS, slotLabel, type DaySchedule } from '../lib/schedule'
import { LIFT_LABEL } from '../lib/liftLabels'
import { Card, PrimaryButton, SecondaryButton } from './ui'

function norm(name: string): string {
  return name.trim().toLowerCase()
}

type Draft = Record<string, { load: string; reps: string }>

function keyFor(ex: ProgramExercise): string {
  return ex.liftCategory ? `main:${ex.liftCategory}` : `acc:${norm(ex.name)}`
}

function buildInitialDraft(program: Program, anamnese: Anamnese): Draft {
  const draft: Draft = {}
  for (const day of DAY_SLOTS) {
    for (const ex of program[day]) {
      const key = keyFor(ex)
      const existing = ex.liftCategory ? anamnese.mainLifts[ex.liftCategory] : anamnese.accessories[norm(ex.name)]
      draft[key] = { load: existing ? String(existing.load) : '', reps: existing ? String(existing.reps) : '' }
    }
  }
  return draft
}

export function AnamneseForm({
  program,
  schedule,
  anamnese,
  onSave,
  onSkip,
}: {
  program: Program
  schedule: DaySchedule
  anamnese: Anamnese
  onSave: (a: Anamnese) => void
  onSkip?: () => void
}) {
  const [draft, setDraft] = useState<Draft>(() => buildInitialDraft(program, anamnese))
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({})

  function setField(key: string, field: 'load' | 'reps', value: string) {
    setDraft((d) => ({ ...d, [key]: { ...d[key], [field]: value } }))
  }

  function handleSave() {
    const next: Anamnese = { mainLifts: {}, accessories: {} }
    for (const day of DAY_SLOTS) {
      for (const ex of program[day]) {
        const key = keyFor(ex)
        const entry = draft[key]
        if (!entry || entry.load === '' || entry.reps === '') continue
        const load = Number(entry.load)
        const reps = Number(entry.reps)
        if (!load || !reps) continue
        if (ex.liftCategory) {
          next.mainLifts[ex.liftCategory] = { load, reps }
        } else {
          next.accessories[norm(ex.name)] = { load, reps }
        }
      }
    }
    onSave(next)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Preencha a carga e as repetições que você já consegue fazer hoje em cada exercício. O app usa isso para já
        calcular a sugestão de carga desde o primeiro treino, em vez de começar do zero. Pode deixar em branco o que
        não souber — dá pra completar depois.
      </p>

      {DAY_SLOTS.map((day) => {
        const exercises = program[day].filter((ex) => ex.kind !== 'aerobico')
        const mainExs = exercises.filter((ex) => ex.isMain)
        const accExs = exercises.filter((ex) => !ex.isMain)
        const isExpanded = expandedDays[day] ?? false

        return (
          <Card key={day}>
            <p className="mb-3 font-semibold text-emerald-400">{slotLabel(schedule, day)}</p>

            <div className="space-y-3">
              {mainExs.map((ex) => {
                const key = keyFor(ex)
                const entry = draft[key] ?? { load: '', reps: '' }
                return (
                  <div key={ex.id}>
                    <p className="mb-1 text-sm font-medium text-slate-200">
                      {ex.name}
                      {ex.liftCategory && <span className="ml-1 text-xs text-slate-500">({LIFT_LABEL[ex.liftCategory as LiftCategory]})</span>}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        inputMode="decimal"
                        value={entry.load}
                        onChange={(e) => setField(key, 'load', e.target.value)}
                        placeholder="Carga (kg)"
                        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
                      />
                      <input
                        type="number"
                        inputMode="decimal"
                        value={entry.reps}
                        onChange={(e) => setField(key, 'reps', e.target.value)}
                        placeholder="Reps"
                        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {accExs.length > 0 && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setExpandedDays((d) => ({ ...d, [day]: !isExpanded }))}
                  className="text-xs font-medium text-slate-400 underline decoration-dotted"
                >
                  {isExpanded ? '▲ ocultar acessórios' : `▼ ver acessórios (${accExs.length})`}
                </button>
                {isExpanded && (
                  <div className="mt-3 space-y-3">
                    {accExs.map((ex) => {
                      const key = keyFor(ex)
                      const entry = draft[key] ?? { load: '', reps: '' }
                      return (
                        <div key={ex.id}>
                          <p className="mb-1 text-xs text-slate-300">{ex.name}</p>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              inputMode="decimal"
                              value={entry.load}
                              onChange={(e) => setField(key, 'load', e.target.value)}
                              placeholder="Carga (kg)"
                              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
                            />
                            <input
                              type="number"
                              inputMode="decimal"
                              value={entry.reps}
                              onChange={(e) => setField(key, 'reps', e.target.value)}
                              placeholder="Reps"
                              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </Card>
        )
      })}

      <div className="space-y-2">
        <PrimaryButton onClick={handleSave}>Salvar ficha de anamnese</PrimaryButton>
        {onSkip && <SecondaryButton onClick={onSkip}>Pular por agora</SecondaryButton>}
      </div>
    </div>
  )
}
