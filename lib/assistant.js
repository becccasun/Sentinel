import {
  activeSubs,
  cardDebt,
  cash,
  diningDeltaPct,
  findSub,
  flaggedSubs,
  fmt,
  fmt2,
  safeToSpend,
  subTotal,
  upcomingRenewals,
  weekSpent,
  carEta,
} from './derive.js';

const clean = value => value.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9$%\s-]/g, ' ').replace(/\s+/g, ' ').trim();
const abs = value => Math.abs(value);

function matches(text, words) {
  return words.some(word => text.includes(word));
}

function matchingTransactions(state, query) {
  const q = clean(query);
  return unifiedTransactions(state).filter(tx => {
    const merchant = clean(tx.m);
    const category = clean(tx.cat);
    return merchant.includes(q) || category === q || q.includes(merchant.split(',')[0]);
  });
}

function unifiedTransactions(state) {
  if (!state.dataset?.transactions) return state.txs;
  const accountNames = Object.fromEntries(state.dataset.accounts.map(account => [account.id, account.name]));
  return state.dataset.transactions.map(tx => ({
    d: new Date(`${tx.date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    m: tx.merchant,
    acct: accountNames[tx.accountId] || tx.accountId,
    cat: tx.category.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase()),
    amt: tx.amount,
  }));
}

function transactionTotal(rows) {
  return rows.filter(row => row.amt < 0).reduce((sum, row) => sum + abs(row.amt), 0);
}

function findDatasetSubject(state, question) {
  const q = clean(question);
  const merchants = [...new Set(unifiedTransactions(state).map(tx => tx.m.split(',')[0]))]
    .sort((a, b) => b.length - a.length);
  const merchant = merchants.find(name => {
    const normalized = clean(name);
    const lead = normalized.split(' ')[0];
    return q.includes(normalized) || (lead.length >= 4 && q.includes(lead));
  });
  if (merchant) return { type: 'transactions', label: merchant, rows: matchingTransactions(state, merchant) };

  const category = state.cats.find(cat => q.includes(clean(cat.n)));
  if (category) return { type: 'category', category };

  const subscription = state.subs.find(sub => q.includes(clean(sub.name)) || q.includes(clean(sub.name.split(' ')[0])));
  if (subscription) return { type: 'subscription', subscription };

  const account = (state.dataset?.accounts || state.accounts).find(item => q.includes(clean(item.name)) || q.includes(clean(item.institution || item.inst)));
  if (account) return { type: 'account', account };
  return null;
}

/** Answer read-only questions from the same dataset that powers the dashboard. */
export function answerFinancialQuestion(state, rawQuestion) {
  const q = clean(rawQuestion);
  const subject = findDatasetSubject(state, rawQuestion);

  if (matches(q, ['help', 'what can you do', 'what can i ask'])) {
    return 'Ask me about balances, recent transactions, merchant or category spending, subscriptions and renewals, savings goals, safe-to-spend, or portfolio guardrails. I can also <strong>CANCEL</strong> or <strong>KEEP</strong> a subscription.';
  }

  if (subject?.type === 'transactions') {
    const spend = transactionTotal(subject.rows);
    const orders = subject.rows.filter(row => row.amt < 0).length;
    return `${subject.label} appears ${orders} time${orders === 1 ? '' : 's'} in this dataset for <strong>${fmt2(spend)}</strong> total.${subject.rows.length ? ` Most recent: ${subject.rows[0].d} on ${subject.rows[0].acct}.` : ''}`;
  }

  if (subject?.type === 'category') {
    const { category } = subject;
    const remaining = category.budget - category.spent;
    return `<strong>${category.n}</strong> spending is ${fmt(category.spent)} against a ${fmt(category.budget)} budget. ${remaining >= 0 ? `${fmt(remaining)} remains.` : `You are ${fmt(abs(remaining))} over.`}`;
  }

  if (subject?.type === 'subscription') {
    const sub = subject.subscription;
    return `<strong>${sub.name}</strong> is ${sub.active ? 'active' : 'canceled'} at ${fmt2(sub.cost)}/month. ${sub.active ? `It renews ${sub.renews}, usage is ${sub.usage}%, and it was last used ${sub.lastUsed.toLowerCase()}.` : `Access ends ${sub.renews}.`}`;
  }

  if (subject?.type === 'account') {
    const account = subject.account;
    const amount = account.balance ?? account.bal;
    const balance = amount < 0 ? `a ${fmt2(amount)} balance owed` : `a ${fmt2(amount)} balance`;
    const autopay = account.autopayDate ? ` Autopay is scheduled for ${account.autopayDate}.` : '';
    const apy = account.apyPct ? ` It earns ${account.apyPct}% APY.` : '';
    return `<strong>${account.name}</strong> has ${balance}. It is listed as ${(account.type || '').replace(/_/g, ' ')}.${autopay}${apy}`;
  }

  if (matches(q, ['safe to spend', 'safely spend', 'can i spend', 'how much can i spend', 'spending room'])) {
    return `You can safely spend <strong>${fmt(safeToSpend(state))}</strong> before Friday. That accounts for your ${fmt(state.goals.safeTarget)} target, the dining overage, and upcoming renewals.`;
  }

  if (matches(q, ['cash', 'checking balance', 'money do i have', 'total balance', 'net worth'])) {
    return `You have <strong>${fmt2(cash(state))}</strong> in cash and savings, <strong>${fmt2(cardDebt(state))}</strong> in card balances, and ${fmt2(state.accounts.find(a => a.type === 'Brokerage')?.bal || 0)} invested.`;
  }

  if (matches(q, ['spend this week', 'spent this week', 'weekly spending', 'where did my money go'])) {
    const ranked = [...state.cats]
      .filter(cat => !['Rent & utilities', 'Investing'].includes(cat.n))
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 3);
    return `Weekly variable spending is <strong>${fmt(weekSpent(state))}</strong>. The largest categories are ${ranked.map(cat => `${cat.n} ${fmt(cat.spent)}`).join(', ')}. Dining is ${Math.abs(diningDeltaPct(state))}% ${diningDeltaPct(state) > 0 ? 'over' : 'under'} budget.`;
  }

  if (matches(q, ['recent transaction', 'latest transaction', 'last purchase', 'transactions'])) {
    const rows = unifiedTransactions(state).slice(0, 5);
    return `Your latest transactions are: ${rows.map(tx => `${tx.m} ${tx.amt > 0 ? '+' : ''}${fmt2(tx.amt)} on ${tx.d}`).join('; ')}.`;
  }

  if (matches(q, ['renew', 'upcoming subscription', 'next subscription', 'due soon'])) {
    const rows = upcomingRenewals(state);
    if (!rows.length) return 'No active subscriptions in the dataset renew before Friday.';
    return `${rows.length} subscription${rows.length === 1 ? '' : 's'} renew before Friday: ${rows.map(sub => `${sub.name} ${fmt2(sub.cost)} on ${sub.renews}`).join(', ')}.`;
  }

  if (matches(q, ['subscription', 'monthly recurring', 'recurring charges'])) {
    const active = activeSubs(state);
    const flagged = flaggedSubs(state);
    return `You have <strong>${active.length} active subscriptions</strong> totaling <strong>${fmt2(subTotal(state))}/month</strong>. ${flagged.length ? `Low-use candidates: ${flagged.map(sub => `${sub.name} ${fmt2(sub.cost)}`).join(', ')}.` : 'Nothing is currently flagged as low-use.'}`;
  }

  if (matches(q, ['car fund', 'car goal', 'down payment'])) {
    const g = state.goals;
    return `Your car fund is at <strong>${fmt(g.carSaved)} of ${fmt(g.carTarget)}</strong>. At ${fmt(g.carMonthly)}/month, the projected finish is <strong>${carEta(state)}</strong>.`;
  }

  if (matches(q, ['emergency fund', 'savings goal', 'savings'])) {
    const g = state.goals;
    const pct = Math.round(g.efSaved / g.efTarget * 100);
    return `Your emergency fund is <strong>${fmt(g.efSaved)} of ${fmt(g.efTarget)}</strong>, or ${pct}% funded. Your car fund is ${fmt(g.carSaved)} of ${fmt(g.carTarget)}.`;
  }

  if (matches(q, ['portfolio', 'investment', 'robinhood', 'stock', 'concentration', 'ai exposure'])) {
    const p = state.portfolio;
    return `Your portfolio is up <strong>${fmt(p.weekChange)} (${p.weekPct}%)</strong> this week, driven mostly by ${p.drivers}. AI exposure is ${p.aiExposure}% versus your ${state.goals.aiCap}% guardrail. This is a guardrail check, not investment advice.`;
  }

  if (matches(q, ['previous report', 'report history', 'earlier report', 'last report', 'what did you flag'])) {
    const history = state.dataset?.reportHistory || [];
    if (!history.length) return 'There is no prior report history in the current dataset.';
    return `Recent reports: ${history.map(report => `${report.date}: ${report.summary}`).join(' ')}`;
  }

  if (matches(q, ['when is my report', 'delivery time', 'notification settings', 'timezone', 'when do you text'])) {
    const settings = state.dataset?.user?.reportSettings;
    if (!settings) return `Your report is scheduled for ${state.reportTime}. SMS is ${state.smsOn ? 'enabled' : 'disabled'}.`;
    return `Reports are scheduled ${settings.cadence} at <strong>${settings.deliveryTimeLocal}</strong> in ${settings.timezone}. Delivery channels: ${settings.channels.join(' and ')}. SMS is ${settings.smsEnabled ? 'enabled' : 'disabled'}.`;
  }

  if (matches(q, ['last synced', 'sync status', 'data fresh', 'up to date'])) {
    const accounts = state.dataset?.accounts || [];
    if (!accounts.length) return 'Sync timestamps are not available in the current dataset.';
    return `All ${accounts.length} connected accounts were last synced at ${accounts[0].lastSyncedAt}.`;
  }

  if (matches(q, ['budget', 'over budget', 'on track'])) {
    const over = state.cats.filter(cat => cat.spent > cat.budget);
    return over.length
      ? `${over.map(cat => `${cat.n} is ${fmt(cat.spent - cat.budget)} over its ${fmt(cat.budget)} budget`).join('; ')}. Safe to spend before Friday is ${fmt(safeToSpend(state))}.`
      : `Every tracked category is within budget. Safe to spend before Friday is ${fmt(safeToSpend(state))}.`;
  }

  const activeNames = activeSubs(state).map(sub => sub.name.split(' ')[0]).join(', ');
  return `I couldn’t map that question to the current financial dataset. Try asking “How much did I spend at DoorDash?”, “What renews this week?”, “Am I over budget?”, or “How is my portfolio doing?” You can also CANCEL or KEEP: ${activeNames}.`;
}
