import { useState } from "react";

// Sensitivity dimensions
const dimensions = [
  { id: "power", label: "Power Cost", levels: ["-20%", "Base", "+30%", "+60%", "+100%"] },
  { id: "chips", label: "Chip Supply", levels: ["Surplus", "Adequate", "Tight", "Shortage", "Crisis"] },
  { id: "demand", label: "AI Demand", levels: ["Collapse", "Slowdown", "Steady", "Accelerate", "Hypergrowth"] },
  { id: "debt", label: "Debt/Refi Cost", levels: ["-100bp", "Base", "+150bp", "+300bp", "+500bp"] },
];

const companies = [
  { name: "Amazon", ticker: "AMZN", baseFCF: -5 },
  { name: "Microsoft", ticker: "MSFT", baseFCF: 12 },
  { name: "Alphabet", ticker: "GOOGL", baseFCF: 18 },
  { name: "Meta", ticker: "META", baseFCF: 25 },
  { name: "Oracle", ticker: "ORCL", baseFCF: -24 },
  { name: "SpaceX", ticker: "SPCX", baseFCF: 3 },
  { name: "NVIDIA", ticker: "NVDA", baseFCF: 200 },
  { name: "CoreWeave", ticker: "CRWV", baseFCF: -12 },
  { name: "Nebius", ticker: "NBIS", baseFCF: 4 },
];

// Impact multipliers for each dimension level (index 0-4)
// Power cost: higher cost = worse FCF for consumers, better for energy companies
const powerImpact: Record<string, number[]> = {
  AMZN: [1.3, 1.0, 0.7, 0.3, -0.5],
  MSFT: [1.4, 1.0, 0.6, 0.2, -0.6],
  GOOGL: [1.3, 1.0, 0.7, 0.3, -0.4],
  META: [1.2, 1.0, 0.8, 0.5, 0.1],
  ORCL: [1.1, 1.0, 0.7, 0.3, -0.8],
  SPCX: [1.5, 1.0, 0.8, 0.6, 0.4], // Less affected (orbital compute hedge)
  NVDA: [1.1, 1.0, 0.9, 0.85, 0.8], // Sells chips regardless
  CRWV: [1.2, 1.0, 0.6, 0.2, -0.8], // Heavy DC power consumer
  NBIS: [1.2, 1.0, 0.7, 0.4, -0.3], // European power, moderate exposure
};

// Chip supply: shortage = great for NVDA, bad for consumers and neoclouds
const chipImpact: Record<string, number[]> = {
  AMZN: [0.8, 1.0, 0.9, 0.6, 0.3],
  MSFT: [0.8, 1.0, 0.85, 0.5, 0.2],
  GOOGL: [0.9, 1.0, 0.9, 0.6, 0.3], // Has TPUs as hedge
  META: [0.8, 1.0, 0.85, 0.5, 0.2],
  ORCL: [0.7, 1.0, 0.8, 0.4, -0.2],
  SPCX: [0.9, 1.0, 0.9, 0.7, 0.4],
  NVDA: [0.7, 1.0, 1.3, 1.6, 2.0], // Shortage = pricing power
  CRWV: [0.7, 1.0, 0.8, 0.4, -0.3], // Needs GPUs desperately
  NBIS: [0.7, 1.0, 0.8, 0.5, 0.0], // Also GPU-dependent
};

// AI demand: higher demand = more revenue for all, but also more capex
const demandImpact: Record<string, number[]> = {
  AMZN: [-2.0, 0.5, 1.0, 1.4, 1.8],
  MSFT: [-1.5, 0.6, 1.0, 1.5, 2.0],
  GOOGL: [-1.5, 0.6, 1.0, 1.5, 2.2],
  META: [-1.0, 0.7, 1.0, 1.3, 1.6],
  ORCL: [-2.5, 0.3, 1.0, 1.8, 2.5],
  SPCX: [-0.5, 0.7, 1.0, 1.3, 1.8],
  NVDA: [-1.0, 0.5, 1.0, 1.5, 2.5],
  CRWV: [-2.0, 0.3, 1.0, 2.0, 3.0], // Most leveraged to AI demand
  NBIS: [-1.5, 0.5, 1.0, 1.8, 2.8], // High growth, high demand sensitivity
};

// Debt/refinancing cost: higher rates = worse for levered companies
const debtImpact: Record<string, number[]> = {
  AMZN: [1.2, 1.0, 0.8, 0.5, 0.1],
  MSFT: [1.1, 1.0, 0.9, 0.7, 0.5],
  GOOGL: [1.1, 1.0, 0.9, 0.8, 0.6],
  META: [1.1, 1.0, 0.9, 0.8, 0.6],
  ORCL: [1.3, 1.0, 0.5, -0.2, -1.5], // CDS already at GFC levels
  SPCX: [1.2, 1.0, 0.8, 0.5, 0.1], // Just issued $25B at IG
  NVDA: [1.05, 1.0, 0.98, 0.95, 0.9], // Minimal debt
  CRWV: [1.3, 1.0, 0.3, -0.5, -2.0], // 9.625% notes, extreme debt sensitivity
  NBIS: [1.1, 1.0, 0.8, 0.6, 0.3], // Moderate debt, profitable
};

const impactMaps: Record<string, Record<string, number[]>> = {
  power: powerImpact,
  chips: chipImpact,
  demand: demandImpact,
  debt: debtImpact,
};

