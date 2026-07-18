const CATEGORY_EMOJI = {
  Dining:        '🍽️',
  Groceries:     '🛒',
  Shopping:      '🛍️',
  Transport:     '🚗',
  Subscriptions: '📱',
  Investing:     '📈',
}

function barColor(pct) {
  if (pct >= 100) return 'bg-red-500'
  if (pct >= 70)  return 'bg-amber-400'
  return 'bg-emerald-400'
}

function fmt(n) {
  return `$${Math.round(n)}`
}

export default function SpendingBar({ category, spent, limit, trailingAvg, anomalyPct }) {
  const pct     = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 100) : 0
  const overPct = limit > 0 ? Math.round((spent / limit) * 100) : 0
  const color   = barColor(overPct)

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{CATEGORY_EMOJI[category] || '💰'}</span>
          <span className="text-sm font-medium text-slate-200">{category}</span>
          {anomalyPct > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-400 font-medium">
              +{anomalyPct}% vs avg
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 money">
          <span className={`text-sm font-semibold ${overPct >= 100 ? 'text-red-400' : overPct >= 70 ? 'text-amber-400' : 'text-slate-200'}`}>
            {fmt(spent)}
          </span>
          <span className="text-xs text-slate-600">/ {fmt(limit)}</span>
        </div>
      </div>

      {/* Bar track */}
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Over-limit overflow indicator */}
      {overPct > 100 && (
        <p className="text-xs text-red-400">Over limit by {fmt(spent - limit)}</p>
      )}
    </div>
  )
}
