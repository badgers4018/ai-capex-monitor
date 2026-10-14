import { describe, expect, it } from "vitest";
import { AI_CAPEX_COUNCIL } from "./aiCapexCouncil";

describe("AI Capex council consensus", () => {
  it("covers the full universe with five-review classifications", () => {
    expect(AI_CAPEX_COUNCIL.universeSize).toBe(50);
    expect(AI_CAPEX_COUNCIL.classifications).toHaveLength(50);
    expect(new Set(AI_CAPEX_COUNCIL.classifications.map((item) => item.ticker)).size).toBe(50);
    expect(AI_CAPEX_COUNCIL.classifications.every((item) => item.reviewCount === 5 && item.voteCount >= 2)).toBe(true);
    expect(AI_CAPEX_COUNCIL.classifications.every((item) => Object.values(item.votes).reduce((sum, count) => sum + count, 0) === 5)).toBe(true);
    expect(AI_CAPEX_COUNCIL.classifications.find((item) => item.ticker === "GOOGL")?.agreement).toBe("majority");
    expect(AI_CAPEX_COUNCIL.classifications.find((item) => item.ticker === "SMCI")?.agreement).toBe("split");
  });

  it("maintains a transparent stance distribution", () => {
    const calculated = AI_CAPEX_COUNCIL.classifications.reduce<Record<string, number>>((counts, item) => {
      counts[item.stance] = (counts[item.stance] ?? 0) + 1;
      return counts;
    }, {});
    expect(calculated).toEqual(AI_CAPEX_COUNCIL.byStance);
    expect(AI_CAPEX_COUNCIL.classifications.find((item) => item.ticker === "NTAP")?.agreement).toBe("unanimous");
  });
});
