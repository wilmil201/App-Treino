import type { ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm ${className}`}>{children}</div>
  )
}

export function Badge({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'emerald' | 'amber' | 'red' }) {
  const tones: Record<string, string> = {
    default: 'bg-slate-700 text-slate-200',
    emerald: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
    amber: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
    red: 'bg-red-500/20 text-red-300 border border-red-500/40',
  }
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-3 text-lg font-bold text-slate-100">{children}</h2>
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  type = 'button',
  className = '',
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
  className?: string
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-xl bg-emerald-500 px-4 py-3 text-center font-semibold text-slate-950 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 ${className}`}
    >
      {children}
    </button>
  )
}

export function SecondaryButton({
  children,
  onClick,
  className = '',
}: {
  children: ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-center font-semibold text-slate-200 transition active:scale-[0.98] ${className}`}
    >
      {children}
    </button>
  )
}
