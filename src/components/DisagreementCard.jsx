import Card from './Card.jsx';
import { money } from '../lib/format.js';

const VERDICT_BORDER = {
  agent_right: 'var(--approve)',
  human_right: 'var(--reject)',
  unclear: 'var(--flag)',
};

const DECISION_COLOR = {
  approved: 'var(--approve)',
  rejected: 'var(--reject)',
};

const PROPOSAL_COLOR = {
  approve: 'var(--approve)',
  reject: 'var(--reject)',
  flag: 'var(--flag)',
};

const PROPOSAL_LABEL = {
  approve: 'Would approve',
  reject: 'Would reject',
  flag: 'Would flag',
};

const DECISION_LABEL = {
  approved: 'Approved',
  rejected: 'Rejected',
};

const VERDICT_OPTIONS = [
  { key: 'agent_right', label: 'Agent was right' },
  { key: 'human_right', label: 'I was right' },
  { key: 'unclear', label: 'Unclear' },
];

// Marks the duplicate-invoice card (the demo peak).
function isDuplicate(bill) {
  return /duplicate/i.test(bill.agent_reasoning);
}

export default function DisagreementCard({ bill, verdict, onVerdict }) {
  const settled = Boolean(verdict);
  const highDollar = bill.amount > 10000;

  return (
    <Card
      className={`dcard ${settled ? 'dcard--settled' : ''}`.trim()}
      accentColor={verdict ? VERDICT_BORDER[verdict] : undefined}
    >
      <div className="dcard__head">
        <div className="dcard__vendor">
          <span className="dcard__vendor-name">{bill.vendor}</span>
          {isDuplicate(bill) && <span className="chip chip--flag">Possible duplicate</span>}
          {highDollar && <span className="chip chip--reject">High dollar</span>}
        </div>
        <div className="dcard__amount tnum">{money(bill.amount)}</div>
      </div>

      <div className="dcard__meta">
        {bill.date} · {bill.bill_id}
      </div>

      <div className="dcard__cols">
        <div className="dcard__col">
          <div className="dcard__label">You</div>
          <div className="dcard__value" style={{ color: DECISION_COLOR[bill.human_decision] }}>
            {DECISION_LABEL[bill.human_decision]}
          </div>
        </div>
        <div className="dcard__col">
          <div className="dcard__label">Agent</div>
          <div className="dcard__value" style={{ color: PROPOSAL_COLOR[bill.agent_proposal] }}>
            {PROPOSAL_LABEL[bill.agent_proposal]}
          </div>
        </div>
      </div>

      <div className="dcard__reasoning">
        <span className="dcard__reasoning-label">Agent’s reasoning:</span> {bill.agent_reasoning}
      </div>

      <div className="dcard__verdicts" role="group" aria-label="Your verdict">
        {VERDICT_OPTIONS.map((opt) => {
          const active = verdict === opt.key;
          const dimmed = settled && !active;
          return (
            <button
              key={opt.key}
              type="button"
              className={`verdict-btn ${active ? 'verdict-btn--active' : ''} ${
                dimmed ? 'verdict-btn--dimmed' : ''
              }`.trim()}
              aria-pressed={active}
              onClick={() => onVerdict(bill.bill_id, opt.key)}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
