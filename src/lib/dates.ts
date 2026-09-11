import type { DaySchedule } from './schedule'
import type { Day } from './types'
import { todaySlot } from './schedule'

export function todayISO(): string {
  const d = new Date()
  const tz = d.getTimezoneOffset()
  const local = new Date(d.getTime() - tz * 60000)
  return local.toISOString().slice(0, 10)
}

export function formatDateBR(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function diffDays(fromISO: string, toISO: string): number {
  const a = new Date(fromISO + 'T00:00:00')
  const b = new Date(toISO + 'T00:00:00')
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function todayWeekdayDay(schedule: DaySchedule): Day {
  const weekday = new Date().getDay() // 0=domingo ... 6=sábado
  return todaySlot(schedule, weekday)
}

export function weekdayOfISO(iso: string): number {
  return new Date(iso + 'T00:00:00').getDay()
}

export interface CicloOndulatorio {
  semana: 1 | 2 | 3 | 4
  rpeAlvo: string
  descricao: string
  isDeload: boolean
}

const SEMANAS_CICLO: Omit<CicloOndulatorio, 'semana'>[] = [
  { rpeAlvo: 'RPE 7', descricao: 'Semana 1 · acumulação leve', isDeload: false },
  { rpeAlvo: 'RPE 7,5–8', descricao: 'Semana 2 · acumulação moderada', isDeload: false },
  { rpeAlvo: 'RPE 8–8,5', descricao: 'Semana 3 · intensificação', isDeload: false },
  { rpeAlvo: 'Deload', descricao: 'Semana 4 · deload, reduzir volume', isDeload: true },
]

export function getCicloOndulatorio(cicloStartISO: string | null, referenceISO: string): CicloOndulatorio {
  if (!cicloStartISO) {
    return { semana: 1, ...SEMANAS_CICLO[0] }
  }
  const dias = Math.max(0, diffDays(cicloStartISO, referenceISO))
  const semanaIndex = Math.floor(dias / 7) % 4
  return { semana: (semanaIndex + 1) as 1 | 2 | 3 | 4, ...SEMANAS_CICLO[semanaIndex] }
}

export interface Mesociclo {
  index: number
  nome: string
  descricao: string
}

const MESOCICLOS: Omit<Mesociclo, 'index'>[] = [
  { nome: 'Base Aeróbia', descricao: 'Construção de capacidade aeróbia e volume de rola' },
  { nome: 'Acidose / Lactato', descricao: 'Trabalho de alta intensidade e tolerância ao lactato' },
  { nome: 'Especificidade / Competição', descricao: 'Foco em cenários específicos e prontidão competitiva' },
]

const SEMANAS_POR_MESOCICLO = 8 // ~2 meses cada, 3 mesociclos = 6 meses

export function getMesociclo(macrocicloStartISO: string | null, referenceISO: string): Mesociclo {
  if (!macrocicloStartISO) {
    return { index: 0, ...MESOCICLOS[0] }
  }
  const dias = Math.max(0, diffDays(macrocicloStartISO, referenceISO))
  const semanas = Math.floor(dias / 7)
  const totalSemanas = SEMANAS_POR_MESOCICLO * 3
  const semanasNoCiclo = semanas % totalSemanas
  const mesocicloIndex = Math.floor(semanasNoCiclo / SEMANAS_POR_MESOCICLO)
  return { index: mesocicloIndex, ...MESOCICLOS[mesocicloIndex] }
}

export function startOfISOWeek(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().slice(0, 10)
}
