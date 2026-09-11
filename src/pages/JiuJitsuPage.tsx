import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import { getMesociclo, formatDateBR, todayISO } from '../lib/dates'
import { checkProgressionReadiness } from '../lib/progression'
import { Card, SectionTitle, Badge } from '../components/ui'
import { MesocicloBanner } from '../components/MesocicloBanner'
import { JJSessionForm } from '../components/JJSessionForm'
import { WarmupChecklist } from '../components/WarmupChecklist'
import type { JJSession } from '../lib/types'

const TYPE_LABEL: Record<JJSession['type'], string> = {
  sessao1: 'Sessão 1',
  sessao2: 'Sessão 2',
  drill: 'Drill de velocidade',
}

const INTENSITY_LABEL: Record<string, string> = {
  forte: 'Forte',
  moderado: 'Moderado',
  leve: 'Leve',
}

export function JiuJitsuPage() {
  const { jjSessions, workouts, upsertJJSession, deleteJJSession } = useData()
  const { showToast } = useToast()

  const today = todayISO()
  const macrocicloStart = jjSessions.length > 0 ? [...jjSessions].map((s) => s.date).sort()[0] : null
  const mesociclo = getMesociclo(macrocicloStart, today)

  const progression = checkProgressionReadiness(workouts, jjSessions, today)

  const history = [...jjSessions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 15)

  return (
    <div className="pb-4">
      <h1 className="mb-4 text-xl font-bold">Jiu-Jitsu</h1>

      <MesocicloBanner mesociclo={mesociclo} />

      <div className="mb-6">
        <JJSessionForm
          mesocicloIndex={mesociclo.index}
          onSave={(session) => {
            upsertJJSession(session)
            showToast('Sessão de jiu-jitsu salva')
          }}
        />
      </div>

      <div className="mb-6">
        <SectionTitle>Progressão de frequência</SectionTitle>
        <Card>
          {progression.ready && (
            <p className="mb-3 rounded-lg border border-emerald-600 bg-emerald-500/10 p-2.5 text-sm font-semibold text-emerald-300">
              ✓ Pronto para subir para 3x/semana de jiu-jitsu
            </p>
          )}
          <div className="space-y-2">
            {progression.weeks.map((w) => (
              <div key={w.weekStart} className="flex items-center justify-between text-sm">
                <span className="text-slate-400">semana de {formatDateBR(w.weekStart)}</span>
                <span className={w.qualifica ? 'text-emerald-400' : 'text-slate-300'}>
                  {w.musculacao}/3 musc · {w.jiuJitsu}/2 jj {w.qualifica ? '✓' : ''}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Cumpra 3 sessões de musculação + 2 de jiu-jitsu por 3 semanas seguidas para liberar a sugestão de progressão.
          </p>
        </Card>
      </div>

      <div className="mb-6">
        <SectionTitle>Aquecimento</SectionTitle>
        <WarmupChecklist />
      </div>

      <SectionTitle>Histórico de sessões</SectionTitle>
      <div className="space-y-2">
        {history.length === 0 && (
          <Card>
            <p className="text-sm text-slate-400">Nenhuma sessão registrada ainda.</p>
          </Card>
        )}
        {history.map((s) => (
          <Card key={s.id} className="flex items-start justify-between gap-2">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold">{formatDateBR(s.date)}</span>
                <Badge>{TYPE_LABEL[s.type]}</Badge>
                {s.intensity && <Badge tone="emerald">{INTENSITY_LABEL[s.intensity]}</Badge>}
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {s.type === 'drill'
                  ? `${s.drillSeries ?? '—'} séries x ${s.drillReps ?? 6} reps${s.rpe ? ` · RPE ${s.rpe}` : ''}`
                  : [
                      s.duration ? `${s.duration}min` : null,
                      s.rounds ? `${s.rounds} rounds` : null,
                      s.rpe ? `RPE ${s.rpe}` : null,
                      s.gas !== undefined ? `gás ${s.gas}/10` : null,
                    ]
                      .filter(Boolean)
                      .join(' · ') || 'sem detalhes'}
              </p>
            </div>
            <button
              type="button"
              aria-label="Remover sessão"
              onClick={() => {
                deleteJJSession(s.id)
                showToast('Sessão removida')
              }}
              className="shrink-0 text-slate-500 active:text-red-400"
            >
              ✕
            </button>
          </Card>
        ))}
      </div>
    </div>
  )
}
