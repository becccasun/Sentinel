import { useEffect, useState } from 'react';
import Review from './screens/Review.jsx';
import Graduation from './screens/Graduation.jsx';
import Live from './screens/Live.jsx';
import Footer from './components/Footer.jsx';
import { getBills, getVerdicts, saveVerdict } from './lib/data.js';

const VIEWS = [
  { key: 'review', label: 'Review' },
  { key: 'graduation', label: 'Graduation' },
  { key: 'live', label: 'Live' },
];

export default function App() {
  const [view, setView] = useState('review');
  const [bills] = useState(() => getBills());
  const [verdicts, setVerdicts] = useState(() => getVerdicts());

  // Keep the tab title honest to the demo state.
  useEffect(() => {
    document.title = 'Agent Probation';
  }, []);

  function handleVerdict(billId, verdict) {
    const next = saveVerdict(billId, verdict);
    setVerdicts({ ...next });
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__brand">Ramp</div>
        <nav className="topbar__nav">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              className={`topbar__tab ${view === v.key ? 'topbar__tab--active' : ''}`.trim()}
              onClick={() => setView(v.key)}
            >
              {v.label}
            </button>
          ))}
        </nav>
        <div className="topbar__user">
          <span>Sarah</span>
          <span className="topbar__avatar">S</span>
        </div>
      </header>

      {view === 'review' && (
        <Review
          bills={bills}
          verdicts={verdicts}
          onVerdict={handleVerdict}
          onContinue={() => setView('graduation')}
        />
      )}
      {view === 'graduation' && (
        <Graduation bills={bills} verdicts={verdicts} onConfirm={() => setView('live')} />
      )}
      {view === 'live' && <Live />}

      <Footer />
    </div>
  );
}
