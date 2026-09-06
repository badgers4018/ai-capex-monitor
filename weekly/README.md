# Weekly tape

Sunday 06:00 America/Los_Angeles. Linked as **AI Capex weekly tape**.

Output: `weekly/YYYY-MM-DD.md` here.

## Contract

Canonical book, do not move without a filing page-cite:

- OBS $1.62T / combined $2.31T as-of 2026-07-20
- META 420 / MSFT 380 / AMZN 320 / GOOG 280 / ORCL 220
- Tape: AMZN $220B, GOOG $195–205B, MSFT $175B printed / $190B economic, META $125–145B
- FCF-zero: 15 Sep 2026

Reject:

- any raw pull that zeros Amazon OBS
- any line item that moves more than 30% WoW without a page cite
- any invented CDS print

## Sources this run

| Source | Wire | What it feeds |
|---|---|---|
| IBKR US equity | LIVE | Mag5, NVDA, AVGO, TSM, CRWV, NBIS, IREN, VRT, HYG, LQD, SPY |
| FRED | LIVE | 10y, IG OAS, HY OAS, VIX, 2s10s |
| EDGAR 7-day scan | LIVE | OBS / leases / purchases only with a page cite |
| Web search | LIVE | Guidance, ratings, issuance, circular, power |
| Markit / Bloomberg 5y CDS | MISSING | Named empty rows. CRWV 855 bp and ORCL 215 bp stay lagged |
| Desk book | LOCKED | OBS / combined / FCF-zero |

HYG, LQD, IG OAS, HY OAS are proxies. They are not CDS.

## Tape shape (8 lines)

1. Week ending YYYY-MM-DD. Book held/moved.
2. Equity: Mag5 vs SPY 1w. CRWV / ORCL / NBIS.
3. Credit proxies: 10y, IG OAS, HY OAS. CDS: lagged CRWV/ORCL + missing list.
4. Filings: none / N footnotes with cites.
5. Guidance: none / revisions.
6. Paper: none / issuance.
7. FCF-zero clock: N days to 15 Sep 2026.
8. Watch item for next week.

Then: WoW capex-guide table, credit table including MISSING rows, OBS/lease/VIE only if cited, 5–8 changelog bullets tagged bullish / bearish / neutral.

Not investment advice.
