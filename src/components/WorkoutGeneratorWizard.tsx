import { useState } from 'react'
import type { Program } from '../lib/types'
import { DAY_SLOTS, slotLabel, type DaySchedule } from '../lib/schedule'
import {
  generateProgram,
  SPLIT_LABEL,
  type Nivel,
  type Objetivo,
  type Questionnaire,
  type SplitKey,
} from '../lib/workoutGenerator'
import type { Equipment, JointTag } from '../lib/exerciseLibrary'
import { Card, PrimaryButton } from './ui'

const OBJETIVOS: { key: Objetivo; label: string; desc: string }[] = [
  { key: 'hipertrofia', label: 'Hipertrofia', desc: 'Ganho de massa muscular — séries de 8 a 12 repetições' },
  { key: 'forca', label: 'Força', desc: 'Ganho de força máxima — séries mais pesadas, 5 a 8 repetições' },
  { key: 'condicionamento', label: 'Condicionamento geral', desc: 'Resistência e saúde geral — séries mais longas, 15+ repetições' },
]

const NIVEIS: { key: Nivel; label: string }[] = [
  { key: 'iniciante', label: 'Iniciante' },
  { key: 'intermediario', label: 'Intermediário' },
  { key: 'avancado', label: 'Avançado' },
]

const EQUIPAMENTOS: { key: Equipment; label: string; desc: string }[] = [
  { key: 'academia', label: 'Academia completa', desc: 'Barras, máquinas, cabos, halteres' },
  { key: 'casa', label: 'Casa com halteres', desc: 'Halteres, elásticos, banco — sem máquinas' },
  { key: 'peso_corporal', label: 'Apenas peso corporal', desc: 'Sem equipamento nenhum' },
]

const LIMITACOES: { key: JointTag; label: string }[] = [
  { key: 'joelho', label: 'Joelho' },
  { key: 'ombro', label: 'Ombro' },
  { key: 'lombar', label: 'Lombar / coluna' },
  { key: 'punho', label: 'Punho' },
]

const DIVISOES: SplitKey[] = ['perna_peito_costas', 'push_pull_legs', 'upper_lower']

const STEPS = ['objetivo', 'nivel', 'equipamento', 'limitacoes', 'divisao', 'preview'] as const
type Step = (typeof STEPS)[number]

