# AI Capex Monitor — Research Entity Card

**Reference date:** October 11, 2026  
**News window:** October 4–11, 2026 (inclusive)  
**Purpose:** Scope control for the weekly AI infrastructure capex refresh. Each quantitative claim must trace to a source published in the news window; older disclosures may appear only as explicitly dated context.

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
| Power Grid | North American power and grid supply chain | Sector / no single issuer | N/A | USD unless source states otherwise | Data-center interconnection delays, transformer shortages, energy deals |
| Semiconductors | AI infrastructure semiconductor supply chain | TSMC, AMD, Broadcom / public | Calendar or issuer-specific | USD unless source states otherwise | CoWoS, MI-series, custom ASICs |

## Validation protocol

1. Prefer official IR releases, regulatory filings, regulator/public-utility releases, and industry bodies; use named financial media only when a contemporaneous primary source is unavailable.
2. Each returned finding must contain a stable source URL, publication date within Oct. 4–11, 2026, and source type.
3. Separate reported actuals from forward guidance or announced plans; do not re-label old quarterly figures as new weekly news.
4. If no defensible development exists, return a clearly marked neutral no-development finding rather than using stale or inferred information.
5. The site payload remains limited to `tag`, `headline`, `detail`, `signal`, and `source`; the research audit retains URLs and validation context.
