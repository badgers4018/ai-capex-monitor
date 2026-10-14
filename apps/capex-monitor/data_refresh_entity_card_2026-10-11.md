# AI Capex Boom Monitor — Live Data Refresh Entity Card

**Reference date:** October 11, 2026  
**Objective:** Refresh the monitor’s visible public-market snapshot, dated research feed, and as-of labels without altering scenario assumptions, historical correlation windows, or analyst-model inputs unless a traceable replacement data source supports the change.

| Entity | Ticker / exchange | Listing status | Fiscal year end | Currency | Monitor use |
|---|---|---|---|---|---|
| NVIDIA Corporation | NVDA / Nasdaq | Public | Late January | USD | Bellwether quote, fundamentals, research |
| Microsoft Corporation | MSFT / Nasdaq | Public | June | USD | Bellwether quote, fundamentals, research |
| Alphabet Inc. | GOOGL / Nasdaq | Public | December | USD | Bellwether quote, fundamentals, research |
| Amazon.com, Inc. | AMZN / Nasdaq | Public | December | USD | Bellwether quote, fundamentals, research |
| Meta Platforms, Inc. | META / Nasdaq | Public | December | USD | Bellwether quote, fundamentals, research |
| CoreWeave, Inc. | CRWV / Nasdaq | Public | December | USD | Bellwether quote, debt and capacity research |
| Oracle Corporation | ORCL / NYSE | Public | May | USD | Bellwether quote, OCI and debt research |
| Broadcom Inc. | AVGO / Nasdaq | Public | November | USD | Semiconductor supply-chain research |
| Advanced Micro Devices, Inc. | AMD / Nasdaq | Public | December | USD | Semiconductor supply-chain research |
| Taiwan Semiconductor Manufacturing Co. Ltd. | TSM / NYSE ADR | Public | December | USD | Semiconductor supply-chain research |
| Nebius Group N.V. | NBIS / Nasdaq | Public | December | USD | AI cloud research |
| Other monitor holdings | See source components | Public, where listed | Issuer-specific | USD | Correlation and position-builder universe; do not refresh unsupported model fields opportunistically |

## Refresh rules

1. **Market snapshot:** Use the most recent regular-market close or clearly labelled latest trade from a structured financial-market source; never mix sessions without a visible as-of timestamp.
2. **Financials:** Preserve reported-period labels and do not overwrite static model projections with point-in-time market data.
3. **Research:** Replace the dated Oct. 11 batch only after a source-linked validation pass proves it materially less accurate or stale. Never append another ten rows for the same date.
4. **Scenario/portfolio analytics:** Maintain existing model assumptions and historical windows unless the monitor code labels the data as live and a complete source-consistent update is available.
5. **Provenance:** Save raw API output and a refresh audit in project files before modifying UI or database content.
