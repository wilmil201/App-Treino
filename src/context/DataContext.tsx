import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { JJSession, Program, Workout } from '../lib/types'
import { storage } from '../lib/storage'

interface DataContextValue {
  program: Program
  workouts: Workout[]
  jjSessions: JJSession[]
  saveProgram: (program: Program) => void
  resetProgram: () => void
  upsertWorkout: (workout: Workout) => void
  upsertJJSession: (session: JJSession) => void
  deleteJJSession: (id: string) => void
  replaceAll: (data: { program?: Program; workouts?: Workout[]; jjSessions?: JJSession[] }) => void
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [program, setProgram] = useState<Program>(() => storage.getProgram())
  const [workouts, setWorkouts] = useState<Workout[]>(() => storage.getWorkouts())
  const [jjSessions, setJJSessions] = useState<JJSession[]>(() => storage.getJJSessions())

  const saveProgram = useCallback((next: Program) => {
    setProgram(next)
    storage.setProgram(next)
  }, [])

  const resetProgram = useCallback(() => {
    const fresh = storage.resetProgram()
    setProgram(fresh)
  }, [])

  const upsertWorkout = useCallback((workout: Workout) => {
    setWorkouts((prev) => {
      const idx = prev.findIndex((w) => w.id === workout.id)
      const next = idx === -1 ? [...prev, workout] : prev.map((w, i) => (i === idx ? workout : w))
      storage.setWorkouts(next)
      return next
    })
  }, [])

  const upsertJJSession = useCallback((session: JJSession) => {
    setJJSessions((prev) => {
      const idx = prev.findIndex((s) => s.id === session.id)
      const next = idx === -1 ? [...prev, session] : prev.map((s, i) => (i === idx ? session : s))
      storage.setJJSessions(next)
      return next
    })
  }, [])

  const deleteJJSession = useCallback((id: string) => {
    setJJSessions((prev) => {
      const next = prev.filter((s) => s.id !== id)
      storage.setJJSessions(next)
      return next
    })
  }, [])

  const replaceAll = useCallback((data: { program?: Program; workouts?: Workout[]; jjSessions?: JJSession[] }) => {
    storage.importAll(data)
    if (data.program) setProgram(data.program)
    if (data.workouts) setWorkouts(data.workouts)
    if (data.jjSessions) setJJSessions(data.jjSessions)
  }, [])

  const value = useMemo(
    () => ({ program, workouts, jjSessions, saveProgram, resetProgram, upsertWorkout, upsertJJSession, deleteJJSession, replaceAll }),
    [program, workouts, jjSessions, saveProgram, resetProgram, upsertWorkout, upsertJJSession, deleteJJSession, replaceAll],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData deve ser usado dentro de DataProvider')
  return ctx
}
