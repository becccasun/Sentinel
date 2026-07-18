// Generates src/data/bills.json — 200 rows total.
// Run once and commit the output:  npm run generate-data
//
// 187 agreement rows (randomized, deterministic via seed) + 13 hand-authored
// disagreement rows (all amount > $1,000). Schema is FROZEN — see build spec.

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'src', 'data', 'bills.json');

// --- deterministic PRNG (mulberry32) so bills.json is stable across runs ---
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260718);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const round2 = (n) => Math.round(n * 100) / 100;

const VENDORS = [
  'Cintas Uniform Services',
  'AWS',
  'Sunrise Office Supply',
  'Meridian Property Management',
  'FreshBite Catering',
  'Staples',
  'Verizon Business',
  'CleanCo Janitorial',
  'Twilio',
  'Datadog',
  'Grainger Industrial',
  'FedEx',
  'Notion Labs',
  'Iron Mountain',
  'City Water & Power',
];

const CANNED_REASONING = [
  'Recurring vendor, amount within 12-month range.',
  'Matches an active purchase order.',
  'Consistent with the vendor’s monthly billing cadence.',
  'Amount within the approved category budget.',
  'Vendor and amount match prior approved invoices.',
];

const DATES = [];
for (let d = 4; d <= 17; d++) {
  DATES.push(`2026-07-${String(d).padStart(2, '0')}`);
}

// --- amount sampling for agreement rows ---
// 80% $40–$2,000 · 15% $2,000–$8,000 · 5% $8,000–$30,000
// hard limits: <= 2 agreement rows over $10,000; nothing under $1,000 disagrees
function sampleAgreementAmount(overTenKBudget) {
  const r = rand();
  if (r < 0.8) return { amount: round2(40 + rand() * (2000 - 40)), band: 'low' };
  if (r < 0.95) return { amount: round2(2000 + rand() * (8000 - 2000)), band: 'mid' };
  // high band 8k–30k, but only allow >10k while budget remains
  if (overTenKBudget.count < 2) {
    overTenKBudget.count += 1;
    return { amount: round2(8000 + rand() * (30000 - 8000)), band: 'high' };
  }
  return { amount: round2(8000 + rand() * (10000 - 8000)), band: 'high' };
}

const rows = [];
let idNum = 1;
const nextId = () => `B-${String(idNum++).padStart(4, '0')}`;

// --- 187 agreement rows ---
const overTenKBudget = { count: 0 };
for (let i = 0; i < 187; i++) {
  const { amount } = sampleAgreementAmount(overTenKBudget);
  rows.push({
    bill_id: nextId(),
    vendor: pick(VENDORS),
    amount,
    date: pick(DATES),
    human_decision: 'approved',
    agent_proposal: 'approve',
    agent_reasoning: pick(CANNED_REASONING),
    verdict: null,
  });
}

// --- 13 disagreement rows (hand-authored, all amount > $1,000) ---
const disagreements = [
  {
    vendor: 'Sunrise Office Supply',
    amount: 4120.0,
    human_decision: 'approved',
    agent_proposal: 'flag',
    agent_reasoning:
      'Invoice #4471 matches amount and vendor of invoice #4468, paid 6 days ago — possible duplicate.',
  },
  {
    vendor: 'Grainger Industrial',
    amount: 18400.0,
    human_decision: 'approved',
    agent_proposal: 'flag',
    agent_reasoning:
      'Amount is 9× this vendor’s trailing average; no matching purchase order found.',
  },
  {
    vendor: 'Meridian Property Management',
    amount: 22750.0,
    human_decision: 'approved',
    agent_proposal: 'flag',
    agent_reasoning: 'One-time charge outside the recurring lease schedule.',
  },
  {
    vendor: 'Datadog',
    amount: 12000.0,
    human_decision: 'approved',
    agent_proposal: 'flag',
    agent_reasoning: 'Amount anomalous vs. 14-day history.',
  },
  {
    vendor: 'Hollis Consulting Group',
    amount: 6500.0,
    human_decision: 'approved',
    agent_proposal: 'flag',
    agent_reasoning: "Invoice description is non-specific: 'professional services, June'.",
  },
  {
    vendor: 'Vertex Supply Co.',
    amount: 3200.0,
    human_decision: 'approved',
    agent_proposal: 'flag',
    agent_reasoning:
      'New vendor with no prior history; amount is roughly 3× the typical first invoice in this category.',
  },
  {
    vendor: 'Grainger Industrial',
    amount: 2450.0,
    human_decision: 'approved',
    agent_proposal: 'flag',
    agent_reasoning: 'No matching purchase order on file for this invoice.',
  },
  {
    vendor: 'FreshBite Catering',
    amount: 1875.0,
    human_decision: 'approved',
    agent_proposal: 'flag',
    agent_reasoning: "Invoice dated Saturday 2026-07-11, outside this vendor's usual weekday billing.",
  },
  {
    vendor: 'Apex Logistics',
    amount: 2000.0,
    human_decision: 'approved',
    agent_proposal: 'flag',
    agent_reasoning: 'Round-number invoice from a vendor added this month; no itemized detail.',
  },
  {
    vendor: 'Staples',
    amount: 1340.0,
    human_decision: 'approved',
    agent_proposal: 'reject',
    agent_reasoning: "Bill-to name 'Staple Inc.' does not match the vendor of record 'Staples'.",
  },
  {
    vendor: 'Verizon Business',
    amount: 1580.0,
    human_decision: 'approved',
    agent_proposal: 'flag',
    agent_reasoning: 'Payment requested 41 days early on net-60 terms.',
  },
  {
    vendor: 'CleanCo Janitorial',
    amount: 1290.0,
    human_decision: 'approved',
    agent_proposal: 'flag',
    agent_reasoning: 'Line items 3 and 5 are identical in description and amount within this invoice.',
  },
  {
    // human rejected, agent would have approved — disagreement in the other direction
    vendor: 'Northwind Freight',
    amount: 3900.0,
    human_decision: 'rejected',
    agent_proposal: 'approve',
    agent_reasoning: 'Vendor and amount match an approved recurring shipping contract.',
  },
];

const disagreementDates = [
  '2026-07-16',
  '2026-07-15',
  '2026-07-14',
  '2026-07-12',
  '2026-07-11',
  '2026-07-10',
  '2026-07-09',
  '2026-07-11',
  '2026-07-08',
  '2026-07-07',
  '2026-07-13',
  '2026-07-06',
  '2026-07-05',
];

disagreements.forEach((d, i) => {
  rows.push({
    bill_id: nextId(),
    vendor: d.vendor,
    amount: round2(d.amount),
    date: disagreementDates[i],
    human_decision: d.human_decision,
    agent_proposal: d.agent_proposal,
    agent_reasoning: d.agent_reasoning,
    verdict: null,
  });
});

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(rows, null, 2) + '\n');

// --- sanity report (not part of the app) ---
const isDisagreement = (b) =>
  (b.human_decision === 'approved' && b.agent_proposal !== 'approve') ||
  (b.human_decision === 'rejected' && b.agent_proposal !== 'reject');
const disCount = rows.filter(isDisagreement).length;
const under1kDis = rows.filter((b) => b.amount < 1000 && isDisagreement(b)).length;
const overTenK = rows.filter((b) => b.amount > 10000 && !isDisagreement(b)).length;
console.log(`Wrote ${rows.length} rows -> ${OUT}`);
console.log(`  disagreements: ${disCount} (expected 13)`);
console.log(`  disagreements under $1,000: ${under1kDis} (expected 0)`);
console.log(`  agreement rows over $10,000: ${overTenK} (expected <= 2)`);
