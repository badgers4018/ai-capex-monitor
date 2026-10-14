import { describe, expect, it } from "vitest";
import { BRAND } from "./brand";

describe("Capital Misallocation brand registry", () => {
  it("keeps the approved parent-brand and product lockup", () => {
    expect(BRAND.lockup).toBe("Capital Misallocation — AI Capex Monitor");
    expect(BRAND.thesis).toBe("A trillion-dollar buildout is now searching for its economic clearing price.");
  });

  it("uses managed official-mark assets and the three approved research properties", () => {
    expect(BRAND.assets.inkMark).toMatch(/^\/manus-storage\//);
    expect(BRAND.assets.paperMark).toMatch(/^\/manus-storage\//);
    expect(BRAND.assets.inkLockup).toMatch(/^\/manus-storage\//);
    expect(BRAND.assets.paperLockup).toMatch(/^\/manus-storage\//);
    expect(BRAND.research.map(item => item.href)).toEqual([
      "https://www.capitalmisallocation.com/",
      "https://longshort.capitalmisallocation.com/",
      "https://ergodicity.capitalmisallocation.com/",
    ]);
  });
});
