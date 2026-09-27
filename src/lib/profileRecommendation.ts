import type { AthleteProfile, NivelExperiencia, ObjetivoTreino } from './types'
import type { PeriodizacaoModel } from './periodization'
import { OBJETIVO_LABEL } from './objetivoGuidance'
import { PERIODIZACAO_LABEL } from './periodization'

/**
 * Motor de decisão (seção 3 do documento): o objetivo principal declarado decide
 * qual "motor" — Se7e (jiu-jitsu), Stoppani (musculação) ou Integrado (os dois) —
 * rege as recomendações. Isso não esconde nenhuma aba do app; só direciona texto
 * de recomendação e o cruzamento de volume do motor integrado.
 */
export const MOTOR_LABEL: Record<AthleteProfile['motorPrincipal'], string> = {
  jiu_jitsu: 'Motor Se7e (condicionamento de jiu-jitsu)',
  musculacao: 'Motor Stoppani (musculação)',
  combinacao: 'Motor Integrado (jiu-jitsu + musculação)',
}

/**
 * Recomendação de modelo de periodização por nível/objetivo (seção 5): iniciante e
 * avançado/força usam progressão mais linear e previsível (Clássica); intermediário
 * se beneficia mais de variação dentro do mesociclo (Ondulada). Linear invertida
 * fica de fora da recomendação automática — é um caso específico (pico adiantado)
 * que o atleta escolhe manualmente quando sabe que precisa dele.
 */
export function recommendPeriodizacaoModel(nivel: NivelExperiencia, objetivo: ObjetivoTreino): PeriodizacaoModel {
  if (nivel === 'intermediario' && objetivo !== 'forca') return 'ondulada'
  return 'classica'
}

export interface ProfileRecommendation {
  motorLabel: string
  periodizacaoRecomendada?: PeriodizacaoModel
  resumo: string
}

/** Monta o resumo "Seu perfil: X — Nível Y — Recomendação: Z" (seção 8, item 1). */
export function buildRecommendation(profile: AthleteProfile): ProfileRecommendation {
  const motorLabel = MOTOR_LABEL[profile.motorPrincipal]
  const includesMusculacao = profile.motorPrincipal === 'musculacao' || profile.motorPrincipal === 'combinacao'
  const includesJJ = profile.motorPrincipal === 'jiu_jitsu' || profile.motorPrincipal === 'combinacao'

  const periodizacaoRecomendada = includesMusculacao ? recommendPeriodizacaoModel(profile.nivel, profile.objetivo) : undefined

  const partes: string[] = []
  if (includesMusculacao) {
    partes.push(`objetivo ${OBJETIVO_LABEL[profile.objetivo]}`)
  }
  if (includesJJ) {
    partes.push(profile.jj?.compete ? 'jiu-jitsu com foco em competição' : 'jiu-jitsu recreativo/condicionamento')
  }

  const resumo = `${motorLabel} — ${partes.join(' + ')}. Nível ${
    profile.nivel === 'iniciante' ? 'iniciante' : profile.nivel === 'intermediario' ? 'intermediário' : 'avançado'
  }.${periodizacaoRecomendada ? ` Periodização recomendada: ${PERIODIZACAO_LABEL[periodizacaoRecomendada]}.` : ''}`

  return { motorLabel, periodizacaoRecomendada, resumo }
}
