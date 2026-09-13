import { useData } from '../context/DataContext'
import { Card, SectionTitle } from '../components/ui'
import { LineChart } from '../components/LineChart'
import { BarChart } from '../components/BarChart'
import { ExerciseProgressPicker } from '../components/ExerciseProgressPicker'
import { HistoryList } from '../components/HistoryList'
import {
  buildRegulationAlerts,
  computeACWR,
  getBestRecord,
  getLiftSessions,
  weeklyVolumes,
  type Alert,
} from '../lib/calculations'
import { suggestMainLift } from '../lib/suggestions'
import { listLoggedExerciseNames } from '../lib/exerciseHistory'
import { LIFT_LABEL, LIFT_COLOR } from '../lib/liftLabels'
import type { LiftCategory } from '../lib/types'
import { formatDateBR, getCicloOndulatorio, todayISO } from '../lib/dates'
import { bodyWeightTrend, gasTrend, weeklyConsistency } from '../lib/performance'

const LEVEL_STYLE: Record<Alert['level'], { border: string; bg: string; text: string; icon: string }> = {
  risco: { border: 'border-red-600', bg: 'bg-red-500/10', text: 'text-red-300', icon: '⚠️' },
  reduzir: { border: 'border-amber-600', bg: 'bg-amber-500/10', text: 'text-amber-300', icon: '↓' },
  subir: { border: 'border-emerald-600', bg: 'bg-emerald-500/10', text: 'text-emerald-300', icon: '↑' },
  deload: { border: 'border-purple-600', bg: 'bg-purple-500/10', text: 'text-purple-300', icon: '🔁' },
  info: { border: 'border-slate-600', bg: 'bg-slate-500/10', text: 'text-slate-300', icon: 'ℹ' },
  dor: { border: 'border-rose-600', bg: 'bg-rose-500/10', text: 'text-rose-300', icon: '🩹' },
}

const ACWR_ZONE: Record<string, { label: string; color: string }> = {
  baixo: { label: 'Carga baixa', color: 'text-sky-300 bg-sky-500/10 border-sky-600' },
  verde: { label: 'Zona ideal', color: 'text-emerald-300 bg-emerald-500/10 border-emerald-600' },
  amarelo: { label: 'Atenção', color: 'text-amber-300 bg-amber-500/10 border-amber-600' },
  vermelho: { label: 'Risco alto', color: 'text-red-300 bg-red-500/10 border-red-600' },
  indefinido: { label: 'Dados insuficientes', color: 'text-slate-400 bg-slate-500/10 border-slate-600' },
}

