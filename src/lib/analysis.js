// Business math. Components never compute these numbers inline — a wrong number
// here is a bug here, not in the UI.

// Agreement = human approved & agent approve, OR human rejected & agent reject.
export function isAgreement(bill) {
  return (
    (bill.human_decision === 'approved' && bill.agent_proposal === 'approve') ||
    (bill.human_decision === 'rejected' && bill.agent_proposal === 'reject')
  );
}

export function isDisagreement(bill) {
  return !isAgreement(bill);
}

const BANDS = [
  { label: 'Under $1,000', min: 0, max: 1000, upper: 1000 },
  { label: '$1,000–$10,000', min: 1000, max: 10000, upper: 10000 },
  { label: 'Over $10,000', min: 10000, max: Infinity, upper: Infinity },
];

function inBand(amount, band) {
  return amount >= band.min && amount < band.max;
}

// agreementByBand(bills) → [{ label, pct, count }]
// pct = whole-number % where human_decision matches agent_proposal.
export function agreementByBand(bills) {
  return BANDS.map((band) => {
    const inThisBand = bills.filter((b) => inBand(b.amount, band));
    const count = inThisBand.length;
    const agree = inThisBand.filter(isAgreement).length;
    const pct = count === 0 ? 0 : Math.round((agree / count) * 100);
    return { label: band.label, pct, count };
  });
}

// suggestedSettings(bills, verdicts) →
//   { threshold, dailyCap, matchCount, disagreementCount, totalCount }
export function suggestedSettings(bills, verdicts = {}) {
  const bands = agreementByBand(bills);

  // threshold = upper bound of the *largest* (highest-value) band with >=98% agreement.
  let threshold = 0;
  for (let i = BANDS.length - 1; i >= 0; i--) {
    if (bands[i].count > 0 && bands[i].pct >= 98) {
      threshold = BANDS[i].upper === Infinity ? BANDS[i].min : BANDS[i].upper;
      break;
    }
  }
  if (threshold === 0) threshold = 1000; // safe floor

  // dailyCap = (sum of approved amounts under threshold ÷ 14) × 1.5, rounded to nearest 50.
  const approvedUnderThreshold = bills.filter(
    (b) => b.human_decision === 'approved' && b.amount < threshold,
  );
  const sum = approvedUnderThreshold.reduce((acc, b) => acc + b.amount, 0);
  const rawCap = (sum / 14) * 1.5;
  const dailyCap = Math.round(rawCap / 50) * 50;

  const totalCount = bills.length;
  const disagreementCount = bills.filter(isDisagreement).length;
  const matchCount = totalCount - disagreementCount;

  return { threshold, dailyCap, matchCount, disagreementCount, totalCount };
}

// Tally of the reviewer's verdicts, for the graduation summary chips.
export function verdictTally(verdicts = {}) {
  const t = { agent_right: 0, human_right: 0, unclear: 0 };
  Object.values(verdicts).forEach((v) => {
    if (v in t) t[v] += 1;
  });
  return t;
}
