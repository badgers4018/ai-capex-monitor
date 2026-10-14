# AI Capex Monitor — Research Entity Card

**Reference date:** September 27, 2026  
**News window:** September 20–27, 2026 (inclusive)  
**Purpose:** Scope control for the weekly AI infrastructure capex refresh. All quantitative claims must be tied to a source published in the news window; older official reporting may be used only as context and must be labeled as such.

| Topic | Legal/common entity or scope | Ticker / listing status | Fiscal year end | Reporting currency | Research focus |
|---|---|---|---|---|---|
| NVIDIA | NVIDIA Corporation | NVDA / Nasdaq / public | Late January | USD | Quarterly earnings, data-center revenue, forward guidance |
| CoreWeave | CoreWeave, Inc. | CRWV / Nasdaq / public | December | USD | Revenue, backlog, debt, customer concentration |
| Nebius | Nebius Group N.V. | NBIS / Nasdaq / public | December | USD | Meta relationship, NVIDIA investment, power capacity |
| Amazon | Amazon.com, Inc. / AWS segment | AMZN / Nasdaq / public | December | USD | AWS capex execution and data-center buildout |
| Microsoft | Microsoft Corporation / Azure segment | MSFT / Nasdaq / public | June | USD | Azure capacity, capex, AI revenue |
| Alphabet | Alphabet Inc. / Google Cloud segment | GOOGL / Nasdaq / public | December | USD | Google Cloud growth, revenue, capex guidance |
| Meta | Meta Platforms, Inc. | META / Nasdaq / public | December | USD | AI infrastructure, custom chips, capex |
| Oracle | Oracle Corporation | ORCL / NYSE / public | May | USD | OCI revenue, RPO, free cash flow, debt |
| Power Grid | North American power and grid supply chain | Sector / no single issuer | N/A | USD unless source states otherwise | Data-center interconnection delays, transformers, energy deals |
| Semiconductors | AI infrastructure semiconductor supply chain | TSMC, AMD, Broadcom / public | Calendar or issuer-specific | USD unless source states otherwise | CoWoS, MI-series, custom ASICs |

## Source and validation rules

1. Prefer company IR releases, filings, regulator/public-utility releases, and industry-body publications; use Reuters or another named wire only when a primary source is unavailable.
2. Each selected item needs a stable source URL, a visible publication date within the stated window, and an exact source attribution.
3. Do not infer current-quarter financial results from estimates or market commentary. Label prior reported results as prior-period context.
4. The final ingestion object permits only `tag`, `headline`, `detail`, `signal`, and `source`; the accompanying research output retains URLs and dates for audit.
5. If no defensible material development is found for a topic, return a neutral no-development finding rather than fabricate a numeric update.
