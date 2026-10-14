# AI Capex Observatory — Universe Selection Audit

**Reference date:** 2026-10-13  
**Universe size:** 50 listed companies  
**Market-cap source:** Yahoo Finance trailing market-cap time series, collected in the refresh run.

## Selection definition

This is a **curated direct-AI-capex exposure screen**, not a claim to be the fifty largest companies in the entire public market. Names enter the screen when their business model has a material transmission path to one or more of: hyperscaler capacity spending, accelerators/memory/networking, systems and storage, firm power/grid/cooling, data-center real estate, or capital-intensive AI-cloud/power-site conversion. The screen intentionally retains strategically important capacity owners and financing-risk names that would not necessarily survive a purely size-based cross-market ranking.

Within this documented 50-name screen, rank is **descending trailing market capitalization**. Refreshes rerun the same manifest and re-rank it from the retrieved source data. Any future inclusion or exclusion requires an update to `data/ai_capex_universe_manifest.json` plus this audit.

## Coverage by sleeve

- **Hyperscaler:** 5
- **Compute & networking:** 16
- **Storage & data:** 4
- **Power & grid:** 13
- **Data-center infrastructure:** 3
- **Neocloud:** 6
- **AI software:** 3

## Validation

- All 50 manifest names had a non-null trailing market-cap observation on the reference date.
- Rank is contiguous from 1 to 50 and is generated after market-cap retrieval.
- Every name has a five-review structural council classification and aligned daily-return history in the companion dataset.
- The 180-calendar-day return window ends 2026-10-13 and contains 127 common trading days.

## Ranked universe

| Rank | Ticker | Company | Sleeve | Trailing market cap |
| ---: | --- | --- | --- | ---: |
| 1 | NVDA | NVIDIA | Compute & networking | $5445.4B |
| 2 | GOOGL | Alphabet | Hyperscaler | $4115.9B |
| 3 | MSFT | Microsoft | Hyperscaler | $3717.2B |
| 4 | AMZN | Amazon | Hyperscaler | $2688.7B |
| 5 | META | Meta Platforms | Hyperscaler | $1895.6B |
| 6 | AVGO | Broadcom | Compute & networking | $1740.2B |
| 7 | MU | Micron Technology | Compute & networking | $1210.6B |
| 8 | AMD | Advanced Micro Devices | Compute & networking | $1003.3B |
| 9 | INTC | Intel | Compute & networking | $648.1B |
| 10 | PLTR | Palantir Technologies | AI software | $460.9B |
| 11 | ORCL | Oracle | Hyperscaler | $437.1B |
| 12 | ARM | Arm Holdings | Compute & networking | $355.2B |
| 13 | DELL | Dell Technologies | Compute & networking | $349.6B |
| 14 | ANET | Arista Networks | Compute & networking | $256.6B |
| 15 | GEV | GE Vernova | Power & grid | $253.5B |
| 16 | QCOM | Qualcomm | Compute & networking | $210.7B |
| 17 | STX | Seagate Technology | Storage & data | $209.2B |
| 18 | WDC | Western Digital | Storage & data | $170.8B |
| 19 | ETN | Eaton | Power & grid | $170.4B |
| 20 | MRVL | Marvell Technology | Compute & networking | $168.3B |
| 21 | NEE | NextEra Energy | Power & grid | $160.7B |
| 22 | NOW | ServiceNow | AI software | $145.5B |
| 23 | SNOW | Snowflake | Storage & data | $118.1B |
| 24 | EQIX | Equinix | Data-center infrastructure | $102.4B |
| 25 | CEG | Constellation Energy | Power & grid | $100.9B |
| 26 | TT | Trane Technologies | Power & grid | $96.3B |
| 27 | VRT | Vertiv Holdings | Data-center infrastructure | $95.8B |
| 28 | PWR | Quanta Services | Power & grid | $95.5B |
| 29 | DDOG | Datadog | AI software | $90.3B |
| 30 | WMB | Williams Companies | Power & grid | $89.1B |
| 31 | JCI | Johnson Controls | Power & grid | $88.7B |
| 32 | LITE | Lumentum Holdings | Compute & networking | $84.0B |
| 33 | HPE | Hewlett Packard Enterprise | Compute & networking | $82.7B |
| 34 | KMI | Kinder Morgan | Power & grid | $69.9B |
| 35 | DLR | Digital Realty Trust | Data-center infrastructure | $67.3B |
| 36 | NBIS | Nebius Group | Neocloud | $61.6B |
| 37 | COHR | Coherent | Compute & networking | $60.8B |
| 38 | CRWV | CoreWeave | Neocloud | $47.9B |
| 39 | VST | Vistra | Power & grid | $46.3B |
| 40 | CARR | Carrier Global | Power & grid | $45.4B |
| 41 | NTAP | NetApp | Storage & data | $37.9B |
| 42 | CRDO | Credo Technology | Compute & networking | $36.4B |
| 43 | SMCI | Super Micro Computer | Compute & networking | $27.2B |
| 44 | HUBB | Hubbell | Power & grid | $24.5B |
| 45 | NRG | NRG Energy | Power & grid | $21.2B |
| 46 | MTSI | MACOM Technology Solutions | Compute & networking | $21.1B |
| 47 | IREN | IREN | Neocloud | $18.5B |
| 48 | WULF | TeraWulf | Neocloud | $8.2B |
| 49 | CIFR | Cipher Mining | Neocloud | $7.6B |
| 50 | CORZ | Core Scientific | Neocloud | $5.8B |

## Limitations

- “AI-capex exposure” is a judgment-based business-model screen; there is no authoritative exchange taxonomy for it.
- Market-cap values are time-stamped source observations and can change materially on subsequent refreshes.
- Council labels describe scenario transmission mechanisms, not valuation, expected return, or suitability.

*This is research and analysis only, not personalized financial advice.*
