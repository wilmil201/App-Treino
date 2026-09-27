import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Anamnese, JJSession, Program, Workout } from '../lib/types'
import type { DaySchedule } from '../lib/schedule'
import type { PeriodizacaoModel } from '../lib/periodization'
import type { Hiit100Config } from '../lib/hiit100'
import { storage } from '../lib/storage'

interface DataContextValue {
  program: Program
  workouts: Workout[]
  jjSessions: JJSession[]
  schedule: DaySchedule
  anamnese: Anamnese
  cycleStartForca: string | null
  cycleStartJiuJitsu: string | null
  competitionDate: string | null
  periodizacaoModel: PeriodizacaoModel
  programUpdatedAt: string
  hiit100Config: Hiit100Config | null
  saveHiit100Config: (config: Hiit100Config | null) => void
  saveProgram: (program: Program) => void
  resetProgram: () => void
  saveSchedule: (schedule: DaySchedule) => void
  saveAnamnese: (anamnese: Anamnese) => void
  upsertWorkout: (workout: Workout) => void
  upsertJJSession: (session: JJSession) => void
  deleteJJSession: (id: string) => void
  saveCycleStartForca: (iso: string | null) => void
  saveCycleStartJiuJitsu: (iso: string | null) => void
  saveCompetitionDate: (iso: string | null) => void
  savePeriodizacaoModel: (model: PeriodizacaoModel) => void
  replaceAll: (data: {
    program?: Program
    workouts?: Workout[]
    jjSessions?: JJSession[]
    schedule?: DaySchedule
    anamnese?: Anamnese
    cycleStartForca?: string | null
    cycleStartJiuJitsu?: string | null
    competitionDate?: string | null
    periodizacaoModel?: PeriodizacaoModel
    programUpdatedAt?: string
    hiit100Config?: Hiit100Config | null
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
  const [competitionDate, setCompetitionDate] = useState<string | null>(() => storage.getCompetitionDate())
  const [periodizacaoModel, setPeriodizacaoModel] = useState<PeriodizacaoModel>(() => storage.getPeriodizacaoModel())
  const [programUpdatedAt, setProgramUpdatedAt] = useState<string>(() => storage.getProgramUpdatedAt())
  const [hiit100Config, setHiit100Config] = useState<Hiit100Config | null>(() => storage.getHiit100Config())

  const saveProgram = useCallback((next: Program) => {
    setProgram(next)
    storage.setProgram(next)
    setProgramUpdatedAt(storage.getProgramUpdatedAt())
  }, [])

  const resetProgram = useCallback(() => {
    const fresh = storage.resetProgram()
    setProgram(fresh)
    setProgramUpdatedAt(storage.getProgramUpdatedAt())
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

  const saveCompetitionDate = useCallback((iso: string | null) => {
    setCompetitionDate(iso)
    storage.setCompetitionDate(iso)
  }, [])

  const savePeriodizacaoModel = useCallback((model: PeriodizacaoModel) => {
    setPeriodizacaoModel(model)
    storage.setPeriodizacaoModel(model)
  }, [])

  const saveHiit100Config = useCallback((config: Hiit100Config | null) => {
    setHiit100Config(config)
    storage.setHiit100Config(config)
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
      competitionDate?: string | null
      periodizacaoModel?: PeriodizacaoModel
      programUpdatedAt?: string
      hiit100Config?: Hiit100Config | null
    }) => {
      storage.importAll(data)
      if (data.program) setProgram(storage.getProgram())
      if (data.workouts) setWorkouts(storage.getWorkouts())
      if (data.jjSessions) setJJSessions(data.jjSessions)
      if (data.schedule) setSchedule(data.schedule)
      if (data.anamnese) setAnamnese(data.anamnese)
      if (data.cycleStartForca !== undefined) setCycleStartForca(data.cycleStartForca)
      if (data.cycleStartJiuJitsu !== undefined) setCycleStartJiuJitsu(data.cycleStartJiuJitsu)
      if (data.competitionDate !== undefined) setCompetitionDate(data.competitionDate)
      if (data.periodizacaoModel !== undefined) setPeriodizacaoModel(data.periodizacaoModel)
      if (data.programUpdatedAt !== undefined) setProgramUpdatedAt(data.programUpdatedAt)
      if (data.hiit100Config !== undefined) setHiit100Config(data.hiit100Config)
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
      competitionDate,
      periodizacaoModel,
      programUpdatedAt,
      hiit100Config,
      saveHiit100Config,
      saveProgram,
      resetProgram,
      saveSchedule,
      saveAnamnese,
      upsertWorkout,
      upsertJJSession,
      deleteJJSession,
      saveCycleStartForca,
      saveCycleStartJiuJitsu,
      saveCompetitionDate,
      savePeriodizacaoModel,
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
      competitionDate,
      periodizacaoModel,
      programUpdatedAt,
      hiit100Config,
      saveHiit100Config,
      saveProgram,
      resetProgram,
      saveSchedule,
      saveAnamnese,
      upsertWorkout,
      upsertJJSession,
      deleteJJSession,
      saveCycleStartForca,
      saveCycleStartJiuJitsu,
      saveCompetitionDate,
      savePeriodizacaoModel,
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
