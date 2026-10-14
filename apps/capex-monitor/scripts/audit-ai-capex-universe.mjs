import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const asOf = "2026-10-13";
const manifest = JSON.parse(await readFile(join(root, "data", "ai_capex_universe_manifest.json"), "utf8"));
const market = JSON.parse(await readFile(join(root, "data", `ai_capex_market_data_${asOf}.json`), "utf8"));
const council = JSON.parse(await readFile(join(root, "data", `ai_capex_council_consensus_${asOf}.json`), "utf8"));

const failures = [];
if (manifest.tickers.length !== 50 || market.companies.length !== 50 || council.classifications.length !== 50) failures.push("The manifest, market dataset, and council dataset must each contain exactly 50 names.");
const marketTickers = new Set(market.companies.map((company) => company.ticker));
if (manifest.tickers.some((company) => !marketTickers.has(company.ticker))) failures.push("Every manifest ticker must have a market-data record.");
if (market.companies.some((company, index) => company.rank !== index + 1 || typeof company.marketCap !== "number")) failures.push("Each market record must have a non-null market cap and contiguous ranking.");
if (failures.length) throw new Error(failures.join(" "));

const categoryCounts = manifest.tickers.reduce((counts, company) => {
  counts[company.category] = (counts[company.category] ?? 0) + 1;
  return counts;
}, {});
const rows = market.companies.map((company) => `| ${company.rank} | ${company.ticker} | ${company.name} | ${company.category} | $${(company.marketCap / 1e9).toFixed(1)}B |`).join("\n");
const report = `# AI Capex Observatory — Universe Selection Audit\n\n**Reference date:** ${asOf}  \n**Universe size:** 50 listed companies  \n**Market-cap source:** Yahoo Finance trailing market-cap time series, collected in the refresh run.\n\n## Selection definition\n\nThis is a **curated direct-AI-capex exposure screen**, not a claim to be the fifty largest companies in the entire public market. Names enter the screen when their business model has a material transmission path to one or more of: hyperscaler capacity spending, accelerators/memory/networking, systems and storage, firm power/grid/cooling, data-center real estate, or capital-intensive AI-cloud/power-site conversion. The screen intentionally retains strategically important capacity owners and financing-risk names that would not necessarily survive a purely size-based cross-market ranking.\n\nWithin this documented 50-name screen, rank is **descending trailing market capitalization**. Refreshes rerun the same manifest and re-rank it from the retrieved source data. Any future inclusion or exclusion requires an update to \`data/ai_capex_universe_manifest.json\` plus this audit.\n\n## Coverage by sleeve\n\n${Object.entries(categoryCounts).map(([category, count]) => `- **${category}:** ${count}`).join("\n")}\n\n## Validation\n\n- All 50 manifest names had a non-null trailing market-cap observation on the reference date.\n- Rank is contiguous from 1 to 50 and is generated after market-cap retrieval.\n- Every name has a five-review structural council classification and aligned daily-return history in the companion dataset.\n- The 180-calendar-day return window ends ${market.asOf} and contains 127 common trading days.\n\n## Ranked universe\n\n| Rank | Ticker | Company | Sleeve | Trailing market cap |\n| ---: | --- | --- | --- | ---: |\n${rows}\n\n## Limitations\n\n- “AI-capex exposure” is a judgment-based business-model screen; there is no authoritative exchange taxonomy for it.\n- Market-cap values are time-stamped source observations and can change materially on subsequent refreshes.\n- Council labels describe scenario transmission mechanisms, not valuation, expected return, or suitability.\n\n*This is research and analysis only, not personalized financial advice.*\n`;
const output = join(root, "data", `ai_capex_universe_selection_audit_${asOf}.md`);
await writeFile(output, report);
console.log(JSON.stringify({ output, universeSize: market.companies.length, categoryCounts }, null, 2));
