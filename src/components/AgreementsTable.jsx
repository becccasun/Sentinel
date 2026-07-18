import { useState } from 'react';
import { money } from '../lib/format.js';

const DECISION_LABEL = { approved: 'Approved', rejected: 'Rejected' };
const PROPOSAL_LABEL = { approve: 'Approve', reject: 'Reject', flag: 'Flag' };

// Collapsible "▸ 187 matches" line → dense table. No pagination.
export default function AgreementsTable({ agreements }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="agreements">
      <button
        type="button"
        className="agreements__toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="agreements__caret">{open ? '▾' : '▸'}</span>
        {agreements.length} matches
      </button>

      {open && (
        <div className="agreements__table" role="table">
          <div className="trow trow--head" role="row">
            <span role="columnheader">Vendor</span>
            <span className="trow__amount" role="columnheader">
              Amount
            </span>
            <span role="columnheader">Date</span>
            <span role="columnheader">Your decision</span>
            <span role="columnheader">Agent proposal</span>
          </div>
          {agreements.map((b) => (
            <div className="trow" role="row" key={b.bill_id}>
              <span role="cell">{b.vendor}</span>
              <span className="trow__amount tnum" role="cell">
                {money(b.amount)}
              </span>
              <span className="trow__muted" role="cell">
                {b.date}
              </span>
              <span role="cell">{DECISION_LABEL[b.human_decision]}</span>
              <span role="cell">{PROPOSAL_LABEL[b.agent_proposal]}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
