import { useState } from 'react'
import { getBills, saveVerdict, getVerdictCounts } from './data/data.js'
import Review from './views/Review.jsx'
import Graduation from './views/Graduation.jsx'
import Live from './views/Live.jsx'

const VIEWS = ['review', 'graduation', 'live']

export default function App() {
  const [view, setView] = useState('review')
  const [bills, setBills] = useState(() => getBills())

  function handleVerdict(billId, verdict) {
    setBills((prev) => saveVerdict(prev, billId, verdict))
  }

  const counts = getVerdictCounts(bills)

  return (
    <div>
      <nav style={{ display: 'flex', gap: 8, padding: 12 }}>
        {VIEWS.map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{ fontWeight: view === v ? 'bold' : 'normal' }}
          >
            {v}
          </button>
        ))}
      </nav>

      {view === 'review' && (
        <Review bills={bills} onVerdict={handleVerdict} counts={counts} />
      )}
      {view === 'graduation' && (
        <Graduation bills={bills} counts={counts} />
      )}
      {view === 'live' && (
        <Live bills={bills} counts={counts} />
      )}

      <footer style={{ padding: 12, borderTop: '1px solid #ccc' }}>
        {counts.reviewed} of {counts.total} reviewed — {counts.remaining} remaining
      </footer>
    </div>
  )
}
