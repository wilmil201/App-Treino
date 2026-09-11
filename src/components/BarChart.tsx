interface Bar {
  label: string
  value: number
}

export function BarChart({ data, color = '#38bdf8' }: { data: Bar[]; color?: string }) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-500">Sem dados ainda.</p>
  }
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="flex items-end gap-2" style={{ height: 140 }}>
      {data.map((d, i) => {
        const h = Math.max(4, (d.value / max) * 118)
        return (
          <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1">
            <span className="text-[10px] text-slate-400">{d.value >= 1000 ? `${(d.value / 1000).toFixed(1)}t` : Math.round(d.value)}</span>
            <div className="w-full rounded-t-md" style={{ height: h, backgroundColor: color }} />
            <span className="text-[10px] text-slate-500">{d.label}</span>
          </div>
        )
      })}
    </div>
  )
}
