'use client';
import { useStore } from '@/lib/store';
import BrandTile from '@/components/BrandTile';
import { fmt } from '@/lib/derive';
import { Spark } from '@/lib/icons';

export default function ConnectionsPage() {
  const { state, connect } = useStore();
  return (
    <>
      <h1 className="page-h">Connections</h1>
      <p className="page-sub">Sentinel reads balances, transactions and holdings from every platform you link: banks, cards, brokerages, and subscription merchants.</p>

      <div className="pagebody"><h2>Connected · {state.accounts.length + state.connectable.filter(c => c.connected).length}</h2></div>
      <div className="congrid" style={{ marginTop: 6 }}>
        {state.accounts.map(a => (
          <div className="concard" key={a.id}>
            <BrandTile id={a.id} letter={a.letter} color={a.color} size={40} radius={11} />
            <span className="who">
              <span className="nm">{a.name}</span>
              <span className="rl">{a.type} · synced 4 min ago</span>
            </span>
            <span style={{ fontWeight: 600, fontSize: '14.5px' }}>{a.bal < 0 ? '−' : ''}{fmt(a.bal)}</span>
          </div>
        ))}
        {state.connectable.filter(c => c.connected).map(c => (
          <div className="concard" key={c.id}>
            <BrandTile id={c.id} letter={c.letter} color={c.color} size={40} radius={11} />
            <span className="who">
              <span className="nm">{c.name}</span>
              <span className="rl">{c.type} · syncing</span>
            </span>
            <span className="pill green">Connected</span>
          </div>
        ))}
      </div>

      <div className="pagebody">
        <h2>Add a platform</h2>
        <p className="desc">Link once and the agent folds it into tomorrow’s report automatically.</p>
      </div>
      <div className="congrid" style={{ marginTop: 6 }}>
        {state.connectable.filter(c => !c.connected).map(c => (
          <div className="concard" key={c.id}>
            <BrandTile id={c.id} letter={c.letter} color={c.color} size={40} radius={11} />
            <span className="who">
              <span className="nm">{c.name}</span>
              <span className="rl">{c.type}</span>
            </span>
            {c.busy
              ? <span className="spinner" />
              : <button className="btn btn-secondary btn-sm" onClick={() => connect(c.id)}>Connect</button>}
          </div>
        ))}
      </div>

      <div className="simnote"><Spark /><span>Demo simulates account aggregation. In production this connects through <strong>Plaid</strong> for banks and cards, brokerage APIs for investments, and subscription detection runs on the merged transaction stream.</span></div>
    </>
  );
}
