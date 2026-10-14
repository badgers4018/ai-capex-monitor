import { describe, expect, it } from "vitest";
import { AI_CAPEX_CORRELATION, AI_CAPEX_UNIVERSE } from "./aiCapexMarketData";

describe("AI Capex 50-name market dataset", () => {
  it("contains 50 uniquely ranked listed names with market caps", () => {
    expect(AI_CAPEX_UNIVERSE).toHaveLength(50);
    expect(new Set(AI_CAPEX_UNIVERSE.map((company) => company.ticker)).size).toBe(50);
    expect(AI_CAPEX_UNIVERSE.map((company) => company.rank)).toEqual(Array.from({ length: 50 }, (_, index) => index + 1));
    expect(AI_CAPEX_UNIVERSE.every((company) => typeof company.marketCap === "number" && company.marketCap > 0)).toBe(true);
  });

  it("contains an aligned, symmetric 50 by 50 daily-return correlation matrix", () => {
    expect(AI_CAPEX_CORRELATION.tickers).toHaveLength(50);
    expect(AI_CAPEX_CORRELATION.matrix).toHaveLength(50);
    expect(AI_CAPEX_CORRELATION.tradingDays).toBeGreaterThanOrEqual(80);
    AI_CAPEX_CORRELATION.matrix.forEach((row, rowIndex) => {
      expect(row).toHaveLength(50);
      expect(row[rowIndex]).toBe(1);
      row.forEach((value, columnIndex) => {
        expect(value).toBeGreaterThanOrEqual(-1);
        expect(value).toBeLessThanOrEqual(1);
        expect(value).toBeCloseTo(AI_CAPEX_CORRELATION.matrix[columnIndex][rowIndex], 4);
      });
    });
  });
});
