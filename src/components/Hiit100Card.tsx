import { useState } from 'react'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import { todayISO, formatDateBR } from '../lib/dates'
import { buildHiit100Program, getHiit100Week, HIIT100_TOTAL_WEEKS, type Hiit100Cargas10RM } from '../lib/hiit100'
import { Card, PrimaryButton, SecondaryButton } from './ui'

const FIELDS: { key: keyof Hiit100Cargas10RM; label: string }[] = [
  { key: 'supino', label: 'Supino — 10RM (kg)' },
  { key: 'agachamento', label: 'Agachamento — 10RM (kg)' },
  { key: 'terra', label: 'Levantamento-terra — 10RM (kg)' },
  { key: 'meioDesenvolvimento', label: 'Meio desenvolvimento (militar) — 10RM (kg)' },
]

function draftFrom(cargas?: Hiit100Cargas10RM): Record<string, string> {
  return {
    supino: cargas?.supino ? String(cargas.supino) : '',
    agachamento: cargas?.agachamento ? String(cargas.agachamento) : '',
    terra: cargas?.terra ? String(cargas.terra) : '',
    meioDesenvolvimento: cargas?.meioDesenvolvimento ? String(cargas.meioDesenvolvimento) : '',
  }
}

/** Programa fechado de 6 semanas (10x10 a 50% do 10RM, intervalo encolhendo semana a
 * semana) que o atleta trouxe pronto — diferente do gerador genérico por objetivo,
 * aqui a estrutura/exercícios/divisão de dias são fixos (ver lib/hiit100.ts). */
export function Hiit100Card() {
  const { hiit100Config, saveHiit100Config, saveProgram } = useData()
  const { showToast } = useToast()
  const [editing, setEditing] = useState(!hiit100Config)
  const [draft, setDraft] = useState<Record<string, string>>(() => draftFrom(hiit100Config?.cargas10RM))
  const [confirmRestart, setConfirmRestart] = useState(false)

  function handleApply() {
    const cargas: Hiit100Cargas10RM = {
      supino: Number(draft.supino) || 0,
      agachamento: Number(draft.agachamento) || 0,
      terra: Number(draft.terra) || 0,
      meioDesenvolvimento: Number(draft.meioDesenvolvimento) || 0,
    }
    if (!cargas.supino || !cargas.agachamento || !cargas.meioDesenvolvimento) {
      showToast('Preencha ao menos supino, agachamento e meio desenvolvimento', 'info')
      return
    }
    saveProgram(buildHiit100Program(cargas))
    saveHiit100Config({ startDate: todayISO(), cargas10RM: cargas })
    setEditing(false)
    showToast('HIIT de 100 aplicado — substituiu o programa atual')
  }

  if (!editing && hiit100Config) {
    const week = getHiit100Week(hiit100Config.startDate, todayISO())
    return (
      <Card className="mb-6 border-red-700/60 bg-red-500/5">
        <p className="mb-1 font-semibold text-red-300">🔥 HIIT de 100 (Stoppani)</p>
        <p className="text-xs text-slate-400">
          Ativo desde {formatDateBR(hiit100Config.startDate)} — 10 séries x 10 reps por levantamento principal, 3x/semana.
        </p>
        {week.concluido ? (
          <p className="mt-2 text-sm font-semibold text-emerald-300">Protocolo de 6 semanas concluído.</p>
        ) : (
          <div className="mt-2 rounded-lg border border-red-700/50 bg-red-500/10 p-2.5">
            <p className="text-sm font-semibold text-red-200">
              Semana {week.semana}/{HIIT100_TOTAL_WEEKS} — intervalo entre séries: {week.intervaloLabel}
            </p>
            <p className="mt-1 text-xs text-red-200/80">{week.focoLabel}</p>
          </div>
        )}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <SecondaryButton onClick={() => setEditing(true)}>Reconfigurar 10RM</SecondaryButton>
          {!confirmRestart ? (
            <SecondaryButton onClick={() => setConfirmRestart(true)} className="border-red-800 text-red-300">
              Reiniciar semana 1
            </SecondaryButton>
          ) : (
            <PrimaryButton
              onClick={() => {
                saveHiit100Config({ ...hiit100Config, startDate: todayISO() })
                setConfirmRestart(false)
                showToast('Semana reiniciada')
              }}
              className="bg-red-500 text-white"
            >
              Confirmar reinício
            </PrimaryButton>
          )}
        </div>
      </Card>
    )
  }

  return (
    <Card className="mb-6 space-y-3 border-red-700/60 bg-red-500/5">
      <p className="font-semibold text-red-300">🔥 HIIT de 100 (Stoppani)</p>
      <p className="text-xs text-slate-400">
        Programa fechado de 6 semanas: 10 séries x 10 reps a 50% do seu 10RM nos levantamentos principais, com o
        intervalo entre séries encolhendo a cada semana (60s → 10-20s), 3x/semana (peito+costas+abdômen,
        perna+tríceps+panturrilha, ombro+trapézio+bíceps). Foco em recomposição corporal. Informe seu 10RM (carga que
        você faz por 10 repetições) em cada levantamento — os demais exercícios usam a estimativa do próprio protocolo.
      </p>
      {FIELDS.map((f) => (
        <div key={f.key}>
          <label className="mb-1 block text-xs text-slate-400" htmlFor={`hiit100-${f.key}`}>
            {f.label}
          </label>
          <input
            id={`hiit100-${f.key}`}
            type="number"
            inputMode="decimal"
            value={draft[f.key]}
            onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-red-500 focus:outline-none"
          />
        </div>
      ))}
      <p className="text-xs text-amber-300/90">Aplicar substitui todo o programa atual pelos 3 treinos do HIIT de 100.</p>
      <PrimaryButton onClick={handleApply} className="bg-red-500 text-white">
        Aplicar HIIT de 100
      </PrimaryButton>
      {hiit100Config && <SecondaryButton onClick={() => setEditing(false)}>Cancelar</SecondaryButton>}
    </Card>
  )
}
