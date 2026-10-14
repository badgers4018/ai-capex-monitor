import { AI_CAPEX_COUNCIL } from "./aiCapexCouncil";

export type ScenarioLensId = "bull" | "base" | "bear";
export type ScenarioExposureRole = "positive" | "neutral" | "negative";

export interface ScenarioExposure {
  label: string;
  role: ScenarioExposureRole;
}

const lensByStance: Record<
  (typeof AI_CAPEX_COUNCIL.classifications)[number]["stance"],
  Record<ScenarioLensId, ScenarioExposure>
> = {
  "capex-winner": {
    bull: { label: "Acceleration leader", role: "positive" },
    base: { label: "Structural leader", role: "positive" },
    bear: { label: "Cyclical exposure", role: "negative" },
  },
  "capex-beneficiary": {
    bull: { label: "Demand beneficiary", role: "positive" },
    base: { label: "Supported exposure", role: "positive" },
    bear: { label: "Mixed exposure", role: "neutral" },
  },
  balanced: {
    bull: { label: "Mixed exposure", role: "neutral" },
    base: { label: "Mixed exposure", role: "neutral" },
    bear: { label: "Mixed exposure", role: "neutral" },
  },
  "capex-risk": {
    bull: { label: "Execution-sensitive", role: "neutral" },
    base: { label: "At-risk", role: "negative" },
    bear: { label: "At-risk", role: "negative" },
  },
};

export const AI_CAPEX_SCENARIO_LENS = AI_CAPEX_COUNCIL.classifications.map((company) => ({
  ...company,
  scenarios: lensByStance[company.stance],
}));

export const scenarioLensCounts = (scenario: ScenarioLensId) => AI_CAPEX_SCENARIO_LENS.reduce<Record<ScenarioExposureRole, number>>(
  (counts, company) => {
    counts[company.scenarios[scenario].role] += 1;
    return counts;
  },
  { positive: 0, neutral: 0, negative: 0 }
);
