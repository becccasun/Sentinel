'use client';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import Finding from '@/components/Finding';
import CatBar from '@/components/CatBar';
import {
  fmt, fmt2, cash, cardDebt, subTotal, safeToSpend, buildReport,
  diningDeltaPct, flaggedSubs, carEta, carMonthsLeft,
} from '@/lib/derive';

function GoalMini({ name, saved, target, eta }) {
  const pct = Math.min(100, Math.round(saved / target * 100));
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
        <strong>{name}</strong>
        <span style={{ color: 'var(--gray-500)' }}>{fmt(saved)} / {fmt(target)}</span>
      </div>
      <div className="mini-track"><div className="mini-fill" style={{ width: pct + '%' }} /></div>
      <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 5 }}>{pct}% · {eta}</div>
    </div>
  );
}

export default function Overview() {
  const { state } = useStore();
  const r = buildReport(state);
  const d = diningDeltaPct(state);
  const total = subTotal(state);
  const flagged = flaggedSubs(state);
  const rh = state.accounts.find(a => a.id === 'rh');

  return (
    <>
      <h1 className="page-h">Morning, Alex.</h1>
      <p className="page-sub">
        {d > 0
          ? <>Everything looks stable. One thing needs your attention: dining is pacing <strong>{d}% above budget</strong> this week.</>
          : <>All clear. Every budget is on pace this week.</>}
      </p>

      <div className="statgrid">
        <div className="statcard solar">
          <div className="sl">Safe to spend before Friday</div>
          <div className="sv">{fmt(safeToSpend(state))}</div>
          <div className="sd">After budgets, renewals & goals</div>
        </div>
        <div className="statcard">
          <div className="sl">Total cash</div>
          <div className="sv">{fmt(cash(state))}</div>
          <div className="sd up">Across 2 accounts</div>
        </div>
        <div className="statcard">
          <div className="sl">Card balances</div>
          <div className="sv">{fmt(cardDebt(state))}</div>
          <div className="sd">Autopay Jul 28</div>
        </div>
        <div className="statcard">
          <div className="sl">Investments</div>
          <div className="sv">{fmt(rh.bal)}</div>
          <div className="sd up">+{fmt(state.portfolio.weekChange)} ({state.portfolio.weekPct}%) this week</div>
        </div>
        <div className="statcard">
          <div className="sl">Subscriptions</div>
          <div className="sv">{fmt2(total)}<span style={{ fontSize: 14, color: 'var(--gray-500)' }}>/mo</span></div>
          <div className={`sd ${total > state.goals.subCap ? 'warn' : ''}`}>
            {total > state.goals.subCap ? `Over your ${fmt(state.goals.subCap)} cap` : `Under your ${fmt(state.goals.subCap)} cap`}
          </div>
        </div>
        <div className="statcard dark">
          <div className="sl">Agent status</div>
          <div className="sv" style={{ fontSize: 19 }}>Watch mode</div>
          <div className="sd">Next report tomorrow, {state.reportTime}</div>
        </div>
      </div>

      <div className="panel">
        <div className="p-head">
          <h3>Today’s findings</h3>
          <Link className="see" href="/report">Open daily report</Link>
        </div>
        <div className="p-pad" style={{ paddingTop: 12 }}>
          {r.shortTerm.map((f, i) => <Finding key={i} ic={f.ic} html={f.text} />)}
          {flagged.length > 0 && (
            <Finding ic="warn" html={`<strong>${flagged.map(x => x.name).join(' and ')}</strong> look${flagged.length === 1 ? 's' : ''} unused. Flagged in today’s report.`} />
          )}
        </div>
      </div>

      <div className="two-col" style={{ marginTop: 14 }}>
        <div className="panel" style={{ marginTop: 0 }}>
          <div className="p-head">
            <h3>Spending this week</h3>
            <Link className="see" href="/spending">Details</Link>
          </div>
          {state.cats.filter(c => ['Dining', 'Groceries', 'Transport', 'Shopping'].includes(c.n)).map(c => <CatBar key={c.n} c={c} />)}
        </div>
        <div className="panel" style={{ marginTop: 0 }}>
          <div className="p-head">
            <h3>Long-term goals</h3>
            <Link className="see" href="/goals">Adjust</Link>
          </div>
          <div className="p-pad">
            <GoalMini name="Car down payment" saved={state.goals.carSaved} target={state.goals.carTarget} eta={`On track for ${carEta(state)}`} />
            <GoalMini name="Emergency fund" saved={state.goals.efSaved} target={state.goals.efTarget} eta={`${fmt(state.goals.efTarget - state.goals.efSaved)} to go`} />
          </div>
        </div>
      </div>
    </>
  );
}
