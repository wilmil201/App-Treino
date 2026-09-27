import { useState } from 'react'
import type {
  Anamnese,
  Articulacao,
  AthleteProfile,
  LiftCategory,
  MotorPrincipal,
  NivelEstresse,
  NivelExperiencia,
  ObjetivoTreino,
  Program,
  ProgramExercise,
  Sexo,
  TempoPratica,
} from '../lib/types'
import type { Equipment, JointTag, MuscleGroup } from '../lib/exerciseLibrary'
import { DAY_SLOTS, slotLabel, type DaySchedule } from '../lib/schedule'
import { LIFT_LABEL } from '../lib/liftLabels'
import { buildRecommendation } from '../lib/profileRecommendation'
import { generateProgram, type Questionnaire } from '../lib/workoutGenerator'
import { OBJETIVO_LABEL } from '../lib/objetivoGuidance'
import { Card, PrimaryButton, SecondaryButton } from './ui'

function norm(name: string): string {
  return name.trim().toLowerCase()
}

const MOTOR_OPTIONS: { key: MotorPrincipal; label: string; desc: string }[] = [
  { key: 'jiu_jitsu', label: 'Jiu-Jitsu', desc: 'Praticar/competir — o foco é o condicionamento pro tatame.' },
  { key: 'musculacao', label: 'Musculação', desc: 'Hipertrofia, força, emagrecimento ou condicionamento geral na academia.' },
  { key: 'combinacao', label: 'Combinação', desc: 'Jiu-jitsu + academia de apoio — o app cruza os dois pra não estourar recuperação.' },
]

const OBJETIVO_OPTIONS: { key: ObjetivoTreino; label: string; desc: string }[] = [
  { key: 'forca', label: 'Força', desc: 'Ganho de força máxima' },
  { key: 'hipertrofia', label: 'Hipertrofia', desc: 'Ganho de massa muscular' },
  { key: 'resistencia', label: 'Resistência / condicionamento', desc: 'Capacidade de repetir esforço' },
  { key: 'emagrecimento', label: 'Emagrecimento', desc: 'Perda de gordura' },
  { key: 'performance_esportiva', label: 'Performance esportiva', desc: 'Transferência para o esporte praticado' },
  { key: 'potencia', label: 'Potência', desc: 'Velocidade e explosão do movimento (cargas submáximas, poucas reps)' },
]

const NIVEL_OPTIONS: { key: NivelExperiencia; label: string }[] = [
  { key: 'iniciante', label: 'Iniciante' },
  { key: 'intermediario', label: 'Intermediário' },
  { key: 'avancado', label: 'Avançado' },
]

const TEMPO_PRATICA_OPTIONS: { key: TempoPratica; label: string }[] = [
  { key: 'sedentario', label: 'Sedentário' },
  { key: 'ate_6_meses', label: 'Até 6 meses' },
  { key: '6_meses_a_2_anos', label: '6 meses a 2 anos' },
  { key: '2_anos_ou_mais', label: '2+ anos' },
]

const ARTICULACAO_OPTIONS: { key: Articulacao; label: string }[] = [
  { key: 'ombro', label: 'Ombro' },
  { key: 'joelho', label: 'Joelho' },
  { key: 'coluna', label: 'Coluna' },
  { key: 'quadril', label: 'Quadril' },
  { key: 'tornozelo', label: 'Tornozelo' },
  { key: 'punho', label: 'Punho' },
]

const EQUIPAMENTO_OPTIONS: { key: Equipment; label: string }[] = [
  { key: 'academia', label: 'Academia completa' },
  { key: 'casa', label: 'Casa com halteres' },
  { key: 'peso_corporal', label: 'Peso corporal' },
]

const GRUPO_LABEL: Record<MuscleGroup, string> = {
  quadriceps: 'Quadríceps',
  posterior: 'Posterior de coxa',
  gluteos: 'Glúteos',
  panturrilha: 'Panturrilha',
  peito: 'Peito',
  costas: 'Costas',
  ombro: 'Ombro',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  core: 'Core',
}
const GRUPO_OPTIONS = Object.keys(GRUPO_LABEL) as MuscleGroup[]

