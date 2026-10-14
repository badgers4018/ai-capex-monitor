import { describe, expect, it } from "vitest";
import { parseQuote, TRACKED_SYMBOLS } from "./routers/market";

describe("market.parseQuote", () => {
  it("parses a valid Yahoo Finance chart response", () => {
    const quote = parseQuote("NVDA", {
      chart: {
        result: [
          {
            meta: {
              symbol: "NVDA",
              currency: "USD",
              longName: "NVIDIA Corporation",
              regularMarketPrice: 200.5,
              previousClose: 195.0,
              regularMarketTime: 1784000000,
              fiftyTwoWeekHigh: 236.54,
              fiftyTwoWeekLow: 157.34,
            },
          },
        ],
      },
    });

    expect(quote).not.toBeNull();
    expect(quote?.symbol).toBe("NVDA");
    expect(quote?.price).toBe(200.5);
    expect(quote?.previousClose).toBe(195.0);
    expect(quote?.changePct).toBeCloseTo(((200.5 - 195.0) / 195.0) * 100, 5);
    expect(quote?.high52).toBe(236.54);
    expect(quote?.low52).toBe(157.34);
    expect(quote?.currency).toBe("USD");
    expect(quote?.name).toBe("NVIDIA Corporation");
  });

  it("falls back to close series when previousClose is missing", () => {
    const quote = parseQuote("MSFT", {
      chart: {
        result: [
          {
            meta: {
              symbol: "MSFT",
              regularMarketPrice: 390.0,
            },
            indicators: {
              quote: [{ close: [380.0, 385.0, 390.0] }],
            },
          },
        ],
      },
    });

    expect(quote).not.toBeNull();
    expect(quote?.previousClose).toBe(385.0);
    expect(quote?.changePct).toBeCloseTo(((390.0 - 385.0) / 385.0) * 100, 5);
  });

  it("returns null when the response has no usable price", () => {
    expect(parseQuote("BAD", {})).toBeNull();
    expect(parseQuote("BAD", { chart: { result: [] } })).toBeNull();
    expect(parseQuote("BAD", { chart: { result: [{ meta: {} }] } })).toBeNull();
  });

  it("handles null changePct when previous close is unavailable", () => {
    const quote = parseQuote("SPCX", {
      chart: {
        result: [
          {
            meta: { symbol: "SPCX", regularMarketPrice: 152.8 },
          },
        ],
      },
    });
    expect(quote).not.toBeNull();
    expect(quote?.changePct).toBeNull();
  });

  it("tracks the expected symbol universe", () => {
    expect(TRACKED_SYMBOLS).toContain("NVDA");
    expect(TRACKED_SYMBOLS).toContain("CRWV");
    expect(TRACKED_SYMBOLS).toContain("AVGO");
    expect(TRACKED_SYMBOLS.length).toBeGreaterThanOrEqual(10);
  });
});
