import { Pause, Play, Calendar } from 'lucide-react'

const STATUS_STYLE = {
  'Keep':             'text-emerald-400 bg-emerald-400/10',
  'Review':           'text-amber-400  bg-amber-400/10',
  'Cancel candidate': 'text-red-400    bg-red-400/10',
}

function daysUntil(dateStr) {
  const today  = new Date('2026-07-18')
  const target = new Date(dateStr)
  const diff   = Math.round((target - today) / 86400000)
  if (diff === 0) return 'today'
  if (diff === 1) return 'tomorrow'
  return `in ${diff} days`
}

export default function SubscriptionCard({ sub, onTogglePause }) {
  return (
    <div className={`card px-4 py-3.5 flex items-center justify-between gap-4 transition-all duration-200 ${sub.paused ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-xl">{sub.emoji}</span>
        <div className="min-w-0">
          <p className={`text-sm font-medium leading-tight ${sub.paused ? 'line-through text-slate-500' : 'text-slate-100'}`}>
            {sub.merchant}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500">
            <Calendar size={10} />
            <span>Renews {daysUntil(sub.renewal)} · Jul {new Date(sub.renewal).getDate()}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLE[sub.status] || 'text-slate-400 bg-slate-800'}`}>
          {sub.paused ? 'Paused' : sub.status}
        </span>
        <span className="text-sm font-semibold text-slate-100 money">${sub.cost.toFixed(2)}</span>
        <button
          onClick={() => onTogglePause(sub.id)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-200 transition-all"
          title={sub.paused ? 'Resume' : 'Pause'}
        >
          {sub.paused ? <Play size={14} /> : <Pause size={14} />}
        </button>
      </div>
    </div>
  )
}
