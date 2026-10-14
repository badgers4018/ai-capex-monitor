import { describe, expect, it } from "vitest";
import { AI_CAPEX_SCENARIO_LENS, scenarioLensCounts } from "./aiCapexScenarioLens";

describe("AI Capex scenario exposure map", () => {
  it("maps every universe name across bull, base, and bear lenses", () => {
    expect(AI_CAPEX_SCENARIO_LENS).toHaveLength(50);
    expect(AI_CAPEX_SCENARIO_LENS.every((item) => item.scenarios.bull && item.scenarios.base && item.scenarios.bear)).toBe(true);
  });

  it("preserves full coverage in each scenario summary", () => {
    (['bull', 'base', 'bear'] as const).forEach((scenario) => {
      const counts = scenarioLensCounts(scenario);
      expect(counts.positive + counts.neutral + counts.negative).toBe(50);
    });
  });

  it("keeps structurally capital-sensitive capacity owners at risk in base and bear cases", () => {
    const coreWeave = AI_CAPEX_SCENARIO_LENS.find((item) => item.ticker === "CRWV");
    expect(coreWeave?.scenarios.base.role).toBe("negative");
    expect(coreWeave?.scenarios.bear.role).toBe("negative");
  });
});
