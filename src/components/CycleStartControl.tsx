import { useState } from 'react'
import { formatDateBR, todayISO } from '../lib/dates'

/**
 * Controle de início de ciclo (macrociclo de jiu-jitsu ou ciclo ondulatório de
 * força): por padrão é calculado automaticamente a partir do primeiro registro,
 * mas pode ser definido/corrigido manualmente — necessário quando o cálculo
 * automático fica errado (ex.: sessão antiga registrada fora de ordem, ou o
 * atleta quer reiniciar a contagem de uma data específica).
 */
export function CycleStartControl({
  value,
  autoValue,
  onChange,
  tone = 'light',
}: {
  value: string | null
  autoValue: string | null
  onChange: (iso: string | null) => void
  /** 'light' pra usar em cima de banner colorido, 'dark' pra usar em cima de Card escuro. */
  tone?: 'light' | 'dark'
}) {
  const [editing, setEditing] = useState(false)
  const effective = value ?? autoValue
  const textClass = tone === 'light' ? 'text-white/80' : 'text-slate-400'
  const inputClass =
    tone === 'light'
      ? 'border-white/30 bg-black/20 text-white focus:border-white'
      : 'border-slate-700 bg-slate-800 text-slate-100 focus:border-emerald-500'

  if (!editing) {
    return (
      <div className={`flex items-center justify-between gap-2 text-xs ${textClass}`}>
        <span>
          Início do ciclo: {effective ? formatDateBR(effective) : 'ainda sem registros'}
          {value ? ' (definido manualmente)' : effective ? ' (automático)' : ''}
        </span>
        <button type="button" onClick={() => setEditing(true)} className="shrink-0 underline decoration-dotted">
          editar
        </button>
      </div>
    )
  }

  return (
    <div className={`space-y-2 text-xs ${textClass}`}>
      <div className="flex items-center gap-2">
        <input
          type="date"
          defaultValue={effective ?? todayISO()}
          onChange={(e) => onChange(e.target.value || null)}
          aria-label="Data de início do ciclo"
          className={`rounded-lg border px-2 py-1.5 focus:outline-none ${inputClass}`}
        />
        <button type="button" onClick={() => setEditing(false)} className="underline decoration-dotted">
          pronto
        </button>
      </div>
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange(null)
            setEditing(false)
          }}
          className="underline decoration-dotted"
        >
          voltar a calcular automaticamente
        </button>
      )}
    </div>
  )
}
