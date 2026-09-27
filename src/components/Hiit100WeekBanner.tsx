import { useData } from '../context/DataContext'
import { todayISO } from '../lib/dates'
import { getHiit100Week, HIIT100_TOTAL_WEEKS } from '../lib/hiit100'

/** Mostra a semana/intervalo atual do HIIT de 100 na tela de Registrar — calculado
 * sempre a partir da data de início (nunca fica congelado), igual ao CycleBanner. */
export function Hiit100WeekBanner() {
  const { hiit100Config } = useData()
  if (!hiit100Config) return null

  const week = getHiit100Week(hiit100Config.startDate, todayISO())
  if (week.concluido) return null

  return (
    <div className="mb-4 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 p-4 text-white shadow">
      <p className="text-xs uppercase tracking-wide text-white/80">
        HIIT de 100 · Semana {week.semana}/{HIIT100_TOTAL_WEEKS}
      </p>
      <p className="text-lg font-bold">Intervalo entre séries: {week.intervaloLabel}</p>
      <p className="mt-1 text-sm text-white/90">{week.focoLabel}</p>
    </div>
  )
}
