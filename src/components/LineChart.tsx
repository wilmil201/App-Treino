interface Point {
  label: string
  value: number
}

export function LineChart({ data, color = '#34d399', unit = '' }: { data: Point[]; color?: string; unit?: string }) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-500">Sem dados ainda.</p>
  }
  if (data.length === 1) {
    return (
      <div className="py-6 text-center">
        <p className="text-2xl font-bold" style={{ color }}>
          {data[0].value.toFixed(1)}
          {unit}
        </p>
        <p className="text-xs text-slate-500">{data[0].label} · registre mais sessões para ver a evolução</p>
      </div>
    )
  }

  const width = 320
  const height = 140
  const padX = 12
  const padY = 16
  const values = data.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const points = data.map((d, i) => {
    const x = padX + (i / (data.length - 1)) * (width - padX * 2)
    const y = padY + (1 - (d.value - min) / range) * (height - padY * 2)
    return { x, y, ...d }
  })

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Gráfico de evolução">
        <path d={path} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-slate-500">
        <span>{data[0].label}</span>
        <span>
          último: {data[data.length - 1].value.toFixed(1)}
          {unit}
        </span>
        <span>{data[data.length - 1].label}</span>
      </div>
    </div>
  )
}
