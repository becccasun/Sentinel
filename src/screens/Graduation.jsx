import { useMemo, useState } from 'react';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import StatChip from '../components/StatChip.jsx';
import { money } from '../lib/format.js';
import { agreementByBand, suggestedSettings, verdictTally } from '../lib/analysis.js';

export default function Graduation({ bills, verdicts, onConfirm }) {
  const settings = useMemo(() => suggestedSettings(bills, verdicts), [bills, verdicts]);
  const bands = useMemo(() => agreementByBand(bills), [bills]);
  const tally = useMemo(() => verdictTally(verdicts), [verdicts]);

  const [threshold, setThreshold] = useState(settings.threshold);
  const [dailyCap, setDailyCap] = useState(settings.dailyCap);
  const [rules, setRules] = useState({ newVendors: true, overThreshold: true, unsure: true });

  const underThresholdPct = bands[0]?.pct ?? 100;

  return (
    <div className="column">
      <h1 className="screen-hero">Set the leash.</h1>
      <p className="screen-sub">Based on your review, here’s where the evidence supports starting.</p>

      <div className="verdict-summary">
        <StatChip tone="approve">Agent was right {tally.agent_right}×</StatChip>
        <StatChip tone="reject">You were right {tally.human_right}×</StatChip>
        <StatChip tone="flag">{tally.unclear} unclear</StatChip>
      </div>

      <div className="section-gap">
        <Card>
          <div className="control-block">
            <div>
              <div className="control-block__title">Auto-approve threshold</div>
              <div className="money-input">
                <span className="money-input__prefix">$</span>
                <input
                  type="number"
                  value={threshold}
                  min={0}
                  step={50}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  aria-label="Auto-approve threshold in dollars"
                />
              </div>
            </div>
            <p className="control-block__evidence">
              You agreed with the agent on <strong>{underThresholdPct}%</strong> of bills under{' '}
              {money(1000)}.
            </p>
          </div>
        </Card>
      </div>

      <div className="section-gap">
        <Card>
          <div className="control-block">
            <div>
              <div className="control-block__title">Daily exposure cap</div>
              <div className="money-input">
                <span className="money-input__prefix">$</span>
                <input
                  type="number"
                  value={dailyCap}
                  min={0}
                  step={50}
                  onChange={(e) => setDailyCap(Number(e.target.value))}
                  aria-label="Daily exposure cap in dollars"
                />
              </div>
            </div>
            <p className="control-block__evidence">
              ≈1.5× your average daily approved volume under the threshold.
            </p>
          </div>
        </Card>
      </div>

      <div className="section-gap">
        <Card>
          <div className="control-block">
            <div>
              <div className="control-block__title">Escalation rules</div>
              <div className="checks">
                <label className="check">
                  <input
                    type="checkbox"
                    checked={rules.newVendors}
                    onChange={(e) => setRules((r) => ({ ...r, newVendors: e.target.checked }))}
                  />
                  New vendors
                </label>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={rules.overThreshold}
                    onChange={(e) => setRules((r) => ({ ...r, overThreshold: e.target.checked }))}
                  />
                  Bills over the threshold
                </label>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={rules.unsure}
                    onChange={(e) => setRules((r) => ({ ...r, unsure: e.target.checked }))}
                  />
                  Agent is unsure
                </label>
              </div>
            </div>
            <p className="control-block__evidence">These always come to you.</p>
          </div>
        </Card>
      </div>

      <div className="graduate-cta">
        <Button variant="primary" onClick={() => onConfirm({ threshold, dailyCap, rules })}>
          Put the agent on the leash
        </Button>
      </div>
    </div>
  );
}
