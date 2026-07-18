import { useState } from 'react'
import { suggestedSettings } from '../data/analysis.js'

const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)

export default function Graduation({ bills, onConfirm }) {
  const suggested = suggestedSettings(bills)
  const [threshold, setThreshold] = useState(suggested.threshold)
  const [cap, setCap] = useState(suggested.dailyCap)

  return (
    <main className="page graduation-page">
      <section className="hero compact-hero">
        <span className="eyebrow">Probation review complete</span>
        <h1>Set the leash.</h1>
        <p className="lede">You are granting limited authority — with exposure capped before each approval.</p>
      </section>

      <section className="settings-card">
        <div className="setting">
          <div className="setting-label"><span className="setting-number">01</span><div><h2>Auto-approve under</h2><p>{suggested.evidence.threshold}</p></div></div>
          <label className="money-input"><span>$</span><input aria-label="Auto-approve threshold" type="number" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} /></label>
        </div>
        <div className="setting">
          <div className="setting-label"><span className="setting-number">02</span><div><h2>Daily exposure cap</h2><p>{suggested.evidence.dailyCap}</p></div></div>
          <label className="money-input"><span>$</span><input aria-label="Daily exposure cap" type="number" value={cap} onChange={(e) => setCap(Number(e.target.value))} /></label>
        </div>
        <div className="setting escalation-setting">
          <div className="setting-label"><span className="setting-number">03</span><div><h2>Always escalate</h2><p>These cases will still reach a person.</p></div></div>
          <div className="rule-list">{suggested.escalationRules.map((rule) => <span key={rule}><i>✓</i>{rule}</span>)}</div>
        </div>
      </section>

      <aside className="enforcement-note"><strong>How the cap works</strong><span>Before each auto-approval, we check today’s total + bill ≤ {money(cap)}. Otherwise, it escalates.</span></aside>
      <button className="confirm-button" onClick={onConfirm}>Confirm limited authority <span>→</span></button>
      <p className="fine-print">You can change these controls any time. The agent cannot exceed this authority.</p>
    </main>
  )
}
