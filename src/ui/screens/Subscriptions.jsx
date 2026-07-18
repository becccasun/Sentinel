import { CreditCard, TrendingDown } from 'lucide-react'
import { useApp } from '../../logic/state/AppContext'
import SubscriptionCard from '../components/SubscriptionCard'

export default function Subscriptions() {
  const { state, dispatch } = useApp()
  const { subscriptions, goals } = state

  const active    = subscriptions.filter(s => !s.paused)
  const paused    = subscriptions.filter(s => s.paused)
  const total     = active.reduce((s, x) => s + x.cost, 0)
  const capPct    = Math.round((total / goals.subscriptionRules.monthlyCap) * 100)
  const cancelable = subscriptions.filter(s => s.status === 'Cancel candidate').reduce((s, x) => s + x.cost, 0)

  function handleToggle(id) {
    dispatch({ type: 'PAUSE_SUBSCRIPTION', id })
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100 flex items-center gap-2">
          <CreditCard size={22} className="text-blue-400" /> Subscriptions
        </h1>
        <p className="text-sm text-slate-500 mt-1">Monthly recurring charges, renewal dates, and recommendations.</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card px-4 py-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Monthly total</p>
          <p className="text-2xl font-semibold text-slate-100 money">${total.toFixed(2)}</p>
          <p className="text-xs text-slate-500 mt-1">{capPct}% of ${goals.subscriptionRules.monthlyCap} cap</p>
        </div>
        <div className="card px-4 py-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Active</p>
          <p className="text-2xl font-semibold text-slate-100">{active.length}</p>
          <p className="text-xs text-slate-500 mt-1">{paused.length} paused</p>
        </div>
        <div className="card px-4 py-4 border-red-400/20">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
            <TrendingDown size={10} className="text-red-400" /> Cancelable
          </p>
          <p className="text-2xl font-semibold text-red-400 money">${cancelable.toFixed(2)}</p>
          <p className="text-xs text-slate-500 mt-1">per month saved</p>
        </div>
      </div>

      {/* Monthly cap bar */}
      <div className="card px-5 py-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-slate-400">Monthly subscription budget</span>
          <span className="text-sm font-medium text-slate-200 money">${total.toFixed(2)} / ${goals.subscriptionRules.monthlyCap}</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              capPct >= 100 ? 'bg-red-500' : capPct >= 70 ? 'bg-amber-400' : 'bg-emerald-400'
            }`}
            style={{ width: `${Math.min(100, capPct)}%` }}
          />
        </div>
      </div>

      {/* Active subscriptions */}
      <div>
        <p className="section-label">Active</p>
        <div className="space-y-2">
          {active.map(sub => (
            <SubscriptionCard key={sub.id} sub={sub} onTogglePause={handleToggle} />
          ))}
        </div>
      </div>

      {/* Paused subscriptions */}
      {paused.length > 0 && (
        <div>
          <p className="section-label">Paused</p>
          <div className="space-y-2">
            {paused.map(sub => (
              <SubscriptionCard key={sub.id} sub={sub} onTogglePause={handleToggle} />
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-slate-600 text-center pb-2">
        Renewal dates and AI recommendations update automatically.
        Pause to skip the next billing cycle.
      </p>
    </div>
  )
}
