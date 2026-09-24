import { useState } from 'react'
import type { Anamnese, NivelExperiencia, ObjetivoTreino, Program } from '../lib/types'
import { DAY_SLOTS, slotLabel, type DaySchedule } from '../lib/schedule'
import { generateProgram, SPLIT_LABEL, type Questionnaire, type SplitKey } from '../lib/workoutGenerator'
import { GUIDANCE_BY_OBJETIVO, OBJETIVO_LABEL } from '../lib/objetivoGuidance'
import type { Equipment, JointTag } from '../lib/exerciseLibrary'
import { Card, PrimaryButton } from './ui'

const OBJETIVOS: { key: ObjetivoTreino; label: string; desc: string }[] = (
  Object.keys(OBJETIVO_LABEL) as ObjetivoTreino[]
).map((key) => {
  const g = GUIDANCE_BY_OBJETIVO[key]
  return { key, label: OBJETIVO_LABEL[key][0].toUpperCase() + OBJETIVO_LABEL[key].slice(1), desc: `${g.repRange} reps, RPE ${g.rpeRange}, descanso ${g.descanso}` }
})

const NIVEIS: { key: NivelExperiencia; label: string }[] = [
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

const STEPS = ['objetivo', 'nivel', 'equipamento', 'limitacoes', 'divisao', 'condicionamento', 'preview'] as const
type Step = (typeof STEPS)[number]

export function WorkoutGeneratorWizard({
  schedule,
  anamnese,
  onApply,
  onClose,
}: {
  schedule: DaySchedule
  anamnese?: Anamnese
  onApply: (program: Program) => void
  onClose: () => void
}) {
  const [stepIdx, setStepIdx] = useState(0)
  const [objetivo, setObjetivo] = useState<ObjetivoTreino>(anamnese?.profile?.objetivo ?? 'hipertrofia')
  const [nivel, setNivel] = useState<NivelExperiencia>(anamnese?.profile?.nivel ?? 'intermediario')
  const [equipamento, setEquipamento] = useState<Equipment>('academia')
  const [limitacoes, setLimitacoes] = useState<JointTag[]>([])
  const [divisao, setDivisao] = useState<SplitKey>('perna_peito_costas')
  const [condicionamentoExtra, setCondicionamentoExtra] = useState(false)

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

  const questionnaire: Questionnaire = { objetivo, nivel, equipamento, limitacoes, divisao, condicionamentoExtra }
  const preview = step === 'preview' ? generateProgram(questionnaire, anamnese) : null

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
            {anamnese?.profile && (
              <p className="text-xs text-sky-300">Pré-selecionado da sua ficha de anamnese — pode trocar se quiser.</p>
            )}
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

        {step === 'condicionamento' && (
          <div className="space-y-3">
            <p className="text-sm text-slate-400">
              Além do objetivo principal, quer incluir um bloco de condicionamento metabólico ao final de cada treino?
              Útil pra quem quer força/hipertrofia <em>e</em> condicionamento geral juntos, não só um dos dois.
            </p>
            <button
              type="button"
              onClick={() => setCondicionamentoExtra(true)}
              aria-pressed={condicionamentoExtra}
              className={`w-full rounded-xl border p-3 text-left ${
                condicionamentoExtra ? 'border-emerald-500 bg-emerald-500/15' : 'border-slate-700 bg-slate-900'
              }`}
            >
              <p className="font-semibold text-slate-100">Sim, incluir finisher de condicionamento</p>
              <p className="text-xs text-slate-400">Circuito ou intervalado de 8-10min ao final de cada um dos 3 treinos.</p>
            </button>
            <button
              type="button"
              onClick={() => setCondicionamentoExtra(false)}
              aria-pressed={!condicionamentoExtra}
              className={`w-full rounded-xl border p-3 text-left ${
                !condicionamentoExtra ? 'border-emerald-500 bg-emerald-500/15' : 'border-slate-700 bg-slate-900'
              }`}
            >
              <p className="font-semibold text-slate-100">Não, só o treino de força/hipertrofia</p>
            </button>
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
                      {ex.isMain ? '⭐ ' : ex.kind === 'aerobico' ? '🔥 ' : '· '}
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
