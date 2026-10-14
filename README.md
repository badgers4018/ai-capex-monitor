# Capital Misallocation — AI Capex Monitor

> **A trillion-dollar buildout is now searching for its economic clearing price.**

Capital Misallocation — AI Capex Monitor is an evidence-led research application for examining the investment, financing, power, and return dynamics of AI infrastructure. It is designed as a **research instrument**, not a promotional market feed: the product separates observed evidence, modeled assumptions, editorial inference, and scenario output.

**Not investment advice.**

## What is included

- **Editorial Paper** landing experience (white canvas, black ink), with a persistent optional **Dark Research** workspace.
- A curated **50-name AI-capex universe**, ranked by market capitalization within the documented direct-exposure screen.
- Dated adjusted-close price history and a **50 × 50 Pearson correlation matrix**.
- Company comparison, evidence ledger, capex/return analysis, power-grid constraints, and source methodology.
- Circular-financing and off-balance-sheet-risk surfaces, debt maturity wall, risk radar, and FCF model revalidation.
- Interactive scenarios, sensitivity analysis, scenario deep dive, 50-name exposure map, and portfolio-position builder.
- TradingView chart/watchlist handoff and downloadable watchlist symbols.
- Database-backed research changelog and architecture for scheduled research refreshes.
- Capital Misallocation brand system, product brand book, and authorized interim logo derivatives.

## Product principles

1. **Thesis → evidence → assumptions → readout → sources.**
2. Do not present modeled values as observed data.
3. Prefer investor relations, filings, earnings calls, regulators, utilities, and other primary sources.
4. A neutral “no update” is better than invented movement.
5. The AI Search interface is intentionally **disabled** to avoid unbounded public LLM cost. Do not re-enable it without authentication, entitlement, source validation, rate limiting, and budget controls.

## Technology

| Layer | Stack |
|---|---|
| Client | React 19, TypeScript, Vite, Tailwind CSS 4, Wouter |
| UI/data | TanStack Query, tRPC 11, Zod, SuperJSON, Radix UI, Recharts |
| Server | Express 4, tsx |
| Database | MySQL/TiDB, Drizzle ORM |
| Testing | Vitest; Playwright is used for browser QA |

## Local development

### Prerequisites

- Node.js 22+
- pnpm 10+
- MySQL-compatible database for database-backed features

### Commands

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm check
pnpm build
pnpm dev
```

### Environment

The original production environment supplied database, OAuth, storage, and data-service values. Configure new equivalents in a private environment file or your host’s secret manager. **Never commit database URLs, OAuth secrets, API keys, session cookies, or user exports.**

## Data refresh

The 50-name data is a dated research data set, not a real-time quote claim.

```bash
# Rebuild 50-name market/correlation data using the approved data provider
AI_CAPEX_AS_OF=YYYY-MM-DD manus-node scripts/refresh-ai-capex-universe.mjs

# Audit universe selection documentation
manus-node scripts/audit-ai-capex-universe.mjs

# Export public research records only; intentionally excludes users/subscribers
DATABASE_URL='mysql://…' node scripts/export-public-handoff-data.mjs output.json
```

Key generated data includes:

- `data/ai_capex_market_data_2026-10-13.json`
- `data/ai_capex_correlation_2026-10-13.json`
- `data/ai_capex_council_consensus_2026-10-13.json`
- `data/ai_capex_universe_manifest.json`

Read the dated research audits before making current claims:

- `research_refresh_audit_2026-09-27.md`
- `research_refresh_audit_2026-10-04.md`
- `research_refresh_audit_2026-10-11.md`

## Repository map

```text
client/                  React application
  src/pages/             Landing and dashboard composition
  src/components/        Research, risk, scenario, data and brand surfaces
  src/data/              Bundled dated data used by the interactive workspace
  src/contexts/          Persistent theme and motion preferences
server/                  tRPC routes, market data, scheduled research handlers
drizzle/                 Database schema and migrations
data/                    Reproducible 50-name market, correlation and council files
scripts/                 Data refresh, audit, consensus and public-export scripts
references/              Research and implementation reference material
```

## Brand and accessibility

- Parent brand: **Capital Misallocation**; product descriptor: **AI Capex Monitor**.
- Editorial type: Newsreader; UI/body: IBM Plex Sans; data/tickers: IBM Plex Mono.
- Default experience: **Editorial Paper** (`#FFFFFF` / `#111111`), persisted per visitor.
- Dark Research and Quiet / Standard / Dynamic motion are optional persistent preferences.
- Cyan is a semantic data/status color. Gold is archival/reference emphasis. Oxblood indicates risk.
- Respect `prefers-reduced-motion`; do not make animation required for comprehension.

The complete product-specific system is documented in:

- `capital-misallocation-ai-capex-monitor-brand-book.md`
- `capital-misallocation-ai-capex-monitor-brand-book.pdf`

## Scheduled research and security

`server/scheduledRefresh.ts` contains the weekly-research and authenticated agent-callback architecture. Before enabling automatic research in a new environment:

1. Add source URL/provenance tracking and deduplication.
2. Gate ingestion behind cron/service authentication.
3. Establish review, budget, retry, and alerting controls.
4. Keep LLM access server-side and rate-limited.

The original app’s database tables are defined in `drizzle/schema.ts`. Do not export or seed user/subscriber data without an explicit privacy-approved migration.

## License

This project is available under the [MIT License](LICENSE).
