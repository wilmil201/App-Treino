# Treino & Jiu-Jitsu

PWA mobile-first para registrar treino de força (bloco agachamento/supino/terra) e jiu-jitsu, 100% offline. Todos os dados ficam salvos apenas no navegador do aparelho (localStorage) — sem backend, sem login, sem serviço externo.

## Publicação (GitHub Pages)

Este repositório já vem com um workflow (`.github/workflows/deploy-pages.yml`) que builda e publica automaticamente no GitHub Pages a cada push na branch `main`.

**Configuração única (uma vez só):**

1. No GitHub, vá em **Settings → Pages**
2. Em "Build and deployment" → "Source", selecione **GitHub Actions**
3. Pronto — o próximo push já publica em `https://<usuário>.github.io/<repositório>/`

## Desenvolvimento local

```bash
npm install
npm run dev       # servidor de desenvolvimento
npm run build     # build de produção em dist/
npm run preview   # servir o build localmente
```

## Instalar no celular

Depois de publicado, abra a URL do GitHub Pages no navegador do celular (Chrome/Android ou Safari/iOS) e toque em "Adicionar à Tela de Início".
