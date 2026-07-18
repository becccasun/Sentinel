'use client';
import { useStore } from '@/lib/store';
import CatBar from '@/components/CatBar';
import { fmt, fmt2, weekSpent, diningSpent } from '@/lib/derive';

const CAT_PILL = {
  Dining: 'amber', Groceries: 'green', Transport: 'blue', Income: 'green',
  Investing: 'blue', Shopping: 'gray', 'Rent & utilities': 'gray',
};

export default function SpendingPage() {
  const { state } = useStore();
  const over = diningSpent > state.goals.diningBudget;
  return (
    <>
      <h1 className="page-h">Spending</h1>
      <p className="page-sub">Week of July 13 to 18 · {fmt(weekSpent(state))} across cards and checking, against your weekly budgets.</p>

      <div className="panel">
        <div className="p-head">
          <h3>By category</h3>
          <span className={`pill ${over ? 'amber' : 'green'}`}>{over ? '1 category over' : 'All under budget'}</span>
        </div>
        {state.cats.map(c => <CatBar key={c.n} c={c} />)}
      </div>

      <div className="panel">
        <div className="p-head">
          <h3>Transactions</h3>
          <span className="pill gray">{state.txs.length} this week</span>
        </div>
        {state.txs.map((t, i) => (
          <div className="tx" key={i}>
            <span className="t-date">{t.d}</span>
            <span className="t-m">{t.m}<span className="t-acct">{t.acct}</span></span>
            <span className="t-cat"><span className={`pill ${CAT_PILL[t.cat] || 'gray'}`}>{t.cat}</span></span>
            <span className={`t-amt ${t.amt > 0 ? 'pos' : ''}`}>{t.amt > 0 ? '+' : ''}{fmt2(t.amt)}</span>
          </div>
        ))}
      </div>
    </>
  );
}
