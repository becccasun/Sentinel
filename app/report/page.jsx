'use client';
import { useStore } from '@/lib/store';
import Finding from '@/components/Finding';
import Phone from '@/components/Phone';
import { buildReport } from '@/lib/derive';
import { Bolt } from '@/lib/icons';

export default function ReportPage() {
  const { state, toggleSms, setTime } = useStore();
  const r = buildReport(state);

  return (
    <>
      <h1 className="page-h">Daily report</h1>
      <p className="page-sub">Sentinel reviews all your connected platforms every morning and texts you what changed, what matters, and what to do next.</p>

      <div className="split">
        <div>
          <div className="report">
            <div className="r-head">
              <h3>Friday check-in</h3>
              <div className="r-date">July 18, 2026 · delivered {state.reportTime} {state.smsOn ? 'via SMS + in-app' : 'in-app'}</div>
              <span className="r-badge">Today</span>
            </div>
            <div className="r-sec">
              <div className="r-k">Short-term · since yesterday</div>
              {r.shortTerm.map((f, i) => <Finding key={i} ic={f.ic} html={f.text} />)}
              {state.reportExtras.map((e, i) => <Finding key={'x' + i} ic="check" html={e} />)}
            </div>
            <div className="r-sec">
              <div className="r-k">Long-term · goals & guardrails</div>
              {r.longTerm.map((f, i) => <Finding key={i} ic={f.ic} html={f.text} />)}
            </div>
            <div className="r-sec">
              <div className="r-k">Recommended action</div>
              <div className="action-box">
                <span className="f-ic"><Bolt /></span>
                <span dangerouslySetInnerHTML={{ __html: r.action.html }} />
              </div>
            </div>
          </div>

          <div className="pagebody"><h2>Earlier this week</h2></div>
          <div className="report-mini"><span className="rm-date">Thu Jul 17</span><span className="rm-t">Groceries trending 12% under budget. Paycheck landed ($2,140). No action needed.</span><span className="pill gray">Read</span></div>
          <div className="report-mini"><span className="rm-date">Wed Jul 16</span><span className="rm-t">Flagged Peacock: unused for 45+ days. Suggested cancellation, saves $95.88/yr.</span><span className="pill gray">Read</span></div>
          <div className="report-mini"><span className="rm-date">Tue Jul 15</span><span className="rm-t">Rent cleared. Cash cushion healthy at 3.2× weekly spend. Portfolio +1.1%.</span><span className="pill gray">Read</span></div>

          <div className="pagebody">
            <h2>Delivery</h2>
            <p className="desc">Reports land every morning. Reply to the text to ask follow-ups.</p>
          </div>
          <div className="panel" style={{ marginTop: 0 }}>
            <div className="p-pad" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <button className={`tog ${state.smsOn ? 'on' : ''}`} onClick={toggleSms}>
                <span className="tr" />
                <span className="tl">Text me my daily report<span className="ts">SMS to (734) 555-0132 · also available in-app</span></span>
              </button>
              <div className="field" style={{ maxWidth: 220 }}>
                <label>Delivery time</label>
                <select value={state.reportTime} onChange={e => setTime(e.target.value)}>
                  {['7:00 AM', '8:00 AM', '9:00 AM', '6:00 PM'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <Phone />
      </div>
    </>
  );
}
