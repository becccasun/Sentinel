function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.abs(n))
}

export default function StatCard({ label, value, sublabel, variant = 'neutral', badge }) {
  const colorMap = {
    positive: 'text-emerald-400',
    negative: 'text-red-400',
    invest:   'text-blue-400',
    neutral:  'text-slate-100',
  }
  const prefixMap = {
    positive: '',
    negative: '-',
    invest:   '',
    neutral:  '',
  }

  return (
    <div className="card px-5 py-4 flex flex-col gap-1 animate-fade-in">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>
        {badge && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">{badge}</span>
        )}
      </div>
      <span className={`text-2xl font-semibold money ${colorMap[variant]}`}>
        {prefixMap[variant]}{fmt(value)}
      </span>
      {sublabel && <span className="text-xs text-slate-500">{sublabel}</span>}
    </div>
  )
}
