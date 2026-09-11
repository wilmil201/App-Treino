import type { Program, Workout, JJSession } from './types'
import { buildDefaultProgram } from './defaultProgram'

const KEYS = {
  program: 'treino:program',
  workouts: 'treino:workouts',
  jjSessions: 'treino:jjSessions',
  onboarded: 'treino:onboarded',
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

export const storage = {
  getProgram(): Program {
    return read<Program>(KEYS.program, buildDefaultProgram())
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
    return read<Workout[]>(KEYS.workouts, [])
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
  isOnboarded(): boolean {
    return read<boolean>(KEYS.onboarded, false)
  },
  setOnboarded() {
    write(KEYS.onboarded, true)
  },
  exportAll(): { version: 1; exportedAt: string; program: Program; workouts: Workout[]; jjSessions: JJSession[] } {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      program: this.getProgram(),
      workouts: this.getWorkouts(),
      jjSessions: this.getJJSessions(),
    }
  },
  importAll(data: { program?: Program; workouts?: Workout[]; jjSessions?: JJSession[] }) {
    if (data.program) write(KEYS.program, data.program)
    if (data.workouts) write(KEYS.workouts, data.workouts)
    if (data.jjSessions) write(KEYS.jjSessions, data.jjSessions)
  },
}
