import { useState, useMemo } from "react";
import { Calculator, TrendingDown, TrendingUp, AlertTriangle, DollarSign, Percent, Cpu } from "lucide-react";
import { SectionHeading } from "@/components/BrandMark";

interface CompanyModel {
  ticker: string;
  name: string;
  baseRevenue: number; // $B annual
  baseCapex: number; // $B annual
  baseFCF: number; // $B annual
  totalDebt: number; // $B
  annualInterest: number; // $B
  aiRevenueShare: number; // 0-1
  gpuDependency: number; // 0-1 (how much capex is GPU-related)
  color: string;
}

const companies: CompanyModel[] = [
  { ticker: "AMZN", name: "Amazon", baseRevenue: 700, baseCapex: 200, baseFCF: -5, totalDebt: 119, annualInterest: 5.2, aiRevenueShare: 0.19, gpuDependency: 0.7, color: "oklch(0.7 0.15 45)" },
  { ticker: "MSFT", name: "Microsoft", baseRevenue: 280, baseCapex: 190, baseFCF: 12, totalDebt: 273, annualInterest: 8.1, aiRevenueShare: 0.15, gpuDependency: 0.65, color: "oklch(0.7 0.15 155)" },
  { ticker: "GOOGL", name: "Alphabet", baseRevenue: 420, baseCapex: 185, baseFCF: 18, totalDebt: 95, annualInterest: 3.2, aiRevenueShare: 0.12, gpuDependency: 0.6, color: "oklch(0.7 0.15 130)" },
  { ticker: "META", name: "Meta", baseRevenue: 220, baseCapex: 130, baseFCF: 25, totalDebt: 85, annualInterest: 3.5, aiRevenueShare: 0.25, gpuDependency: 0.55, color: "oklch(0.7 0.15 240)" },
  { ticker: "ORCL", name: "Oracle", baseRevenue: 67, baseCapex: 50, baseFCF: -24, totalDebt: 145, annualInterest: 11.2, aiRevenueShare: 0.35, gpuDependency: 0.8, color: "oklch(0.65 0.2 25)" },
  { ticker: "CRWV", name: "CoreWeave", baseRevenue: 8.3, baseCapex: 33, baseFCF: -12, totalDebt: 35, annualInterest: 2.14, aiRevenueShare: 1.0, gpuDependency: 0.95, color: "oklch(0.7 0.18 280)" },
  { ticker: "NBIS", name: "Nebius", baseRevenue: 1.6, baseCapex: 12, baseFCF: -4, totalDebt: 15, annualInterest: 0.25, aiRevenueShare: 0.98, gpuDependency: 0.9, color: "oklch(0.7 0.15 170)" },
  { ticker: "NVDA", name: "NVIDIA", baseRevenue: 326, baseCapex: 12, baseFCF: 200, totalDebt: 30, annualInterest: 1.2, aiRevenueShare: 0.9, gpuDependency: 0.1, color: "oklch(0.7 0.15 80)" },
];

interface ScenarioInputs {
  demandGrowth: number; // -50 to +100 (%)
  interestRateChange: number; // -200 to +400 (bps)
  gpuPriceChange: number; // -50 to +100 (%)
  revenueMultiple: number; // 0.5 to 3.0x
}

