# PRD: Agent Probation for Ramp
**Ramp Hackathon · "Save Time, Save Money" · 4-hour build**

## The one sentence (what a judge must remember)
Ramp's Policy Agent reviews one transaction at a time — by their own docs it *"cannot look across multiple transactions."* We built the layer that judges the agent's **whole track record** and turns it into a **capped grant of authority.**

## What we're building (plain words)
A finance controller puts their AP bill-approval agent in **shadow mode**: for two weeks it watches real bills and records what it *would* have done, surfacing nothing at decision time and touching nothing. Then they review the record at once — "200 decisions, 187 matched you; here are the 13 disagreements" — judge the misses, and **graduate** the agent to limited autonomy under a dollar cap (auto-approve under $1,000, max $500/day, else escalate).
*Ramp gave your agent a key to the vault. We give it a probation period with a spending leash.*

**No AI in the demo.** The "agent's decisions" are authored JSON fields. Backend = serve JSON, compute percentages, track a dollar total. CRUD difficulty. We're demoing the trust interface, not an agent — say so if asked.

## Shadow mode ≠ Policy Agent (know this cold)
Policy Agent is **recommend mode**: it suggests on each expense while a human decides live. **Shadow mode** records silently and builds a track record to judge *later*. Different loop. Policy Agent also can't look across transactions; our whole product is cross-transaction.

