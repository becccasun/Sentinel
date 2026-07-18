/* Mock financial dataset. All values the UI shows derive from this object
   plus the pure functions in lib/derive.js. */
export const initialState = {
  smsOn: true,
  reportTime: '8:00 AM',
  accounts: [
    { id: 'chase',   name: 'Chase Checking',         inst: 'Chase',            type: 'Checking',        bal: 4820.12,  color: '#0e3a8a', letter: 'C' },
    { id: 'freedom', name: 'Chase Freedom Unlimited', inst: 'Chase',            type: 'Credit card',     bal: -1240.55, color: '#0e3a8a', letter: 'C' },
    { id: 'amex',    name: 'AmEx Gold',               inst: 'American Express', type: 'Credit card',     bal: -486.20,  color: '#1a6f5c', letter: 'A' },
    { id: 'rh',      name: 'Robinhood',               inst: 'Robinhood',        type: 'Brokerage',       bal: 12600,    color: '#17332d', letter: 'R' },
    { id: 'apple',   name: 'Apple Savings',           inst: 'Goldman Sachs',    type: 'HYSA · 4.1% APY', bal: 6150,     color: '#212121', letter: 'A' },
  ],
  connectable: [
    { id: 'boa',   name: 'Bank of America', type: 'Bank',               color: '#8a1538', letter: 'B', connected: false, busy: false },
    { id: 'cap1',  name: 'Capital One',     type: 'Bank & cards',       color: '#33529b', letter: 'C', connected: false, busy: false },
    { id: 'venmo', name: 'Venmo',           type: 'Payments',           color: '#5683d2', letter: 'V', connected: false, busy: false },
    { id: 'fid',   name: 'Fidelity',        type: 'Brokerage & 401(k)', color: '#3d3a38', letter: 'F', connected: false, busy: false },
  ],
  subs: [
    { id: 'spotify', name: 'Spotify Premium', cost: 11.99, renews: 'Jul 22', usage: 96, lastUsed: 'Today',       opens: 'Daily, ~2.1 hrs/day',     color: '#17332d', letter: 'S', active: true, kept: false },
    { id: 'chatgpt', name: 'ChatGPT Plus',    cost: 20.00, renews: 'Aug 2',  usage: 88, lastUsed: 'Today',       opens: '26 days this month',      color: '#41705f', letter: 'C', active: true, kept: false },
    { id: 'prime',   name: 'Amazon Prime',    cost: 14.99, renews: 'Aug 9',  usage: 81, lastUsed: 'Yesterday',   opens: '11 orders + video',       color: '#e96516', letter: 'A', active: true, kept: false },
    { id: 'netflix', name: 'Netflix',         cost: 22.99, renews: 'Jul 24', usage: 74, lastUsed: '2 days ago',  opens: '14 sessions this month',  color: '#932020', letter: 'N', active: true, kept: false },
    { id: 'notion',  name: 'Notion Plus',     cost: 12.00, renews: 'Jul 21', usage: 68, lastUsed: 'Today',       opens: 'Work hours, weekdays',    color: '#212121', letter: 'N', active: true, kept: false },
    { id: 'figma',   name: 'Figma Pro',       cost: 15.00, renews: 'Jul 30', usage: 31, lastUsed: '3 weeks ago', opens: '2 sessions this month',   color: '#5683d2', letter: 'F', active: true, kept: false },
    { id: 'crunchy', name: 'Crunchyroll',     cost: 7.99,  renews: 'Jul 27', usage: 12, lastUsed: '5 weeks ago', opens: '1 session this month',    color: '#c95410', letter: 'C', active: true, kept: false },
    { id: 'peacock', name: 'Peacock Premium', cost: 7.99,  renews: 'Jul 23', usage: 6,  lastUsed: '47 days ago', opens: '0 sessions this month',   color: '#3d3a38', letter: 'P', active: true, kept: false },
  ],
  txs: [
    { d: 'Jul 18', m: 'Blue Bottle Coffee',    acct: 'AmEx Gold',      cat: 'Dining',           amt: -7.75 },
    { d: 'Jul 17', m: 'DoorDash, Thai Basil',  acct: 'Chase Freedom',  cat: 'Dining',           amt: -34.90 },
    { d: 'Jul 17', m: 'Whole Foods Market',    acct: 'Chase Freedom',  cat: 'Groceries',        amt: -86.42 },
    { d: 'Jul 16', m: 'Robinhood transfer',    acct: 'Chase Checking', cat: 'Investing',        amt: -200.00 },
    { d: 'Jul 16', m: 'Uber',                  acct: 'AmEx Gold',      cat: 'Transport',        amt: -18.40 },
    { d: 'Jul 15', m: 'Paycheck, Acme Corp',   acct: 'Chase Checking', cat: 'Income',           amt: 2140.00 },
    { d: 'Jul 15', m: 'Sweetgreen',            acct: 'AmEx Gold',      cat: 'Dining',           amt: -16.85 },
    { d: 'Jul 15', m: 'Shell',                 acct: 'Chase Freedom',  cat: 'Transport',        amt: -42.10 },
    { d: 'Jul 14', m: 'DoorDash, Shake Shack', acct: 'Chase Freedom',  cat: 'Dining',           amt: -28.65 },
    { d: 'Jul 14', m: 'Trader Joe’s',          acct: 'Chase Freedom',  cat: 'Groceries',        amt: -54.20 },
    { d: 'Jul 13', m: 'Rent, Parkline Apts',   acct: 'Chase Checking', cat: 'Rent & utilities', amt: -1450.00 },
    { d: 'Jul 13', m: 'Cava',                  acct: 'AmEx Gold',      cat: 'Dining',           amt: -14.30 },
    { d: 'Jul 12', m: 'Target',                acct: 'Chase Freedom',  cat: 'Shopping',         amt: -63.75 },
    { d: 'Jul 12', m: 'DoorDash, Chipotle',    acct: 'Chase Freedom',  cat: 'Dining',           amt: -21.45 },
  ],
  cats: [
    { n: 'Rent & utilities', spent: 1450, budget: 1500 },
    { n: 'Dining',           spent: 218,  budget: 150 },
    { n: 'Groceries',        spent: 141,  budget: 180 },
    { n: 'Transport',        spent: 61,   budget: 90 },
    { n: 'Shopping',         spent: 64,   budget: 120 },
    { n: 'Investing',        spent: 200,  budget: 200 },
  ],
  goals: {
    carTarget: 9000, carSaved: 5400, carMonthly: 450,
    efTarget: 8000, efSaved: 6150,
    diningBudget: 150, subCap: 120, safeTarget: 500,
    aiCap: 30, // max single-theme portfolio exposure, %
  },
  portfolio: { weekChange: 320, weekPct: 2.8, drivers: 'NVDA and VOO', aiExposure: 41 },
  savedThisYear: 0,
  reportExtras: [],
  thread: [], // user replies + agent responses in the SMS thread: {who:'me'|'agent', text}
};
