import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

interface ToastItem {
  id: string
  message: string
  kind: 'sucesso' | 'info' | 'recorde'
}

interface ToastContextValue {
  showToast: (message: string, kind?: ToastItem['kind']) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const DURATION: Record<ToastItem['kind'], number> = { sucesso: 2600, info: 2600, recorde: 4200 }

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counter = useRef(0)

  const showToast = useCallback((message: string, kind: ToastItem['kind'] = 'sucesso') => {
    const id = `toast-${Date.now()}-${counter.current++}`
    setToasts((prev) => [...prev, { id, message, kind }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, DURATION[kind])
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto w-full max-w-sm rounded-xl px-4 py-3 text-sm font-medium shadow-lg backdrop-blur border animate-[toast-in_0.2s_ease-out] ${
              t.kind === 'sucesso'
                ? 'bg-emerald-500/95 border-emerald-400 text-white'
                : t.kind === 'recorde'
                  ? 'bg-gradient-to-r from-amber-500/95 to-amber-400/95 border-amber-300 text-slate-950'
                  : 'bg-slate-700/95 border-slate-600 text-white'
            }`}
          >
            <span className="mr-1">{t.kind === 'sucesso' ? '✓' : t.kind === 'recorde' ? '🏆' : 'ℹ'}</span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast deve ser usado dentro de ToastProvider')
  return ctx
}
