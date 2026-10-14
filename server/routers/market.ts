import { z } from "zod";
import { callDataApi } from "../_core/dataApi";
import { publicProcedure, router } from "../_core/trpc";

export type LiveQuote = {
  symbol: string;
  price: number;
  previousClose: number | null;
  changePct: number | null;
  high52: number | null;
  low52: number | null;
  marketTime: number | null; // unix seconds
  currency: string;
  name: string | null;
};

// Symbols the site tracks. SPCX (SpaceX) may not always resolve on Yahoo; failures are tolerated per-symbol.
export const TRACKED_SYMBOLS = [
  "NVDA",
  "MSFT",
  "GOOGL",
  "AMZN",
  "META",
  "ORCL",
  "SPCX",
  "CRWV",
  "NBIS",
  "AMD",
  "AVGO",
] as const;

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

type CacheEntry = { quotes: LiveQuote[]; fetchedAt: number };
let cache: CacheEntry | null = null;
let inflight: Promise<LiveQuote[]> | null = null;

type ChartMeta = {
  symbol?: string;
  currency?: string;
  longName?: string;
  regularMarketPrice?: number;
  chartPreviousClose?: number;
  previousClose?: number;
  regularMarketTime?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
};

type ChartResponse = {
  chart?: {
    result?: Array<{
      meta?: ChartMeta;
      indicators?: { quote?: Array<{ close?: Array<number | null> }> };
    }>;
    error?: unknown;
  };
};

export function parseQuote(symbol: string, data: ChartResponse): LiveQuote | null {
  const result = data?.chart?.result?.[0];
  const meta = result?.meta;
  if (!meta || typeof meta.regularMarketPrice !== "number") return null;

  // Daily change: prefer meta.previousClose; fall back to second-to-last close in the series
  let previousClose: number | null =
    typeof meta.previousClose === "number" ? meta.previousClose : null;
  if (previousClose === null) {
    const closes = (result?.indicators?.quote?.[0]?.close ?? []).filter(
      (c): c is number => typeof c === "number"
    );
    if (closes.length >= 2) previousClose = closes[closes.length - 2];
    else if (typeof meta.chartPreviousClose === "number") previousClose = meta.chartPreviousClose;
  }

  const changePct =
    previousClose && previousClose > 0
      ? ((meta.regularMarketPrice - previousClose) / previousClose) * 100
      : null;

  return {
    symbol,
    price: meta.regularMarketPrice,
    previousClose,
    changePct,
    high52: typeof meta.fiftyTwoWeekHigh === "number" ? meta.fiftyTwoWeekHigh : null,
    low52: typeof meta.fiftyTwoWeekLow === "number" ? meta.fiftyTwoWeekLow : null,
    marketTime: typeof meta.regularMarketTime === "number" ? meta.regularMarketTime : null,
    currency: meta.currency ?? "USD",
    name: meta.longName ?? null,
  };
}

async function fetchQuote(symbol: string): Promise<LiveQuote | null> {
  try {
    const data = (await callDataApi("YahooFinance/get_stock_chart", {
      query: { symbol, region: "US", interval: "1d", range: "5d" },
    })) as ChartResponse;
    return parseQuote(symbol, data);
  } catch (error) {
    console.warn(`[Market] Failed to fetch quote for ${symbol}:`, error);
    return null;
  }
}

async function fetchAllQuotes(): Promise<LiveQuote[]> {
  const results = await Promise.all(TRACKED_SYMBOLS.map((s) => fetchQuote(s)));
  return results.filter((q): q is LiveQuote => q !== null);
}

export async function getQuotesCached(): Promise<{ quotes: LiveQuote[]; fetchedAt: number }> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) return cache;
  if (!inflight) {
    inflight = fetchAllQuotes().finally(() => {
      inflight = null;
    });
  }
  const quotes = await inflight;
  // Only replace the cache if we actually got data; otherwise keep serving stale
  if (quotes.length > 0 || !cache) {
    cache = { quotes, fetchedAt: now };
  }
  return cache;
}

export const marketRouter = router({
  quotes: publicProcedure
    .input(z.object({ symbols: z.array(z.string()).optional() }).optional())
    .query(async ({ input }) => {
      const { quotes, fetchedAt } = await getQuotesCached();
      const wanted = input?.symbols;
      const filtered = wanted && wanted.length > 0
        ? quotes.filter((q) => wanted.includes(q.symbol))
        : quotes;
      return { quotes: filtered, fetchedAt };
    }),
});
