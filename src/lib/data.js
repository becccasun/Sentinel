// Data access layer. Components call these — they never import bills.json directly
// and never touch localStorage directly. Swapping bills.json for another
// schema-identical file requires zero changes here or in components.

import billsData from '../data/bills.json';

const STORAGE_KEY = 'verdicts';

// Safe localStorage read — app must work if it's empty or unavailable.
function loadVerdicts() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function persistVerdicts(map) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore — private mode / storage disabled; app still works in-memory
  }
}

// getBills() → array of bills with any persisted verdicts merged in.
export function getBills() {
  const stored = loadVerdicts();
  return billsData.map((b) => ({
    ...b,
    verdict: stored[b.bill_id] ?? b.verdict ?? null,
  }));
}

// saveVerdict(billId, verdict) → persists to localStorage and returns the
// updated verdict map so callers can update React state from it.
export function saveVerdict(billId, verdict) {
  const map = loadVerdicts();
  if (verdict === null || verdict === undefined) {
    delete map[billId];
  } else {
    map[billId] = verdict;
  }
  persistVerdicts(map);
  return map;
}

// Convenience for hydrating React state on load.
export function getVerdicts() {
  return loadVerdicts();
}