export function WorkoutGeneratorWizard({
  schedule,
  onApply,
  onClose,
}: {
  schedule: DaySchedule
  onApply: (program: Program) => void
  onClose: () => void
}) {
  const [stepIdx, setStepIdx] = useState(0)
  const [objetivo, setObjetivo] = useState<Objetivo>('hipertrofia')
  const [nivel, setNivel] = useState<Nivel>('intermediario')
  const [equipamento, setEquipamento] = useState<Equipment>('academia')
  const [limitacoes, setLimitacoes] = useState<JointTag[]>([])
  const [divisao, setDivisao] = useState<SplitKey>('perna_peito_costas')

  const step: Step = STEPS[stepIdx]

  function next() {
    setStepIdx((i) => Math.min(i + 1, STEPS.length - 1))
  }
  function back() {
    if (stepIdx === 0) onClose()
    else setStepIdx((i) => i - 1)
  }
  function toggleLimitacao(key: JointTag) {
    setLimitacoes((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }

  const questionnaire: Questionnaire = { objetivo, nivel, equipamento, limitacoes, divisao }
  const preview = step === 'preview' ? generateProgram(questionnaire) : null

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-slate-950 px-5 pb-8 pt-[calc(env(safe-area-inset-top)+1.5rem)] safe-bottom">
      <div className="mx-auto w-full max-w-md flex-1">
        <div className="mb-4 flex items-center justify-between">
          <button type="button" onClick={back} className="text-sm text-slate-400">
            ← {stepIdx === 0 ? 'Cancelar' : 'Voltar'}
          </button>
          <div className="flex gap-1">
            {STEPS.map((s, i) => (
              <span key={s} className={`h-1.5 w-6 rounded-full ${i <= stepIdx ? 'bg-emerald-500' : 'bg-slate-700'}`} />
            ))}
          </div>
        </div>

        <h1 className="mb-4 text-xl font-bold">Gerar treino automaticamente</h1>

        {step === 'objetivo' && (
          <div className="space-y-3">
            <p className="text-sm text-slate-400">Qual é o seu objetivo principal?</p>
            {OBJETIVOS.map((o) => (
              <button
                key={o.key}
                type="button"
                onClick={() => setObjetivo(o.key)}
                aria-pressed={objetivo === o.key}
                className={`w-full rounded-xl border p-3 text-left ${
                  objetivo === o.key ? 'border-emerald-500 bg-emerald-500/15' : 'border-slate-700 bg-slate-900'
                }`}
              >
                <p className="font-semibold text-slate-100">{o.label}</p>
                <p className="text-xs text-slate-400">{o.desc}</p>
              </button>
            ))}
          </div>
        )}

        {step === 'nivel' && (
          <div className="space-y-3">
            <p className="text-sm text-slate-400">Qual seu nível de experiência com treino?</p>
            <div className="grid grid-cols-3 gap-2">
              {NIVEIS.map((n) => (
                <button
                  key={n.key}
                  type="button"
                  onClick={() => setNivel(n.key)}
                  aria-pressed={nivel === n.key}
                  className={`rounded-xl border px-2 py-3 text-sm font-semibold ${
                    nivel === n.key ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300' : 'border-slate-700 bg-slate-900 text-slate-300'
                  }`}
                >
                  {n.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'equipamento' && (
          <div className="space-y-3">
            <p className="text-sm text-slate-400">Onde você vai treinar / o que tem disponível?</p>
            {EQUIPAMENTOS.map((e) => (
              <button
                key={e.key}
                type="button"
                onClick={() => setEquipamento(e.key)}
                aria-pressed={equipamento === e.key}
                className={`w-full rounded-xl border p-3 text-left ${
                  equipamento === e.key ? 'border-emerald-500 bg-emerald-500/15' : 'border-slate-700 bg-slate-900'
                }`}
              >
                <p className="font-semibold text-slate-100">{e.label}</p>
                <p className="text-xs text-slate-400">{e.desc}</p>
              </button>
            ))}
          </div>
        )}

        {step === 'limitacoes' && (
          <div className="space-y-3">
            <p className="text-sm text-slate-400">Alguma lesão ou limitação a evitar? (pode marcar mais de uma, ou nenhuma)</p>
            <div className="grid grid-cols-2 gap-2">
              {LIMITACOES.map((l) => (
                <button
                  key={l.key}
                  type="button"
                  onClick={() => toggleLimitacao(l.key)}
                  aria-pressed={limitacoes.includes(l.key)}
                  className={`rounded-xl border px-2 py-3 text-sm font-semibold ${
                    limitacoes.includes(l.key)
                      ? 'border-amber-500 bg-amber-500/15 text-amber-300'
                      : 'border-slate-700 bg-slate-900 text-slate-300'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'divisao' && (
          <div className="space-y-3">
            <p className="text-sm text-slate-400">Como prefere dividir os 3 treinos da semana?</p>
            {DIVISOES.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDivisao(d)}
                aria-pressed={divisao === d}
                className={`w-full rounded-xl border p-3 text-left ${
                  divisao === d ? 'border-emerald-500 bg-emerald-500/15' : 'border-slate-700 bg-slate-900'
                }`}
              >
                <p className="font-semibold text-slate-100">{SPLIT_LABEL[d]}</p>
              </button>
            ))}
          </div>
        )}

        {step === 'preview' && preview && (
          <div className="space-y-3">
            <p className="text-sm text-slate-400">Treino gerado — confira antes de aplicar:</p>
            {DAY_SLOTS.map((day) => (
              <Card key={day}>
                <p className="mb-2 font-semibold text-emerald-400">{slotLabel(schedule, day)}</p>
                <ul className="space-y-1">
                  {preview[day].map((ex) => (
                    <li key={ex.id} className="text-sm text-slate-300">
                      {ex.isMain ? '⭐ ' : '· '}
                      {ex.name} <span className="text-slate-500">— {ex.detail}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
            <p className="text-xs text-amber-300/90">
              Aplicar substitui todo o programa atual pelo gerado acima. Seus treinos já registrados não são afetados.
            </p>
          </div>
        )}
      </div>

      <div className="mx-auto mt-6 w-full max-w-md">
        {step === 'preview' ? (
          <PrimaryButton onClick={() => preview && onApply(preview)}>Aplicar este treino</PrimaryButton>
        ) : (
          <PrimaryButton onClick={next}>Próximo</PrimaryButton>
        )}
      </div>
    </div>
  )
}
