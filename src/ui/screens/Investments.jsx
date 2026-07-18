import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { useApp } from '../../logic/state/AppContext'

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

const TYPE_COLOR = {
  AI:    'text-purple-400 bg-purple-400/10',
  Index: 'text-blue-400   bg-blue-400/10',
  Tech:  'text-sky-400    bg-sky-400/10',
  Cash:  'text-slate-400  bg-slate-800',
}

export default function Investments() {
  const { state } = useApp()
  const { investments, goals } = state
  const inv = goals.investingGuardrails

  const aiExposure = investments.holdings.filter(h => h.type === 'AI').reduce((s, h) => s + h.pct, 0)
  const topHolder  = investments.holdings[0]

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100 flex items-center gap-2">
          <TrendingUp size={22} className="text-blue-400" /> Investments
        </h1>
        <p className="text-sm text-slate-500 mt-1">Robinhood portfolio snapshot. No buy/sell advice.</p>
      </div>

      {/* Portfolio value hero */}
      <div className="card px-6 py-6">
        <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase mb-1">Portfolio Value</p>
        <div className="flex items-end gap-3 mb-1">
          <span className="text-5xl font-bold text-slate-100 money">{fmt(investments.totalValue)}</span>
          <div className="flex items-center gap-1 mb-2 text-emerald-400">
            <TrendingUp size={16} />
            <span className="text-sm font-semibold">+{fmt(investments.weeklyChange)} this week</span>
            <span className="text-sm">({investments.weeklyChangePct}%)</span>
          </div>
        </div>
      </div>

      {/* Concentration flags */}
      {(topHolder.pct > inv.maxSingleStockExposure || aiExposure > inv.maxThemeExposure.pct) && (
        <div className="card px-5 py-4 border-amber-400/20">
          <p className="section-label flex items-center gap-1.5">
            <AlertTriangle size={12} className="text-amber-400" /> Concentration Flags
          </p>
          <div className="space-y-3">
            {topHolder.pct > inv.maxSingleStockExposure && (
              <div className="flex items-start gap-2">
                <AlertTriangle size={14} className="text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-slate-200">
                    <span className="text-amber-400 font-medium">{topHolder.ticker}</span> is {topHolder.pct}% of portfolio — above your {inv.maxSingleStockExposure}% single-stock limit
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Single-name concentration adds idiosyncratic risk. Consider diversifying {(topHolder.pct - inv.maxSingleStockExposure).toFixed(1)}pp.
                  </p>
                </div>
              </div>
            )}
            {aiExposure > inv.maxThemeExposure.pct && (
              <div className="flex items-start gap-2">
                <AlertTriangle size={14} className="text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-slate-200">
                    <span className="text-amber-400 font-medium">AI exposure</span> is {aiExposure.toFixed(1)}% — above your {inv.maxThemeExposure.pct}% theme limit
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">Sector/theme concentration is driven by NVDA.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Holdings list */}
      <div className="card px-5 py-5">
        <p className="section-label">Holdings</p>
        <div className="space-y-3">
          {investments.holdings.map(h => (
            <div key={h.ticker}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-100">{h.ticker}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${TYPE_COLOR[h.type]}`}>{h.type}</span>
                    </div>
                    <p className="text-xs text-slate-500">{h.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-100 money">{fmt(h.value)}</p>
                  <div className="flex items-center gap-1 justify-end">
                    {h.weeklyChange > 0 ? (
                      <span className="text-xs text-emerald-400 flex items-center gap-0.5">
                        <TrendingUp size={10} />+{fmt(h.weeklyChange)}
                      </span>
                    ) : h.weeklyChange < 0 ? (
                      <span className="text-xs text-red-400 flex items-center gap-0.5">
                        <TrendingDown size={10} />{fmt(h.weeklyChange)}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-600">—</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      h.pct > inv.maxSingleStockExposure ? 'bg-amber-400' : 'bg-blue-400'
                    }`}
                    style={{ width: `${h.pct}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-10 text-right money">{h.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-600 text-center pb-2">
        This is an informational snapshot only — not investment advice.
      </p>
    </div>
  )
}
