import { useState } from 'react'
import { checkForUpdate } from '../registerSW'
import { Card, SecondaryButton } from './ui'

type Status = 'idle' | 'checking' | 'updated' | 'up-to-date' | 'unsupported' | 'error'

const STATUS_MESSAGE: Record<Exclude<Status, 'idle' | 'checking'>, string> = {
  updated: '✓ Nova versão encontrada — atualizando...',
  'up-to-date': '✓ Você já está na versão mais recente.',
  unsupported: 'Este navegador não suporta atualização automática.',
  error: 'Não consegui verificar agora. Tente de novo em alguns segundos.',
}

export function UpdateChecker() {
  const [status, setStatus] = useState<Status>('idle')

  async function handleCheck() {
    setStatus('checking')
    const result = await checkForUpdate()
    setStatus(result)
  }

  return (
    <Card className="mb-8">
      <p className="mb-1 font-semibold text-slate-100">Atualização do app</p>
      <p className="mb-3 text-xs text-slate-400">
        O app busca atualizações sozinho em segundo plano. Se você souber que tem uma versão nova e ela não chegou,
        use este botão — funciona mesmo com o app instalado na tela de início.
      </p>
      <SecondaryButton onClick={handleCheck} className={status === 'checking' ? 'opacity-60' : ''}>
        {status === 'checking' ? 'Verificando...' : '🔄 Verificar atualização'}
      </SecondaryButton>
      {status !== 'idle' && status !== 'checking' && (
        <p className="mt-2 text-xs text-slate-400">{STATUS_MESSAGE[status]}</p>
      )}
    </Card>
  )
}
