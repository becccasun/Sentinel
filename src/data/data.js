import rawBills from './bills.json'
export { agreementByBand, suggestedSettings, getCapStatus } from './analysis.js'

// --- In-memory store (seeded from JSON, optionally persisted) ---

const LS_KEY = 'ramp_bills_v1'

function loadInitialBills() {
  try {
    const stored = localStorage.getItem(LS_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    // ignore parse errors, fall through to raw data
  }
  return rawBills
}

function persist(bills) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(bills))
  } catch {
    // quota errors etc. — silently skip
  }
}

// Returns a fresh copy of bills from localStorage (or JSON seed).
// Call once at app startup to initialize React state.
export function getBills() {
  return loadInitialBills()
}

// Returns a new bills array with the verdict updated for bill_id.
// Pass this into your setState call and it will also persist to localStorage.
// verdict: null | "agent_right" | "human_right" | "unclear"
export function saveVerdict(bills, id, verdict) {
  const next = bills.map((b) =>
    b.bill_id === id ? { ...b, verdict } : b
  )
  persist(next)
  return next
}

// Returns summary counts for footer/progress display.
// Example return: { total: 10, reviewed: 3, remaining: 7 }
export function getVerdictCounts(bills) {
  const reviewed = bills.filter((b) => b.verdict !== null).length
  return {
    total: bills.length,
    reviewed,
    remaining: bills.length - reviewed,
  }
}
