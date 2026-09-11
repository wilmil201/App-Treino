/**
 * Tabela de %1RM por reps x RPE (aproximação da tabela RPE popularizada por
 * Mike Tuchscherer / RTS). Usada para normalizar qualquer série (carga, reps, RPE)
 * em um "1RM verdadeiro" e para converter esse 1RM de volta numa carga alvo
 * para um esquema de reps x RPE diferente (ex: a semana atual do ciclo ondulatório).
 */
const RPE_KEYS = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10]

// linhas = RPE (na ordem de RPE_KEYS), colunas = reps 1..10
const TABLE: number[][] = [
  [86, 84, 81, 78, 76, 73, 71, 69, 65, 63], // RPE 6
  [88, 85, 82, 80, 77, 75, 72, 70, 67, 64], // RPE 6.5
  [89, 86, 84, 81, 79, 76, 74, 71, 68, 65], // RPE 7
  [91, 88, 85, 82, 80, 77, 75, 72, 69, 67], // RPE 7.5
  [92, 89, 86, 84, 81, 78, 76, 74, 71, 68], // RPE 8
  [94, 91, 88, 85, 82, 80, 77, 75, 72, 69], // RPE 8.5
  [96, 92, 89, 86, 84, 81, 79, 76, 74, 71], // RPE 9
  [98, 94, 91, 88, 85, 82, 80, 77, 75, 72], // RPE 9.5
  [100, 96, 92, 89, 86, 84, 81, 79, 76, 74], // RPE 10
]

function nearestRpeIndex(rpe: number): number {
  const clamped = Math.min(10, Math.max(6, rpe))
  let best = 0
  let bestDiff = Infinity
  RPE_KEYS.forEach((k, i) => {
    const diff = Math.abs(k - clamped)
    if (diff < bestDiff) {
      bestDiff = diff
      best = i
    }
  })
  return best
}

/** %1RM (0-100) para uma combinação reps x RPE, com clamp/arredondamento nas bordas da tabela. */
export function pctForRepsRpe(reps: number, rpe: number): number {
  const repIdx = Math.min(10, Math.max(1, Math.round(reps))) - 1
  const rpeIdx = nearestRpeIndex(rpe)
  return TABLE[rpeIdx][repIdx]
}

/** Estima o 1RM "verdadeiro" (RPE10 @ 1 rep) a partir de uma série qualquer. */
export function trueOneRepMax(load: number, reps: number, rpe: number): number {
  const pct = pctForRepsRpe(reps, rpe)
  if (pct <= 0) return 0
  return load / (pct / 100)
}

/** Converte um 1RM verdadeiro numa carga alvo para determinado reps x RPE, arredondada a 2,5kg. */
export function loadForTarget(oneRepMax: number, targetReps: number, targetRpe: number): number {
  const pct = pctForRepsRpe(targetReps, targetRpe)
  const raw = oneRepMax * (pct / 100)
  return Math.round(raw / 2.5) * 2.5
}
