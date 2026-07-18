/* Pure functions over state. Every number the UI shows is computed here. */

export const fmt  = n => '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
export const fmt2 = n => '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const esc  = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

export const diningSpent = 218;

export const activeSubs  = s => s.subs.filter(x => x.active);
export const subTotal    = s => activeSubs(s).reduce((a, x) => a + x.cost, 0);
export const cash        = s => s.accounts.filter(a => a.bal > 0 && a.type !== 'Brokerage').reduce((a, b) => a + b.bal, 0);
export const cardDebt    = s => -s.accounts.filter(a => a.bal < 0).reduce((a, b) => a + b.bal, 0);
export const weekSpent   = s => s.cats.filter(c => c.n !== 'Rent & utilities' && c.n !== 'Investing').reduce((a, c) => a + c.spent, 0);
export const flaggedSubs = s => activeSubs(s).filter(x => x.usage < 25 && !x.kept);

export const upcomingRenewals = s =>
  activeSubs(s).filter(x => ['Jul 21', 'Jul 22', 'Jul 23', 'Jul 24'].includes(x.renews));

export function safeToSpend(s) {
  const overage = Math.max(0, diningSpent - s.goals.diningBudget);
  const renew = upcomingRenewals(s).reduce((a, x) => a + x.cost, 0);
  return Math.max(0, Math.round(s.goals.safeTarget - overage - renew));
}

export const carMonthsLeftOf = goals =>
  Math.ceil((goals.carTarget - goals.carSaved) / Math.max(1, goals.carMonthly));

export function carEtaOf(goals) {
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const m = carMonthsLeftOf(goals);
  return months[m % 12] + ' ' + (2026 + Math.floor((6 + m) / 12));
}

export const carMonthsLeft = s => carMonthsLeftOf(s.goals);
export const carEta        = s => carEtaOf(s.goals);

/* % over(+)/under(-) the dining budget. Computed, never hardcoded. */
export const diningDeltaPct = s =>
  Math.round((diningSpent - s.goals.diningBudget) / s.goals.diningBudget * 100);

export function findSub(s, q) {
  q = q.toLowerCase().replace(/[.!?]+$/, '').trim();
  return s.subs.find(x => x.name.toLowerCase() === q)
      || s.subs.find(x => x.name.toLowerCase().split(' ')[0] === q.split(' ')[0])
      || s.subs.find(x => x.name.toLowerCase().includes(q));
}

/* Single source of truth for the daily report. The report card and the SMS
   bubble both render from this, so they can never disagree.
   Finding: {ic, text: rich HTML, sms: concise plain line (null = omit)} */
export function buildReport(s) {
  const g = s.goals, p = s.portfolio;
  const d = diningDeltaPct(s);
  const renew = upcomingRenewals(s);
  const renewSum = renew.reduce((a, x) => a + x.cost, 0);
  const efPct = Math.round(g.efSaved / g.efTarget * 100);

  const shortTerm = [
    { ic: d > 0 ? 'warn' : 'check',
      text: `You spent <strong>${fmt(diningSpent)} on dining this week, ${Math.abs(d)}% ${d > 0 ? 'above' : 'below'}</strong> your ${fmt(g.diningBudget)} budget. Three of five charges were DoorDash.`,
      sms: `Dining: ${fmt(diningSpent)} this week, ${Math.abs(d)}% ${d > 0 ? 'over' : 'under'} your ${fmt(g.diningBudget)} pace` },
    { ic: 'up',
      text: `Your Robinhood portfolio is <strong>up ${fmt(p.weekChange)} (${p.weekPct}%)</strong> this week, mostly from ${p.drivers}.`,
      sms: `Robinhood: +${fmt(p.weekChange)} this week (${p.drivers.replace(' and ', ', ')})` },
    { ic: 'cal',
      text: renew.length
        ? `<strong>${renew.length} subscription${renew.length !== 1 ? 's' : ''} renew${renew.length === 1 ? 's' : ''} before Friday:</strong> ${renew.map(x => `${x.name} (${fmt2(x.cost)})`).join(', ')}. ${fmt2(renewSum)} total.`
        : `<strong>No subscriptions renew before Friday.</strong>`,
      sms: renew.length
        ? `${renew.length} renewal${renew.length > 1 ? 's' : ''} before Fri: ${renew.map(x => x.name.split(' ')[0]).join(', ')} (${fmt2(renewSum)})`
        : `No renewals before Friday` },
  ];

  const overAi = p.aiExposure > g.aiCap;
  const longTerm = [
    { ic: 'check',
      text: `<strong>Car down payment:</strong> ${fmt(g.carSaved)} of ${fmt(g.carTarget)} saved. At ${fmt(g.carMonthly)}/mo you hit it in <strong>${carMonthsLeftOf(g)} month${carMonthsLeftOf(g) !== 1 ? 's' : ''} (${carEtaOf(g)})</strong>.`,
      sms: `Car fund: ${fmt(g.carSaved)} / ${fmt(g.carTarget)}, on track for ${carEtaOf(g)}` },
    { ic: 'check',
      text: `<strong>Emergency fund:</strong> ${fmt(g.efSaved)} of ${fmt(g.efTarget)}, ${efPct}% funded, earning 4.1% APY.`,
      sms: null },
    { ic: overAi ? 'warn' : 'check',
      text: `<strong>Portfolio concentration:</strong> AI holdings are <strong>${p.aiExposure}%</strong> of your portfolio${overAi ? `, above your ${g.aiCap}% guardrail. That’s a drift from your own rule, not advice` : `, inside your ${g.aiCap}% guardrail`}.`,
      sms: null },
  ];

  const overage = Math.max(0, diningSpent - g.diningBudget);
  let action;
  if (overage > 0) {
    const weeks = Math.max(1, Math.round(overage / Math.max(1, g.carMonthly) * 4.33));
    const wk = weeks === 1 ? 'about a week' : `about ${weeks} weeks`;
    action = {
      html: `<strong>Skip delivery twice this week</strong> and move ${fmt(overage)} to your car fund. That clears the dining overage and pulls your <strong>${carEtaOf(g)}</strong> goal ${wk} closer. Safe to spend before Friday: <strong>${fmt(safeToSpend(s))}</strong>.`,
      sms: `Do this: skip delivery twice and move ${fmt(overage)} to your car fund. Pulls ${carEtaOf(g)} ${wk} closer.`,
    };
  } else {
    action = {
      html: `Dining is inside budget, nothing to fix. You can safely spend <strong>${fmt(safeToSpend(s))}</strong> before Friday, or sweep the surplus into your car fund to beat <strong>${carEtaOf(g)}</strong>.`,
      sms: `You’re inside budget. Safe to spend ${fmt(safeToSpend(s))} before Friday, or sweep the surplus to your car fund.`,
    };
  }

  return { shortTerm, longTerm, action };
}

export function smsBody(s) {
  const r = buildReport(s);
  return [
    `Good morning, Alex ☀️ Here’s your daily brief:`,
    ``,
    ...r.shortTerm.map(f => '• ' + f.sms),
    ...s.reportExtras.map(e => '• ' + e.replace(/<[^>]+>/g, '')),
    ...r.longTerm.filter(f => f.sms).map(f => '• ' + f.sms),
    ``,
    `Safe to spend before Friday: ${fmt(safeToSpend(s))}`,
    r.action.sms,
  ].join('\n');
}
