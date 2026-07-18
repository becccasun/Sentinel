import { useState } from 'react'
import { Send, AlertTriangle, Calendar, TrendingUp } from 'lucide-react'
import { useApp } from '../../logic/state/AppContext'
import { buildLocalCheckIn, buildSnapshotForAPI } from '../../logic/agent/checkInGenerator'
import { generateCheckinText, sendSMS } from '../../logic/api/sendCheckin'
import StatCard from '../components/StatCard'
import AgentStatus from '../components/AgentStatus'
import SpendingBar from '../components/SpendingBar'
import { trailingAverages } from '../../data/mockData'

const SPENDING_CATEGORIES = ['Dining', 'Groceries', 'Shopping', 'Transport']

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function daysUntil(dateStr) {
  const diff = Math.round((new Date(dateStr) - new Date('2026-07-18')) / 86400000)
  if (diff === 0) return 'today'
  if (diff === 1) return 'tomorrow'
  return `Jul ${new Date(dateStr).getDate()}`
}

export default function Dashboard({ onNavigate }) {
  const { state, dispatch, derived } = useApp()
  const { cashBalance, creditBalance, investBalance, agentStatus, safeToSpend, byCategory, anomalyFlags, upcomingRenewals } = derived
  const [sending, setSending] = useState(false)
  const [sentToast, setSentToast] = useState(null)

  const limits = state.goals.spendingLimits
  const totalSpentDiscretionary = (byCategory['Dining'] || 0) + (byCategory['Shopping'] || 0) + (byCategory['Transport'] || 0) + (byCategory['Groceries'] || 0)

  async function handleSendCheckin() {
    setSending(true)
    setSentToast(null)
    try {
      const snapshot = buildSnapshotForAPI(state, derived)
      const { text, source } = await generateCheckinText(snapshot)
      const finalText = text || buildLocalCheckIn(state, derived)
      dispatch({ type: 'SET_CHECKIN_TEXT', text: finalText })

      const result = await sendSMS(finalText)
      setSentToast(result.simulated
        ? '📋 Check-in generated (SMS simulated — add Twilio env vars to send for real)'
        : '📱 Check-in sent to your phone!'
      )

      // Add message to chat thread
      dispatch({
        type: 'ADD_CHAT_MESSAGE',
        message: { role: 'agent', text: finalText, timestamp: new Date().toISOString() },
      })
    } finally {
      setSending(false)
      setTimeout(() => setSentToast(null), 5000)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Good Friday, Alex</h1>
          <p className="text-sm text-slate-500 mt-0.5">July 18, 2026</p>
        </div>
        <AgentStatus status={agentStatus} />
      </div>

      {/* Account cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Cash"        value={cashBalance}   variant="positive" sublabel="Chase Checking" />
        <StatCard label="Credit"      value={creditBalance} variant="negative" sublabel="Chase Freedom"  />
        <StatCard label="Investments" value={investBalance} variant="invest"   sublabel={`Robinhood · +$${state.investments.weeklyChange} this week`} badge="+2.6%" />
      </div>

      {/* Safe to Spend hero */}
      <div className="card px-6 py-6">
        <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase mb-1">Safe to Spend This Week</p>
        <div className="flex items-end gap-3 mb-3">
          <span className="text-5xl font-bold text-emerald-400 money">{fmt(safeToSpend)}</span>
          <span className="text-sm text-slate-500 mb-1.5">remaining</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              safeToSpend / limits.weeklyDiscretionaryCap < 0.25 ? 'bg-red-400' :
              safeToSpend / limits.weeklyDiscretionaryCap < 0.5  ? 'bg-amber-400' : 'bg-emerald-400'
            }`}
            style={{ width: `${Math.min(100, (safeToSpend / limits.weeklyDiscretionaryCap) * 100)}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Weekly cap: {fmt(limits.weeklyDiscretionaryCap)} · Spent so far: {fmt(totalSpentDiscretionary)}
        </p>
      </div>

      {/* Spending bars */}
      <div className="card px-5 py-5">
        <p className="section-label">Spending This Week</p>
        <div className="space-y-4">
          {SPENDING_CATEGORIES.map(cat => {
            const flag   = anomalyFlags.find(f => f.category === cat)
            const catLim = cat === 'Dining' ? limits.weeklyDiningBudget : limits.categoryLimits[cat]
            return (
              <SpendingBar
                key={cat}
                category={cat}
                spent={byCategory[cat] || 0}
                limit={catLim || 200}
                trailingAvg={trailingAverages[cat]}
                anomalyPct={flag?.pctAbove || 0}
              />
            )
          })}
        </div>
      </div>

      {/* Anomaly flags */}
      {anomalyFlags.length > 0 && (
        <div className="card px-5 py-4 border-amber-400/20">
          <p className="section-label flex items-center gap-1.5"><AlertTriangle size={12} className="text-amber-400" />Anomaly Flags</p>
          <div className="space-y-2">
            {anomalyFlags.map(f => (
              <div key={f.category} className="flex flex-col gap-0.5">
                <p className="text-sm text-slate-200">
                  <span className="text-amber-400 font-medium">{f.category}</span> is {f.pctAbove}% above your trailing 4-week average
                </p>
                <p className="text-xs text-slate-500">
                  Flagged because {f.category} ({fmt(f.spent)}) exceeds your trailing avg ({fmt(f.avg)}) by &gt;
                  {state.goals.notificationSettings.anomalySensitivity === 'high' ? '20' : state.goals.notificationSettings.anomalySensitivity === 'medium' ? '40' : '75'}%
                  · {state.goals.notificationSettings.anomalySensitivity} sensitivity
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming renewals */}
      {upcomingRenewals.length > 0 && (
        <div className="card px-5 py-4">
          <p className="section-label flex items-center gap-1.5"><Calendar size={12} />Upcoming Renewals</p>
          <div className="space-y-2.5">
            {upcomingRenewals.map(s => (
              <div key={s.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{s.emoji}</span>
                  <div>
                    <span className="text-sm text-slate-200">{s.merchant}</span>
                    <span className="text-xs text-slate-500 ml-2">· {daysUntil(s.renewal)}</span>
                  </div>
                </div>
                <span className="text-sm font-medium text-slate-300 money">${s.cost.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Investment snapshot */}
      <div className="card px-5 py-4">
        <p className="section-label flex items-center gap-1.5"><TrendingUp size={12} />Investment Snapshot</p>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">Portfolio this week</span>
          <span className="text-sm font-semibold text-emerald-400 money">+${state.investments.weeklyChange} (+{state.investments.weeklyChangePct}%)</span>
        </div>
        <p className="text-xs text-slate-500">
          NVDA is at {state.investments.holdings[0].pct}% of portfolio — above your {state.goals.investingGuardrails.maxSingleStockExposure}% single-stock limit.
          <button className="text-blue-400 ml-1 hover:underline" onClick={() => onNavigate('investments')}>
            View holdings →
          </button>
        </p>
      </div>

      {/* Send check-in CTA */}
      <div className="space-y-2">
        <button
          onClick={handleSendCheckin}
          disabled={sending}
          className="btn-primary w-full text-base py-4"
        >
          <Send size={16} />
          {sending ? 'Generating…' : 'Send My Check-In'}
        </button>
        {sentToast && (
          <p className="text-center text-sm text-emerald-400 animate-fade-in">{sentToast}</p>
        )}
        <p className="text-center text-xs text-slate-600">
          Generates AI copy from your current data · sends via Twilio SMS
        </p>
      </div>
    </div>
  )
}
