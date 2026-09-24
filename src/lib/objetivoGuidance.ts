import type { NivelExperiencia, ObjetivoTreino } from './types'

/**
 * Diretrizes técnicas por objetivo de treino (linha NSCA/ACSM) — fonte única
 * reaproveitada tanto no cálculo de carga/reps (suggestions.ts) quanto no gerador
 * de programa (workoutGenerator.ts), pra não ter duas definições divergentes do
 * mesmo objetivo em lugares diferentes do app.
 */
export const GUIDANCE_BY_OBJETIVO: Record<ObjetivoTreino, { repRange: string; rpeRange: string; descanso: string }> = {
  forca: { repRange: '3–6', rpeRange: '8–9', descanso: '3–5 min' },
  hipertrofia: { repRange: '8–12', rpeRange: '7–9', descanso: '60–90s' },
  resistencia: { repRange: '15–20', rpeRange: '6–8', descanso: '30–45s' },
  emagrecimento: { repRange: '12–15', rpeRange: '6–8', descanso: '30–45s (priorize densidade de treino)' },
  performance_esportiva: { repRange: '6–10', rpeRange: '7–8', descanso: '60–90s (priorize qualidade/velocidade do movimento)' },
}

/** Mesmas faixas de GUIDANCE_BY_OBJETIVO, em número — usadas pra de fato calcular
 * (reps-alvo, esquema de séries), não só exibir num texto. */
export const REP_RANGE_BY_OBJETIVO: Record<ObjetivoTreino, [number, number]> = {
  forca: [3, 6],
  hipertrofia: [8, 12],
  resistencia: [15, 20],
  emagrecimento: [12, 15],
  performance_esportiva: [6, 10],
}

/** Centro da faixa de RPE de cada objetivo — usado como referência da onda ondulatória
 * de 4 semanas (em vez de uma única onda universal igual pra todo mundo). */
export const OBJETIVO_RPE_CENTER: Record<ObjetivoTreino, number> = {
  forca: 8.5,
  hipertrofia: 8,
  resistencia: 7,
  emagrecimento: 7,
  performance_esportiva: 7.5,
}

/** Nº de séries do levantamento principal por objetivo — mais séries e menos reps pra
 * força (maior frequência de estímulo de alta intensidade), menos séries e mais reps
 * pra resistência (o volume por série já é alto). */
export const MAIN_SETS_BY_OBJETIVO: Record<ObjetivoTreino, number> = {
  forca: 5,
  hipertrofia: 4,
  resistencia: 3,
  emagrecimento: 3,
  performance_esportiva: 4,
}

/** Nº de séries de acessório por objetivo. */
export const ACCESSORY_SETS_BY_OBJETIVO: Record<ObjetivoTreino, number> = {
  forca: 3,
  hipertrofia: 3,
  resistencia: 3,
  emagrecimento: 3,
  performance_esportiva: 3,
}

export const OBJETIVO_LABEL: Record<ObjetivoTreino, string> = {
  forca: 'força',
  hipertrofia: 'hipertrofia',
  resistencia: 'resistência muscular / condicionamento',
  emagrecimento: 'emagrecimento',
  performance_esportiva: 'performance esportiva',
}

export const NIVEL_HINT: Record<NivelExperiencia, string> = {
  iniciante: 'comece com a menor carga disponível (barra vazia ou menor anilha)',
  intermediario: 'comece com uma carga moderada, próxima da que usa em exercícios parecidos',
  avancado: 'pode iniciar mais perto do que estima suportar, ajustando pela técnica',
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v))
}

/** Texto pronto "NxM reps" (ex.: "5x5", "4x8-12") a partir do objetivo — usado no
 * gerador de programa como o detalhe/esquema do exercício. */
export function repSchemeText(sets: number, range: [number, number]): string {
  const [min, max] = range
  return min === max ? `${sets}x${min}` : `${sets}x${min}-${max}`
}
