/**
 * Tabela de %1RM por RPE x repetições — Mike Tuchscherer / Reactive Training
 * Systems, o padrão de referência usado em powerlifting para converter entre
 * RPE, repetições e percentual de 1RM. Cada linha é RPE (6 a 10, passo 0,5);
 * cada coluna são as repetições (1 a 10).
 */
const RPE_TABLE: Record<string, number[]> = {
  '10': [100, 96, 92, 89, 86, 84, 81, 79, 76, 74],
  '9.5': [98, 94, 91, 88, 85, 82, 80, 77, 75, 72],
  '9': [96, 92, 89, 86, 84, 81, 79, 76, 74, 71],
  '8.5': [94, 91, 87, 85, 82, 80, 77, 75, 72, 69],
  '8': [92, 89, 86, 84, 81, 79, 76, 74, 71, 68],
  '7.5': [91, 87, 85, 82, 80, 77, 75, 72, 69, 67],
  '7': [89, 86, 84, 81, 79, 76, 74, 71, 68, 65],
  '6.5': [88, 85, 82, 80, 77, 75, 72, 69, 67, 64],
  '6': [86, 84, 81, 79, 76, 74, 71, 68, 65, 63],
}

function pctFor(reps: number, rpe: number): number {
  const clampedReps = Math.min(Math.max(Math.round(reps), 1), 10)
  const clampedRpe = Math.min(Math.max(Math.round(rpe * 2) / 2, 6), 10)
  const row = RPE_TABLE[String(clampedRpe)]
  return row[clampedReps - 1] / 100
}

/** Estima o 1RM verdadeiro a partir de uma série real (carga, reps, RPE). */
export function estimateOneRepMax(load: number, reps: number, rpe: number): number {
  return load / pctFor(reps, rpe)
}

/** Carga sugerida para atingir um número de reps a um RPE alvo, dado um 1RM. Arredonda para 2,5kg. */
export function loadForTarget(oneRepMax: number, targetReps: number, targetRpe: number): number {
  const raw = oneRepMax * pctFor(targetReps, targetRpe)
  return Math.round(raw / 2.5) * 2.5
}
