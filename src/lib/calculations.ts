import type { ExerciseFeedback, LiftCategory, SetLog, Workout } from './types'
import { diffDays, startOfISOWeek, todayISO } from './dates'

export function epley1RM(load: number, reps: number): number {
  if (reps <= 0 || load <= 0) return 0
  if (reps === 1) return load
  return load * (1 + reps / 30)
}

export function exerciseVolume(sets: SetLog[]): number {
  return sets.reduce((sum, s) => sum + s.load * s.reps, 0)
}

export function workoutVolume(workout: Workout): number {
  return workout.exercises.reduce((sum, ex) => sum + exerciseVolume(ex.sets), 0)
}

export function topSet(sets: SetLog[]): SetLog | null {
  if (sets.length === 0) return null
  return [...sets].sort((a, b) => b.load - a.load || b.rpe - a.rpe)[0]
}

/** Maior e1RM (Epley) já registrado para um levantamento, considerando TODAS as séries de todas as sessões finalizadas (não só o top set por carga). */
export function getMaxE1RM(workouts: Workout[], category: LiftCategory): number {
  return getBestRecord(workouts, category)?.e1rm ?? 0
}

export interface PersonalRecord {
  e1rm: number
  date: string
  load: number
  reps: number
}

/** Recorde pessoal (maior e1RM) de um levantamento, com a data em que foi alcançado. */
export function getBestRecord(workouts: Workout[], category: LiftCategory): PersonalRecord | null {
  let best: PersonalRecord | null = null
  for (const w of workouts) {
    if (!w.finished) continue
    const ex = w.exercises.find((e) => e.liftCategory === category)
    if (!ex) continue
    for (const s of ex.sets) {
      const e1rm = epley1RM(s.load, s.reps)
      if (!best || e1rm > best.e1rm) best = { e1rm, date: w.date, load: s.load, reps: s.reps }
    }
  }
  return best
}

export interface LiftSessionPoint {
  date: string
  topSet: SetLog
  e1rm: number
}

/** Sessões (em ordem cronológica) em que o levantamento indicado apareceu, com o top set daquela sessão. */
export function getLiftSessions(workouts: Workout[], category: LiftCategory): LiftSessionPoint[] {
  const finished = workouts.filter((w) => w.finished)
  const points: LiftSessionPoint[] = []
  for (const w of [...finished].sort((a, b) => a.date.localeCompare(b.date))) {
    const ex = w.exercises.find((e) => e.liftCategory === category)
    if (!ex || ex.sets.length === 0) continue
    const top = topSet(ex.sets)
    if (!top) continue
    points.push({ date: w.date, topSet: top, e1rm: epley1RM(top.load, top.reps) })
  }
  return points
}

/** Feedback mais recente (completou/motivo) registrado para um levantamento principal,
 * independente de ter séries registradas (pode ter sido pulado por completo). */
export function getLastFeedbackForCategory(workouts: Workout[], category: LiftCategory): { date: string; feedback: ExerciseFeedback } | null {
  const finished = [...workouts].filter((w) => w.finished).sort((a, b) => b.date.localeCompare(a.date))
  for (const w of finished) {
    const ex = w.exercises.find((e) => e.liftCategory === category)
    if (ex?.feedback) return { date: w.date, feedback: ex.feedback }
  }
  return null
}

export type AlertLevel = 'risco' | 'reduzir' | 'subir' | 'deload' | 'info' | 'dor'

export interface Alert {
  id: string
  level: AlertLevel
  title: string
  message: string
}

const LIFT_LABEL: Record<LiftCategory, string> = {
  agachamento: 'Agachamento',
  supino: 'Supino',
  terra: 'Levantamento terra',
}

export function buildRegulationAlerts(workouts: Workout[]): Alert[] {
  const alerts: Alert[] = []
  const categories: LiftCategory[] = ['agachamento', 'supino', 'terra']

  for (const cat of categories) {
    const sessions = getLiftSessions(workouts, cat)
    if (sessions.length === 0) continue
    const label = LIFT_LABEL[cat]

    // RPE 10 (falha real) em agachamento/terra -> risco, checa a última sessão
    if ((cat === 'agachamento' || cat === 'terra')) {
      const last = sessions[sessions.length - 1]
      if (last.topSet.rpe >= 10) {
        alerts.push({
          id: `risco-${cat}-${last.date}`,
          level: 'risco',
          title: `Risco em ${label}`,
          message: `Última sessão (${last.date}) registrou RPE 10 (falha real) em ${label}. Evite chegar à falha real neste levantamento — priorize técnica e reduza a carga na próxima sessão.`,
        })
      }
    }

    if (sessions.length >= 2) {
      const last2 = sessions.slice(-2)
      const allHigh = last2.every((s) => s.topSet.rpe >= 9.5)
      const allLow = last2.every((s) => s.topSet.rpe <= 7)
      if (allHigh) {
        alerts.push({
          id: `reduzir-${cat}`,
          level: 'reduzir',
          title: `Reduzir carga em ${label}`,
          message: `RPE ≥ 9,5 nas últimas 2 sessões de ${label}. Sugestão: reduzir a carga em 5–10% ou trocar para RIR 1–2 na próxima sessão.`,
        })
      } else if (allLow) {
        alerts.push({
          id: `subir-${cat}`,
          level: 'subir',
          title: `Pode subir carga em ${label}`,
          message: `RPE ≤ 7 nas últimas 2 sessões de ${label}. Sugestão: subir 2,5–5kg na próxima sessão.`,
        })
      }
    }
  }

  const deload = checkDeloadNeeded(workouts)
  if (deload) alerts.push(deload)

  alerts.push(...checkPainFeedback(workouts))

  return alerts
}

