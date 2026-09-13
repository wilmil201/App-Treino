import type { Mesociclo } from '../lib/dates'
import { CycleStartControl } from './CycleStartControl'

const COLORS = ['from-sky-600 to-sky-500', 'from-orange-600 to-orange-500', 'from-rose-600 to-rose-500']

export function MesocicloBanner({
  mesociclo,
  cycleStart,
  autoCycleStart,
  onChangeCycleStart,
}: {
  mesociclo: Mesociclo
  cycleStart: string | null
  autoCycleStart: string | null
  onChangeCycleStart: (iso: string | null) => void
}) {
  return (
    <div className={`mb-4 space-y-2 rounded-2xl bg-gradient-to-r p-4 text-white shadow ${COLORS[mesociclo.index]}`}>
      <p className="text-xs uppercase tracking-wide text-white/80">
        Macrociclo · Mesociclo {mesociclo.index + 1}/3
      </p>
      <p className="text-lg font-bold">{mesociclo.nome}</p>
      <p className="text-sm text-white/90">{mesociclo.descricao}</p>
      <div className="border-t border-white/20 pt-2">
        <CycleStartControl value={cycleStart} autoValue={autoCycleStart} onChange={onChangeCycleStart} tone="light" />
      </div>
    </div>
  )
}
