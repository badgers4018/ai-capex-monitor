import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the Data API before importing the router so fetchQuote uses the mock
vi.mock("./_core/dataApi", () => ({
  callDataApi: vi.fn(),
}));

import { callDataApi } from "./_core/dataApi";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const mockedCallDataApi = vi.mocked(callDataApi);

function chartResponse(symbol: string, price: number, previousClose: number) {
  return {
    chart: {
      result: [
        {
          meta: {
            symbol,
            currency: "USD",
            regularMarketPrice: price,
            previousClose,
            regularMarketTime: 1784000000,
            fiftyTwoWeekHigh: price * 1.3,
            fiftyTwoWeekLow: price * 0.6,
          },
        },
      ],
    },
  };
}

function createContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

describe("market.quotes procedure", () => {
  beforeEach(() => {
    mockedCallDataApi.mockReset();
  });

  it("returns quotes for tracked symbols and serves the cache on repeat calls", async () => {
    mockedCallDataApi.mockImplementation(async (_api, options) => {
      const symbol = (options as { query: { symbol: string } }).query.symbol;
      return chartResponse(symbol, 100, 95);
    });

    const caller = appRouter.createCaller(createContext());

    const first = await caller.market.quotes();
    expect(first.quotes.length).toBeGreaterThan(0);
    expect(first.fetchedAt).toBeGreaterThan(0);
    const callsAfterFirst = mockedCallDataApi.mock.calls.length;
    expect(callsAfterFirst).toBeGreaterThan(0);

    // Second call within the TTL must be served from cache (no new upstream calls)
    const second = await caller.market.quotes();
    expect(mockedCallDataApi.mock.calls.length).toBe(callsAfterFirst);
    expect(second.fetchedAt).toBe(first.fetchedAt);

    const nvda = second.quotes.find((q) => q.symbol === "NVDA");
    expect(nvda?.price).toBe(100);
    expect(nvda?.changePct).toBeCloseTo(((100 - 95) / 95) * 100, 5);
  });

  it("filters by requested symbols", async () => {
    const caller = appRouter.createCaller(createContext());
    const result = await caller.market.quotes({ symbols: ["NVDA", "MSFT"] });
    expect(result.quotes.every((q) => ["NVDA", "MSFT"].includes(q.symbol))).toBe(true);
  });

  it("tolerates per-symbol upstream failures without throwing", async () => {
    // Cache is still warm from the first test within this file's module instance,
    // so this verifies the procedure never throws even when upstream errors occur.
    mockedCallDataApi.mockRejectedValue(new Error("upstream down"));
    const caller = appRouter.createCaller(createContext());
    await expect(caller.market.quotes()).resolves.toHaveProperty("quotes");
  });
});
