import { useState } from 'react'
import type { Anamnese, LiftCategory, NivelExperiencia, ObjetivoTreino, Program, ProgramExercise } from '../lib/types'
import { DAY_SLOTS, slotLabel, type DaySchedule } from '../lib/schedule'
import { LIFT_LABEL } from '../lib/liftLabels'
import { Card, PrimaryButton, SecondaryButton } from './ui'

function norm(name: string): string {
  return name.trim().toLowerCase()
}

const OBJETIVO_OPTIONS: { key: ObjetivoTreino; label: string; desc: string }[] = [
  { key: 'forca', label: 'Força', desc: 'Ganho de força máxima' },
  { key: 'hipertrofia', label: 'Hipertrofia', desc: 'Ganho de massa muscular' },
  { key: 'resistencia', label: 'Resistência / condicionamento', desc: 'Capacidade de repetir esforço' },
  { key: 'emagrecimento', label: 'Emagrecimento', desc: 'Perda de gordura' },
  { key: 'performance_esportiva', label: 'Performance esportiva', desc: 'Transferência para o esporte praticado' },
]

const NIVEL_OPTIONS: { key: NivelExperiencia; label: string }[] = [
  { key: 'iniciante', label: 'Iniciante' },
  { key: 'intermediario', label: 'Intermediário' },
  { key: 'avancado', label: 'Avançado' },
]

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
  const [objetivo, setObjetivo] = useState<ObjetivoTreino>(anamnese.profile?.objetivo ?? 'hipertrofia')
  const [esporte, setEsporte] = useState(anamnese.profile?.esporte ?? '')
  const [nivel, setNivel] = useState<NivelExperiencia>(anamnese.profile?.nivel ?? 'intermediario')

  function setField(key: string, field: 'load' | 'reps', value: string) {
    setDraft((d) => ({ ...d, [key]: { ...d[key], [field]: value } }))
  }

  function handleSave() {
    const next: Anamnese = { profile: { objetivo, esporte: esporte.trim() || undefined, nivel }, mainLifts: {}, accessories: {} }
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

      <Card className="space-y-3">
        <p className="font-semibold text-sky-300">Objetivo e perfil</p>
        <p className="text-xs text-slate-400">
          Sem nenhuma carga de referência, o app não inventa um número — ele te dá um protocolo de calibração (faixa de
          reps/RPE) baseado no seu objetivo. Por isso essas respostas importam.
        </p>
        <div>
          <p className="mb-1.5 text-xs text-slate-400">Objetivo principal</p>
          <div className="space-y-2">
            {OBJETIVO_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setObjetivo(opt.key)}
                aria-pressed={objetivo === opt.key}
                className={`w-full rounded-lg border p-2.5 text-left ${
                  objetivo === opt.key ? 'border-sky-500 bg-sky-500/15' : 'border-slate-700 bg-slate-900'
                }`}
              >
                <p className="text-sm font-medium text-slate-100">{opt.label}</p>
                <p className="text-xs text-slate-400">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-xs text-slate-400">Nível de experiência</p>
          <div className="grid grid-cols-3 gap-2">
            {NIVEL_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setNivel(opt.key)}
                aria-pressed={nivel === opt.key}
                className={`rounded-lg border px-2 py-2 text-xs font-semibold ${
                  nivel === opt.key ? 'border-sky-500 bg-sky-500/15 text-sky-300' : 'border-slate-700 bg-slate-900 text-slate-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400" htmlFor="esporte">
            Esporte praticado (opcional)
          </label>
          <input
            id="esporte"
            value={esporte}
            onChange={(e) => setEsporte(e.target.value)}
            placeholder="ex: Jiu-Jitsu"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </Card>

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
