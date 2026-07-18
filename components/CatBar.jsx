import { fmt } from '@/lib/derive';

export default function CatBar({ c }) {
  const pct = Math.min(100, Math.round(c.spent / c.budget * 100));
  const over = c.spent > c.budget;
  return (
    <div className={`cat ${over ? 'over' : ''}`}>
      <div className="c-top">
        <span className="cn">{c.n}</span>
        <span className="cv">{fmt(c.spent)}</span>
        <span className="cb">/ {fmt(c.budget)}</span>
      </div>
      <div className="track"><div className="fill" style={{ width: pct + '%' }} /></div>
      <div className="c-note">{over ? fmt(c.spent - c.budget) + ' over budget' : fmt(c.budget - c.spent) + ' left this week'}</div>
    </div>
  );
}
