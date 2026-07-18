import { useMemo } from 'react';
import DisagreementCard from '../components/DisagreementCard.jsx';
import AgreementsTable from '../components/AgreementsTable.jsx';
import Button from '../components/Button.jsx';
import { money } from '../lib/format.js';
import { isDisagreement } from '../lib/analysis.js';

export default function Review({ bills, verdicts, onVerdict, onContinue }) {
  const disagreements = useMemo(
    () => bills.filter(isDisagreement).sort((a, b) => b.amount - a.amount),
    [bills],
  );
  const agreements = useMemo(() => bills.filter((b) => !isDisagreement(b)), [bills]);

  const reviewedCount = disagreements.filter((b) => verdicts[b.bill_id]).length;
  const total = disagreements.length;
  const allReviewed = reviewedCount === total;

  return (
    <div className="column">
      <div className="screen-eyebrow">Agent Probation</div>
      <h1 className="screen-hero">
        Your AP agent made <strong>{bills.length}</strong> shadow decisions over 14 days.
      </h1>
      <p className="screen-sub">
        {agreements.length} matched yours · {disagreements.length} need your review ·{' '}
        <span className="tnum">{money(0)}</span> at risk
      </p>

      <div className="cards-stack">
        {disagreements.map((bill) => (
          <DisagreementCard
            key={bill.bill_id}
            bill={bill}
            verdict={verdicts[bill.bill_id] ?? null}
            onVerdict={onVerdict}
          />
        ))}
      </div>

      <AgreementsTable agreements={agreements} />

      <div className="review-footer">
        <div className="review-footer__inner">
          <span className="review-footer__count">
            {reviewedCount} of {total} reviewed
          </span>
          <span title={allReviewed ? undefined : 'Review all disagreements first.'}>
            <Button variant={allReviewed ? 'primary' : 'secondary'} disabled={!allReviewed} onClick={onContinue}>
              Continue to graduation
            </Button>
          </span>
        </div>
      </div>
    </div>
  );
}
