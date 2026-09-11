import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Em GitHub Pages o site fica em /<repo>/, não na raiz do domínio.
// O workflow de deploy define BASE_PATH; localmente cai em '/'.
const base = process.env.BASE_PATH || '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Registramos o service worker manualmente em main.tsx com updateViaCache:'none',
      // porque o script injetado automaticamente não força o navegador a ignorar o
      // cache do sw.js — e hosts como GitHub Pages cacheiam esse arquivo por vários
      // minutos, fazendo o app parecer "travado" numa versão antiga.
      injectRegister: false,
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        id: base,
        name: 'Treino & Jiu-Jitsu',
        short_name: 'Treino',
        description: 'Diário de treino de força e jiu-jitsu, 100% offline e local.',
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#0f172a',
        theme_color: '#0f172a',
        orientation: 'portrait',
        lang: 'pt-BR',
        icons: [
          {
            src: 'pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
})
