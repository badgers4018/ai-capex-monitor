import { ApiClient } from "/home/ubuntu/skills/data-api/lib/data-api.mjs";

const symbol = process.argv[2];
if (!symbol) throw new Error("Usage: manus-node scripts/check-ticker-chart.mjs SYMBOL");
const client = new ApiClient();
const data = await client.callApi("YahooFinance/get_stock_chart", {
  query: { symbol, region: "US", interval: "1d", range: "6mo", includeAdjustedClose: true, events: "div,split" },
});
const result = data?.chart?.result?.[0];
const adjusted = result?.indicators?.adjclose?.[0]?.adjclose ?? [];
console.log(JSON.stringify({
  symbol,
  error: data?.chart?.error ?? null,
  price: result?.meta?.regularMarketPrice ?? null,
  timestamps: result?.timestamp?.length ?? 0,
  adjustedCloses: adjusted.filter((value) => typeof value === "number").length,
}, null, 2));
if (!result || adjusted.filter((value) => typeof value === "number").length < 80) process.exitCode = 1;
