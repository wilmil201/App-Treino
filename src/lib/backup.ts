import type { Anamnese, JJSession, Program, Workout } from './types'
import { storage } from './storage'
import { todayISO, weekdayOfISO } from './dates'
import { weekdayLabel } from './schedule'

function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportBackupFile() {
  const data = storage.exportAll()
  downloadBlob(`treino-backup-${todayISO()}.json`, JSON.stringify(data, null, 2), 'application/json')
}

export interface ImportedBackup {
  program?: Program
  workouts?: Workout[]
  jjSessions?: JJSession[]
  schedule?: import('./schedule').DaySchedule
  anamnese?: Anamnese
}

/** Valida minimamente o formato de um backup antes de sobrescrever os dados locais. */
export function parseBackupFile(text: string): ImportedBackup {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Arquivo inválido: não é um JSON válido.')
  }
  if (typeof data !== 'object' || data === null) {
    throw new Error('Arquivo inválido: formato inesperado.')
  }
  const obj = data as Record<string, unknown>
  const hasAny = 'program' in obj || 'workouts' in obj || 'jjSessions' in obj
  if (!hasAny) {
    throw new Error('Arquivo inválido: não parece ser um backup deste app.')
  }
  if (obj.workouts !== undefined && !Array.isArray(obj.workouts)) {
    throw new Error('Arquivo inválido: "workouts" deveria ser uma lista.')
  }
  if (obj.jjSessions !== undefined && !Array.isArray(obj.jjSessions)) {
    throw new Error('Arquivo inválido: "jjSessions" deveria ser uma lista.')
  }
  return obj as ImportedBackup
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(reader.error ?? new Error('Falha ao ler o arquivo.'))
    reader.readAsText(file)
  })
}

function csvEscape(value: string | number | undefined): string {
  if (value === undefined || value === null) return ''
  const s = String(value)
  if (/[",;\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function toCsv(rows: (string | number | undefined)[][]): string {
  return rows.map((row) => row.map(csvEscape).join(';')).join('\r\n')
}

export function buildWorkoutsCsv(workouts: Workout[]): string {
  const header = ['Data', 'Dia', 'Exercício', 'Principal', 'Levantamento', 'Série', 'Carga (kg)', 'Reps', 'RPE', 'Peso corporal (kg)', 'Observações', 'Treino finalizado']
  const rows: (string | number | undefined)[][] = [header]
  for (const w of [...workouts].sort((a, b) => a.date.localeCompare(b.date))) {
    for (const ex of w.exercises) {
      if (ex.sets.length === 0) continue
      ex.sets.forEach((s, idx) => {
        rows.push([
          w.date,
          weekdayLabel(weekdayOfISO(w.date)),
          ex.name,
          ex.isMain ? 'sim' : 'não',
          ex.liftCategory ?? '',
          idx + 1,
          s.load,
          s.reps,
          s.rpe,
          w.bodyWeight ?? '',
          w.notes ?? '',
          w.finished ? 'sim' : 'não',
        ])
      })
    }
  }
  return toCsv(rows)
}

export function buildJJSessionsCsv(sessions: JJSession[]): string {
  const header = ['Data', 'Tipo', 'Mesociclo', 'Intensidade', 'Duração (min)', 'Rounds', 'RPE', 'Gás (0-10)', 'Séries drill', 'Reps drill']
  const rows: (string | number | undefined)[][] = [header]
  for (const s of [...sessions].sort((a, b) => a.date.localeCompare(b.date))) {
    rows.push([
      s.date,
      s.type,
      s.mesocicloIndex + 1,
      s.intensity ?? '',
      s.duration ?? '',
      s.rounds ?? '',
      s.rpe ?? '',
      s.gas ?? '',
      s.drillSeries ?? '',
      s.drillReps ?? '',
    ])
  }
  return toCsv(rows)
}

export function exportWorkoutsCsvFile(workouts: Workout[]) {
  downloadBlob(`treinos-forca-${todayISO()}.csv`, '﻿' + buildWorkoutsCsv(workouts), 'text/csv;charset=utf-8')
}

export function exportJJSessionsCsvFile(sessions: JJSession[]) {
  downloadBlob(`sessoes-jiujitsu-${todayISO()}.csv`, '﻿' + buildJJSessionsCsv(sessions), 'text/csv;charset=utf-8')
}
