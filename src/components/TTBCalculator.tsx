import { useState } from 'react'
import { calculateTTB } from '../lib/jjPlanning'
import { Card } from './ui'

/**
 * Calculadora do TTB (Tempo Total Base) do Método Se7e: QL (nº de lutas da categoria
 * do atleta) × TL (tempo de luta da categoria) = quanto tempo total de róla faz
 * sentido programar na fase de especificidade, pra simular a demanda real da
 * competição-alvo. Os valores de QL/TL variam por federação/faixa/idade/peso — por
 * isso são inseridos pelo atleta/professor, não fixados pelo app.
 */
export function TTBCalculator() {
  const [ql, setQl] = useState('')
  const [tl, setTl] = useState('')

  const qlNum = Number(ql)
  const tlNum = Number(tl)
  const ttb = ql !== '' && tl !== '' && !Number.isNaN(qlNum) && !Number.isNaN(tlNum) ? calculateTTB(qlNum, tlNum) : null

  return (
    <Card className="border-sky-700/60 bg-sky-500/5">
      <p className="mb-1 font-semibold text-sky-300">Calculadora de TTB (tempo total de róla)</p>
      <p className="mb-3 text-xs text-slate-400">
        QL (nº de lutas até a final da sua categoria) × TL (tempo de cada luta) = quanto tempo total de róla programar
        na fase de especificidade, pra simular a demanda real da competição.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-slate-400" htmlFor="ttb-ql">
            QL — nº de lutas
          </label>
          <input
            id="ttb-ql"
            type="number"
            inputMode="numeric"
            min={0}
            value={ql}
            onChange={(e) => setQl(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400" htmlFor="ttb-tl">
            TL — min por luta
          </label>
          <input
            id="ttb-tl"
            type="number"
            inputMode="numeric"
            min={0}
            value={tl}
            onChange={(e) => setTl(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>
      <p className="mt-3 text-center text-2xl font-bold text-slate-100">{ttb !== null ? `${ttb} min` : '—'}</p>
      <p className="mt-1 text-center text-xs text-slate-500">
        {ttb !== null
          ? 'Distribua esse tempo entre as sessões de "Tempo de competição" nas semanas antes da competição.'
          : 'Preencha QL e TL da sua categoria (confirme com seu professor/regulamento do evento).'}
      </p>
    </Card>
  )
}