## Verified sources (cite with confidence)
- **Support doc:** Policy Agent "evaluates data on a transaction-by-transaction basis and cannot look across multiple transactions." → our cross-transaction wedge.
- **Internal article** (Agentic Risk Operations, Ramp, 6/30/26): risk agents get a *"dedicated exposure budget"*, total exposure *"capped, so we always know the risk we're carrying"*; **40% automated, 95% target**; thesis *"agents route, but policies decide."* → our dollar cap is their own discipline, made usable by a non-expert. (Their internal shadow mode = operators testing config changes; don't overstate it.)

## Differentiation (ranked — lead with #1)
1. **Cross-transaction vs. per-transaction** — the structural gap their docs admit.
2. **A decision, not a dashboard** — their dashboard shows an alignment %; we attach a bounded grant of authority to it.
3. **A dollar cap** — absent from the customer product; present internally.

**Don't claim** (all false — Policy Agent does them): "we explain reasoning / cite policy," "we start in review-only mode," "we show agreement rates." The last survives only as "…with a decision + cap attached."

**Win the "Ramp could just add this" objection:** we don't sell duplicate-detection (a feature); we sell trust-graduation (a product). The duplicate catch is *evidence*, not the product.

## Screens (2 interactive + 1 static)
**1 — Review.** Header: "200 shadow decisions · 187 matched · 13 need review · $0 at risk." The 13 disagreements as cards, **sorted by $ descending**: vendor + amount, "You approved" vs "Agent would flag," one-line reasoning, buttons `Agent was right / I was right / Unclear`. On click, card settles (border color, others fade) — **does not collapse.** Sticky footer "9 of 13" + `Continue` (enables at 13/13). 187 agreements = one collapsed line → plain table.
**2 — Graduation.** "Set the leash." Three controls, each **prefilled from the review** with the evidence beside it: auto-approve threshold ("100% agreement under $1,000"), daily cap (~1.5× avg daily approved volume under threshold), escalation rules (new vendor / over threshold / unsure). Confirm button (acid yellow) → screen 3. **This pairing is the thesis — polish here.**
**3 — Live (static).** "AP Agent · live · Day 3," "$340 of $500 cap used," "12 auto-approved · 2 escalated," audit line "Approved by AP Agent (via Sarah)."
**Cut:** onboarding, auth, settings, notifications, real agent, token dashboards.

## Alignment with the track
**Save Time:** the win is the agent getting turned *on* — Ramp's own 40%→95% automation, reachable only once trust exists. Routine bills stop hitting the queue; controller sees only escalations.
**Save Money:** catches cross-transaction errors a per-transaction check can't (duplicate = real dollars); caps worst-case exposure to a known number; redeploys expensive judgment to exceptions.

---

# Roles & task delegation

**Frozen at 0:00 (whiteboard, before any code):** the schema + four function names. Nobody renames a field after this.
```
Schema: { bill_id, vendor, amount(number), date("YYYY-MM-DD"),
  human_decision(approved|rejected), agent_proposal(approve|reject|flag),
  agent_reasoning, verdict(null|agent_right|human_right|unclear) }
Agreement = human approved & agent approve, OR human rejected & agent reject.
Contract: getBills(), saveVerdict(id,verdict), agreementByBand(bills), suggestedSettings(bills,verdicts)
```

### Designer / Frontend (you) — the screens
- **Done already:** Ramp tokens (Inter; near-black `#1A1A17` on off-white `#FAF9F5`; borders `#E7E4DC`; acid-yellow `#F5FF78` only on confirm + tiny chips; muted green/red/amber). Button/Card/row components.
- **0:15–1:15** Review — hardcode 3 bills, then BE1's placeholders. Filter + sort live in-component. **Card timeboxed to 40 min.**
- **1:15–2:00** Graduation — call BE2's functions for prefills; render evidence sentence per control.
- **2:00–2:15** static frame (third React view). View switch = `useState('review'|'graduation'|'live')`, no router.
- Dollars: `tabular-nums`, `$4,120.00`. **You never compute business numbers; wrong number = BE2's bug, ugly card = yours.**

### BE1 — data plumbing + integration lead
- **0:00–0:15** own the schema freeze on the whiteboard.
- Stack: Vite + React, JSON imported as a file, **no server** unless early. Ship `getBills()` + `saveVerdict()`.
- Give designer ~10 placeholder rows by 0:30 so nobody blocks. Store verdicts in state (+ localStorage if quick); expose verdict counts.
- **~1:45** swap in BE3's real 200-row file (a file replacement — schema is frozen).
- **2:15+** integration lead / designer's pair. The "agent" is just fields — nothing to build that thinks.

### BE2 — graduation math + deck
- Three functions in `analysis.js`: `agreementByBand` (% per <$1k/$1k–10k/>$10k band); `suggestedSettings` (threshold = largest band ≥98% agreement → $1,000; dailyCap = sum approved-under-threshold ÷14 ×1.5, round to $50); cap accounting for screen 3.
- **Must explain enforcement in one breath:** "before each auto-approval, check today's total + bill ≤ cap, else escalate." Own that Q.
- Deck skeleton: McKinsey stat → transaction-by-transaction doc quote → three screens.
- Likely finishes first → rehearsal, **not** a chart library.

### BE3 — the dataset (highest-leverage non-design job)
- **187 agreement rows** via script: 15 realistic vendors, amounts mostly $40–$2k, `approved/approve`, canned reasoning. **Keep under-$1,000 at 100% agreement; nothing dramatic below $1,000.**
- **13 disagreement rows, hand-written, all > $1,000:** the **duplicate invoice** (~$4,120, agent flags "matches invoice paid 6 days ago" → demo peak); 2 high-dollar (>$10k); 1 agent-clearly-wrong ($12k annual renewal flagged on 14-day history → honesty exhibit); 1 ambiguous; 8 plausible small (new vendor, 3× usual, missing PO, weekend-dated…). Reread aloud — kill anything that sounds AI-generated.

## Timeline
`0:00–0:15` freeze schema + names + confirm 13 beats · `0:15–2:15` parallel build · `2:15–3:00` integration (BE1 drives) · `3:00–3:25` freeze + finalize pitch · `3:25–4:00` one timed rehearsal + Q&A drill.
*Slip past 3:15 → Graduation becomes non-editable, narrated.*

## Demo (~3 min) — present on our terms, not as a Policy Agent comparison
Setup sentence → Review (click 3–4 verdicts, land the duplicate) → Graduation (evidence-prefilled leash, confirm) → static frame + one-liner. Comparison stays in Q&A.

## Judge Q&A
- **"Isn't this Policy Agent?"** Read them their doc: transaction-by-transaction, can't look across. We're the cross-transaction layer; they show a %, we attach a decision + cap.
- **"Ramp could add cross-transaction detection."** We sell trust-graduation, not detection. Duplicate = evidence, not product.
- **"Why hasn't Ramp built it?"** Can't speak to their roadmap; their product is deliberately transaction-by-transaction; we show the next layer. If they're building it, that validates us.
- **"Agreement ≠ safety / Ramp measures real outcomes."** Right, and we say it first: they score against real risk outcomes because they have an ML team and outcome data; a customer only has decision history — so we use agreement as the *starting* signal and **cap the dollars** because agreement isn't proof. The cap is the answer to imperfect ground truth.
- **"How real is the agent?"** A fixture. We built the trust apparatus; a scripted agent is reliable where a live one gambles.

## Success = walking out with
A documented case study: the three killed ideas + the evidence that killed each, the final flow, the research trail (the transaction-by-transaction find is the sharp part). That trail is the portfolio piece — win or not.