import { useState } from 'react'
import type { JJIntensity, JJSession, JJSessionType } from '../lib/types'
import { generateId } from '../lib/id'
import { todayISO } from '../lib/dates'
import { SESSION_PROTOCOLS } from '../lib/jjProtocols'
import { youtubeSearchUrl } from '../lib/youtube'
import { Card, PrimaryButton } from './ui'

const TYPE_OPTIONS: { key: JJSessionType; label: string }[] = [
  { key: 'sessao1', label: 'Sessão 1' },
  { key: 'sessao2', label: 'Sessão 2' },
  { key: 'drill', label: 'Drill de velocidade' },
]

const INTENSITY_OPTIONS: { key: JJIntensity; label: string }[] = [
  { key: 'forte', label: 'Forte' },
  { key: 'moderado', label: 'Moderado' },
  { key: 'leve', label: 'Leve' },
]

export function JJSessionForm({ mesocicloIndex, onSave }: { mesocicloIndex: number; onSave: (session: JJSession) => void }) {
  const [date, setDate] = useState(todayISO())
  const [type, setType] = useState<JJSessionType>('sessao1')
  const [intensity, setIntensity] = useState<JJIntensity>('moderado')
  const [duration, setDuration] = useState('')
  const [rounds, setRounds] = useState('')
  const [rpe, setRpe] = useState('')
  const [gas, setGas] = useState('')
  const [drillSeries, setDrillSeries] = useState('')

  const isDrill = type === 'drill'
  const protocol = SESSION_PROTOCOLS[mesocicloIndex]

  function reset() {
    setDuration('')
    setRounds('')
    setRpe('')
    setGas('')
    setDrillSeries('')
  }

  function handleSave() {
    const base: JJSession = {
      id: generateId('jj'),
      date,
      type,
      mesocicloIndex,
    }
    const session: JJSession = isDrill
      ? { ...base, drillSeries: drillSeries === '' ? undefined : Number(drillSeries), drillReps: 6, rpe: rpe === '' ? undefined : Number(rpe) }
      : {
          ...base,
          intensity,
          duration: duration === '' ? undefined : Number(duration),
          rounds: rounds === '' ? undefined : Number(rounds),
          rpe: rpe === '' ? undefined : Number(rpe),
          gas: gas === '' ? undefined : Number(gas),
        }
    onSave(session)
    reset()
  }

  return (
    <Card className="space-y-3">
      <p className="font-semibold">Registrar sessão</p>

      <div>
        <label className="mb-1 block text-xs text-slate-400" htmlFor="jj-date">
          Data
        </label>
        <input
          id="jj-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <div>
        <span className="mb-1 block text-xs text-slate-400">Tipo de sessão</span>
        <div className="grid grid-cols-3 gap-2">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setType(opt.key)}
              aria-pressed={type === opt.key}
              className={`rounded-lg border px-2 py-2 text-xs font-semibold ${
                type === opt.key ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300' : 'border-slate-700 bg-slate-900 text-slate-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {!isDrill && (
        <>
          <p className="rounded-lg bg-slate-800/70 p-2.5 text-xs text-slate-400">
            {type === 'sessao1' ? protocol.sessao1 : protocol.sessao2}
          </p>

          <div>
            <span className="mb-1 block text-xs text-slate-400">Intensidade planejada</span>
            <div className="grid grid-cols-3 gap-2">
              {INTENSITY_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setIntensity(opt.key)}
                  aria-pressed={intensity === opt.key}
                  className={`rounded-lg border px-2 py-2 text-xs font-semibold ${
                    intensity === opt.key
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                      : 'border-slate-700 bg-slate-900 text-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-slate-400" htmlFor="jj-duration">
                Duração da rola (min)
              </label>
              <input
                id="jj-duration"
                type="number"
                inputMode="numeric"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400" htmlFor="jj-rounds">
                Rounds
              </label>
              <input
                id="jj-rounds"
                type="number"
                inputMode="numeric"
                value={rounds}
                onChange={(e) => setRounds(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-slate-400" htmlFor="jj-rpe">
                RPE
              </label>
              <input
                id="jj-rpe"
                type="number"
                inputMode="decimal"
                step={0.5}
                min={1}
                max={10}
                value={rpe}
                onChange={(e) => setRpe(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400" htmlFor="jj-gas">
                Gás no final (0-10)
              </label>
              <input
                id="jj-gas"
                type="number"
                inputMode="numeric"
                min={0}
                max={10}
                value={gas}
                onChange={(e) => setGas(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </>
      )}

      {isDrill && (
        <>
          <p className="rounded-lg bg-slate-800/70 p-2.5 text-xs text-slate-400">
            Protocolo: 4–8 séries de 6 reps, descanso 2min, executado na maior velocidade possível. 2–3x/semana.
          </p>
          <a
            href={youtubeSearchUrl('drill de velocidade jiu-jitsu explosão')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs font-medium text-emerald-400"
          >
            ▶ ver referência do drill
          </a>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-slate-400" htmlFor="jj-series">
                Séries realizadas (4-8)
              </label>
              <input
                id="jj-series"
                type="number"
                inputMode="numeric"
                min={1}
                max={8}
                value={drillSeries}
                onChange={(e) => setDrillSeries(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400" htmlFor="jj-rpe-drill">
                RPE
              </label>
              <input
                id="jj-rpe-drill"
                type="number"
                inputMode="decimal"
                step={0.5}
                min={1}
                max={10}
                value={rpe}
                onChange={(e) => setRpe(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </>
      )}

      <PrimaryButton onClick={handleSave}>Salvar sessão</PrimaryButton>
    </Card>
  )
}
