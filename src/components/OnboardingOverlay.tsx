import { useState } from 'react'
import { useData } from '../context/DataContext'
import { AnamneseForm } from './AnamneseForm'
import { PrimaryButton } from './ui'

const STEPS = [
  {
    icon: '📝',
    title: 'Registrar',
    text: 'Escolha o treino do dia (você define os dias na aba Programa), logue cada série de cada exercício e finalize o treino no final. Tudo fica salvo automaticamente, sem precisar de internet.',
  },
  {
    icon: '📊',
    title: 'Painel',
    text: 'Alertas de autorregulação, sugestão de carga para a próxima sessão, carga aguda x crônica, recordes pessoais, gráficos de evolução e o histórico completo de tudo que você já registrou.',
  },
  {
    icon: '🥋',
    title: 'Jiu-Jitsu',
    text: 'Acompanhe o macrociclo de 6 meses, registre sessões técnicas, rola de referência e drills de velocidade, e siga o checklist de aquecimento antes de treinar.',
  },
  {
    icon: '⚙️',
    title: 'Programa',
    text: 'Edite os exercícios de cada dia, defina quais dias da semana treina, marque os levantamentos principais e gerencie backup/exportação dos seus dados.',
  },
]

export function OnboardingOverlay({ onDismiss }: { onDismiss: () => void }) {
  const { program, schedule, anamnese, saveAnamnese } = useData()
  const [phase, setPhase] = useState<'intro' | 'anamnese'>('intro')

  if (phase === 'anamnese') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-slate-950 px-5 pb-8 pt-[calc(env(safe-area-inset-top)+2rem)] safe-bottom">
        <div className="mx-auto w-full max-w-md flex-1">
          <p className="mb-1 text-center text-sm font-semibold uppercase tracking-wide text-emerald-400">Última etapa</p>
          <h1 className="mb-6 text-center text-2xl font-bold text-slate-100">Ficha de anamnese</h1>
          <AnamneseForm
            program={program}
            schedule={schedule}
            anamnese={anamnese}
            onSave={(a) => {
              saveAnamnese(a)
              onDismiss()
            }}
            onSkip={onDismiss}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-slate-950 px-5 pb-8 pt-[calc(env(safe-area-inset-top)+2rem)] safe-bottom">
      <div className="mx-auto w-full max-w-md flex-1">
        <p className="mb-1 text-center text-sm font-semibold uppercase tracking-wide text-emerald-400">Bem-vindo</p>
        <h1 className="mb-6 text-center text-2xl font-bold text-slate-100">Seu diário de força e jiu-jitsu</h1>

        <div className="space-y-4">
          {STEPS.map((step) => (
            <div key={step.title} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl" aria-hidden="true">
                  {step.icon}
                </span>
                <h2 className="text-lg font-bold text-slate-100">{step.title}</h2>
              </div>
              <p className="mt-2 text-sm text-slate-400">{step.text}</p>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Seus dados ficam só neste aparelho — sem login, sem backend. Exporte um backup de vez em quando na aba Programa.
        </p>
      </div>

      <div className="mx-auto mt-6 w-full max-w-md">
        <PrimaryButton onClick={() => setPhase('anamnese')}>Continuar</PrimaryButton>
      </div>
    </div>
  )
}
