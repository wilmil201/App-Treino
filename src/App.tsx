import { useState } from 'react'
import { BottomNav, type TabKey } from './components/BottomNav'
import { OnboardingOverlay } from './components/OnboardingOverlay'
import { DataProvider } from './context/DataContext'
import { ToastProvider } from './context/ToastContext'
import { storage } from './lib/storage'
import { RegistrarPage } from './pages/RegistrarPage'
import { PainelPage } from './pages/PainelPage'
import { JiuJitsuPage } from './pages/JiuJitsuPage'
import { ProgramaPage } from './pages/ProgramaPage'

function App() {
  const [tab, setTab] = useState<TabKey>('registrar')
  const [showOnboarding, setShowOnboarding] = useState(() => !storage.isOnboarded())

  function dismissOnboarding() {
    storage.setOnboarded()
    setShowOnboarding(false)
  }

  return (
    <DataProvider>
      <ToastProvider>
        <div className="min-h-screen bg-slate-950 text-slate-100">
          {showOnboarding && <OnboardingOverlay onDismiss={dismissOnboarding} />}
          <main className="mx-auto max-w-md px-4 pb-24 pt-[calc(env(safe-area-inset-top)+1rem)]">
            {tab === 'registrar' && <RegistrarPage />}
            {tab === 'painel' && <PainelPage />}
            {tab === 'jiujitsu' && <JiuJitsuPage />}
            {tab === 'programa' && <ProgramaPage />}
          </main>
          <BottomNav active={tab} onChange={setTab} />
        </div>
      </ToastProvider>
    </DataProvider>
  )
}

export default App
