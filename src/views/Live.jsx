export default function Live() {
  return (
    <main className="page live-page">
      <section className="live-header">
        <div><span className="eyebrow"><i className="live-dot" /> Live · Day 3</span><h1>AP Agent</h1><p className="lede">Routine bills are moving. Exceptions come to you.</p></div>
        <div className="live-status"><span className="status-dot" /> Limited authority active</div>
      </section>
      <section className="cap-card">
        <div><span className="eyebrow">Today’s exposure</span><strong><em>$340</em> of $500</strong><div className="meter"><i /></div><p>$160 remaining before new bills escalate.</p></div>
        <div className="cap-summary"><div><strong>12</strong><span>auto-approved</span></div><div><strong>2</strong><span>escalated</span></div></div>
      </section>
      <section className="audit-card"><span className="check">✓</span><div><small>Latest action · 10:42 AM</small><h2>Adobe · $28.00</h2><p>Approved by AP Agent <b>(via Sarah)</b></p></div><span className="audit-status">Auto-approved</span></section>
      <p className="live-footnote">The agent has authority only under the limits you set.</p>
    </main>
  )
}
