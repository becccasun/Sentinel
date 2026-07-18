'use client';
import { createContext, useContext, useState } from 'react';
import { initialState } from './data';
import { fmt2, esc, activeSubs, flaggedSubs, findSub, carEtaOf } from './derive';

const StoreCtx = createContext(null);
export const useStore = () => useContext(StoreCtx);

/* Returns the next state after canceling a subscription, plus bits for messaging.
   Shared by the modal flow (Subscriptions page) and the SMS reply flow. */
function applyCancel(s, id) {
  const sub = s.subs.find(x => x.id === id);
  const goals = { ...s.goals, carMonthly: s.goals.carMonthly + Math.round(sub.cost) };
  const eta = carEtaOf(goals);
  const next = {
    ...s,
    subs: s.subs.map(x => x.id === id ? { ...x, active: false } : x),
    goals,
    savedThisYear: s.savedThisYear + sub.cost * 12,
    reportExtras: [...s.reportExtras, `You canceled <strong>${sub.name}</strong>. ${fmt2(sub.cost * 12)}/yr redirected to your car fund. New ETA: <strong>${eta}</strong>.`],
  };
  return { next, sub, eta };
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(initialState);
  const [toasts, setToasts] = useState([]);

  const toast = msg => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3400);
  };

  const setGoal = (key, val) =>
    setState(s => ({ ...s, goals: { ...s.goals, [key]: val } }));

  const toggleSms = () => {
    const on = !state.smsOn;
    setState(s => ({ ...s, smsOn: on }));
    toast(on ? 'Daily SMS reports on' : 'SMS off. In-app only');
  };

  const setTime = t => {
    setState(s => ({ ...s, reportTime: t }));
    toast('Daily report moved to ' + t);
  };

  const cancelSub = id => {
    const { next, sub } = applyCancel(state, id);
    setState(next);
    toast(`${sub.name} deactivated · +${fmt2(sub.cost)}/mo to car fund`);
  };

  const reactivate = id => {
    setState(s => {
      const sub = s.subs.find(x => x.id === id);
      return {
        ...s,
        subs: s.subs.map(x => x.id === id ? { ...x, active: true } : x),
        savedThisYear: Math.max(0, s.savedThisYear - sub.cost * 12),
        goals: { ...s.goals, carMonthly: s.goals.carMonthly - Math.round(sub.cost) },
        reportExtras: s.reportExtras.filter(e => !e.includes(sub.name)),
      };
    });
    toast(`${state.subs.find(x => x.id === id).name} reactivated`);
  };

  const connect = id => {
    setState(s => ({ ...s, connectable: s.connectable.map(c => c.id === id ? { ...c, busy: true } : c) }));
    setTimeout(() => {
      setState(s => {
        const c = s.connectable.find(x => x.id === id);
        toast(`${c.name} connected · syncing transactions`);
        return {
          ...s,
          connectable: s.connectable.map(x => x.id === id ? { ...x, busy: false, connected: true } : x),
          reportExtras: [...s.reportExtras, `New platform linked: <strong>${c.name}</strong>. First insights land in tomorrow’s report.`],
        };
      });
    }, 1400);
  };

  /* Parse an SMS reply: "CANCEL <name>" deactivates, "KEEP <name>" dismisses. */
  const sendSms = raw => {
    raw = raw.trim();
    if (!raw) return;
    let s = state;
    const me = { who: 'me', text: esc(raw) };
    const m = raw.match(/^(cancel|keep)\s+(.+)/i);
    let reply;
    if (m) {
      const verb = m[1].toLowerCase();
      const sub = findSub(s, m[2]);
      if (!sub) {
        reply = `I couldn’t find a subscription matching “${esc(m[2].trim())}”. You have: ${activeSubs(s).map(x => x.name.split(' ')[0]).join(', ')}.`;
      } else if (verb === 'cancel') {
        if (!sub.active) {
          reply = `${sub.name} is already canceled. Access ends ${sub.renews}.`;
        } else {
          const r = applyCancel(s, sub.id);
          s = r.next;
          toast(`${sub.name} deactivated · +${fmt2(sub.cost)}/mo to car fund`);
          reply = `Done. Canceled <strong>${sub.name}</strong>, that’s ${fmt2(sub.cost)}/mo back, routed to your car fund. New ETA <strong>${r.eta}</strong>. You keep access until ${sub.renews}.`;
        }
      } else {
        s = { ...s, subs: s.subs.map(x => x.id === sub.id ? { ...x, kept: true } : x) };
        reply = `Got it, keeping <strong>${sub.name}</strong>. I’ll stop asking about it.`;
      }
    } else {
      const f = flaggedSubs(s);
      reply = `I can take action right from this thread: reply <strong>CANCEL &lt;name&gt;</strong> to end a subscription or <strong>KEEP &lt;name&gt;</strong> to stop suggestions.${f.length ? ` Right now I’d look at ${f.map(x => x.name).join(' and ')}.` : ''}`;
    }
    setState({ ...s, thread: [...s.thread, me, { who: 'agent', text: reply }] });
  };

  const value = { state, toasts, toast, setGoal, toggleSms, setTime, cancelSub, reactivate, connect, sendSms };
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}