function computeScenario(co: CompanyModel, inputs: ScenarioInputs) {
  // Revenue impact: AI revenue portion scales with demand growth, non-AI stays flat
  const aiRevGrowth = 1 + (inputs.demandGrowth / 100) * inputs.revenueMultiple;
  const newRevenue = co.baseRevenue * (co.aiRevenueShare * aiRevGrowth + (1 - co.aiRevenueShare));

  // Capex impact: GPU-dependent portion scales with GPU price changes
  const gpuPriceFactor = 1 + inputs.gpuPriceChange / 100;
  const newCapex = co.baseCapex * (co.gpuDependency * gpuPriceFactor + (1 - co.gpuDependency));

  // Interest expense: scales with rate change (bps) on total debt
  const rateChangePct = inputs.interestRateChange / 10000;
  const newInterest = co.annualInterest + co.totalDebt * rateChangePct;

  // FCF = Revenue - Capex - Interest (simplified)
  const operatingMargin = (co.baseRevenue - co.baseCapex + co.baseFCF + co.annualInterest) / co.baseRevenue;
  const newOperatingIncome = newRevenue * operatingMargin;
  const newFCF = newOperatingIncome - newCapex - newInterest + newCapex * 0.3; // 30% of capex is maintenance, rest is growth

  // Debt serviceability: interest coverage ratio
  const ebitda = newOperatingIncome + newCapex * 0.15; // rough EBITDA proxy
  const interestCoverage = ebitda / Math.max(newInterest, 0.1);

  // Debt/EBITDA
  const debtToEbitda = co.totalDebt / Math.max(ebitda, 0.1);

  return {
    revenue: newRevenue,
    capex: newCapex,
    fcf: newFCF,
    interest: newInterest,
    interestCoverage,
    debtToEbitda,
    revenueChange: ((newRevenue - co.baseRevenue) / co.baseRevenue) * 100,
    fcfChange: newFCF - co.baseFCF,
    riskLevel: interestCoverage < 1.5 ? "critical" : interestCoverage < 3 ? "elevated" : "manageable",
  };
}