function calculateFCF(ticker: string, baseFCF: number, dimId: string, levelIdx: number): number {
  const multiplier = impactMaps[dimId][ticker][levelIdx];
  return Math.round(baseFCF * multiplier);
}

function getHeatColor(value: number, maxAbs: number): string {
  if (maxAbs === 0) return "var(--muted)";
  const normalized = value / maxAbs; // -1 to 1
  if (normalized >= 0) {
    const intensity = Math.min(normalized, 1);
    return `oklch(${0.25 + intensity * 0.2} ${intensity * 0.12} 155 / ${0.3 + intensity * 0.7})`;
  } else {
    const intensity = Math.min(Math.abs(normalized), 1);
    return `oklch(${0.25 + intensity * 0.15} ${intensity * 0.15} 25 / ${0.3 + intensity * 0.7})`;
  }
}

export function SensitivityMatrix() {
  const [activeDimension, setActiveDimension] = useState("power");
  const activeDim = dimensions.find((d) => d.id === activeDimension)!;

  // Calculate all values for current dimension
  const matrix = companies.map((company) => ({
    ...company,
    values: activeDim.levels.map((_, levelIdx) =>
      calculateFCF(company.ticker, company.baseFCF, activeDimension, levelIdx)
    ),
  }));

  // Find max absolute value for color scaling
  const allValues = matrix.flatMap((row) => row.values);
  const maxAbs = Math.max(...allValues.map(Math.abs), 1);

  return (
    <section id="sensitivity" className="py-20 relative">
      <div className="container max-w-5xl">

        <div className="text-center mb-8">
          <h2 className="text-3xl font-sans font-semibold mb-3">FCF Sensitivity Heatmap</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
            How each company's free cash flow ($B) changes under different constraint scenarios.
            Green = positive FCF, Red = negative FCF. Darker = more extreme.
          </p>
        </div>

        {/* Dimension selector */}
        <div className="flex justify-center gap-2 mb-8">
          {dimensions.map((dim) => (
            <button
              key={dim.id}
              onClick={() => setActiveDimension(dim.id)}
              className={`px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider transition-[transform,opacity,border-color,background-color] duration-200 active:scale-[0.97] ${
                activeDimension === dim.id
                  ? "bg-primary/20 text-primary border border-primary/40"
                  : "bg-card/30 text-muted-foreground border border-border/30 hover:border-border/60 hover:text-foreground"
              }`}
            >
              {dim.label}
            </button>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="overflow-x-auto rounded-xl border border-border/30 bg-card/10">
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr>
                <th className="p-3 text-left font-mono text-fluid-xs uppercase tracking-wider text-muted-foreground border-b border-border/20 min-w-[100px]">
                  Company
                </th>
                {activeDim.levels.map((level, i) => (
                  <th
                    key={i}
                    className="p-3 text-center font-mono text-fluid-xs uppercase tracking-wider text-muted-foreground border-b border-border/20 min-w-[90px]"
                  >
                    {level}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row) => (
                <tr key={row.ticker} className="border-b border-border/10 last:border-0">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-foreground">{row.ticker}</span>
                      <span className="text-fluid-xs text-muted-foreground hidden sm:inline">{row.name}</span>
                    </div>
                  </td>
                  {row.values.map((value, i) => (
                    <td key={i} className="p-1.5">
                      <div
                        className="p-3 rounded-lg text-center transition-[transform,opacity,border-color,background-color] duration-300"
                        style={{ backgroundColor: getHeatColor(value, maxAbs) }}
                      >
                        <span className={`font-mono text-sm font-bold ${value >= 0 ? "text-[oklch(0.85_0.1_155)]" : "text-[oklch(0.85_0.15_25)]"}`}>
                          {value >= 0 ? `+$${value}B` : `-$${Math.abs(value)}B`}
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: "oklch(0.4 0.15 25)" }} />
            <span className="text-fluid-xs font-mono text-muted-foreground">Deep Negative FCF</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: "oklch(0.25 0 0)" }} />
            <span className="text-fluid-xs font-mono text-muted-foreground">Near Zero</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: "oklch(0.45 0.12 155)" }} />
            <span className="text-fluid-xs font-mono text-muted-foreground">Strong Positive FCF</span>
          </div>
        </div>

        {/* Key insight callout */}
        <div className="mt-8 p-5 rounded-xl border border-border/30 bg-gradient-to-r from-accent/30 to-accent/10 dark:from-[oklch(0.15_0.02_240)] dark:to-[oklch(0.13_0.01_155)]">
          <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Key Insight</h4>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {activeDimension === "power" && "NVIDIA is largely insulated from power cost increases: it sells the shovels. CoreWeave and the neoclouds are extremely exposed as heavy DC power consumers. Amazon, Microsoft, and Oracle bear significant risk, with FCF going deeply negative at +100% power costs. SpaceX's orbital compute vision provides a unique hedge."}
            {activeDimension === "chips" && "Chip shortage creates a stark winner/loser divide: NVIDIA gains massive pricing power while neoclouds (CoreWeave, Nebius) and hyperscalers see FCF collapse. CoreWeave is most vulnerable: it needs GPUs desperately to fulfill its $99.4B backlog. Google's TPU program provides partial insulation."}
            {activeDimension === "demand" && "An AI demand collapse would be catastrophic for Oracle (already leveraged) and painful for Amazon/Microsoft. NVIDIA would lose the most absolute dollars. Paradoxically, moderate demand slowdown might improve hyperscaler FCF by reducing capex pressure."}
          </p>
        </div>
      </div>
    </section>
  );
}