/** Alerta para todo exercício (principal ou acessório) em que o atleta relatou dor
 * como motivo de não ter completado, nos últimos 14 dias. */
function checkPainFeedback(workouts: Workout[]): Alert[] {
  const alerts: Alert[] = []
  const recent = [...workouts]
    .filter((w) => w.finished && diffDays(w.date, todayISO()) < 14)
    .sort((a, b) => b.date.localeCompare(a.date))
  const seen = new Set<string>()
  for (const w of recent) {
    for (const ex of w.exercises) {
      if (ex.feedback?.motivo !== 'dor') continue
      const key = ex.name.trim().toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      alerts.push({
        id: `dor-${key}-${w.date}`,
        level: 'dor',
        title: `Dor relatada em ${ex.name}`,
        message: `Em ${w.date} você relatou dor em ${ex.name}${ex.feedback?.observacao ? `: "${ex.feedback.observacao}"` : ''}. Considere trocar por um substituto ou procurar orientação profissional antes de repetir este exercício.`,
      })
    }
  }
  return alerts
}

/** Volume semanal (todos os treinos) agrupado por início da semana ISO. */
export function weeklyVolumes(workouts: Workout[]): { weekStart: string; volume: number }[] {
  const finished = workouts.filter((w) => w.finished)
  const map = new Map<string, number>()
  for (const w of finished) {
    const weekStart = startOfISOWeek(w.date)
    map.set(weekStart, (map.get(weekStart) ?? 0) + workoutVolume(w))
  }
  return [...map.entries()]
    .map(([weekStart, volume]) => ({ weekStart, volume }))
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
}

function checkDeloadNeeded(workouts: Workout[]): Alert | null {
  const weeks = weeklyVolumes(workouts)
  if (weeks.length < 2) return null

  let lastDeloadIndex = -1
  for (let i = 1; i < weeks.length; i++) {
    const prev = weeks[i - 1].volume
    const curr = weeks[i].volume
    if (prev > 0 && curr <= prev * 0.6) {
      lastDeloadIndex = i
    }
  }

  const weeksSinceDeload = lastDeloadIndex === -1 ? weeks.length : weeks.length - 1 - lastDeloadIndex

  if (weeksSinceDeload >= 5) {
    return {
      id: 'deload-sugerido',
      level: 'deload',
      title: 'Semana de deload recomendada',
      message: `Já se passaram ${weeksSinceDeload} semanas sem uma queda de volume de pelo menos 40%. Considere programar uma semana de deload.`,
    }
  }
  return null
}

export interface AcwrResult {
  acute: number
  chronic: number
  ratio: number | null
  zone: 'baixo' | 'verde' | 'amarelo' | 'vermelho' | 'indefinido'
}

export function computeACWR(workouts: Workout[], referenceISO: string = todayISO()): AcwrResult {
  const finished = workouts.filter((w) => w.finished)

  const acute = finished
    .filter((w) => {
      const d = diffDays(w.date, referenceISO)
      return d >= 0 && d < 7
    })
    .reduce((sum, w) => sum + workoutVolume(w), 0)

  const chronicTotal = finished
    .filter((w) => {
      const d = diffDays(w.date, referenceISO)
      return d >= 0 && d < 28
    })
    .reduce((sum, w) => sum + workoutVolume(w), 0)
  const chronicWeekly = chronicTotal / 4

  if (chronicWeekly === 0) {
    return { acute, chronic: chronicWeekly, ratio: null, zone: 'indefinido' }
  }

  const ratio = acute / chronicWeekly
  let zone: AcwrResult['zone'] = 'verde'
  if (ratio < 0.8) zone = 'baixo'
  else if (ratio <= 1.3) zone = 'verde'
  else if (ratio <= 1.5) zone = 'amarelo'
  else zone = 'vermelho'

  return { acute, chronic: chronicWeekly, ratio, zone }
}
