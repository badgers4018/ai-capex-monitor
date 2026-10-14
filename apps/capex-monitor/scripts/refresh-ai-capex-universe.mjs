#!/usr/bin/env manus-node
/**
 * Refreshes the 50-name AI Capex Observatory universe.
 * Data API use: YahooFinance/get_stock_chart (discovered 2026-10-13).
 * Public fallback: Yahoo Finance trailingMarketCap fundamentals endpoint.
 *
 * Output:
 *   data/ai_capex_market_data_2026-10-13.json
 *   data/ai_capex_correlation_2026-10-13.json
 *   client/src/data/aiCapexMarketData.ts
 */
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");
const asOf = process.env.AI_CAPEX_AS_OF ?? "2026-10-13";
const manifestPath = join(projectRoot, "data", "ai_capex_universe_manifest.json");
const outputDir = join(projectRoot, "data");
const clientOutputDir = join(projectRoot, "client", "src", "data");
const { ApiClient } = await import(pathToFileURL("/home/ubuntu/skills/data-api/lib/data-api.mjs").href);
const client = new ApiClient();

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
if (!Array.isArray(manifest.tickers) || manifest.tickers.length !== 50) {
  throw new Error(`Expected exactly 50 tickers in the manifest; received ${manifest.tickers?.length ?? 0}`);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchTrailingMarketCap(symbol, attempt = 1) {
  const period2 = Math.floor(new Date(`${asOf}T23:59:59Z`).getTime() / 1000);
  const period1 = period2 - 365 * 24 * 60 * 60;
  const endpoint = new URL(`https://query1.finance.yahoo.com/ws/fundamentals-timeseries/v1/finance/timeseries/${encodeURIComponent(symbol)}`);
  endpoint.searchParams.set("symbol", symbol);
  endpoint.searchParams.set("type", "trailingMarketCap");
  endpoint.searchParams.set("period1", String(period1));
  endpoint.searchParams.set("period2", String(period2));
  const response = await fetch(endpoint, { headers: { "user-agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(30_000) });
  if (!response.ok) {
    if (response.status === 429 && attempt < 4) {
      await sleep(1_500 * attempt);
      return fetchTrailingMarketCap(symbol, attempt + 1);
    }
    throw new Error(`Market-cap response ${response.status}`);
  }
  const payload = await response.json();
  const entries = payload?.timeseries?.result?.[0]?.trailingMarketCap ?? [];
  const last = entries.at(-1);
  return {
    marketCap: typeof last?.reportedValue?.raw === "number" ? last.reportedValue.raw : null,
    marketCapAsOf: last?.asOfDate ?? null,
  };
}

function parseChart(symbol, item, payload) {
  const result = payload?.chart?.result?.[0];
  const meta = result?.meta;
  const timestamps = result?.timestamp ?? [];
  const adjusted = result?.indicators?.adjclose?.[0]?.adjclose ?? result?.indicators?.quote?.[0]?.close ?? [];
  const history = timestamps.map((timestamp, index) => {
    const adjustedClose = adjusted[index];
    if (typeof timestamp !== "number" || typeof adjustedClose !== "number" || adjustedClose <= 0) return null;
    return { date: new Date(timestamp * 1000).toISOString().slice(0, 10), adjustedClose };
  }).filter(Boolean);
  if (!meta || typeof meta.regularMarketPrice !== "number" || history.length < 80) {
    throw new Error(`Insufficient usable chart history (${history.length} observations)`);
  }
  return {
    ...item,
    symbol,
    price: meta.regularMarketPrice,
    marketTime: meta.regularMarketTime ?? null,
    currency: meta.currency ?? "USD",
    displayName: meta.longName ?? meta.shortName ?? item.name,
    high52: meta.fiftyTwoWeekHigh ?? null,
    low52: meta.fiftyTwoWeekLow ?? null,
    exchangeName: meta.fullExchangeName ?? meta.exchangeName ?? item.exchange,
    history,
  };
}

async function fetchOne(item, attempt = 1) {
  try {
    const chart = await client.callApi("YahooFinance/get_stock_chart", {
      query: { symbol: item.ticker, region: "US", interval: "1d", range: "6mo", includeAdjustedClose: true, events: "div,split" },
    });
    const parsed = parseChart(item.ticker, item, chart);
    return { ok: true, value: parsed };
  } catch (error) {
    if (attempt < 3) {
      await sleep(800 * attempt);
      return fetchOne(item, attempt + 1);
    }
    return { ok: false, ticker: item.ticker, error: error instanceof Error ? error.message : String(error) };
  }
}

async function mapWithConcurrency(items, limit, mapper) {
  const output = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      output[index] = await mapper(items[index]);
      process.stderr.write(`Fetched ${index + 1}/${items.length}: ${items[index].ticker}\n`);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return output;
}

function pearson(left, right) {
  const count = Math.min(left.length, right.length);
  if (count < 2) return null;
  const meanLeft = left.reduce((sum, value) => sum + value, 0) / count;
  const meanRight = right.reduce((sum, value) => sum + value, 0) / count;
  let numerator = 0;
  let leftVariance = 0;
  let rightVariance = 0;
  for (let index = 0; index < count; index++) {
    const leftDeviation = left[index] - meanLeft;
    const rightDeviation = right[index] - meanRight;
    numerator += leftDeviation * rightDeviation;
    leftVariance += leftDeviation ** 2;
    rightVariance += rightDeviation ** 2;
  }
  const denominator = Math.sqrt(leftVariance * rightVariance);
  return denominator === 0 ? null : numerator / denominator;
}

function dailyReturnMap(history) {
  const prices = new Map(history.map((entry) => [entry.date, entry.adjustedClose]));
  const dates = [...prices.keys()].sort();
  const output = new Map();
  for (let index = 1; index < dates.length; index++) {
    const current = prices.get(dates[index]);
    const prior = prices.get(dates[index - 1]);
    if (typeof current === "number" && typeof prior === "number" && prior > 0) {
      output.set(dates[index], current / prior - 1);
    }
  }
  return output;
}

await mkdir(outputDir, { recursive: true });
await mkdir(clientOutputDir, { recursive: true });
const fetches = await mapWithConcurrency(manifest.tickers, 6, fetchOne);
const failures = fetches.filter((result) => !result.ok);
if (failures.length > 0) {
  throw new Error(`Unable to collect all 50 symbols: ${failures.map((failure) => `${failure.ticker}: ${failure.error}`).join("; ")}`);
}
const chartCompanies = fetches.map((result) => result.value);
const capFailures = [];
for (const company of chartCompanies) {
  try {
    const cap = await fetchTrailingMarketCap(company.ticker);
    if (typeof cap.marketCap !== "number") throw new Error("No trailing market-cap observation returned");
    Object.assign(company, cap);
    process.stderr.write(`Fetched market cap: ${company.ticker}\n`);
    await sleep(450);
  } catch (error) {
    capFailures.push({ ticker: company.ticker, error: error instanceof Error ? error.message : String(error) });
  }
}
if (capFailures.length > 0) {
  throw new Error(`Unable to collect valid market caps: ${capFailures.map((failure) => `${failure.ticker}: ${failure.error}`).join("; ")}`);
}
const companies = chartCompanies.sort((a, b) => b.marketCap - a.marketCap);
const returnsByTicker = new Map(companies.map((company) => [company.ticker, dailyReturnMap(company.history)]));
const sharedDates = [...new Set(companies.flatMap((company) => [...returnsByTicker.get(company.ticker).keys()]))]
  .filter((date) => companies.every((company) => returnsByTicker.get(company.ticker).has(date)))
  .sort();
if (sharedDates.length < 80) {
  throw new Error(`Only ${sharedDates.length} common daily-return observations; expected at least 80`);
}
const tickers = companies.map((company) => company.ticker);
const matrix = tickers.map((rowTicker, rowIndex) => tickers.map((columnTicker, columnIndex) => {
  if (rowIndex === columnIndex) return 1;
  const rowReturns = sharedDates.map((date) => returnsByTicker.get(rowTicker).get(date));
  const columnReturns = sharedDates.map((date) => returnsByTicker.get(columnTicker).get(date));
  const value = pearson(rowReturns, columnReturns);
  return value === null ? null : Number(value.toFixed(4));
}));
const start = sharedDates[0];
const end = sharedDates.at(-1);
const publicCompanies = companies.map(({ history, ...company }, index) => ({ rank: index + 1, ...company }));
const marketOutput = {
  asOf,
  source: "Yahoo Finance via Manus Data API (adjusted daily closes); Yahoo Finance trailing market-cap endpoint",
  methodology: manifest.methodology,
  universeSize: publicCompanies.length,
  companies: publicCompanies,
};
const correlationOutput = {
  asOf,
  method: "Pearson correlation of aligned adjusted-close daily returns",
  calendarWindow: "6 months / 180 calendar days",
  start,
  end,
  tradingDays: sharedDates.length,
  tickers,
  matrix,
};
await writeFile(join(outputDir, `ai_capex_market_data_${asOf}.json`), `${JSON.stringify(marketOutput, null, 2)}\n`);
await writeFile(join(outputDir, `ai_capex_correlation_${asOf}.json`), `${JSON.stringify(correlationOutput, null, 2)}\n`);
const ts = `/** Generated by scripts/refresh-ai-capex-universe.mjs on ${asOf}. */\n` +
  `export const AI_CAPEX_UNIVERSE_AS_OF = ${JSON.stringify(asOf)} as const;\n` +
  `export const AI_CAPEX_UNIVERSE_METHODOLOGY = ${JSON.stringify(manifest.methodology)} as const;\n` +
  `export const AI_CAPEX_UNIVERSE = ${JSON.stringify(publicCompanies)} as const;\n` +
  `export const AI_CAPEX_CORRELATION = ${JSON.stringify(correlationOutput)} as const;\n`;
await writeFile(join(clientOutputDir, "aiCapexMarketData.ts"), ts);
console.log(JSON.stringify({ asOf, universeSize: companies.length, start, end, tradingDays: sharedDates.length, topTen: publicCompanies.slice(0, 10).map((company) => ({ ticker: company.ticker, marketCap: company.marketCap, rank: company.rank })), outputs: [join(outputDir, `ai_capex_market_data_${asOf}.json`), join(outputDir, `ai_capex_correlation_${asOf}.json`), join(clientOutputDir, "aiCapexMarketData.ts")] }, null, 2));
