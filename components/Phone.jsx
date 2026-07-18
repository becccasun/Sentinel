'use client';
import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';
import { smsBody, flaggedSubs, fmt, fmt2, diningSpent, safeToSpend } from '@/lib/derive';
import { Send } from '@/lib/icons';

export default function Phone() {
  const { state, sendSms } = useStore();
  const [draft, setDraft] = useState('');
  const msgsRef = useRef(null);

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [state.thread, state.smsOn]);

  const submit = () => {
    if (!draft.trim()) return;
    sendSms(draft);
    setDraft('');
  };

  const flagged = flaggedSubs(state);
  const flagName = flagged.length ? flagged[0].name.split(' ')[0] : '';
  const brief = smsBody(state).replace(/^Good morning/, '<span class="b-brand">Sentinel</span>\nGood morning');

  return (
    <div className="phone">
      <div className="screen">
        <div className="ph-top">
          <div className="notch" />
          <div className="ph-name">Sentinel</div>
          <div className="ph-num">+1 (833) 555-0199</div>
        </div>
        <div className="msgs" ref={msgsRef}>
          <div className="stamp">Today {state.reportTime}</div>
          {state.smsOn ? (
            <>
              <div className="bubble" dangerouslySetInnerHTML={{ __html: brief }} />
              <div className="bubble me">how much of that is doordash?</div>
              <div className="bubble">
                DoorDash is $85.00 of your {fmt(diningSpent)} dining spend (3 orders).
                Cancelling tonight’s usual order keeps you under {fmt(safeToSpend(state))} safe-to-spend.
                Want me to nudge you at 6pm? 👍
              </div>
              {flagged.length > 0 && (
                <div className="bubble">
                  {flagged.map(x => `${x.name} renews ${x.renews} at ${fmt2(x.cost)}/mo, last opened ${x.lastUsed.toLowerCase()}`).join('. ')}.
                  {'\n'}Reply <strong>CANCEL {flagName}</strong> to end it, or <strong>KEEP {flagName}</strong> to stop asking.
                </div>
              )}
            </>
          ) : (
            <div className="bubble">SMS delivery is off. Your reports are waiting in the app, and you can still reply below.</div>
          )}
          {state.thread.map((m, i) => (
            <div key={i} className={`bubble ${m.who === 'me' ? 'me' : ''}`} dangerouslySetInnerHTML={{ __html: m.text }} />
          ))}
        </div>
        <div className="compose">
          <input
            placeholder="Text message"
            autoComplete="off"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submit(); }}
          />
          <button className="send" onClick={submit} aria-label="Send"><Send /></button>
        </div>
      </div>
    </div>
  );
}
