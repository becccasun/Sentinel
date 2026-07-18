// Trailing avgs calibrated so dining at $108 = +43% above avg at medium sensitivity threshold (40%).
// Low sensitivity (75%) does NOT flag it; medium (40%) and high (20%) do.

export const WEEK_START = '2026-07-14'
export const WEEK_END   = '2026-07-18'

export const accounts = [
  { id: 'chase-checking', name: 'Chase Checking', type: 'cash',       balance: 4820,  institution: 'Chase'     },
  { id: 'chase-freedom',  name: 'Chase Freedom',  type: 'credit',     balance: -1240, institution: 'Chase'     },
  { id: 'robinhood',      name: 'Robinhood',       type: 'investment', balance: 12600, institution: 'Robinhood' },
]

export const transactions = [
  // ── This week (Jul 14-18) ────────────────────────────────────────────────
  { id: 't1',  merchant: 'Chipotle',          category: 'Dining',        amount: 18.50,  date: '2026-07-14', account: 'chase-freedom'  },
  { id: 't2',  merchant: 'Uber',              category: 'Transport',     amount: 18.40,  date: '2026-07-14', account: 'chase-freedom'  },
  { id: 't3',  merchant: 'DoorDash',          category: 'Dining',        amount: 34.90,  date: '2026-07-15', account: 'chase-freedom'  },
  { id: 't4',  merchant: 'Blue Bottle Coffee',category: 'Dining',        amount: 12.80,  date: '2026-07-15', account: 'chase-freedom'  },
  { id: 't5',  merchant: 'Whole Foods',       category: 'Groceries',     amount: 86.42,  date: '2026-07-16', account: 'chase-freedom'  },
  { id: 't6',  merchant: 'Netflix',           category: 'Subscriptions', amount: 22.99,  date: '2026-07-16', account: 'chase-freedom', recurring: true },
  { id: 't7',  merchant: 'Sweetgreen',        category: 'Dining',        amount: 24.60,  date: '2026-07-17', account: 'chase-freedom'  },
  { id: 't8',  merchant: 'Amazon',            category: 'Shopping',      amount: 47.30,  date: '2026-07-17', account: 'chase-freedom'  },
  { id: 't9',  merchant: 'Blue Bottle Coffee',category: 'Dining',        amount: 17.20,  date: '2026-07-18', account: 'chase-freedom'  },
  { id: 't10', merchant: 'Robinhood Transfer',category: 'Investing',     amount: 200.00, date: '2026-07-18', account: 'chase-checking', transfer: true },

  // ── Week −1 (Jul 7-11) ──────────────────────────────────────────────────
  { id: 't11', merchant: 'Chipotle',          category: 'Dining',    amount: 22.40,  date: '2026-07-08', account: 'chase-freedom' },
  { id: 't12', merchant: 'DoorDash',          category: 'Dining',    amount: 31.50,  date: '2026-07-09', account: 'chase-freedom' },
  { id: 't13', merchant: 'Whole Foods',       category: 'Groceries', amount: 102.30, date: '2026-07-09', account: 'chase-freedom' },
  { id: 't14', merchant: 'Sweetgreen',        category: 'Dining',    amount: 21.60,  date: '2026-07-10', account: 'chase-freedom' },
  { id: 't15', merchant: 'Uber',              category: 'Transport', amount: 22.80,  date: '2026-07-11', account: 'chase-freedom' },
  { id: 't16', merchant: 'Target',            category: 'Shopping',  amount: 38.90,  date: '2026-07-11', account: 'chase-freedom' },

  // ── Week −2 (Jun 30 – Jul 4) ─────────────────────────────────────────────
  { id: 't17', merchant: 'Chipotle',          category: 'Dining',    amount: 16.80,  date: '2026-06-30', account: 'chase-freedom' },
  { id: 't18', merchant: 'DoorDash',          category: 'Dining',    amount: 28.40,  date: '2026-07-01', account: 'chase-freedom' },
  { id: 't19', merchant: 'Shake Shack',       category: 'Dining',    amount: 21.50,  date: '2026-07-03', account: 'chase-freedom' },
  { id: 't20', merchant: "Trader Joe's",      category: 'Groceries', amount: 89.20,  date: '2026-07-02', account: 'chase-freedom' },
  { id: 't21', merchant: 'Lyft',              category: 'Transport', amount: 31.20,  date: '2026-07-04', account: 'chase-freedom' },
  { id: 't22', merchant: 'Amazon',            category: 'Shopping',  amount: 72.10,  date: '2026-07-03', account: 'chase-freedom' },

  // ── Week −3 (Jun 23-27) ──────────────────────────────────────────────────
  { id: 't23', merchant: 'Sweetgreen',        category: 'Dining',    amount: 19.20,  date: '2026-06-23', account: 'chase-freedom' },
  { id: 't24', merchant: 'DoorDash',          category: 'Dining',    amount: 42.80,  date: '2026-06-25', account: 'chase-freedom' },
  { id: 't25', merchant: 'Sushi Place',       category: 'Dining',    amount: 21.50,  date: '2026-06-26', account: 'chase-freedom' },
  { id: 't26', merchant: 'Whole Foods',       category: 'Groceries', amount: 94.60,  date: '2026-06-24', account: 'chase-freedom' },
  { id: 't27', merchant: 'Uber',              category: 'Transport', amount: 38.50,  date: '2026-06-26', account: 'chase-freedom' },
  { id: 't28', merchant: 'Zara',              category: 'Shopping',  amount: 89.30,  date: '2026-06-27', account: 'chase-freedom' },

  // ── Week −4 (Jun 16-20) ──────────────────────────────────────────────────
  { id: 't29', merchant: 'Chipotle',          category: 'Dining',    amount: 17.40,  date: '2026-06-16', account: 'chase-freedom' },
  { id: 't30', merchant: 'DoorDash',          category: 'Dining',    amount: 29.30,  date: '2026-06-17', account: 'chase-freedom' },
  { id: 't31', merchant: 'Pizza Place',       category: 'Dining',    amount: 21.50,  date: '2026-06-19', account: 'chase-freedom' },
  { id: 't32', merchant: 'Sweetgreen',        category: 'Dining',    amount: 8.10,   date: '2026-06-18', account: 'chase-freedom' },
  { id: 't33', merchant: 'Whole Foods',       category: 'Groceries', amount: 97.40,  date: '2026-06-18', account: 'chase-freedom' },
  { id: 't34', merchant: 'Lyft',              category: 'Transport', amount: 44.20,  date: '2026-06-19', account: 'chase-freedom' },
  { id: 't35', merchant: 'Amazon',            category: 'Shopping',  amount: 45.50,  date: '2026-06-20', account: 'chase-freedom' },
]

