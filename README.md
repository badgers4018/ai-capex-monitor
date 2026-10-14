# AI Capex Boom Monitor

Capital Misallocation reconstructed desk.

**Do not use Manus as the host.** `meissnermonitor.manus.space` is behind OAuth and the owning account reports deleted.

## Data-center permit intelligence

The [database-design package](docs/data-center-permit-intelligence/README.md) remains the immutable reference for the evidence-backed PostgreSQL model. This branch adds a **private, local-first module** using that schema: source ingestion, a React research desk, scoped authentication/review, company/parent evidence, API projections, and paired Excel/Markdown exports.

Read the [operator runbook](docs/implementation/RUNBOOK.md), [contracts](docs/implementation/CONTRACTS.md), [QA/handoff report](docs/implementation/QA_HANDOFF.md), and [implementation tracker](MASTER_TRACKER.md).

```bash
pnpm install --frozen-lockfile
pnpm setup:local  # Ubuntu + running PostgreSQL 16; generates private local credentials
pnpm migrate
pnpm ingest pwc_dc_inventory --baseline
pnpm dev:api     # terminal 1: loopback API
pnpm dev:ui      # terminal 2: http://127.0.0.1:5173 on YOUR development machine
```

Credentials are generated in private `.local/access.md`, never public Git. Verified source scope: **78 county campus records and 247 building records** at the test date; these are inventory records, not 325 additive announced deals. Unmatched buildings retain separate unresolved containers. DEQ is blocked from the tested direct runtime; Loudoun bulk collection remains unverified.

This is **not production deployment**, nationwide coverage, or integration into the unavailable external Grok frontend. No public UI, alert delivery, AI API, paid feed, or production schedule is enabled. The original financial book and weekly files below remain unchanged; permit evidence has a separately generated appendix.

## Weekly run

Linked as **AI Capex weekly tape**. Sunday 06:00 America/Los_Angeles. First fire under this spec: 6 Sep 2026.

Contract: [`weekly/README.md`](weekly/README.md). Output: `weekly/YYYY-MM-DD.md`.

Sources this run:

- **LIVE** IBKR equity (Mag5, NVDA, AVGO, TSM, CRWV, NBIS, IREN, VRT, HYG, LQD, SPY)
- **LIVE** FRED (10y, IG OAS, HY OAS, VIX, 2s10s)
- **LIVE** EDGAR 7-day footnote scan (OBS/leases/purchases only with a page cite)
- **LIVE** guidance / ratings / issuance search
- **MISSING** Markit/Bloomberg 5y CDS — CRWV 855 bp and ORCL 215 bp lagged; remaining named rows empty. Do not invent.
- **LOCKED** OBS $1.62T / combined $2.31T as-of 2026-07-20 until a filing cites a change.

Reject: Amazon OBS zeroed, any line item >30% WoW without a page cite, invented CDS.

## Evaluation — 2026-09-05

| Surface                                                         | Status                                                                                    |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| GitHub `main`                                                   | Stub app + weekly contract. The reconstructed React tree lives in the Grok app, not here. |
| GitHub Pages                                                    | 404. Pages is not enabled.                                                                |
| Vercel `ai-capex-monitor-capital-misallocation.vercel.app`      | SSO-gated. Cannot be used as a public host.                                               |
| Manus                                                           | OAuth wall. Do not depend on it.                                                          |
| Prior Grok workspace `/home/workdir/artifacts/ai-capex-monitor` | Gone.                                                                                     |

**Verdict:** the public hosts are empty or gated. The 25-section cockpit plus node schematic and Sunday run live in the current Grok app. CDS is the honest gap versus the old site — two lagged prints, the rest named and missing.

## Canonical book

- **OBS** $1.62T / **combined** $2.31T, as-of 2026-07-20
- **Tape:** AMZN $220B, GOOG $195–205B, MSFT $175B printed / $190B economic, META $125–145B
- **FCF-zero clock:** 15 Sep 2026
- CRWV 5y CDS 855 bp (29 Jul, lagged). ORCL 5y CDS 215 bp (lagged).

## 25-section cockpit

**Tape** 01 Opening tape · 02 FCF-zero clock · 03 Print vs economic · 04 Capex vs OCF

**Credit** 05 OBS book · 06 Combined leverage · 07 Uncommenced leases · 08 Purchase commits · 09 Debt wall · 10 Credit tape

**Circuit** 11 Circular financing · 12 Equity dilution · 13 LAG7 vs picks

**Physics** 14 Useful life · 15 Capex / GDP · 16 Historical rhymes · 17 Power · 18 Revenue gap · 19 Scenarios

**Ledger** 20 Weekly credit run · 21 June ledger · 22 Four Horsemen · 23 CMSS Case 49 · 24 Source ledger · 25 Method

Not investment advice.
