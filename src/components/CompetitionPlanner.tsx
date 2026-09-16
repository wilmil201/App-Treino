import { useState } from 'react'
import { useData } from '../context/DataContext'
import { todayISO, formatDateBR } from '../lib/dates'
import { buildCompetitionPlan, currentWeekPlan, PHASE_DESC, PHASE_LABEL } from '../lib/competitionPlanner'
import { ROLA_CATEGORIA_LABEL } from '../lib/jjPlanning'
import { Card, PrimaryButton, SecondaryButton } from './ui'

export function CompetitionPlanner() {
  const { competitionDate, saveCompetitionDate } = useData()
  const [draftDate, setDraftDate] = useState('')
  const [showAllWeeks, setShowAllWeeks] = useState(false)

  const today = todayISO()
  const plan = competitionDate ? buildCompetitionPlan(competitionDate, today) : null
  const thisWeek = currentWeekPlan(plan, today)

  if (!competitionDate) {
    return (
      <Card className="border-rose-700/60 bg-rose-500/5">
        <p className="mb-1 font-semibold text-rose-300">Planejador de competição</p>
        <p className="mb-3 text-xs text-slate-400">
          Informe a data do seu campeonato-alvo e o app monta a distribuição de semanas regressiva até lá — base
          aeróbia → acidose → transição → especificidade máxima — igual à periodização do Método Se7e.
        </p>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={draftDate}
            onChange={(e) => setDraftDate(e.target.value)}
            aria-label="Data da competição"
            min={today}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <PrimaryButton className="mt-3" disabled={!draftDate} onClick={() => saveCompetitionDate(draftDate)}>
          Definir competição
        </PrimaryButton>
      </Card>
    )
  }

  if (!plan || !thisWeek) {
    return (
      <Card className="border-rose-700/60 bg-rose-500/5">
        <p className="mb-1 font-semibold text-rose-300">Planejador de competição</p>
        <p className="mb-3 text-xs text-slate-400">
          A data definida ({formatDateBR(competitionDate)}) já passou. Defina a próxima competição-alvo, ou remova pra
          voltar ao planejamento genérico de macrociclo.
        </p>
        <SecondaryButton onClick={() => saveCompetitionDate(null)}>Remover data</SecondaryButton>
      </Card>
    )
  }

  const weeksVisible = showAllWeeks ? plan : plan.slice(0, 6)

  return (
    <Card className="border-rose-700/60 bg-rose-500/5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-rose-300">Planejador de competição</p>
          <p className="text-xs text-slate-400">
            {formatDateBR(competitionDate)} · faltam {thisWeek.weeksToGo} semana{thisWeek.weeksToGo === 1 ? '' : 's'}
          </p>
        </div>
        <button type="button" onClick={() => saveCompetitionDate(null)} className="shrink-0 text-xs text-slate-500 underline decoration-dotted">
          remover
        </button>
      </div>

      <div className="mt-3 rounded-lg border border-rose-600/50 bg-rose-500/10 p-2.5">
        <p className="text-xs uppercase tracking-wide text-rose-300">Semana atual · fase</p>
        <p className="font-semibold text-slate-100">{PHASE_LABEL[thisWeek.phase]}</p>
        <p className="mt-1 text-xs text-slate-400">{PHASE_DESC[thisWeek.phase]}</p>
        <p className="mt-1.5 text-xs text-slate-300">
          Ênfase: <span className="font-semibold text-rose-300">{ROLA_CATEGORIA_LABEL[thisWeek.enfase]}</span> · Tempo de
          competição: {thisWeek.tempoCompeticaoPorSemana}x na semana
        </p>
      </div>

      <div className="mt-3 space-y-1.5">
        {weeksVisible.map((w) => (
          <div
            key={w.weekNumber}
            className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-xs ${
              w.weekNumber === thisWeek.weekNumber ? 'border-rose-500 bg-rose-500/10' : 'border-slate-800 bg-slate-900/60'
            }`}
          >
            <span className="text-slate-400">
              Sem. {w.weekNumber} · {formatDateBR(w.weekStart)}
            </span>
            <span className="text-slate-300">{PHASE_LABEL[w.phase]}</span>
            <span className="font-medium text-slate-200">{ROLA_CATEGORIA_LABEL[w.enfase]}</span>
          </div>
        ))}
      </div>

      {plan.length > 6 && (
        <button
          type="button"
          onClick={() => setShowAllWeeks((v) => !v)}
          className="mt-2 w-full text-center text-xs text-slate-500 underline decoration-dotted"
        >
          {showAllWeeks ? '▲ ver menos' : `▼ ver todas as ${plan.length} semanas`}
        </button>
      )}
    </Card>
  )
}