// Trailing 4-week averages per category.
// Dining: (75.50 + 66.70 + 83.50 + 76.30) / 4 = $75.50
// At $108 current, that's 43% above → flagged at medium (40%) & high (20%), NOT at low (75%).
export const trailingAverages = {
  Dining:        75.50,
  Groceries:     95.88,
  Transport:     34.18,
  Shopping:      61.45,
  Subscriptions: 65.97,
}

export const subscriptions = [
  { id: 'sub-spotify', merchant: 'Spotify', cost: 11.99, renewal: '2026-07-19', status: 'Keep',             paused: false, emoji: '🎵' },
  { id: 'sub-netflix', merchant: 'Netflix', cost: 22.99, renewal: '2026-07-20', status: 'Keep',             paused: false, emoji: '🎬' },
  { id: 'sub-figma',   merchant: 'Figma',   cost: 15.00, renewal: '2026-07-22', status: 'Review',           paused: false, emoji: '🎨' },
  { id: 'sub-peacock', merchant: 'Peacock', cost: 7.99,  renewal: '2026-07-25', status: 'Cancel candidate', paused: false, emoji: '📺' },
  { id: 'sub-notion',  merchant: 'Notion',  cost: 8.00,  renewal: '2026-07-26', status: 'Keep',             paused: false, emoji: '📝' },
]

export const investments = {
  totalValue:      12600,
  weeklyChange:    320,
  weeklyChangePct: 2.6,
  holdings: [
    { ticker: 'NVDA', name: 'NVIDIA Corp',          value: 4820, pct: 38.2, weeklyChange:  180, type: 'AI'    },
    { ticker: 'VOO',  name: 'Vanguard S&P 500 ETF', value: 3940, pct: 31.3, weeklyChange:   95, type: 'Index' },
    { ticker: 'MSFT', name: 'Microsoft Corp',        value: 2100, pct: 16.7, weeklyChange:   42, type: 'Tech'  },
    { ticker: 'AMZN', name: 'Amazon.com',            value: 1210, pct: 9.6,  weeklyChange:  -18, type: 'Tech'  },
    { ticker: 'CASH', name: 'Cash & Equivalents',    value:  530, pct: 4.2,  weeklyChange:    0, type: 'Cash'  },
  ],
}

export const defaultGoals = {
  spendingLimits: {
    weeklyDiningBudget:    150,
    weeklyDiscretionaryCap: 400,
    categoryLimits: { Groceries: 300, Shopping: 150, Transport: 100 },
  },
  subscriptionRules: {
    monthlyCap:     120,
    unusedFlagDays:  30,
    flagUnused:     true,
  },
  investingGuardrails: {
    maxSingleStockExposure: 25,
    maxThemeExposure: { label: 'AI stocks', pct: 30 },
  },
  savingsGoals: [
    { id: 'sg-emergency', name: 'Emergency fund', target: 8000, current: 4820 },
    { id: 'sg-trip',      name: 'August trip',    target: 1200, current:  400 },
  ],
  notificationSettings: {
    cadence: '2x_week',
    channels: { sms: true },
    anomalySensitivity: 'medium',
    quietHours: { start: '21:00', end: '08:00' },
  },
}
