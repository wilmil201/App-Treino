import type { JJSession, Workout } from './types'
import { addDays, startOfISOWeek, todayISO } from './dates'

export interface WeekProgress {
  weekStart: string
  musculacao: number
  jiuJitsu: number
  qualifica: boolean
}

/**
 * Verifica se o usuário cumpriu 3 sessões de musculação + 2 sessões de jiu-jitsu
 * (técnica/rola, sem contar drills) por 3 semanas seguidas.
 */
export function checkProgressionReadiness(
  workouts: Workout[],
  jjSessions: JJSession[],
  referenceISO: string = todayISO(),
): { ready: boolean; weeks: WeekProgress[] } {
  const currentWeekStart = startOfISOWeek(referenceISO)
  const weekStarts: string[] = []
  for (let i = 2; i >= 0; i--) {
    weekStarts.push(addDays(currentWeekStart, -7 * i))
  }

  const weeks: WeekProgress[] = weekStarts.map((weekStart) => {
    const weekEnd = addDays(weekStart, 6)
    const musculacao = workouts.filter((w) => w.finished && w.date >= weekStart && w.date <= weekEnd).length
    const jiuJitsu = jjSessions.filter(
      (s) => (s.type === 'sessao1' || s.type === 'sessao2') && s.date >= weekStart && s.date <= weekEnd,
    ).length
    return { weekStart, musculacao, jiuJitsu, qualifica: musculacao >= 3 && jiuJitsu >= 2 }
  })

  const ready = weeks.length === 3 && weeks.every((w) => w.qualifica)
  return { ready, weeks }
}
