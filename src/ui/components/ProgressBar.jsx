function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export default function ProgressBar({ label, current, target, color = 'emerald' }) {
  const pct     = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0
  const colorMap = {
    emerald: 'bg-emerald-400',
    blue:    'bg-blue-400',
    amber:   'bg-amber-400',
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-200">{label}</span>
        <span className="text-xs text-slate-500 money">{fmt(current)} / {fmt(target)}</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${colorMap[color]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-600">{pct}% funded</span>
        <span className="text-xs text-slate-600">{fmt(target - current)} to go</span>
      </div>
    </div>
  )
}
