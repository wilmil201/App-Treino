import type { JJSession, RolaCategoria } from './types'

/**
 * Método Se7e (Lucio Flávio M. de Oliveira / GFTeam) — planejamento periodizado de
 * condicionamento para jiu-jitsu. Fonte: "O Guia Extraordinário de Alto Rendimento
 * com Foco no Jiu-Jitsu". Ver planejamento-competicao-se7e.md para o resumo completo.
 */

export const ROLA_CATEGORIA_LABEL: Record<RolaCategoria, string> = {
  muito_curto: 'Muito curto',
  curto: 'Curto',
  longo: 'Longo',
  tempo_competicao: 'Tempo de competição',
}

export const ROLA_CATEGORIA_DESC: Record<RolaCategoria, string> = {
  muito_curto: 'até 1 minuto — pico de intensidade (explosão/força/isometria)',
  curto: '1 a 4 minutos — tolerância à acidose',
  longo: '5 minutos ou mais — resistência aeróbia/mental',
  tempo_competicao: 'no tempo e intervalo exatos da sua categoria de competição (fórmula TTB)',
}

/** QL (quantidade de lutas da categoria) × TL (tempo de luta da categoria) = TTB (Tempo Total Base). */
export function calculateTTB(quantidadeLutas: number, tempoLutaMin: number): number {
  return Math.max(0, quantidadeLutas) * Math.max(0, tempoLutaMin)
}

export interface RolaFocusSuggestion {
  categoria: RolaCategoria
  motivo: string
}

/**
 * Sugere a categoria de róla do dia com base na fase do macrociclo (mesociclo Se7e)
 * e alterna entre sessão 1/2 da semana pra cumprir a "Alternância Consciente" —
 * nunca repetir exatamente o mesmo estímulo em sessões seguidas da mesma fase.
 * Isso é uma meta de referência, não uma trava: o atleta pode registrar outra
 * categoria se foi o que de fato rolou na aula.
 */
export function suggestRolaFocus(mesocicloIndex: number, sessionType: 'sessao1' | 'sessao2'): RolaFocusSuggestion {
  if (mesocicloIndex === 0) {
    return sessionType === 'sessao1'
      ? { categoria: 'longo', motivo: 'Fase de base aeróbia — predomínio de rolas longos para construir resistência.' }
      : { categoria: 'muito_curto', motivo: 'Fase de base aeróbia — toques de muito curto pra já familiarizar o sistema neuromuscular.' }
  }
  if (mesocicloIndex === 1) {
    return sessionType === 'sessao1'
      ? { categoria: 'curto', motivo: 'Fase de acidose — predomínio de rolas curtos, alta intensidade, pouco descanso.' }
      : { categoria: 'muito_curto', motivo: 'Fase de acidose — muito curto reforça o pico de intensidade da fase.' }
  }
  return sessionType === 'sessao1'
    ? { categoria: 'tempo_competicao', motivo: 'Fase de especificidade — róla no tempo e intervalo exatos da sua categoria de competição.' }
    : { categoria: 'longo', motivo: 'Fase de especificidade — róla longo residual, mantendo a base aeróbia enquanto o foco é especificidade.' }
}

export interface RolaCategoriaStat {
  categoria: RolaCategoria
  count: number
  avgGas: number | null
  avgRpe: number | null
}

/**
 * Cruza o feedback (gás/RPE) de cada sessão real (sessão 1/2) com a categoria de róla
 * registrada, pra mostrar ao atleta em qual tipo de estímulo ele está bem e em qual
 * precisa melhorar — não um resumo geral, mas quebrado por categoria.
 */
export function rolaCategoriaBreakdown(jjSessions: JJSession[]): RolaCategoriaStat[] {
  const categorias: RolaCategoria[] = ['muito_curto', 'curto', 'longo', 'tempo_competicao']
  return categorias
    .map((categoria) => {
      const sessions = jjSessions.filter((s) => (s.type === 'sessao1' || s.type === 'sessao2') && s.categoria === categoria)
      const gasValues = sessions.map((s) => s.gas).filter((v): v is number => v !== undefined)
      const rpeValues = sessions.map((s) => s.rpe).filter((v): v is number => v !== undefined)
      return {
        categoria,
        count: sessions.length,
        avgGas: gasValues.length > 0 ? gasValues.reduce((a, b) => a + b, 0) / gasValues.length : null,
        avgRpe: rpeValues.length > 0 ? rpeValues.reduce((a, b) => a + b, 0) / rpeValues.length : null,
      }
    })
    .filter((s) => s.count > 0)
}
