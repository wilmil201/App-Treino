import type { Day } from './types'

export const DAY_SLOTS: Day[] = ['dia1', 'dia2', 'dia3']

export const WEEKDAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export function weekdayLabel(weekday: number): string {
  return WEEKDAY_NAMES[((weekday % 7) + 7) % 7]
}

export type DaySchedule = Record<Day, number>

/** Padrão de fábrica: Segunda/Quarta/Sexta, igual ao comportamento original do app. */
export const DEFAULT_SCHEDULE: DaySchedule = { dia1: 1, dia2: 3, dia3: 5 }

/** Rótulo do treino (ex: "Segunda") a partir da agenda configurada pelo atleta. */
export function slotLabel(schedule: DaySchedule, day: Day): string {
  return weekdayLabel(schedule[day])
}

/** Qual dos 3 treinos corresponde ao dia real de hoje, segundo a agenda do atleta. */
export function todaySlot(schedule: DaySchedule, referenceWeekday: number): Day {
  const match = DAY_SLOTS.find((d) => schedule[d] === referenceWeekday)
  return match ?? 'dia1'
}
