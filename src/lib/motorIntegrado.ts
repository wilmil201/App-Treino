import type { JJSession, Workout } from './types'

/**
 * Motor Integrado (seção 6 do documento) — regra de prioridade de recuperação
 * quando jiu-jitsu e musculação coexistem: o volume total de estresse do dia não
 * deve ultrapassar a capacidade de recuperação do atleta. Em vez de uma trava
 * automática (o app não sabe todo o contexto do dia), avisa quando os dois lados
 * já têm sinal de sessão intensa na mesma data, pra o atleta decidir com essa
 * informação — reduzir volume do lado que ainda não fez, ou tratar como auxiliar.
 */
export interface OverlapAdvisory {
  message: string
}

/** Chamado na tela de Registrar (força): avisa se já tem jiu-jitsu intenso hoje. */
export function checkJJOverlapForWorkout(jjSessions: JJSession[], date: string): OverlapAdvisory | null {
  const intenso = jjSessions.find(
    (s) => s.date === date && (s.categoria === 'curto' || s.categoria === 'tempo_competicao' || s.intensity === 'forte'),
  )
  if (!intenso) return null
  return {
    message:
      'Você já tem jiu-jitsu intenso registrado hoje. Considere reduzir volume/intensidade na academia agora — trate como treino auxiliar/manutenção, não como sessão de pico.',
  }
}

/** Chamado na tela de Jiu-Jitsu: avisa se já tem treino de força pesado hoje. */
export function checkWorkoutOverlapForJJ(workouts: Workout[], date: string): OverlapAdvisory | null {
  const intenso = workouts.find(
    (w) => w.date === date && w.finished && w.exercises.some((ex) => ex.isMain && ex.sets.some((s) => s.rpe >= 9)),
  )
  if (!intenso) return null
  return {
    message:
      'Você já tem um treino de força pesado (RPE ≥9) registrado hoje. Se puder, modere a intensidade da rola — priorize técnica e controle sobre esforço máximo.',
  }
}
