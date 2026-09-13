import type { JJSession, Workout } from './types'
import { addDays, formatDateBR, startOfISOWeek, todayISO } from './dates'

export interface TrendPoint {
  label: string
  value: number
}

/**
 * Tendência de condicionamento (autoavaliação de "gás", 1-10) por sessão de jiu-jitsu
 * real (sessão 1/2 — não conta drill de velocidade, que é outro tipo de estímulo).
 * É uma medida de percepção de esforço, não um teste de campo objetivo — serve para
 * ver a TENDÊNCIA ao longo do tempo, não para comparar com padrões externos.
 */
export function gasTrend(jjSessions: JJSession[]): TrendPoint[] {
  return [...jjSessions]
    .filter((s) => (s.type === 'sessao1' || s.type === 'sessao2') && s.gas !== undefined)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((s) => ({ label: formatDateBR(s.date).slice(0, 5), value: s.gas as number }))
}

/** Tendência de peso corporal, a partir do que foi registrado nos treinos de musculação. */
export function bodyWeightTrend(workouts: Workout[]): TrendPoint[] {
  return [...workouts]
    .filter((w) => w.finished && w.bodyWeight !== undefined)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((w) => ({ label: formatDateBR(w.date).slice(0, 5), value: w.bodyWeight as number }))
}

export interface WeeklyConsistency {
  weekStart: string
  musculacao: number
  jiuJitsu: number
}

/** Sessões de musculação e de jiu-jitsu (sessão 1/2, sem drill) por semana, nas últimas `weeksBack` semanas. */
export function weeklyConsistency(workouts: Workout[], jjSessions: JJSession[], weeksBack = 8): WeeklyConsistency[] {
  const currentWeekStart = startOfISOWeek(todayISO())
  const weeks: WeeklyConsistency[] = []
  for (let i = weeksBack - 1; i >= 0; i--) {
    const weekStart = addDays(currentWeekStart, -7 * i)
    const weekEnd = addDays(weekStart, 6)
    const musculacao = workouts.filter((w) => w.finished && w.date >= weekStart && w.date <= weekEnd).length
    const jiuJitsu = jjSessions.filter(
      (s) => (s.type === 'sessao1' || s.type === 'sessao2') && s.date >= weekStart && s.date <= weekEnd,
    ).length
    weeks.push({ weekStart, musculacao, jiuJitsu })
  }
  return weeks
}
