/**
 * Registro manual do service worker (em vez do script auto-injetado pelo
 * vite-plugin-pwa). O ponto crucial é `updateViaCache: 'none'`: isso instrui
 * o navegador a NUNCA usar cache HTTP ao checar o sw.js por atualizações —
 * sem isso, hosts como o GitHub Pages podem servir uma cópia em cache do
 * service worker por vários minutos e o app parece nunca atualizar.
 *
 * Também fazemos polling periódico de atualização (o navegador só checa
 * automaticamente em navegações de página, o que não ajuda muito num PWA
 * instalado que fica aberto) e recarregamos a página assim que o novo
 * service worker assumir o controle.
 *
 * Isso cobre a maioria dos casos, mas o iOS tem limitações conhecidas com
 * atualização de service worker em apps instalados na tela de início
 * (timers de fundo são suspensos, o app raramente "recarrega" de verdade).
 * Por isso também expomos `checkForUpdate()`, usado por um botão manual em
 * Programa como rede de segurança quando o automático não dispara sozinho.
 */

let currentRegistration: ServiceWorkerRegistration | null = null

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return

  const swUrl = `${import.meta.env.BASE_URL}sw.js`

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(swUrl, { updateViaCache: 'none' })
      .then((registration) => {
        currentRegistration = registration
        registration.update()
        setInterval(() => registration.update(), 60 * 1000)
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') registration.update()
        })
      })
      .catch((err) => console.error('Falha ao registrar service worker', err))
  })

  let reloading = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return
    reloading = true
    window.location.reload()
  })
}

export type UpdateCheckResult = 'updated' | 'up-to-date' | 'unsupported' | 'error'

/** Força uma verificação de atualização agora. Se encontrar uma versão nova, a
 * página recarrega sozinha em seguida (via o listener de controllerchange acima). */
export async function checkForUpdate(): Promise<UpdateCheckResult> {
  if (!('serviceWorker' in navigator)) return 'unsupported'
  try {
    const registration = currentRegistration ?? (await navigator.serviceWorker.getRegistration())
    if (!registration) return 'unsupported'

    let found = false
    const onUpdateFound = () => {
      found = true
    }
    registration.addEventListener('updatefound', onUpdateFound)

    await registration.update()
    await new Promise((resolve) => setTimeout(resolve, 2000))

    registration.removeEventListener('updatefound', onUpdateFound)
    return found ? 'updated' : 'up-to-date'
  } catch {
    return 'error'
  }
}
