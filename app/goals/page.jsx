'use client';
import { useStore } from '@/lib/store';
import Slider from '@/components/Slider';
import { fmt, fmt2, subTotal, safeToSpend, carMonthsLeft, carEta, diningSpent } from '@/lib/derive';
import { Car, Shield, Warn } from '@/lib/icons';

export default function GoalsPage() {
  const { state, setGoal } = useStore();
  const g = state.goals;
  const carPct = Math.min(100, Math.round(g.carSaved / g.carTarget * 100));
  const efPct = Math.min(100, Math.round(g.efSaved / g.efTarget * 100));
  const total = subTotal(state);

  return (
    <>
      <h1 className="page-h">Goals & guardrails</h1>
      <p className="page-sub">These are the rules the agent watches your money against. Change them and tomorrow’s report adapts.</p>

      <div className="pagebody"><h2>Long-term goals</h2></div>

      <div className="goal solar">
        <div className="g-top">
          <span className="g-ic" style={{ background: 'rgba(12,10,8,.08)', color: 'var(--ink)' }}><Car /></span>
          <span className="g-name" style={{ color: 'var(--ink)' }}>
            Car down payment
            <span className="g-eta" style={{ color: 'rgba(12,10,8,.6)' }}>At {fmt(g.carMonthly)}/mo · {carMonthsLeft(state)} months left · done {carEta(state)}</span>
          </span>
          <span className="g-amt" style={{ color: 'var(--ink)' }}>{fmt(g.carSaved)}<span style={{ color: 'rgba(12,10,8,.6)' }}>of {fmt(g.carTarget)}</span></span>
        </div>
        <div className="track"><div className="fill" style={{ width: carPct + '%' }} /></div>
        <div className="sliderq ink" style={{ marginTop: 18 }}>
          <div className="q-label" style={{ color: 'var(--ink)' }}>Monthly contribution</div>
          <Slider min={100} max={900} step={25} value={g.carMonthly} onChange={v => setGoal('carMonthly', v)} ink />
          <div className="slider-read" style={{ color: 'rgba(12,10,8,.7)' }}>
            <strong style={{ color: 'var(--ink)' }}>{fmt(g.carMonthly)}/mo</strong> hits {fmt(g.carTarget)} by <strong style={{ color: 'var(--ink)' }}>{carEta(state)}</strong>
          </div>
        </div>
      </div>

      <div className="goal">
        <div className="g-top">
          <span className="g-ic"><Shield /></span>
          <span className="g-name">Emergency fund<span className="g-eta">Apple Savings · 4.1% APY</span></span>
          <span className="g-amt">{fmt(g.efSaved)}<span>of {fmt(g.efTarget)}</span></span>
        </div>
        <div className="track"><div className="fill" style={{ width: efPct + '%' }} /></div>
        <div style={{ fontSize: '12.5px', color: 'var(--gray-500)', marginTop: 8 }}>{efPct}% funded · {fmt(g.efTarget - g.efSaved)} to go</div>
      </div>

      <div className="pagebody">
        <h2>Weekly guardrails</h2>
        <p className="desc">The agent alerts you the moment spending crosses these lines.</p>
      </div>
      <div className="panel" style={{ marginTop: 0 }}>
        <div className="p-pad">
          <div className="sliderq" style={{ marginTop: 0 }}>
            <div className="q-label">
              Weekly dining budget{' '}
              {diningSpent > g.diningBudget
                ? <span className="pill amber" style={{ marginLeft: 8 }}>currently over</span>
                : <span className="pill green" style={{ marginLeft: 8 }}>on track</span>}
            </div>
            <Slider min={75} max={400} step={25} value={g.diningBudget} onChange={v => setGoal('diningBudget', v)} />
            <div className="slider-read"><strong>{fmt(g.diningBudget)}/week</strong>. You’ve spent {fmt(diningSpent)} so far this week.</div>
          </div>
          <div className="sliderq">
            <div className="q-label">
              Monthly subscription cap{' '}
              {total > g.subCap
                ? <span className="pill amber" style={{ marginLeft: 8 }}>currently over</span>
                : <span className="pill green" style={{ marginLeft: 8 }}>on track</span>}
            </div>
            <Slider min={50} max={300} step={10} value={g.subCap} onChange={v => setGoal('subCap', v)} />
            <div className="slider-read"><strong>{fmt(g.subCap)}/month</strong>. Active subscriptions total {fmt2(total)}.</div>
          </div>
          <div className="sliderq">
            <div className="q-label">Weekly safe-to-spend target</div>
            <Slider min={200} max={900} step={25} value={g.safeTarget} onChange={v => setGoal('safeTarget', v)} />
            <div className="slider-read"><strong>{fmt(g.safeTarget)}/week</strong>. After overages and renewals, that’s <strong>{fmt(safeToSpend(state))}</strong> right now.</div>
          </div>
        </div>
      </div>

      <div className="pagebody"><h2>Portfolio guardrail</h2></div>
      <div className="panel" style={{ marginTop: 0 }}>
        <div className="p-pad">
          <div className="finding" style={{ padding: 0 }}>
            <span className="f-ic"><Warn /></span>
            <span>
              <strong>Max single-theme exposure: {g.aiCap}%.</strong> AI holdings (NVDA + related) are at <strong>{state.portfolio.aiExposure}%</strong> of your portfolio.
              The agent will keep flagging this in your report. It never gives buy/sell advice, it just tells you when you’ve drifted from your own rule.
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