function SliderInput({
  label,
  value,
  min,
  max,
  step,
  unit,
  icon: Icon,
  onChange,
  color,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  icon: typeof Calculator;
  onChange: (v: number) => void;
  color: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5" style={{ color }} />
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{label}</span>
        </div>
        <span className="font-mono text-sm font-bold" style={{ color }}>
          {value > 0 ? "+" : ""}{value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${color}40 0%, ${color} ${((value - min) / (max - min)) * 100}%, oklch(0.3 0 0) ${((value - min) / (max - min)) * 100}%, oklch(0.3 0 0) 100%)`,
        }}
      />
      <div className="flex justify-between text-[10px] font-mono text-muted-foreground/50">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

export function ScenarioCalculator() {
  const [inputs, setInputs] = useState<ScenarioInputs>({
    demandGrowth: 0,
    interestRateChange: 0,
    gpuPriceChange: 0,
    revenueMultiple: 1.0,
  });

  const [preset, setPreset] = useState<string | null>(null);

  const presets = [
    { name: "Base Case", values: { demandGrowth: 0, interestRateChange: 0, gpuPriceChange: 0, revenueMultiple: 1.0 } },
    { name: "Bull: AI Boom", values: { demandGrowth: 50, interestRateChange: -100, gpuPriceChange: -20, revenueMultiple: 2.0 } },
    { name: "Bear: Demand Plateau", values: { demandGrowth: -30, interestRateChange: 200, gpuPriceChange: -40, revenueMultiple: 0.7 } },
    { name: "Stress: Credit Crisis", values: { demandGrowth: -20, interestRateChange: 400, gpuPriceChange: 30, revenueMultiple: 0.5 } },
    { name: "GPU Shortage", values: { demandGrowth: 30, interestRateChange: 50, gpuPriceChange: 80, revenueMultiple: 1.5 } },
  ];

  const results = useMemo(() => {
    return companies.map((co) => ({
      ...co,
      scenario: computeScenario(co, inputs),
    }));
  }, [inputs]);

  const aggregateFCF = results.reduce((sum, r) => sum + r.scenario.fcf, 0);
  const criticalCount = results.filter((r) => r.scenario.riskLevel === "critical").length;
  const elevatedCount = results.filter((r) => r.scenario.riskLevel === "elevated").length;

  return (
    <section id="scenario-calc" className="py-24 relative">
      <div className="container max-w-6xl">

        <SectionHeading index="08" eyebrow="Scenario laboratory" title="What-if stress tester" description="Adjust macro assumptions and trace the effect through free cash flow, debt serviceability, and risk classification." />

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: Inputs */}
          <div className="lg:col-span-1 space-y-6">
            {/* Presets */}
            <div className="observatory-panel p-4">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3 block">Presets</span>
              <div className="grid grid-cols-1 gap-1.5">
                {presets.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => { setInputs(p.values); setPreset(p.name); }}
                    className={`px-3 py-2 rounded-lg text-xs font-mono text-left transition-[transform,opacity,border-color,background-color] active:scale-[0.97] ${
                      preset === p.name
                        ? "bg-primary/20 border border-primary/40 text-primary"
                        : "border border-border/30 hover:border-border/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="observatory-panel space-y-5 p-4">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1 block">Adjust Assumptions</span>

              <SliderInput
                label="AI Demand Growth"
                value={inputs.demandGrowth}
                min={-50}
                max={100}
                step={5}
                unit="%"
                icon={TrendingUp}
                color="oklch(0.7 0.15 155)"
                onChange={(v) => { setInputs({ ...inputs, demandGrowth: v }); setPreset(null); }}
              />

              <SliderInput
                label="Interest Rate Δ"
                value={inputs.interestRateChange}
                min={-200}
                max={400}
                step={25}
                unit="bps"
                icon={Percent}
                color="oklch(0.7 0.15 45)"
                onChange={(v) => { setInputs({ ...inputs, interestRateChange: v }); setPreset(null); }}
              />

              <SliderInput
                label="GPU Price Δ"
                value={inputs.gpuPriceChange}
                min={-50}
                max={100}
                step={5}
                unit="%"
                icon={Cpu}
                color="oklch(0.7 0.15 280)"
                onChange={(v) => { setInputs({ ...inputs, gpuPriceChange: v }); setPreset(null); }}
              />

              <SliderInput
                label="Revenue Multiple"
                value={inputs.revenueMultiple}
                min={0.5}
                max={3.0}
                step={0.1}
                unit="x"
                icon={DollarSign}
                color="oklch(0.7 0.15 240)"
                onChange={(v) => { setInputs({ ...inputs, revenueMultiple: v }); setPreset(null); }}
              />
            </div>
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-2 space-y-4">
            {/* Aggregate summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="observatory-panel p-3 text-center">
                <div className={`text-lg font-mono font-bold ${aggregateFCF >= 0 ? "text-green-400" : "text-red-400"}`}>
                  ${aggregateFCF.toFixed(0)}B
                </div>
                <div className="text-[10px] font-mono text-muted-foreground uppercase">Aggregate FCF</div>
              </div>
              <div className="observatory-panel p-3 text-center">
                <div className="text-lg font-mono font-bold text-red-400">{criticalCount}</div>
                <div className="text-[10px] font-mono text-muted-foreground uppercase">Critical Risk</div>
              </div>
              <div className="observatory-panel p-3 text-center">
                <div className="text-lg font-mono font-bold text-amber-400">{elevatedCount}</div>
                <div className="text-[10px] font-mono text-muted-foreground uppercase">Elevated Risk</div>
              </div>
            </div>

            {/* Company results table */}
            <div className="observatory-panel overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-border/30 bg-card/30">
                      <th className="text-left px-3 py-2.5 text-muted-foreground uppercase tracking-wider">Company</th>
                      <th className="text-right px-3 py-2.5 text-muted-foreground uppercase tracking-wider">FCF</th>
                      <th className="text-right px-3 py-2.5 text-muted-foreground uppercase tracking-wider">Δ FCF</th>
                      <th className="text-right px-3 py-2.5 text-muted-foreground uppercase tracking-wider">Int. Cover</th>
                      <th className="text-right px-3 py-2.5 text-muted-foreground uppercase tracking-wider">Debt/EBITDA</th>
                      <th className="text-center px-3 py-2.5 text-muted-foreground uppercase tracking-wider">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results
                      .sort((a, b) => a.scenario.fcf - b.scenario.fcf)
                      .map((r) => (
                        <tr key={r.ticker} className="border-b border-border/10 hover:bg-card/20 transition-colors">
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                              <span className="font-bold text-foreground">{r.ticker}</span>
                              <span className="text-muted-foreground hidden sm:inline">{r.name}</span>
                            </div>
                          </td>
                          <td className={`text-right px-3 py-2.5 font-bold ${r.scenario.fcf >= 0 ? "text-green-400" : "text-red-400"}`}>
                            ${r.scenario.fcf.toFixed(1)}B
                          </td>
                          <td className="text-right px-3 py-2.5">
                            <span className={`inline-flex items-center gap-0.5 ${r.scenario.fcfChange >= 0 ? "text-green-400" : "text-red-400"}`}>
                              {r.scenario.fcfChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {r.scenario.fcfChange >= 0 ? "+" : ""}{r.scenario.fcfChange.toFixed(1)}B
                            </span>
                          </td>
                          <td className={`text-right px-3 py-2.5 ${r.scenario.interestCoverage < 1.5 ? "text-red-400" : r.scenario.interestCoverage < 3 ? "text-amber-400" : "text-green-400"}`}>
                            {r.scenario.interestCoverage.toFixed(1)}x
                          </td>
                          <td className={`text-right px-3 py-2.5 ${r.scenario.debtToEbitda > 5 ? "text-red-400" : r.scenario.debtToEbitda > 3 ? "text-amber-400" : "text-green-400"}`}>
                            {r.scenario.debtToEbitda.toFixed(1)}x
                          </td>
                          <td className="text-center px-3 py-2.5">
                            {r.scenario.riskLevel === "critical" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] uppercase">
                                <AlertTriangle className="w-2.5 h-2.5" /> Critical
                              </span>
                            )}
                            {r.scenario.riskLevel === "elevated" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] uppercase">
                                Elevated
                              </span>
                            )}
                            {r.scenario.riskLevel === "manageable" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] uppercase">
                                OK
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Visual FCF bar chart */}
            <div className="observatory-panel p-4">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3 block">FCF Waterfall (Scenario vs. Base)</span>
              <div className="space-y-2">
                {results
                  .sort((a, b) => b.scenario.fcf - a.scenario.fcf)
                  .map((r) => {
                    const maxAbs = Math.max(...results.map((x) => Math.abs(x.scenario.fcf)), 1);
                    const barWidth = Math.abs(r.scenario.fcf) / maxAbs * 100;
                    const isPositive = r.scenario.fcf >= 0;
                    return (
                      <div key={r.ticker} className="flex items-center gap-2">
                        <span className="w-12 text-xs font-mono font-bold text-foreground/80 shrink-0">{r.ticker}</span>
                        <div className="flex-1 h-5 relative">
                          {/* Center line */}
                          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border/50" />
                          {/* Bar */}
                          <div
                            className="absolute top-0.5 bottom-0.5 rounded-sm transition-[transform,opacity,width,left] duration-500 ease-out"
                            style={{
                              width: `${barWidth / 2}%`,
                              left: isPositive ? "50%" : `${50 - barWidth / 2}%`,
                              backgroundColor: isPositive ? "oklch(0.65 0.15 155 / 0.7)" : "oklch(0.65 0.2 25 / 0.7)",
                            }}
                          />
                        </div>
                        <span className={`w-16 text-right text-xs font-mono ${isPositive ? "text-green-400" : "text-red-400"}`}>
                          ${r.scenario.fcf.toFixed(0)}B
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Methodology note */}
            <p className="text-[10px] font-mono text-muted-foreground/60 leading-relaxed">
              Model: Simplified FCF = (Revenue × Operating Margin) - Capex - Interest. AI demand growth applies to AI revenue share only.
              GPU price changes scale GPU-dependent capex. Interest rate changes (bps) apply to total outstanding debt.
              Revenue multiple amplifies/dampens the demand growth effect. Actual outcomes depend on contract structures, hedging, and timing.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
