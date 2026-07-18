// Agreement = human approved & agent approve, OR human rejected & agent reject.
function isAgreement(bill) {
  return (
    (bill.human_decision === 'approved' && bill.agent_proposal === 'approve') ||
    (bill.human_decision === 'rejected' && bill.agent_proposal === 'reject')
  )
}

// Returns agreement stats broken into three dollar bands.
//
// agreementByBand(bills) →
// {
//   under1k:  { total: 115, agreed: 115, rate: 1.0 },
//   k1to10k:  { total: 74,  agreed: 64,  rate: 0.865 },
//   over10k:  { total: 11,  agreed: 8,   rate: 0.727 },
// }
export function agreementByBand(bills) {
  const bands = {
    under1k: bills.filter((b) => b.amount < 1000),
    k1to10k: bills.filter((b) => b.amount >= 1000 && b.amount <= 10000),
    over10k:  bills.filter((b) => b.amount > 10000),
  }

  const result = {}
  for (const [key, group] of Object.entries(bands)) {
    const agreed = group.filter(isAgreement).length
    result[key] = {
      total: group.length,
      agreed,
      rate: group.length > 0 ? agreed / group.length : 0,
    }
  }
  return result
}

// Returns prefill values for the Graduation screen.
//
// suggestedSettings(bills) →
// {
//   threshold: 1000,       // dollar threshold: largest band with ≥98% agreement
//   dailyCap: 6300,        // avg daily approved-under-threshold spend × 1.5, rounded to $50
//   escalationRules: [     // static strings for the escalation control
//     'New vendor (no prior payment history)',
//     'Amount exceeds threshold',
//     'Agent confidence is "flag" or "unclear"',
//   ],
//   evidence: {            // supporting sentences for display beside each control
//     threshold: '115 of 115 bills under $1,000 matched (100%)',
//     dailyCap: '14-day approved volume under threshold ÷ 14 × 1.5',
//   },
// }
export function suggestedSettings(bills) {
  const bands = agreementByBand(bills)

  // Pick threshold: highest band with ≥98% agreement rate
  let threshold = 0
  if (bands.under1k.rate >= 0.98) threshold = 1000
  if (bands.k1to10k.rate >= 0.98) threshold = 10000
  if (bands.over10k.rate >= 0.98) threshold = Infinity

  // Daily cap: sum of all approved bills under threshold / 14 * 1.5, rounded to $50
  const approvedUnder = bills.filter(
    (b) => b.amount < threshold && b.human_decision === 'approved'
  )
  const rawCap = (approvedUnder.reduce((s, b) => s + b.amount, 0) / 14) * 1.5
  const dailyCap = Math.round(rawCap / 50) * 50

  const thresholdBand = bands.under1k
  const evidenceThreshold =
    `${thresholdBand.agreed} of ${thresholdBand.total} bills under $1,000 matched ` +
    `(${(thresholdBand.rate * 100).toFixed(0)}%)`

  return {
    threshold,
    dailyCap,
    escalationRules: [
      'New vendor (no prior payment history)',
      'Amount exceeds auto-approve threshold',
      'Agent proposal is "flag" or "unclear"',
    ],
    evidence: {
      threshold: evidenceThreshold,
      dailyCap: `14-day approved volume under threshold ÷ 14 × 1.5, rounded to $50`,
    },
  }
}

// Returns running totals for the Live screen cap meter.
// Pass the list of auto-approved bills for today.
//
// getCapStatus(todayBills, dailyCap) →
// { used: 340, cap: 6300, remaining: 5960, pct: 5.4 }
export function getCapStatus(todayBills, dailyCap) {
  const used = todayBills.reduce((s, b) => s + b.amount, 0)
  return {
    used: Math.round(used * 100) / 100,
    cap: dailyCap,
    remaining: Math.round((dailyCap - used) * 100) / 100,
    pct: dailyCap > 0 ? (used / dailyCap) * 100 : 0,
  }
}
