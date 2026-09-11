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
 */
export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return

  const swUrl = `${import.meta.env.BASE_URL}sw.js`

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(swUrl, { updateViaCache: 'none' })
      .then((registration) => {
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
