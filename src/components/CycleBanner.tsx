import type { CicloOndulatorio } from '../lib/dates'

const SEMANA_STYLES: Record<number, string> = {
  1: 'from-sky-600 to-sky-500',
  2: 'from-emerald-600 to-emerald-500',
  3: 'from-amber-600 to-amber-500',
  4: 'from-purple-600 to-purple-500',
}

export function CycleBanner({ ciclo }: { ciclo: CicloOndulatorio }) {
  return (
    <div className={`mb-4 rounded-2xl bg-gradient-to-r p-4 text-white shadow ${SEMANA_STYLES[ciclo.semana]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-white/80">Ciclo ondulatório · Semana {ciclo.semana}/4</p>
          <p className="text-lg font-bold">{ciclo.rpeAlvo}</p>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((n) => (
            <span
              key={n}
              className={`h-2 w-6 rounded-full ${n === ciclo.semana ? 'bg-white' : 'bg-white/30'}`}
            />
          ))}
        </div>
      </div>
      <p className="mt-1 text-sm text-white/90">{ciclo.descricao}</p>
    </div>
  )
}
