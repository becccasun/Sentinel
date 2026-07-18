'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import BrandTile from '@/components/BrandTile';
import { fmt, fmt2, activeSubs, subTotal } from '@/lib/derive';
import { Check, Spark, Warn } from '@/lib/icons';

const usageClass = u => (u >= 60 ? 'use-hi' : u >= 25 ? 'use-mid' : 'use-lo');

function RecPill({ s }) {
  if (!s.active) return <span className="pill gray">Canceled</span>;
  if (s.usage >= 60) return <span className="pill green">Keep</span>;
  if (s.usage >= 25) return <span className="pill amber">Review</span>;
  return <span className="pill red">Cancel candidate</span>;
}

export default function SubscriptionsPage() {
  const { state, cancelSub, reactivate } = useStore();
  const [confirmId, setConfirmId] = useState(null);

  const sorted = [...state.subs].sort((a, b) => (b.active - a.active) || b.usage - a.usage);
  const lowUse = activeSubs(state).filter(s => s.usage < 25);
  const total = subTotal(state);
  const confirming = confirmId ? state.subs.find(s => s.id === confirmId) : null;

  return (
    <>
      <h1 className="page-h">Subscriptions</h1>
      <p className="page-sub">Detected from recurring charges across your cards, ranked by how much you actually use them. Sentinel flags anything you’re paying for but not using.</p>

      <div className="statgrid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="statcard">
          <div className="sl">Active subscriptions</div>
          <div className="sv">{activeSubs(state).length}</div>
          <div className="sd">{fmt2(total)}/mo · {fmt(Math.round(total * 12))}/yr</div>
        </div>
        <div className="statcard">
          <div className="sl">Monthly cap</div>
          <div className="sv">{fmt(state.goals.subCap)}</div>
          <div className={`sd ${total > state.goals.subCap ? 'warn' : 'up'}`}>
            {total > state.goals.subCap ? `${fmt2(total - state.goals.subCap)} over cap` : 'Within cap'}
          </div>
        </div>
        <div className={`statcard ${lowUse.length ? '' : 'dark'}`}>
          <div className="sl">Low-use spend</div>
          <div className="sv">{fmt2(lowUse.reduce((a, s) => a + s.cost, 0))}<span style={{ fontSize: 14, color: 'var(--gray-500)' }}>/mo</span></div>
          <div className={`sd ${lowUse.length ? 'warn' : ''}`}>
            {lowUse.length ? `${lowUse.length} cancel candidate${lowUse.length > 1 ? 's' : ''}` : 'Nothing wasted 🎉'}
          </div>
        </div>
      </div>

      {state.savedThisYear > 0 && (
        <div className="subs-banner"><Check /> You’ve cut {fmt2(state.savedThisYear)}/yr in unused subscriptions, redirected to your car fund.</div>
      )}

      <div className="panel">
        <div className="p-head"><h3>Most used → least used</h3></div>
        {sorted.map(s => (
          <div key={s.id} className={`lrow ${s.active ? '' : 'canceled'}`}>
            <BrandTile id={s.id} letter={s.letter} color={s.color} />
            <span className="who">
              <span className="nm">{s.name}</span>
              <span className="rl">{s.active ? `Renews ${s.renews} · Last used ${s.lastUsed} · ${s.opens}` : `Canceled. Access ends ${s.renews}`}</span>
            </span>
            <span style={{ textAlign: 'right' }}>
              <span className="use-track"><span className={`use-fill ${usageClass(s.usage)}`} style={{ width: s.usage + '%' }} /></span>
              <span className="use-lbl">{s.usage}% usage</span>
            </span>
            <RecPill s={s} />
            <span className="amt">{fmt2(s.cost)}<span className="per">/mo</span></span>
            {s.active
              ? (s.usage < 60
                  ? <button className="btn btn-danger btn-sm" onClick={() => setConfirmId(s.id)}>Deactivate</button>
                  : <button className="btn btn-secondary btn-sm" disabled style={{ opacity: .45, cursor: 'default' }}>In use</button>)
              : <button className="btn btn-secondary btn-sm" onClick={() => reactivate(s.id)}>Undo</button>}
          </div>
        ))}
      </div>

      <div className="simnote"><Spark /><span>Usage is estimated from transaction frequency, merchant session data and device signals. In production, cancellations run through each provider’s API or a concierge flow. Here they’re simulated.</span></div>

      {confirming && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setConfirmId(null); }}>
          <div className="modal">
            <div className="m-body">
              <h3>Deactivate {confirming.name}?</h3>
              <p>
                You’ve used it {confirming.usage < 10 ? 'zero times' : 'only ' + confirming.opens.toLowerCase()} recently
                (last opened {confirming.lastUsed.toLowerCase()}). You’ll keep access until <strong>{confirming.renews}</strong>, then billing stops.
              </p>
              <div className="m-warn">
                <span className="f-ic"><Warn /></span>
                <span><strong>This isn’t easily reversible.</strong> Deactivating cancels your plan with the provider. Getting it back usually means re-subscribing from scratch, and any grandfathered pricing is lost. Only continue if you’re sure.</span>
              </div>
              <div className="m-save">Saves {fmt2(confirming.cost)}/mo, {fmt2(confirming.cost * 12)}/yr, auto-redirected to your car fund</div>
            </div>
            <div className="m-foot">
              <button className="btn btn-secondary btn-sm" onClick={() => setConfirmId(null)}>Keep it</button>
              <button className="btn btn-primary btn-sm" onClick={() => { cancelSub(confirming.id); setConfirmId(null); }}>I’m sure, deactivate</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
