import { describe, expect, it } from "vitest";
import { categoryTone, categoryToneValue } from "./observatory";

describe("observatory evidence color semantics", () => {
  it("reserves red for credit and physical risk categories", () => {
    expect(categoryTone("Power Infrastructure")).toBe("risk");
    expect(categoryTone("Oracle Cloud")).toBe("risk");
    expect(categoryTone("Neoclouds")).toBe("risk");
  });

  it("uses gold for tangible infrastructure and cyan for neutral evidence", () => {
    expect(categoryTone("Data Center")).toBe("gold");
    expect(categoryTone("Semiconductors")).toBe("gold");
    expect(categoryTone("Artificial Intelligence")).toBe("cyan");
    expect(categoryToneValue("Cloud")).toBe("var(--signal-cyan)");
  });

  it("uses a quiet silver marker for geopolitical evidence", () => {
    expect(categoryTone("Geopolitical")).toBe("silver");
    expect(categoryToneValue("Geopolitical")).toBe("var(--signal-silver)");
  });
});
