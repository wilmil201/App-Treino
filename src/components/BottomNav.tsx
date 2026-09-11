export type TabKey = 'registrar' | 'painel' | 'jiujitsu' | 'programa'

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'registrar', label: 'Registrar', icon: '📝' },
  { key: 'painel', label: 'Painel', icon: '📊' },
  { key: 'jiujitsu', label: 'Jiu-Jitsu', icon: '🥋' },
  { key: 'programa', label: 'Programa', icon: '⚙️' },
]

export function BottomNav({ active, onChange }: { active: TabKey; onChange: (tab: TabKey) => void }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-slate-900/95 backdrop-blur safe-bottom"
      aria-label="Navegação principal"
    >
      <div className="mx-auto grid max-w-md grid-cols-4">
        {TABS.map((tab) => {
          const isActive = tab.key === active
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
                isActive ? 'text-emerald-400' : 'text-slate-400'
              }`}
            >
              <span className="text-xl leading-none" aria-hidden="true">
                {tab.icon}
              </span>
              {tab.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