const NIVEL_ESTRESSE_OPTIONS: { key: NivelEstresse; label: string }[] = [
  { key: 'baixo', label: 'Baixo' },
  { key: 'medio', label: 'Médio' },
  { key: 'alto', label: 'Alto' },
]

type Draft = Record<string, { load: string; reps: string }>

function keyFor(ex: ProgramExercise): string {
  return ex.liftCategory ? `main:${ex.liftCategory}` : `acc:${norm(ex.name)}`
}

function buildInitialDraft(program: Program, anamnese: Anamnese): Draft {
  const draft: Draft = {}
  for (const day of DAY_SLOTS) {
    for (const ex of program[day]) {
      const key = keyFor(ex)
      const existing = ex.liftCategory ? anamnese.mainLifts[ex.liftCategory] : anamnese.accessories[norm(ex.name)]
      draft[key] = { load: existing ? String(existing.load) : '', reps: existing ? String(existing.reps) : '' }
    }
  }
  return draft
}

function toggleInArray<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]
}

export function AnamneseForm({
  program,
  schedule,
  anamnese,
  onSave,
  onApplyProgram,
  onFinish,
  onSkip,
}: {
  program: Program
  schedule: DaySchedule
  anamnese: Anamnese
  /** Persiste a ficha de anamnese. Não fecha a tela sozinho — quando o motor inclui
   * musculação, a tela ainda mostra o treino gerado a partir dela antes de fechar. */
  onSave: (a: Anamnese) => void
  /** Aplica o treino gerado automaticamente a partir da anamnese recém-salva. Sem
   * essa prop, a tela pula direto pra onFinish() depois de salvar (comportamento
   * de quando o motor não inclui musculação). */
  onApplyProgram?: (program: Program) => void
  /** Fecha a tela de anamnese — chamado depois de salvar (e, se aplicável, depois
   * que o atleta decidir sobre o treino gerado) ou ao pular. */
  onFinish: () => void
  onSkip?: () => void
}) {
  const p = anamnese.profile
  const [draft, setDraft] = useState<Draft>(() => buildInitialDraft(program, anamnese))
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({})
  /** Treino gerado a partir da anamnese recém-salva, aguardando decisão do atleta
   * (aplicar ou manter o atual) — é isso que faz a anamnese realmente "analisar e
   * escolher" um treino, em vez de só mostrar uma recomendação em texto. */
  const [resultProgram, setResultProgram] = useState<Program | null>(null)

  // Bloco B
  const [motorPrincipal, setMotorPrincipal] = useState<MotorPrincipal>(p?.motorPrincipal ?? 'combinacao')
  const [objetivo, setObjetivo] = useState<ObjetivoTreino>(p?.objetivo ?? 'hipertrofia')
  const [esporte, setEsporte] = useState(p?.esporte ?? '')
  const [nivel, setNivel] = useState<NivelExperiencia>(p?.nivel ?? 'intermediario')

  // Bloco A
  const [idade, setIdade] = useState(p?.idade ? String(p.idade) : '')
  const [sexo, setSexo] = useState<Sexo | ''>(p?.sexo ?? '')
  const [pesoCorporalKg, setPesoCorporalKg] = useState(p?.pesoCorporalKg ? String(p.pesoCorporalKg) : '')
  const [alturaCm, setAlturaCm] = useState(p?.alturaCm ? String(p.alturaCm) : '')
  const [lesoes, setLesoes] = useState<Articulacao[]>(p?.lesoes ?? [])
  const [lesoesObs, setLesoesObs] = useState(p?.lesoesObs ?? '')
  const [tempoPratica, setTempoPratica] = useState<TempoPratica | ''>(p?.tempoPratica ?? '')

  // Bloco C
  const [jjFaixa, setJjFaixa] = useState(p?.jj?.faixa ?? '')
  const [jjCompete, setJjCompete] = useState(p?.jj?.compete ?? false)
  const [jjCategoriaPeso, setJjCategoriaPeso] = useState(p?.jj?.categoriaPeso ?? '')
  const [jjFrequenciaSemanal, setJjFrequenciaSemanal] = useState(p?.jj?.frequenciaSemanal ? String(p.jj.frequenciaSemanal) : '')

  // Bloco D
  const [diasDisponiveisSemana, setDiasDisponiveisSemana] = useState(p?.diasDisponiveisSemana ? String(p.diasDisponiveisSemana) : '3')
  const [tempoPorSessaoMin, setTempoPorSessaoMin] = useState(p?.tempoPorSessaoMin ? String(p.tempoPorSessaoMin) : '')
  const [equipamentoDisponivel, setEquipamentoDisponivel] = useState<Equipment | ''>(p?.equipamentoDisponivel ?? '')
  const [gruposPrioritarios, setGruposPrioritarios] = useState<MuscleGroup[]>(p?.gruposPrioritarios ?? [])

  // Bloco E
  const [horasSonoMedia, setHorasSonoMedia] = useState(p?.horasSonoMedia ? String(p.horasSonoMedia) : '')
  const [nivelEstresse, setNivelEstresse] = useState<NivelEstresse | ''>(p?.nivelEstresse ?? '')
  const [sinaisOvertraining, setSinaisOvertraining] = useState(p?.sinaisOvertraining ?? false)

  const includesMusculacao = motorPrincipal === 'musculacao' || motorPrincipal === 'combinacao'
  const includesJJ = motorPrincipal === 'jiu_jitsu' || motorPrincipal === 'combinacao'

  const previewProfile: AthleteProfile = {
    motorPrincipal,
    objetivo,
    nivel,
    esporte: esporte.trim() || undefined,
    jj: includesJJ ? { faixa: jjFaixa || undefined, compete: jjCompete, categoriaPeso: jjCategoriaPeso || undefined } : undefined,
  }
  const preview = buildRecommendation(previewProfile)

  function setField(key: string, field: 'load' | 'reps', value: string) {
    setDraft((d) => ({ ...d, [key]: { ...d[key], [field]: value } }))
  }

  function handleSave() {
    const profile: AthleteProfile = {
      motorPrincipal,
      objetivo,
      esporte: esporte.trim() || undefined,
      nivel,
      idade: idade === '' ? undefined : Number(idade),
      sexo: sexo || undefined,
      pesoCorporalKg: pesoCorporalKg === '' ? undefined : Number(pesoCorporalKg),
      alturaCm: alturaCm === '' ? undefined : Number(alturaCm),
      lesoes: lesoes.length > 0 ? lesoes : undefined,
      lesoesObs: lesoesObs.trim() || undefined,
      tempoPratica: tempoPratica || undefined,
      jj: includesJJ
        ? {
            faixa: jjFaixa.trim() || undefined,
            compete: jjCompete,
            categoriaPeso: jjCompete ? jjCategoriaPeso.trim() || undefined : undefined,
            frequenciaSemanal: jjFrequenciaSemanal === '' ? undefined : Number(jjFrequenciaSemanal),
          }
        : undefined,
      diasDisponiveisSemana: includesMusculacao && diasDisponiveisSemana !== '' ? Number(diasDisponiveisSemana) : undefined,
      tempoPorSessaoMin: includesMusculacao && tempoPorSessaoMin !== '' ? Number(tempoPorSessaoMin) : undefined,
      equipamentoDisponivel: includesMusculacao ? equipamentoDisponivel || undefined : undefined,
      gruposPrioritarios: includesMusculacao && gruposPrioritarios.length > 0 ? gruposPrioritarios : undefined,
      horasSonoMedia: horasSonoMedia === '' ? undefined : Number(horasSonoMedia),
      nivelEstresse: nivelEstresse || undefined,
      sinaisOvertraining,
    }

    const next: Anamnese = { profile, mainLifts: {}, accessories: {} }
    for (const day of DAY_SLOTS) {
      for (const ex of program[day]) {
        const key = keyFor(ex)
        const entry = draft[key]
        if (!entry || entry.load === '' || entry.reps === '') continue
        const load = Number(entry.load)
        const reps = Number(entry.reps)
        if (!load || !reps) continue
        if (ex.liftCategory) {
          next.mainLifts[ex.liftCategory] = { load, reps }
        } else {
          next.accessories[norm(ex.name)] = { load, reps }
        }
      }
    }
    onSave(next)

    if (includesMusculacao && onApplyProgram) {
      const lesoesToJointTag: JointTag[] = (profile.lesoes ?? [])
        .map((a): JointTag | null => (a === 'coluna' ? 'lombar' : a === 'ombro' || a === 'joelho' || a === 'punho' ? a : null))
        .filter((t): t is JointTag => t !== null)
      const questionnaire: Questionnaire = {
        objetivo,
        nivel,
        equipamento: equipamentoDisponivel || 'academia',
        limitacoes: lesoesToJointTag,
        divisao: 'perna_peito_costas',
        condicionamentoExtra: false,
      }
      setResultProgram(generateProgram(questionnaire, next))
    } else {
      onFinish()
    }
  }

  if (resultProgram) {
    return (
      <div className="space-y-4">
        <Card className="space-y-2 border-emerald-700/60 bg-emerald-500/5">
          <p className="font-semibold text-emerald-300">Ficha salva — treino gerado a partir dela</p>
          <p className="text-xs text-slate-400">
            Analisando objetivo ({OBJETIVO_LABEL[objetivo]}), nível ({NIVEL_OPTIONS.find((n) => n.key === nivel)?.label}), equipamento
            disponível{lesoes.length > 0 ? ', limitações marcadas' : ''}
            {gruposPrioritarios.length > 0 ? ' e grupos prioritários' : ''}, este é o treino que combina com o seu caso — não o
            genérico de antes.
          </p>
        </Card>
        {DAY_SLOTS.map((day) => (
          <Card key={day}>
            <p className="mb-2 font-semibold text-emerald-400">{slotLabel(schedule, day)}</p>
            <ul className="space-y-1">
              {resultProgram[day].map((ex) => (
                <li key={ex.id} className="text-sm text-slate-300">
                  {ex.isMain ? '⭐ ' : ex.kind === 'aerobico' ? '🔥 ' : '· '}
                  {ex.name} <span className="text-slate-500">— {ex.detail}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
        <p className="text-xs text-amber-300/90">
          Aplicar substitui todo o programa atual pelo gerado acima. Seus treinos já registrados não são afetados.
        </p>
        <div className="space-y-2">
          <PrimaryButton
            onClick={() => {
              onApplyProgram?.(resultProgram)
              onFinish()
            }}
          >
            Aplicar este treino agora
          </PrimaryButton>
          <SecondaryButton onClick={onFinish}>Manter meu treino atual por enquanto</SecondaryButton>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Preencha o quanto souber — nada aqui é obrigatório além do objetivo e nível. Quanto mais completo, mais
        precisa fica a recomendação e o cálculo de carga desde o primeiro treino.
      </p>

      <Card className="space-y-3 border-emerald-700/60 bg-emerald-500/5">
        <p className="font-semibold text-emerald-300">Objetivo principal</p>
        <p className="text-xs text-slate-400">Isso decide qual motor de recomendação o app usa pra você.</p>
        <div className="space-y-2">
          {MOTOR_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setMotorPrincipal(opt.key)}
              aria-pressed={motorPrincipal === opt.key}
              className={`w-full rounded-lg border p-2.5 text-left ${
                motorPrincipal === opt.key ? 'border-emerald-500 bg-emerald-500/15' : 'border-slate-700 bg-slate-900'
              }`}
            >
              <p className="text-sm font-medium text-slate-100">{opt.label}</p>
              <p className="text-xs text-slate-400">{opt.desc}</p>
            </button>
          ))}
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400" htmlFor="esporte">
            Esporte praticado (opcional)
          </label>
          <input
            id="esporte"
            value={esporte}
            onChange={(e) => setEsporte(e.target.value)}
            placeholder="ex: Jiu-Jitsu"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div className="rounded-lg border border-emerald-700/50 bg-emerald-500/10 p-2.5">
          <p className="text-xs font-semibold text-emerald-300">Seu perfil (prévia)</p>
          <p className="mt-1 text-xs text-emerald-200/80">{preview.resumo}</p>
        </div>
      </Card>

      {includesMusculacao && (
        <Card className="space-y-3">
          <p className="font-semibold text-sky-300">Objetivo e nível (musculação)</p>
          <div>
            <p className="mb-1.5 text-xs text-slate-400">Objetivo específico</p>
            <div className="space-y-2">
              {OBJETIVO_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setObjetivo(opt.key)}
                  aria-pressed={objetivo === opt.key}
                  className={`w-full rounded-lg border p-2.5 text-left ${
                    objetivo === opt.key ? 'border-sky-500 bg-sky-500/15' : 'border-slate-700 bg-slate-900'
                  }`}
                >
                  <p className="text-sm font-medium text-slate-100">{opt.label}</p>
                  <p className="text-xs text-slate-400">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-xs text-slate-400">Nível de experiência</p>
            <div className="grid grid-cols-3 gap-2">
              {NIVEL_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setNivel(opt.key)}
                  aria-pressed={nivel === opt.key}
                  className={`rounded-lg border px-2 py-2 text-xs font-semibold ${
                    nivel === opt.key ? 'border-sky-500 bg-sky-500/15 text-sky-300' : 'border-slate-700 bg-slate-900 text-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400" htmlFor="dias-disponiveis">
              Dias disponíveis por semana para academia
            </label>
            <input
              id="dias-disponiveis"
              type="number"
              inputMode="numeric"
              min={1}
              max={7}
              value={diasDisponiveisSemana}
              onChange={(e) => setDiasDisponiveisSemana(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400" htmlFor="tempo-sessao">
              Tempo disponível por sessão (min, opcional)
            </label>
            <input
              id="tempo-sessao"
              type="number"
              inputMode="numeric"
              value={tempoPorSessaoMin}
              onChange={(e) => setTempoPorSessaoMin(e.target.value)}
              placeholder="ex: 60"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <p className="mb-1.5 text-xs text-slate-400">Equipamento disponível</p>
            <div className="grid grid-cols-3 gap-2">
              {EQUIPAMENTO_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setEquipamentoDisponivel(opt.key)}
                  aria-pressed={equipamentoDisponivel === opt.key}
                  className={`rounded-lg border px-2 py-2 text-xs font-semibold ${
                    equipamentoDisponivel === opt.key
                      ? 'border-sky-500 bg-sky-500/15 text-sky-300'
                      : 'border-slate-700 bg-slate-900 text-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-xs text-slate-400">Grupos musculares prioritários (opcional)</p>
            <div className="grid grid-cols-2 gap-2">
              {GRUPO_OPTIONS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGruposPrioritarios((prev) => toggleInArray(prev, g))}
                  aria-pressed={gruposPrioritarios.includes(g)}
                  className={`rounded-lg border px-2 py-1.5 text-xs font-semibold ${
                    gruposPrioritarios.includes(g)
                      ? 'border-sky-500 bg-sky-500/15 text-sky-300'
                      : 'border-slate-700 bg-slate-900 text-slate-300'
                  }`}
                >
                  {GRUPO_LABEL[g]}
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {includesJJ && (
        <Card className="space-y-3 border-rose-700/60 bg-rose-500/5">
          <p className="font-semibold text-rose-300">Jiu-Jitsu</p>
          <div>
            <label className="mb-1 block text-xs text-slate-400" htmlFor="jj-faixa">
              Faixa/graduação atual
            </label>
            <input
              id="jj-faixa"
              value={jjFaixa}
              onChange={(e) => setJjFaixa(e.target.value)}
              placeholder="ex: Roxa 2º grau"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400" htmlFor="jj-frequencia">
              Frequência de treino por semana
            </label>
            <input
              id="jj-frequencia"
              type="number"
              inputMode="numeric"
              min={1}
              max={7}
              value={jjFrequenciaSemanal}
              onChange={(e) => setJjFrequenciaSemanal(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setJjCompete(true)}
              aria-pressed={jjCompete}
              className={`rounded-lg border px-2 py-2 text-xs font-semibold ${
                jjCompete ? 'border-rose-500 bg-rose-500/15 text-rose-300' : 'border-slate-700 bg-slate-900 text-slate-300'
              }`}
            >
              Compete / pretende competir
            </button>
            <button
              type="button"
              onClick={() => setJjCompete(false)}
              aria-pressed={!jjCompete}
              className={`rounded-lg border px-2 py-2 text-xs font-semibold ${
                !jjCompete ? 'border-rose-500 bg-rose-500/15 text-rose-300' : 'border-slate-700 bg-slate-900 text-slate-300'
              }`}
            >
              Não compete
            </button>
          </div>
          {jjCompete && (
            <div>
              <label className="mb-1 block text-xs text-slate-400" htmlFor="jj-categoria">
                Categoria de peso
              </label>
              <input
                id="jj-categoria"
                value={jjCategoriaPeso}
                onChange={(e) => setJjCategoriaPeso(e.target.value)}
                placeholder="ex: Pena, Médio, Absoluto..."
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                A data da competição e o cálculo de TTB (QL×TL) ficam no planejador de competição, na aba Jiu-Jitsu.
              </p>
            </div>
          )}
        </Card>
      )}

      <Card className="space-y-3">
        <p className="font-semibold text-violet-300">Identificação e saúde geral</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs text-slate-400" htmlFor="idade">
              Idade
            </label>
            <input
              id="idade"
              type="number"
              inputMode="numeric"
              value={idade}
              onChange={(e) => setIdade(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-400">Sexo biológico</p>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setSexo('masculino')}
                aria-pressed={sexo === 'masculino'}
                className={`rounded-lg border px-2 py-2 text-xs font-semibold ${
                  sexo === 'masculino' ? 'border-violet-500 bg-violet-500/15 text-violet-300' : 'border-slate-700 bg-slate-900 text-slate-300'
                }`}
              >
                Masc.
              </button>
              <button
                type="button"
                onClick={() => setSexo('feminino')}
                aria-pressed={sexo === 'feminino'}
                className={`rounded-lg border px-2 py-2 text-xs font-semibold ${
                  sexo === 'feminino' ? 'border-violet-500 bg-violet-500/15 text-violet-300' : 'border-slate-700 bg-slate-900 text-slate-300'
                }`}
              >
                Fem.
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400" htmlFor="peso-corporal">
              Peso (kg)
            </label>
            <input
              id="peso-corporal"
              type="number"
              inputMode="decimal"
              value={pesoCorporalKg}
              onChange={(e) => setPesoCorporalKg(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400" htmlFor="altura">
              Altura (cm)
            </label>
            <input
              id="altura"
              type="number"
              inputMode="numeric"
              value={alturaCm}
              onChange={(e) => setAlturaCm(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-xs text-slate-400">Tempo de prática de atividade física</p>
          <div className="grid grid-cols-2 gap-2">
            {TEMPO_PRATICA_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setTempoPratica(opt.key)}
                aria-pressed={tempoPratica === opt.key}
                className={`rounded-lg border px-2 py-2 text-xs font-semibold ${
                  tempoPratica === opt.key ? 'border-violet-500 bg-violet-500/15 text-violet-300' : 'border-slate-700 bg-slate-900 text-slate-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-xs text-slate-400">Lesões ou restrições atuais/prévias (pode marcar mais de uma)</p>
          <div className="grid grid-cols-3 gap-2">
            {ARTICULACAO_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setLesoes((prev) => toggleInArray(prev, opt.key))}
                aria-pressed={lesoes.includes(opt.key)}
                className={`rounded-lg border px-2 py-2 text-xs font-semibold ${
                  lesoes.includes(opt.key) ? 'border-amber-500 bg-amber-500/15 text-amber-300' : 'border-slate-700 bg-slate-900 text-slate-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {lesoes.length > 0 && (
            <textarea
              value={lesoesObs}
              onChange={(e) => setLesoesObs(e.target.value)}
              rows={2}
              placeholder="detalhe (opcional): o que é, há quanto tempo, orientação médica..."
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          )}
        </div>
      </Card>

      <Card className="space-y-3">
        <p className="font-semibold text-amber-300">Rotina e recuperação</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs text-slate-400" htmlFor="sono">
              Horas de sono (média)
            </label>
            <input
              id="sono"
              type="number"
              inputMode="decimal"
              value={horasSonoMedia}
              onChange={(e) => setHorasSonoMedia(e.target.value)}
              placeholder="ex: 7"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-400">Nível de estresse</p>
            <div className="grid grid-cols-3 gap-1">
              {NIVEL_ESTRESSE_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setNivelEstresse(opt.key)}
                  aria-pressed={nivelEstresse === opt.key}
                  className={`rounded-lg border px-1.5 py-2 text-xs font-semibold ${
                    nivelEstresse === opt.key ? 'border-amber-500 bg-amber-500/15 text-amber-300' : 'border-slate-700 bg-slate-900 text-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSinaisOvertraining((v) => !v)}
          aria-pressed={sinaisOvertraining}
          className={`w-full rounded-lg border p-2.5 text-left text-sm font-medium ${
            sinaisOvertraining ? 'border-amber-500 bg-amber-500/15 text-amber-300' : 'border-slate-700 bg-slate-900 text-slate-300'
          }`}
        >
          {sinaisOvertraining ? '☑' : '☐'} Já senti sinais de overtraining (fadiga incomum, doenças recorrentes,
          desmotivação, queda de performance)
        </button>
      </Card>

      <p className="text-sm text-slate-400">
        Carga e repetições que você já consegue fazer hoje em cada exercício (opcional) — o app usa isso para já
        calcular a sugestão de carga desde o primeiro treino, em vez de começar do zero.
      </p>

      {DAY_SLOTS.map((day) => {
        const exercises = program[day].filter((ex) => ex.kind !== 'aerobico')
        const mainExs = exercises.filter((ex) => ex.isMain)
        const accExs = exercises.filter((ex) => !ex.isMain)
        const isExpanded = expandedDays[day] ?? false

        return (
          <Card key={day}>
            <p className="mb-3 font-semibold text-emerald-400">{slotLabel(schedule, day)}</p>

            <div className="space-y-3">
              {mainExs.map((ex) => {
                const key = keyFor(ex)
                const entry = draft[key] ?? { load: '', reps: '' }
                return (
                  <div key={ex.id}>
                    <p className="mb-1 text-sm font-medium text-slate-200">
                      {ex.name}
                      {ex.liftCategory && <span className="ml-1 text-xs text-slate-500">({LIFT_LABEL[ex.liftCategory as LiftCategory]})</span>}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        inputMode="decimal"
                        value={entry.load}
                        onChange={(e) => setField(key, 'load', e.target.value)}
                        placeholder="Carga (kg)"
                        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
                      />
                      <input
                        type="number"
                        inputMode="decimal"
                        value={entry.reps}
                        onChange={(e) => setField(key, 'reps', e.target.value)}
                        placeholder="Reps"
                        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {accExs.length > 0 && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setExpandedDays((d) => ({ ...d, [day]: !isExpanded }))}
                  className="text-xs font-medium text-slate-400 underline decoration-dotted"
                >
                  {isExpanded ? '▲ ocultar acessórios' : `▼ ver acessórios (${accExs.length})`}
                </button>
                {isExpanded && (
                  <div className="mt-3 space-y-3">
                    {accExs.map((ex) => {
                      const key = keyFor(ex)
                      const entry = draft[key] ?? { load: '', reps: '' }
                      return (
                        <div key={ex.id}>
                          <p className="mb-1 text-xs text-slate-300">{ex.name}</p>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              inputMode="decimal"
                              value={entry.load}
                              onChange={(e) => setField(key, 'load', e.target.value)}
                              placeholder="Carga (kg)"
                              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
                            />
                            <input
                              type="number"
                              inputMode="decimal"
                              value={entry.reps}
                              onChange={(e) => setField(key, 'reps', e.target.value)}
                              placeholder="Reps"
                              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </Card>
        )
      })}

      <div className="space-y-2">
        <PrimaryButton onClick={handleSave}>Salvar ficha de anamnese</PrimaryButton>
        {onSkip && <SecondaryButton onClick={onSkip}>Pular por agora</SecondaryButton>}
      </div>
    </div>
  )
}
