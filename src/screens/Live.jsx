import Card from '../components/Card.jsx';
import { money } from '../lib/format.js';

const USED = 340;
const CAP = 500;

const AUDIT = [
  { vendor: 'Staples', amount: 86.4, detail: 'Approved by AP Agent (via Sarah)', time: '9:14 AM' },
  { vendor: 'FreshBite Catering', amount: 142.0, detail: 'Approved by AP Agent (via Sarah)', time: '9:47 AM' },
  { vendor: 'Grainger Industrial', amount: 2900.0, detail: 'Escalated: over threshold', time: '10:02 AM' },
  { vendor: 'Cintas Uniform Services', amount: 111.75, detail: 'Approved by AP Agent (via Sarah)', time: '11:20 AM' },
];

export default function Live() {
  const pct = Math.round((USED / CAP) * 100);

  return (
    <div className="column">
      <Card>
        <div className="live-status">
          <span className="live-dot" />
          AP Agent · live in probation · Day 3
        </div>

        <div className="cap">
          <div className="cap__label">
            <strong className="tnum">{money(USED)}</strong> of{' '}
            <span className="tnum">{money(CAP)}</span> daily cap used
          </div>
          <div className="cap__track">
            <div className="cap__fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="counters">
          <div>
            <div className="counter__num">12</div>
            <div className="counter__label">auto-approved today</div>
          </div>
          <div>
            <div className="counter__num">2</div>
            <div className="counter__label">escalated to you</div>
          </div>
          <div>
            <div className="counter__num">0</div>
            <div className="counter__label">over cap</div>
          </div>
        </div>

        <div className="audit">
          <div className="audit__title">Today’s activity</div>
          {AUDIT.map((row, i) => (
            <div className="audit__row" key={i}>
              <span>{row.vendor}</span>
              <span className="audit__amount tnum">{money(row.amount)}</span>
              <span className="audit__detail">{row.detail}</span>
              <span className="audit__time">{row.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
