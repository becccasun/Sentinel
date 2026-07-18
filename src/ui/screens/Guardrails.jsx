import { Shield, AlertTriangle } from 'lucide-react'
import { useApp } from '../../logic/state/AppContext'
import AgentStatus from '../components/AgentStatus'
import NumberInput from '../components/NumberInput'
import ToggleSwitch from '../components/ToggleSwitch'
import ProgressBar from '../components/ProgressBar'

const SENSITIVITY_OPTIONS = [
  { value: 'low',    label: 'Low',    desc: 'Only alert on big swings (>75% above avg)' },
  { value: 'medium', label: 'Medium', desc: 'Default — flag at 40% above avg'           },
  { value: 'high',   label: 'High',   desc: 'Sensitive — flag at 20% above avg'         },
]

const CADENCE_OPTIONS = [
  { value: 'daily',    label: 'Daily'   },
  { value: '2x_week',  label: '2x/Week' },
  { value: 'weekly',   label: 'Weekly'  },
]

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function SectionCard({ title, children }) {
  return (
    <div className="card px-5 py-5">
      <p className="section-label">{title}</p>
      <div className="space-y-5">{children}</div>
    </div>
  )
}

function Divider() {
  return <div className="border-t border-slate-800" />
}

export default function Guardrails() {
  const { state, dispatch, derived } = useApp()
  const { goals, investments } = state
  const { agentStatus, byCategory } = derived

  const lim = goals.spendingLimits
  const sub = goals.subscriptionRules
  const inv = goals.investingGuardrails
  const notif = goals.notificationSettings

  const totalMonthlySubscriptions = state.subscriptions.filter(s => !s.paused).reduce((s, x) => s + x.cost, 0)
  const nvdaPct = investments.holdings[0].pct
  const aiPct   = investments.holdings.filter(h => h.type === 'AI').reduce((s, h) => s + h.pct, 0)

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100 flex items-center gap-2">
            <Shield size={22} className="text-emerald-400" /> Guardrails
          </h1>
          <p className="text-sm text-slate-500 mt-1">Rules for your agent. Change one — watch the dashboard respond.</p>
        </div>
        <AgentStatus status={agentStatus} />
      </div>

      {/* ── Spending Limits ────────────────────────────────────────────────── */}
      <SectionCard title="Spending Limits">
        <div className="space-y-2">
          <NumberInput
            label="Weekly dining budget"
            description={`$${Math.round(byCategory['Dining'] || 0)} spent so far · ${Math.round(((byCategory['Dining'] || 0) / lim.weeklyDiningBudget) * 100)}% used`}
            value={lim.weeklyDiningBudget}
            onChange={v => dispatch({ type: 'SET_DINING_BUDGET', value: v })}
            step={25} min={0} max={500}
          />
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                (byCategory['Dining'] || 0) / lim.weeklyDiningBudget >= 1 ? 'bg-red-500' :
                (byCategory['Dining'] || 0) / lim.weeklyDiningBudget >= 0.7 ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, ((byCategory['Dining'] || 0) / lim.weeklyDiningBudget) * 100)}%` }}
            />
          </div>
        </div>

        <Divider />

        <div className="space-y-2">
          <NumberInput
            label="Weekly discretionary cap"
            description="Dining + groceries + shopping + transport"
            value={lim.weeklyDiscretionaryCap}
            onChange={v => dispatch({ type: 'SET_WEEKLY_CAP', value: v })}
            step={50} min={100} max={2000}
          />
        </div>

        <Divider />

        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category limits</p>
          {Object.entries(lim.categoryLimits).map(([cat, val]) => (
            <NumberInput
              key={cat}
              label={cat}
              value={val}
              onChange={v => dispatch({ type: 'SET_CATEGORY_LIMIT', category: cat, value: v })}
              step={25} min={0} max={1000}
            />
          ))}
        </div>
      </SectionCard>

      {/* ── Subscription Rules ─────────────────────────────────────────────── */}
      <SectionCard title="Subscription Rules">
        <div className="space-y-2">
          <NumberInput
            label="Monthly cap"
            description={`${fmt(totalMonthlySubscriptions)} active · ${Math.round((totalMonthlySubscriptions / sub.monthlyCap) * 100)}% of cap`}
            value={sub.monthlyCap}
            onChange={v => dispatch({ type: 'SET_SUBSCRIPTION_CAP', value: v })}
            step={10} min={0} max={500}
          />
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                totalMonthlySubscriptions / sub.monthlyCap >= 1 ? 'bg-red-500' :
                totalMonthlySubscriptions / sub.monthlyCap >= 0.7 ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, (totalMonthlySubscriptions / sub.monthlyCap) * 100)}%` }}
            />
          </div>
        </div>

        <Divider />

        <ToggleSwitch
          label={`Flag unused subscriptions after ${sub.unusedFlagDays} days`}
          description="Agent will mark subscriptions as 'Review' if not recently used"
          checked={sub.flagUnused}
          onChange={v => dispatch({ type: 'TOGGLE_UNUSED_FLAG', value: v })}
        />
      </SectionCard>

      {/* ── Investing Guardrails ───────────────────────────────────────────── */}
      <SectionCard title="Investing Guardrails">
        <div className="space-y-2">
          <NumberInput
            label="Max single-stock exposure"
            description={`NVDA is at ${nvdaPct}%${nvdaPct > inv.maxSingleStockExposure ? ' — over limit' : ' — within limit'}`}
            value={inv.maxSingleStockExposure}
            onChange={v => dispatch({ type: 'SET_MAX_SINGLE_STOCK', value: v })}
            step={5} min={5} max={100} prefix="" suffix="%"
          />
          {nvdaPct > inv.maxSingleStockExposure && (
            <div className="flex items-center gap-1.5 text-xs text-amber-400">
              <AlertTriangle size={12} />
              <span>NVDA at {nvdaPct}% — {(nvdaPct - inv.maxSingleStockExposure).toFixed(1)}% over your limit</span>
            </div>
          )}
        </div>

        <Divider />

        <div className="space-y-2">
          <NumberInput
            label={`Max ${inv.maxThemeExposure.label} exposure`}
            description={`Currently ${aiPct.toFixed(1)}% in AI names (NVDA)`}
            value={inv.maxThemeExposure.pct}
            onChange={v => dispatch({ type: 'SET_MAX_THEME_PCT', value: v })}
            step={5} min={5} max={100} prefix="" suffix="%"
          />
          {aiPct > inv.maxThemeExposure.pct && (
            <div className="flex items-center gap-1.5 text-xs text-amber-400">
              <AlertTriangle size={12} />
              <span>AI exposure at {aiPct.toFixed(1)}% — above your {inv.maxThemeExposure.pct}% target</span>
            </div>
          )}
        </div>
      </SectionCard>

      {/* ── Savings Goals ──────────────────────────────────────────────────── */}
      <SectionCard title="Savings Goals">
        {goals.savingsGoals.map((goal, i) => (
          <div key={goal.id}>
            {i > 0 && <Divider />}
            <div className={i > 0 ? 'pt-4' : ''}>
              <ProgressBar
                label={goal.name}
                current={goal.current}
                target={goal.target}
                color={i === 0 ? 'emerald' : 'blue'}
              />
            </div>
          </div>
        ))}
      </SectionCard>

      {/* ── Notification Controls ──────────────────────────────────────────── */}
      <SectionCard title="Notification Controls">
        {/* Cadence */}
        <div>
          <p className="text-sm font-medium text-slate-200 mb-2">Check-in cadence</p>
          <div className="flex gap-2">
            {CADENCE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => dispatch({ type: 'SET_CADENCE', value: opt.value })}
                className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all duration-150 ${
                  notif.cadence === opt.value
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <Divider />

        {/* Anomaly sensitivity */}
        <div>
          <p className="text-sm font-medium text-slate-200 mb-1">Anomaly sensitivity</p>
          <p className="text-xs text-slate-500 mb-3">Controls what triggers an unscheduled check-in</p>
          <div className="space-y-2">
            {SENSITIVITY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => dispatch({ type: 'SET_ANOMALY_SENSITIVITY', value: opt.value })}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all duration-150 ${
                  notif.anomalySensitivity === opt.value
                    ? 'bg-emerald-500/10 border-emerald-500/40'
                    : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  notif.anomalySensitivity === opt.value
                    ? 'border-emerald-400 bg-emerald-400'
                    : 'border-slate-600'
                }`}>
                  {notif.anomalySensitivity === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                </div>
                <div>
                  <p className={`text-sm font-medium ${notif.anomalySensitivity === opt.value ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-slate-500">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <Divider />

        {/* Quiet hours */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-200">Quiet hours</p>
            <p className="text-xs text-slate-500 mt-0.5">No texts during this window</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="time"
              value={notif.quietHours.start.replace(':', ':')}
              onChange={e => dispatch({ type: 'SET_QUIET_HOURS', value: { ...notif.quietHours, start: e.target.value } })}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
            <span className="text-slate-500">—</span>
            <input
              type="time"
              value={notif.quietHours.end.replace(':', ':')}
              onChange={e => dispatch({ type: 'SET_QUIET_HOURS', value: { ...notif.quietHours, end: e.target.value } })}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <Divider />

        <ToggleSwitch
          label="SMS notifications"
          description="Receive check-ins via text message"
          checked={notif.channels.sms}
          onChange={v => dispatch({ type: 'TOGGLE_SMS', value: v })}
        />
      </SectionCard>
    </div>
  )
}
