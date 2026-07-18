const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
})

function isAgreement(bill) {
  return (
    (bill.human_decision === 'approved' && bill.agent_proposal === 'approve') ||
    (bill.human_decision === 'rejected' && bill.agent_proposal === 'reject')
  )
}

const verdicts = [
  ['agent_right', 'Agent was right'],
  ['human_right', 'I was right'],
  ['unclear', 'Unclear'],
]

export default function Review({ bills, onVerdict, reviewed, totalToReview, onContinue }) {
  const disagreements = bills.filter((bill) => !isAgreement(bill)).sort((a, b) => b.amount - a.amount)
  const agreements = bills.length - disagreements.length

  return (
    <main className="page review-page">
      <section className="hero">
        <span className="eyebrow">Two-week shadow mode complete</span>
        <h1>Review the record.<br /><em>Then set the leash.</em></h1>
        <p className="lede">Your AP Agent watched silently. Nothing was approved or changed.</p>
        <div className="stats-row">
          <div><strong>200</strong><span>shadow decisions</span></div>
          <div><strong>187</strong><span>matched you</span></div>
          <div className="attention-stat"><strong>13</strong><span>need review</span></div>
          <div><strong>$0</strong><span>at risk</span></div>
        </div>
      </section>

      <section className="agreement-row">
        <span className="check">✓</span>
        <span><strong>{agreements} agreements</strong> — decisions where you and the agent matched</span>
        <span className="collapse-mark">⌄</span>
      </section>

      <section className="review-list" aria-label="Decisions requiring review">
        <div className="section-heading"><span>Disagreements</span><small>Highest amount first</small></div>
        {disagreements.map((bill) => (
          <article className={`decision-card ${bill.verdict ? `settled ${bill.verdict}` : ''}`} key={bill.bill_id}>
            <div className="decision-topline">
              <div><h2>{bill.vendor}</h2><span className="date">{bill.date}</span></div>
              <strong className="amount">{currency.format(bill.amount)}</strong>
            </div>
            <div className="decision-compare">
              <span>You <b>{bill.human_decision}</b></span>
              <span className="arrow">→</span>
              <span>Agent would <b>{bill.agent_proposal}</b></span>
            </div>
            <p className="reasoning">{bill.agent_reasoning}</p>
            <div className="verdict-actions">
              {verdicts.map(([value, label]) => (
                <button
                  className={`verdict-button ${bill.verdict === value ? 'selected' : ''}`}
                  key={value}
                  onClick={() => onVerdict(bill.bill_id, value)}
                >{label}</button>
              ))}
            </div>
          </article>
        ))}
      </section>

      <footer className="review-footer">
        <span><strong>{reviewed} of {totalToReview}</strong> reviewed</span>
        <button className="primary-button" disabled={reviewed !== totalToReview} onClick={onContinue}>
          Continue <span>→</span>
        </button>
      </footer>
    </main>
  )
}
