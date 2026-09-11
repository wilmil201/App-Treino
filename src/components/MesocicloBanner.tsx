import type { Mesociclo } from '../lib/dates'

const COLORS = ['from-sky-600 to-sky-500', 'from-orange-600 to-orange-500', 'from-rose-600 to-rose-500']

export function MesocicloBanner({ mesociclo }: { mesociclo: Mesociclo }) {
  return (
    <div className={`mb-4 rounded-2xl bg-gradient-to-r p-4 text-white shadow ${COLORS[mesociclo.index]}`}>
      <p className="text-xs uppercase tracking-wide text-white/80">
        Macrociclo · Mesociclo {mesociclo.index + 1}/3
      </p>
      <p className="text-lg font-bold">{mesociclo.nome}</p>
      <p className="mt-1 text-sm text-white/90">{mesociclo.descricao}</p>
    </div>
  )
}
