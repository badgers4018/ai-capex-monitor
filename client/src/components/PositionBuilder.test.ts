import { describe, expect, it } from "vitest";
import { hasScenarioReturn, PORTFOLIO_TICKER_COUNT } from "./PositionBuilder";

describe("PositionBuilder universe safeguards", () => {
  it("exposes all 50 research names to the picker", () => {
    expect(PORTFOLIO_TICKER_COUNT).toBe(50);
  });

  it("does not fabricate return-model coverage for newly added names", () => {
    expect(hasScenarioReturn("NVDA")).toBe(true);
    expect(hasScenarioReturn("VRT")).toBe(true);
    expect(hasScenarioReturn("JCI")).toBe(false);
    expect(hasScenarioReturn("NTAP")).toBe(false);
  });
});
