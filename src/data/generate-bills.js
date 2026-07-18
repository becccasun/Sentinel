#!/usr/bin/env node
// One-time script — run: node src/data/generate-bills.js > src/data/bills.json
// Produces 200 rows: 187 agreements + 13 hand-crafted disagreements.
// Constraint: ALL bills under $1,000 are agreements (so under-$1k band = 100%).

// Seeded RNG for reproducible output
function makeRng(seed) {
  let s = seed
  return function () {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}
const rng = makeRng(42)
function pick(arr) { return arr[Math.floor(rng() * arr.length)] }
function r2(n) { return Math.round(n * 100) / 100 }
function between(lo, hi) { return r2(lo + rng() * (hi - lo)) }

function date(dayOffset) {
  const d = new Date('2026-06-01')
  d.setDate(d.getDate() + dayOffset)
  return d.toISOString().slice(0, 10)
}

// 15 vendors with realistic per-vendor reasoning templates
const VENDORS = [
  {
    name: 'AWS',
    agreeReasons: [
      'Monthly EC2 + S3 usage — within 4% of prior billing cycle.',
      'Reserved instance charge matches signed contract terms.',
      'Cloud compute cost consistent with projected growth trajectory.',
    ],
  },
  {
    name: 'Microsoft Azure',
    agreeReasons: [
      'Azure DevOps monthly fee — matches prior month within 2%.',
      'Blob storage charge consistent with data ingestion volume.',
      'Compute reservation matches PO-2026-0041.',
    ],
  },
  {
    name: 'Google Workspace',
    agreeReasons: [
      'Monthly seat license — 40 active seats verified in admin console.',
      'Workspace renewal matches annual contract proration.',
      'Per-seat rate matches signed order form.',
    ],
  },
  {
    name: 'Slack Technologies',
    agreeReasons: [
      'Pro plan — 30 seats at contract rate, matches prior invoice.',
      'Monthly license consistent with approved headcount.',
      'Quarterly true-up within expected range.',
    ],
  },
  {
    name: 'Zoom Communications',
    agreeReasons: [
      'Business plan renewal — matches prior quarter.',
      'Monthly license consistent with headcount and prior billing.',
      'Webinar add-on within approved budget line.',
    ],
  },
  {
    name: 'GitHub',
    agreeReasons: [
      'Team plan seats — matches current engineering headcount.',
      'Actions compute charge within expected CI usage.',
      'Monthly developer seat license matches approved roster.',
    ],
  },
  {
    name: 'Figma',
    agreeReasons: [
      'Design seat license — matches approved seat roster.',
      'Organization plan renewal at contract rate.',
      'Annual plan proration for new seat within policy.',
    ],
  },
  {
    name: 'Notion',
    agreeReasons: [
      'Team plan renewal — below $300 single-purchase threshold.',
      'Workspace seats match approved headcount.',
      'Monthly fee consistent with prior invoices.',
    ],
  },
  {
    name: 'Gusto',
    agreeReasons: [
      'Payroll processing fee — matches employee count on file.',
      'HR platform monthly charge within contract terms.',
      'Benefits administration fee — expected and on schedule.',
    ],
  },
  {
    name: 'DocuSign',
    agreeReasons: [
      'Envelope volume within monthly plan allowance.',
      'eSignature plan renewal matches contract.',
      'Usage-based charge within projected range.',
    ],
  },
  {
    name: 'HubSpot',
    agreeReasons: [
      'CRM seat license renewal at contracted rate.',
      'Marketing Hub monthly charge matches order form.',
      'Sales Pro seats — matches current sales headcount.',
    ],
  },
  {
    name: 'Salesforce',
    agreeReasons: [
      'Sales Cloud seat license matches headcount.',
      'Annual contract monthly installment — on schedule.',
      'Sandbox add-on within approved budget.',
    ],
  },
  {
    name: 'FedEx Shipping',
    agreeReasons: [
      'Standard shipping charge — amount within normal range.',
      'Express courier matches shipping manifest for this period.',
      'Freight charge consistent with order volume.',
    ],
  },
  {
    name: 'Staples Business',
    agreeReasons: [
      'Office supply restock — under $500 single-purchase threshold.',
      'Paper and toner order matches approved purchase request.',
      'Supply order within monthly office budget.',
    ],
  },
  {
    name: 'Stripe',
    agreeReasons: [
      'Payment processing fees match transaction volume for period.',
      'Monthly processing charge within expected range.',
      'Platform fee consistent with reported revenue.',
    ],
  },
]

// ── 13 hand-crafted disagreements (all > $1,000) ──────────────────────────────

const DISAGREEMENTS = [
  // #1 — Demo peak: duplicate invoice
  {
    bill_id: 'BILL-D01',
    vendor: 'Acme Facilities Group',
    amount: 4120.00,
    date: '2026-06-08',
    human_decision: 'approved',
    agent_proposal: 'flag',
    agent_reasoning:
      'Amount and vendor match invoice BILL-D00 paid 6 days ago (2026-06-02, $4,120.00). ' +
      'No intervening PO or contract amendment found. High confidence duplicate — recommend hold pending vendor confirmation.',
    verdict: null,
  },
  // #2 — High-dollar, missing approval chain
  {
    bill_id: 'BILL-D02',
    vendor: 'Salesforce',
    amount: 14800.00,
    date: '2026-06-05',
    human_decision: 'approved',
    agent_proposal: 'flag',
    agent_reasoning:
      'Amount exceeds $10,000 single-approval threshold. No linked VP sign-off found in approval workflow. ' +
      'Contract on file covers $9,800/quarter — this amount is 51% above contract rate.',
    verdict: null,
  },
  // #3 — High-dollar, no PO
  {
    bill_id: 'BILL-D03',
    vendor: 'Meridian Consulting LLC',
    amount: 12500.00,
    date: '2026-06-11',
    human_decision: 'approved',
    agent_proposal: 'reject',
    agent_reasoning:
      'Vendor not on approved vendor list. No PO, SOW, or prior payment history found. ' +
      'Consulting category requires pre-approval for amounts over $5,000.',
    verdict: null,
  },
  // #4 — Agent clearly wrong: annual renewal flagged on short history
  {
    bill_id: 'BILL-D04',
    vendor: 'HubSpot',
    amount: 12960.00,
    date: '2026-06-13',
    human_decision: 'approved',
    agent_proposal: 'flag',
    agent_reasoning:
      'Amount 14× higher than average monthly HubSpot charge observed in shadow window. ' +
      'Flagging as anomalous — no prior invoice at this scale in the 14-day observation period.',
    verdict: null,
    // Note: agent is wrong — this is the annual renewal. Short observation window = no baseline.
  },
  // #5 — Ambiguous: plausible either way
  {
    bill_id: 'BILL-D05',
    vendor: 'AWS',
    amount: 3180.00,
    date: '2026-06-12',
    human_decision: 'approved',
    agent_proposal: 'flag',
    agent_reasoning:
      'AWS charge is 38% above the prior-month baseline of $2,302. ' +
      'Spike could reflect legitimate workload growth or misconfigured autoscaling. No cost-explorer annotation found.',
    verdict: null,
  },
  // #6 — New vendor, no history
  {
    bill_id: 'BILL-D06',
    vendor: 'Retool Inc.',
    amount: 1800.00,
    date: '2026-06-03',
    human_decision: 'approved',
    agent_proposal: 'flag',
    agent_reasoning:
      'First-time vendor with no prior payment history. No approved vendor record, contract, or PO on file. ' +
      'Recommend confirming vendor onboarding before payment.',
    verdict: null,
  },
  // #7 — 3× usual amount, same vendor
  {
    bill_id: 'BILL-D07',
    vendor: 'FedEx Shipping',
    amount: 2410.00,
    date: '2026-06-09',
    human_decision: 'approved',
    agent_proposal: 'flag',
    agent_reasoning:
      'FedEx charge is 3.1× the average invoice amount for this vendor ($780). ' +
      'No matching bulk shipment event or freight PO found.',
    verdict: null,
  },
  // #8 — Missing PO, mid-range amount
  {
    bill_id: 'BILL-D08',
    vendor: 'Crestwood Office Interiors',
    amount: 1540.00,
    date: '2026-06-07',
    human_decision: 'approved',
    agent_proposal: 'reject',
    agent_reasoning:
      'No PO on file. Furniture/fixtures category requires a purchase order for amounts over $500. ' +
      'Vendor is approved but invoice references an internal project code that does not match any open budget line.',
    verdict: null,
  },
  // #9 — Weekend-dated invoice
  {
    bill_id: 'BILL-D09',
    vendor: 'TechSolutions Partners',
    amount: 2200.00,
    date: '2026-06-06',
    human_decision: 'approved',
    agent_proposal: 'flag',
    agent_reasoning:
      'Invoice dated Saturday 2026-06-06 — outside normal business operations. ' +
      'Vendor has no weekend service contract on file. Pattern consistent with backdating.',
    verdict: null,
  },
  // #10 — Unusual category
  {
    bill_id: 'BILL-D10',
    vendor: 'SkyView Events LLC',
    amount: 1125.00,
    date: '2026-06-04',
    human_decision: 'approved',
    agent_proposal: 'reject',
    agent_reasoning:
      'Entertainment/events category not in approved spend categories for this cost center. ' +
      'No event memo or manager pre-approval attached.',
    verdict: null,
  },
  // #11 — Human rejected, agent would approve
  {
    bill_id: 'BILL-D11',
    vendor: 'Notion',
    amount: 1320.00,
    date: '2026-06-10',
    human_decision: 'rejected',
    agent_proposal: 'approve',
    agent_reasoning:
      'Annual Notion Business plan for 12 seats at $110/seat — within contract terms and below annual renewal threshold.',
    verdict: null,
  },
  // #12 — Human rejected, agent would approve (different vendor)
  {
    bill_id: 'BILL-D12',
    vendor: 'Zoom Communications',
    amount: 1599.90,
    date: '2026-06-02',
    human_decision: 'rejected',
    agent_proposal: 'approve',
    agent_reasoning:
      'Zoom Business+ upgrade for 15 seats — matches a pending approval request from IT. ' +
      'Per-seat rate is within market range and below the $2,000 auto-escalation threshold.',
    verdict: null,
  },
  // #13 — High-dollar, agent rejects, human approved
  {
    bill_id: 'BILL-D13',
    vendor: 'Oracle Corporation',
    amount: 8500.00,
    date: '2026-06-14',
    human_decision: 'approved',
    agent_proposal: 'reject',
    agent_reasoning:
      'Oracle license charge has no matching contract in the vendor management system. ' +
      'No prior Oracle invoices in observation window. Recommend contract verification before payment.',
    verdict: null,
  },
]

// ── Generate 187 agreement rows ───────────────────────────────────────────────

const agreements = []
let seq = 1

// Helper: produce an agreement bill
function makeBill(vendor, amount, dayOffset) {
  return {
    bill_id: `BILL-${String(seq++).padStart(3, '0')}`,
    vendor: vendor.name,
    amount,
    date: date(dayOffset),
    human_decision: 'approved',
    agent_proposal: 'approve',
    agent_reasoning: pick(vendor.agreeReasons),
    verdict: null,
  }
}

// ~115 bills under $1,000 — spread vendors and days evenly
const smallAmounts = [
  42.80, 55.10, 67.40, 78.20, 89.50, 94.30, 102.60, 115.90, 128.40, 134.70,
  145.20, 158.80, 167.30, 179.60, 188.40, 197.20, 203.50, 214.80, 226.10, 235.60,
  241.90, 253.20, 264.70, 276.40, 285.10, 293.80, 302.50, 314.20, 325.90, 337.40,
  348.10, 359.80, 368.50, 374.20, 385.90, 394.60, 403.30, 415.70, 427.40, 438.10,
  444.80, 456.50, 467.20, 478.90, 489.60, 497.30, 503.40, 515.70, 526.40, 537.10,
  548.80, 559.50, 568.20, 574.90, 585.60, 596.30, 604.70, 615.40, 626.10, 637.80,
  648.50, 657.20, 668.90, 679.60, 688.30, 694.70, 703.40, 714.10, 725.80, 736.50,
  747.20, 758.90, 767.60, 778.30, 789.70, 797.40, 803.10, 814.80, 825.50, 836.20,
  847.90, 856.60, 867.30, 878.70, 889.40, 897.10, 903.80, 914.50, 925.20, 936.90,
  945.60, 954.30, 963.70, 972.40, 981.10, 989.80, 994.50, 43.20, 76.90, 112.30,
  156.80, 198.40, 234.70, 278.20, 312.60, 367.90, 423.50, 478.10, 534.70, 589.30,
  645.90, 701.50, 757.10, 812.70, 868.30,
]

for (let i = 0; i < smallAmounts.length; i++) {
  const vendor = VENDORS[i % VENDORS.length]
  const day = i % 14
  agreements.push(makeBill(vendor, smallAmounts[i], day))
}

// ~72 bills over $1,000 — a mix of mid ($1k-$8k) and large ($10k-$20k)
const largeAmounts = [
  1024.50, 1098.20, 1156.80, 1234.60, 1312.40, 1389.90, 1467.30, 1545.70,
  1623.10, 1701.80, 1789.40, 1867.90, 1945.30, 2023.60, 2134.80, 2245.10,
  2356.40, 2467.70, 2578.90, 2690.20, 2801.50, 2912.80, 3023.10, 3134.40,
  3245.70, 3356.90, 3468.20, 3579.50, 3690.80, 3802.10, 3913.40, 4024.70,
  4135.90, 4247.20, 4358.50, 4469.80, 4581.10, 4692.40, 4803.70, 4914.90,
  5026.20, 5137.50, 5248.80, 5360.10, 5471.40, 5582.70, 5693.90, 5805.20,
  5916.50, 6027.80, 6139.10, 6250.40, 6361.70, 6472.90, 6584.20, 6695.50,
  6806.80, 6918.10, 7029.40, 7140.70, 7251.90, 7363.20, 7474.50, 7585.80,
  10120.00, 10890.00, 11450.00, 12340.00, 13200.00, 14100.00, 15600.00, 16800.00,
]

for (let i = 0; i < largeAmounts.length; i++) {
  const vendor = VENDORS[i % VENDORS.length]
  const day = i % 14
  agreements.push(makeBill(vendor, largeAmounts[i], day))
}

// Pad to exactly 187 if needed (smallAmounts=115, largeAmounts=72 → 187 ✓)

// ── Assemble final array, shuffle agreements so bills aren't perfectly sorted ─

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

const allBills = [...shuffle(agreements), ...DISAGREEMENTS]

process.stdout.write(JSON.stringify(allBills, null, 2) + '\n')
