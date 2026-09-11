import type { Program, Workout, JJSession } from './types'
import { buildDefaultProgram } from './defaultProgram'
import { DEFAULT_SCHEDULE, type DaySchedule } from './schedule'

const KEYS = {
  program: 'treino:program',
  workouts: 'treino:workouts',
  jjSessions: 'treino:jjSessions',
  onboarded: 'treino:onboarded',
  schedule: 'treino:schedule',
} as const

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.error('Falha ao salvar dados localmente', err)
  }
}

// Versões antigas do app usavam os dias da semana como chave fixa
// (segunda/quarta/sexta). Agora os 3 treinos são identificadores
// abstratos (dia1/dia2/dia3) com o dia real definido pelo atleta.
const LEGACY_DAY_MAP: Record<string, 'dia1' | 'dia2' | 'dia3'> = {
  segunda: 'dia1',
  quarta: 'dia2',
  sexta: 'dia3',
}

function migrateProgram(program: Record<string, unknown>): Program {
  if (program.dia1 || program.dia2 || program.dia3) return program as Program
  if (program.segunda || program.quarta || program.sexta) {
    return {
      dia1: (program.segunda as Program['dia1']) ?? [],
      dia2: (program.quarta as Program['dia2']) ?? [],
      dia3: (program.sexta as Program['dia3']) ?? [],
    }
  }
  return program as Program
}

function migrateWorkouts(workouts: Workout[]): Workout[] {
  return workouts.map((w) => {
    const legacy = LEGACY_DAY_MAP[w.day as unknown as string]
    return legacy ? { ...w, day: legacy } : w
  })
}

export const storage = {
  getProgram(): Program {
    const raw = read<Record<string, unknown>>(KEYS.program, buildDefaultProgram() as unknown as Record<string, unknown>)
    return migrateProgram(raw)
  },
  setProgram(program: Program) {
    write(KEYS.program, program)
  },
  resetProgram(): Program {
    const fresh = buildDefaultProgram()
    write(KEYS.program, fresh)
    return fresh
  },
  getWorkouts(): Workout[] {
    return migrateWorkouts(read<Workout[]>(KEYS.workouts, []))
  },
  setWorkouts(workouts: Workout[]) {
    write(KEYS.workouts, workouts)
  },
  getJJSessions(): JJSession[] {
    return read<JJSession[]>(KEYS.jjSessions, [])
  },
  setJJSessions(sessions: JJSession[]) {
    write(KEYS.jjSessions, sessions)
  },
  getSchedule(): DaySchedule {
    return read<DaySchedule>(KEYS.schedule, DEFAULT_SCHEDULE)
  },
  setSchedule(schedule: DaySchedule) {
    write(KEYS.schedule, schedule)
  },
  isOnboarded(): boolean {
    return read<boolean>(KEYS.onboarded, false)
  },
  setOnboarded() {
    write(KEYS.onboarded, true)
  },
  exportAll(): { version: 1; exportedAt: string; program: Program; workouts: Workout[]; jjSessions: JJSession[]; schedule: DaySchedule } {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      program: this.getProgram(),
      workouts: this.getWorkouts(),
      jjSessions: this.getJJSessions(),
      schedule: this.getSchedule(),
    }
  },
  importAll(data: { program?: Program; workouts?: Workout[]; jjSessions?: JJSession[]; schedule?: DaySchedule }) {
    if (data.program) write(KEYS.program, migrateProgram(data.program as unknown as Record<string, unknown>))
    if (data.workouts) write(KEYS.workouts, migrateWorkouts(data.workouts))
    if (data.jjSessions) write(KEYS.jjSessions, data.jjSessions)
    if (data.schedule) write(KEYS.schedule, data.schedule)
  },
}