export function PainelPage() {
  const { workouts, jjSessions } = useData()

  const alerts = buildRegulationAlerts(workouts)
  const acwr = computeACWR(workouts)
  const acwrZone = ACWR_ZONE[acwr.zone]
  const weeks = weeklyVolumes(workouts).slice(-8)

  const today = todayISO()
  const cicloStart = workouts.length > 0 ? [...workouts].map((w) => w.date).sort()[0] : null
  const ciclo = getCicloOndulatorio(cicloStart, today)
  const liftSuggestions = (['agachamento', 'supino', 'terra'] as LiftCategory[]).map((cat) => suggestMainLift(cat, workouts, ciclo))

  const exerciseNames = listLoggedExerciseNames(workouts)
  const gas = gasTrend(jjSessions)
  const bodyWeight = bodyWeightTrend(workouts)
  const consistency = weeklyConsistency(workouts, jjSessions, 8)

  return (
    <div className="pb-4">
      <h1 className="mb-4 text-xl font-bold">Painel</h1>

      <SectionTitle>Alertas de autorregulação</SectionTitle>
      <div className="mb-6 space-y-3">
        {alerts.length === 0 && (
          <Card>
            <p className="text-sm text-slate-400">Nenhum alerta no momento. Continue registrando os top sets de agachamento, supino e terra.</p>
          </Card>
        )}
        {alerts.map((a) => {
          const style = LEVEL_STYLE[a.level]
          return (
            <div key={a.id} className={`rounded-2xl border p-4 ${style.border} ${style.bg}`}>
              <p className={`font-semibold ${style.text}`}>
                {style.icon} {a.title}
              </p>
              <p className="mt-1 text-sm text-slate-300">{a.message}</p>
            </div>
          )
        })}
      </div>

      <SectionTitle>Sugestão de carga (próxima sessão)</SectionTitle>
      <div className="mb-6 space-y-3">
        {liftSuggestions.map((s) => (
          <Card key={s.category}>
            <div className="flex items-center justify-between">
              <p className="font-semibold" style={{ color: LIFT_COLOR[s.category] }}>
                {LIFT_LABEL[s.category]}
              </p>
              <p className="text-lg font-bold text-slate-100">
                {s.suggestedLoad !== null ? `${s.suggestedLoad}kg${s.reps ? ` x${s.reps}` : ''}` : s.isCalibration ? '🧭 calibração' : '—'}
              </p>
            </div>
            <p className="mt-1 text-xs text-slate-400">{s.note}</p>
          </Card>
        ))}
        <p className="text-xs text-slate-500">
          Semana atual do ciclo: {ciclo.semana}/4 · {ciclo.descricao}. Sugestões combinam a periodização ondulatória com os alertas de
          autorregulação acima.
        </p>
      </div>

      <SectionTitle>Carga aguda vs. crônica (ACWR)</SectionTitle>
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold">{acwr.ratio !== null ? acwr.ratio.toFixed(2) : '—'}</p>
            <p className="text-xs text-slate-500">
              Aguda (7d): {Math.round(acwr.acute).toLocaleString('pt-BR')}kg · Crônica (média sem./28d):{' '}
              {Math.round(acwr.chronic).toLocaleString('pt-BR')}kg
            </p>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${acwrZone.color}`}>{acwrZone.label}</span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div className="flex h-full w-full">
            <div className="h-full bg-sky-500/50" style={{ width: '30%' }} />
            <div className="h-full bg-emerald-500/60" style={{ width: '25%' }} />
            <div className="h-full bg-amber-500/60" style={{ width: '10%' }} />
            <div className="h-full bg-red-500/60" style={{ width: '35%' }} />
          </div>
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-slate-500">
          <span>0</span>
          <span>0,8</span>
          <span>1,3</span>
          <span>1,5+</span>
        </div>
      </Card>

      <SectionTitle>Recordes pessoais (PR)</SectionTitle>
      <div className="mb-6 grid grid-cols-3 gap-2">
        {(['agachamento', 'supino', 'terra'] as LiftCategory[]).map((cat) => {
          const record = getBestRecord(workouts, cat)
          return (
            <Card key={cat} className="text-center">
              <p className="text-xs font-semibold" style={{ color: LIFT_COLOR[cat] }}>
                {LIFT_LABEL[cat]}
              </p>
              {record ? (
                <>
                  <p className="mt-1 text-lg font-bold text-amber-300">🏆 {Math.round(record.e1rm)}kg</p>
                  <p className="text-[10px] text-slate-500">
                    {record.load}kg x{record.reps} · {formatDateBR(record.date)}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-xs text-slate-500">sem dados</p>
              )}
            </Card>
          )
        })}
      </div>

      <SectionTitle>e1RM estimado (Epley)</SectionTitle>
      <div className="mb-6 space-y-4">
        {(['agachamento', 'supino', 'terra'] as LiftCategory[]).map((cat) => {
          const sessions = getLiftSessions(workouts, cat)
          const data = sessions.map((s) => ({ label: formatDateBR(s.date).slice(0, 5), value: s.e1rm }))
          return (
            <Card key={cat}>
              <p className="mb-2 font-semibold" style={{ color: LIFT_COLOR[cat] }}>
                {LIFT_LABEL[cat]}
              </p>
              <LineChart data={data} color={LIFT_COLOR[cat]} unit="kg" />
            </Card>
          )
        })}
      </div>

      <SectionTitle>Volume semanal total</SectionTitle>
      <Card className="mb-6">
        <BarChart data={weeks.map((w) => ({ label: formatDateBR(w.weekStart).slice(0, 5), value: w.volume }))} />
      </Card>

      <SectionTitle>Condicionamento (gás) — jiu-jitsu</SectionTitle>
      <Card className="mb-6">
        <p className="mb-3 text-xs text-slate-500">
          Autoavaliação de 1 a 10 por sessão de rola. Não é um teste de campo objetivo — é uma medida de percepção de
          esforço: o que importa é a tendência ao longo do tempo, não o valor isolado.
        </p>
        <LineChart data={gas} color="#38bdf8" unit="/10" />
      </Card>

      <SectionTitle>Peso corporal</SectionTitle>
      <Card className="mb-6">
        <LineChart data={bodyWeight} color="#f472b6" unit="kg" />
      </Card>

      <SectionTitle>Consistência semanal</SectionTitle>
      <div className="mb-6 space-y-4">
        <Card>
          <p className="mb-2 font-semibold text-emerald-400">Musculação</p>
          <BarChart data={consistency.map((w) => ({ label: formatDateBR(w.weekStart).slice(0, 5), value: w.musculacao }))} color="#34d399" />
        </Card>
        <Card>
          <p className="mb-2 font-semibold text-sky-400">Jiu-Jitsu</p>
          <BarChart data={consistency.map((w) => ({ label: formatDateBR(w.weekStart).slice(0, 5), value: w.jiuJitsu }))} color="#38bdf8" />
        </Card>
      </div>

      <SectionTitle>Progressão por exercício</SectionTitle>
      <div className="mb-6">
        <ExerciseProgressPicker workouts={workouts} exerciseNames={exerciseNames} />
      </div>

      <SectionTitle>Histórico completo</SectionTitle>
      <HistoryList workouts={workouts} jjSessions={jjSessions} />
    </div>
  )
}
