# AI Capex Monitor — Research Entity Card

**Reference date:** October 4, 2026
**News window:** September 27–October 4, 2026 (inclusive)
**Purpose:** Scope control for the weekly AI infrastructure capex refresh. Each quantitative claim must trace to a source published in the news window; older official reporting may appear only as explicitly dated context.

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

1. Use an official company IR release, filing, regulator/public-utility release, or industry-body publication where available; Reuters or another named wire may be used only when a contemporaneous primary source is unavailable.
2. Each finding must retain a stable source URL, source date within the stated news window, and a clear source type.
3. Do not treat estimates, stale reported results, or generic market commentary as current-period company disclosure.
4. If no defensible material development exists, return a clearly marked neutral no-development finding rather than fill the record with stale figures.
5. The monitor’s ingestion payload remains limited to `tag`, `headline`, `detail`, `signal`, and `source`; this entity card and the resulting audit retain URLs and validation context.
