import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Anamnese, JJSession, Program, Workout } from '../lib/types'
import type { DaySchedule } from '../lib/schedule'
import { storage } from '../lib/storage'

interface DataContextValue {
  program: Program
  workouts: Workout[]
  jjSessions: JJSession[]
  schedule: DaySchedule
  anamnese: Anamnese
  cycleStartForca: string | null
  cycleStartJiuJitsu: string | null
  saveProgram: (program: Program) => void
  resetProgram: () => void
  saveSchedule: (schedule: DaySchedule) => void
  saveAnamnese: (anamnese: Anamnese) => void
  upsertWorkout: (workout: Workout) => void
  upsertJJSession: (session: JJSession) => void
  deleteJJSession: (id: string) => void
  saveCycleStartForca: (iso: string | null) => void
  saveCycleStartJiuJitsu: (iso: string | null) => void
  replaceAll: (data: {
    program?: Program
    workouts?: Workout[]
    jjSessions?: JJSession[]
    schedule?: DaySchedule
    anamnese?: Anamnese
    cycleStartForca?: string | null
    cycleStartJiuJitsu?: string | null
  }) => void
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [program, setProgram] = useState<Program>(() => storage.getProgram())
  const [workouts, setWorkouts] = useState<Workout[]>(() => storage.getWorkouts())
  const [jjSessions, setJJSessions] = useState<JJSession[]>(() => storage.getJJSessions())
  const [schedule, setSchedule] = useState<DaySchedule>(() => storage.getSchedule())
  const [anamnese, setAnamnese] = useState<Anamnese>(() => storage.getAnamnese())
  const [cycleStartForca, setCycleStartForca] = useState<string | null>(() => storage.getCycleStartForca())
  const [cycleStartJiuJitsu, setCycleStartJiuJitsu] = useState<string | null>(() => storage.getCycleStartJiuJitsu())

  const saveProgram = useCallback((next: Program) => {
    setProgram(next)
    storage.setProgram(next)
  }, [])

  const resetProgram = useCallback(() => {
    const fresh = storage.resetProgram()
    setProgram(fresh)
  }, [])

  const saveSchedule = useCallback((next: DaySchedule) => {
    setSchedule(next)
    storage.setSchedule(next)
  }, [])

  const saveAnamnese = useCallback((next: Anamnese) => {
    setAnamnese(next)
    storage.setAnamnese(next)
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

  const saveCycleStartForca = useCallback((iso: string | null) => {
    setCycleStartForca(iso)
    storage.setCycleStartForca(iso)
  }, [])

  const saveCycleStartJiuJitsu = useCallback((iso: string | null) => {
    setCycleStartJiuJitsu(iso)
    storage.setCycleStartJiuJitsu(iso)
  }, [])

  const replaceAll = useCallback(
    (data: {
      program?: Program
      workouts?: Workout[]
      jjSessions?: JJSession[]
      schedule?: DaySchedule
      anamnese?: Anamnese
      cycleStartForca?: string | null
      cycleStartJiuJitsu?: string | null
    }) => {
      storage.importAll(data)
      if (data.program) setProgram(storage.getProgram())
      if (data.workouts) setWorkouts(storage.getWorkouts())
      if (data.jjSessions) setJJSessions(data.jjSessions)
      if (data.schedule) setSchedule(data.schedule)
      if (data.anamnese) setAnamnese(data.anamnese)
      if (data.cycleStartForca !== undefined) setCycleStartForca(data.cycleStartForca)
      if (data.cycleStartJiuJitsu !== undefined) setCycleStartJiuJitsu(data.cycleStartJiuJitsu)
    },
    [],
  )

  const value = useMemo(
    () => ({
      program,
      workouts,
      jjSessions,
      schedule,
      anamnese,
      cycleStartForca,
      cycleStartJiuJitsu,
      saveProgram,
      resetProgram,
      saveSchedule,
      saveAnamnese,
      upsertWorkout,
      upsertJJSession,
      deleteJJSession,
      saveCycleStartForca,
      saveCycleStartJiuJitsu,
      replaceAll,
    }),
    [
      program,
      workouts,
      jjSessions,
      schedule,
      anamnese,
      cycleStartForca,
      cycleStartJiuJitsu,
      saveProgram,
      resetProgram,
      saveSchedule,
      saveAnamnese,
      upsertWorkout,
      upsertJJSession,
      deleteJJSession,
      saveCycleStartForca,
      saveCycleStartJiuJitsu,
      replaceAll,
    ],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData deve ser usado dentro de DataProvider')
  return ctx
}
