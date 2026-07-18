import { useState } from 'react'
import { getBills, saveVerdict } from './data/data.js'
import Review from './views/Review.jsx'
import Graduation from './views/Graduation.jsx'
import Live from './views/Live.jsx'
import './styles.css'

export default function App() {
  const [view, setView] = useState('review')
  const [bills, setBills] = useState(() => getBills())

  function handleVerdict(billId, verdict) {
    setBills((prev) => saveVerdict(prev, billId, verdict))
  }

  const disagreements = bills.filter((bill) =>
    !((bill.human_decision === 'approved' && bill.agent_proposal === 'approve') ||
      (bill.human_decision === 'rejected' && bill.agent_proposal === 'reject'))
  )
  const reviewedDisagreements = disagreements.filter((bill) => bill.verdict !== null).length

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">R</span> Ramp</div>
        <div className="mode-pill"><span className="status-dot" /> AP Agent · probation</div>
      </header>

      {view === 'review' && (
        <Review
          bills={bills}
          onVerdict={handleVerdict}
          reviewed={reviewedDisagreements}
          totalToReview={disagreements.length}
          onContinue={() => setView('graduation')}
        />
      )}
      {view === 'graduation' && (
        <Graduation bills={bills} onConfirm={() => setView('live')} />
      )}
      {view === 'live' && (
        <Live />
      )}
    </div>
  )
}
