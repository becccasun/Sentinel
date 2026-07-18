'use client';
import { createContext, useContext, useState } from 'react';
import { initialState } from './data';
import { fmt2, esc, activeSubs, findSub, carEtaOf } from './derive';
import { answerFinancialQuestion } from './assistant';

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
  const [agentThinking, setAgentThinking] = useState(false);

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

  function applyAgentActions(current, actions) {
    let next = current;
    for (const action of actions) {
      if (action.type === 'cancel_subscription') {
        const sub = next.subs.find(item => item.id === action.target);
        if (sub?.active) next = applyCancel(next, sub.id).next;
      } else if (action.type === 'keep_subscription') {
        if (next.subs.some(item => item.id === action.target)) {
          next = { ...next, subs: next.subs.map(item => item.id === action.target ? { ...item, kept: true } : item) };
        }
      } else if (action.type === 'reactivate_subscription') {
        const sub = next.subs.find(item => item.id === action.target);
        if (sub && !sub.active) {
          next = {
            ...next,
            subs: next.subs.map(item => item.id === sub.id ? { ...item, active: true } : item),
            savedThisYear: Math.max(0, next.savedThisYear - sub.cost * 12),
            goals: { ...next.goals, carMonthly: Math.max(0, next.goals.carMonthly - Math.round(sub.cost)) },
            reportExtras: next.reportExtras.filter(item => !item.includes(sub.name)),
          };
        }
      } else if (action.type === 'set_goal') {
        const limits = {
          diningBudget: [25, 2000], subCap: [0, 2000], safeTarget: [0, 10000],
          carMonthly: [0, 10000], carTarget: [1, 1000000], efTarget: [1, 1000000], aiCap: [1, 100],
        };
        const range = limits[action.target];
        const value = Number(action.value);
        if (range && Number.isFinite(value) && value >= range[0] && value <= range[1]) {
          next = { ...next, goals: { ...next.goals, [action.target]: value } };
        }
      } else if (action.type === 'set_sms' && typeof action.value === 'boolean') {
        next = { ...next, smsOn: action.value };
      } else if (action.type === 'set_report_time' && ['7:00 AM', '8:00 AM', '9:00 AM', '6:00 PM'].includes(action.value)) {
        next = { ...next, reportTime: action.value };
      } else if (action.type === 'connect_platform') {
        if (next.connectable.some(item => item.id === action.target)) {
          next = { ...next, connectable: next.connectable.map(item => item.id === action.target ? { ...item, connected: true, busy: false } : item) };
        }
      }
    }
    return next;
  }

  /* Ask the reasoning API; fall back to local dataset Q&A if it is unavailable. */
  const sendSms = async raw => {
    raw = raw.trim();
    if (!raw || agentThinking) return;
    const me = { who: 'me', text: esc(raw) };
    const snapshot = state;
    setState(current => ({ ...current, thread: [...current.thread, me] }));
    setAgentThinking(true);
    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: raw, state: snapshot, history: snapshot.thread }),
      });
      if (!response.ok) throw new Error('Agent request failed');
      const result = await response.json();
      setState(current => {
        const acted = applyAgentActions(current, result.actions || []);
        return { ...acted, thread: [...acted.thread, { who: 'agent', text: esc(result.answer || 'Done.') }] };
      });
      if (result.actions?.length) toast(`${result.actions.length} Sentinel action${result.actions.length === 1 ? '' : 's'} applied`);
    } catch {
      const command = raw.match(/^(cancel|keep|reactivate)\s+(.+)/i);
      let fallback = answerFinancialQuestion(snapshot, raw);
      let offlineActions = [];
      if (command) {
        const sub = findSub(snapshot, command[2]);
        if (!sub) {
          fallback = `I couldn’t find that subscription. Try one of: ${activeSubs(snapshot).map(item => item.name).join(', ')}.`;
        } else {
          const type = command[1].toLowerCase() === 'cancel'
            ? 'cancel_subscription'
            : command[1].toLowerCase() === 'keep'
              ? 'keep_subscription'
              : 'reactivate_subscription';
          offlineActions = [{ type, target: sub.id, value: null }];
          fallback = `${command[1][0].toUpperCase() + command[1].slice(1).toLowerCase()} action applied for <strong>${sub.name}</strong> using the offline command handler.`;
        }
      }
      setState(current => {
        const acted = applyAgentActions(current, offlineActions);
        return { ...acted, thread: [...acted.thread, { who: 'agent', text: fallback }] };
      });
      toast('Using local dataset answer');
    } finally {
      setAgentThinking(false);
    }
  };

  const value = { state, toasts, agentThinking, toast, setGoal, toggleSms, setTime, cancelSub, reactivate, connect, sendSms };
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}
