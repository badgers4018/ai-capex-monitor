import { useState, useMemo, useEffect, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Clock, DollarSign, Zap, Share2, Check } from "lucide-react";
import { toast } from "sonner";

// Base case data for each company (2026 capex in $B)
const baseData = [
  { name: "Amazon", ticker: "AMZN", baseCapex: 200, baseFCF: -5, color: "oklch(0.75 0.15 70)" },
  { name: "Microsoft", ticker: "MSFT", baseCapex: 190, baseFCF: 12, color: "oklch(0.7 0.15 240)" },
  { name: "Alphabet", ticker: "GOOGL", baseCapex: 185, baseFCF: 18, color: "oklch(0.7 0.15 155)" },
  { name: "Meta", ticker: "META", baseCapex: 130, baseFCF: 25, color: "oklch(0.65 0.12 320)" },
  { name: "Oracle", ticker: "ORCL", baseCapex: 50, baseFCF: -24, color: "oklch(0.65 0.2 25)" },
  { name: "SpaceX", ticker: "SPCX", baseCapex: 21, baseFCF: 3, color: "oklch(0.7 0.15 45)" },
  { name: "NVIDIA", ticker: "NVDA", baseCapex: 12, baseFCF: 200, color: "oklch(0.7 0.15 240)" },
  { name: "CoreWeave", ticker: "CRWV", baseCapex: 33, baseFCF: -12, color: "oklch(0.7 0.18 280)" },
  { name: "Nebius", ticker: "NBIS", baseCapex: 12, baseFCF: 4, color: "oklch(0.7 0.15 170)" },
];

// Scenario multipliers
const scenarios = {
  bear: { capexMult: 0.65, fcfMult: 1.3, label: "Bear Case", description: "Enterprise backlash + moratoriums. 25% of projects delayed. Power constraints bite hard. Capex cuts 35%.", icon: TrendingDown, color: "oklch(0.65 0.2 25)" },
  base: { capexMult: 1.0, fcfMult: 1.0, label: "Base Case", description: "Goldman Sachs $800B AI capex ($670B cloud alone). $600B revenue gap. FCF crosses zero Q3 2026. Dell'Oro DC capex >$1T. IDC semi +53%.", icon: Minus, color: "oklch(0.7 0.15 240)" },
  bull: { capexMult: 1.4, fcfMult: 0.6, label: "Bull Case", description: "AI revenue inflection. Jevons Paradox accelerates. Nuclear/SMR unlocks power. Capex grows 40% more.", icon: TrendingUp, color: "oklch(0.7 0.15 155)" },
};

type ScenarioKey = "bear" | "base" | "bull";

// FCF zero-crossing calculation
// Base: Sept 15, 2026 (81 days from Jun 26)
// Bear: Pushed back ~6 months (capex cuts delay crossing)
// Bull: Pulled forward ~2 months (more spending accelerates it)
function calculateFCFCrossing(sliderValue: number): { date: Date; daysFromNow: number; label: string } {
  const now = new Date("2026-06-26T00:00:00Z");
  // sliderValue: 0 = bear, 50 = base, 100 = bull
  // Bear: +180 days from base, Bull: -60 days from base
  const baseDays = 81; // Sept 15 from Jun 26
  const bearDays = baseDays + 180; // ~March 2027
  const bullDays = Math.max(baseDays - 60, 15); // ~July 2026

  let targetDays: number;
  if (sliderValue <= 50) {
    // Interpolate between bear and base
    const t = sliderValue / 50;
    targetDays = bearDays + (baseDays - bearDays) * t;
  } else {
    // Interpolate between base and bull
    const t = (sliderValue - 50) / 50;
    targetDays = baseDays + (bullDays - baseDays) * t;
  }

  const targetDate = new Date(now.getTime() + targetDays * 24 * 60 * 60 * 1000);
  return {
    date: targetDate,
    daysFromNow: Math.round(targetDays),
    label: targetDate.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
  };
}

function getScenarioFromSlider(value: number): ScenarioKey {
  if (value < 25) return "bear";
  if (value > 75) return "bull";
  return "base";
}

export function ScenarioModeler() {
  const [sliderValue, setSliderValue] = useState(() => {
    // Read initial value from URL hash
    const hash = window.location.hash;
    const match = hash.match(/scenario=(\d+)/);
    if (match) return [Math.min(100, Math.max(0, parseInt(match[1])))];
    return [50];
  });
  const [copied, setCopied] = useState(false);

  const currentValue = sliderValue[0];
  const scenarioKey = getScenarioFromSlider(currentValue);
  const scenario = scenarios[scenarioKey];
  const ScenarioIcon = scenario.icon;

  // Update URL hash when slider changes
  useEffect(() => {
    const newHash = `scenario=${currentValue}`;
    const currentHash = window.location.hash.replace('#', '');
    // Only update if we're on the scenarios section or hash already has scenario
    if (currentHash.includes('scenario') || currentValue !== 50) {
      window.history.replaceState(null, '', `#${newHash}`);
    }
  }, [currentValue]);

  const handleShare = useCallback(() => {
    const url = `${window.location.origin}${window.location.pathname}#scenario=${currentValue}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success("Scenario URL copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Fallback for older browsers
      toast.info(`Share URL: ${url}`);
    });
  }, [currentValue]);

  // Interpolate multipliers based on slider position
  const capexMultiplier = useMemo(() => {
    if (currentValue <= 50) {
      const t = currentValue / 50;
      return scenarios.bear.capexMult + (scenarios.base.capexMult - scenarios.bear.capexMult) * t;
    } else {
      const t = (currentValue - 50) / 50;
      return scenarios.base.capexMult + (scenarios.bull.capexMult - scenarios.base.capexMult) * t;
    }
  }, [currentValue]);

  const fcfMultiplier = useMemo(() => {
    if (currentValue <= 50) {
      const t = currentValue / 50;
      return scenarios.bear.fcfMult + (scenarios.base.fcfMult - scenarios.bear.fcfMult) * t;
    } else {
      const t = (currentValue - 50) / 50;
      return scenarios.base.fcfMult + (scenarios.bull.fcfMult - scenarios.base.fcfMult) * t;
    }
  }, [currentValue]);

  const projectedData = useMemo(() => {
    return baseData.map((company) => ({
      ...company,
      projectedCapex: Math.round(company.baseCapex * capexMultiplier),
      projectedFCF: Math.round(company.baseFCF * fcfMultiplier),
    }));
  }, [capexMultiplier, fcfMultiplier]);

  const totalCapex = projectedData.reduce((sum, c) => sum + c.projectedCapex, 0);
  const totalFCF = projectedData.reduce((sum, c) => sum + c.projectedFCF, 0);
  const fcfCrossing = calculateFCFCrossing(currentValue);

  // Total liabilities scale with capex
  const totalLiabilities = Math.round(1600 * capexMultiplier);
  const debtFunded = Math.round(378 * capexMultiplier);

  return (
    <section id="scenarios" className="py-20 relative">
      <div className="container max-w-5xl">

        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-sans font-semibold mb-2 sm:mb-3">What If the Assumptions Change?</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto hidden sm:block">
            Drag the slider to model different scenarios. Watch how capex totals, FCF countdown, and debt levels shift
            between bear case (enterprise backlash) and bull case (AI revenue inflection).
          </p>
          <p className="text-sm text-muted-foreground sm:hidden">
            Drag the slider to model bear → bull scenarios.
          </p>
        </div>

        {/* Main slider */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="relative p-4 sm:p-6 rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm">
            {/* Scenario label */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <ScenarioIcon className="w-5 h-5" style={{ color: scenario.color }} />
              <span className="font-mono text-sm font-bold uppercase tracking-wider" style={{ color: scenario.color }}>
                {scenario.label}
              </span>
            </div>

            {/* Slider */}
            <div className="px-4 mb-4">
              <Slider
                value={sliderValue}
                onValueChange={setSliderValue}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            {/* Slider labels */}
            <div className="flex justify-between px-4 mb-4">
              <button
                onClick={() => setSliderValue([5])}
                className="text-fluid-xs font-mono text-muted-foreground hover:text-[oklch(0.65_0.2_25)] transition-colors uppercase"
              >
                Bear
              </button>
              <button
                onClick={() => setSliderValue([50])}
                className="text-fluid-xs font-mono text-muted-foreground hover:text-[oklch(0.7_0.15_240)] transition-colors uppercase"
              >
                Base
              </button>
              <button
                onClick={() => setSliderValue([95])}
                className="text-fluid-xs font-mono text-muted-foreground hover:text-[oklch(0.7_0.15_155)] transition-colors uppercase"
              >
                Bull
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground text-center leading-relaxed px-4">
              {scenario.description}
            </p>

            {/* Share button */}
            <div className="flex justify-center mt-4">
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/40 bg-accent/10 hover:bg-accent/20 text-xs font-mono text-muted-foreground hover:text-foreground transition-[transform,opacity,border-color,background-color] duration-200 active:scale-[0.97]"
              >
                {copied ? <Check className="w-3 h-3 text-[oklch(0.7_0.15_155)]" /> : <Share2 className="w-3 h-3" />}
                {copied ? "Copied!" : <><span className="hidden sm:inline">Share this scenario</span><span className="sm:hidden">Share</span></>}
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic results grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {/* FCF Countdown card */}
          <div className="p-5 rounded-xl border border-[oklch(0.65_0.2_25_/_0.4)] bg-gradient-to-br from-destructive/5 to-card/50 dark:from-[oklch(0.15_0.02_25)] dark:to-[oklch(0.12_0.01_250)]">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-[oklch(0.65_0.2_25)]" />
              <span className="font-mono text-fluid-xs font-bold text-[oklch(0.65_0.2_25)] uppercase tracking-wider">FCF Zero Crossing</span>
            </div>
            <div className="text-3xl font-mono font-bold text-foreground mb-1">
              {fcfCrossing.daysFromNow} <span className="text-lg text-muted-foreground">days</span>
            </div>
            <div className="text-xs text-muted-foreground">{fcfCrossing.label}</div>
            <div className="mt-3 pt-3 border-t border-border/20">
              <div className="text-fluid-xs text-muted-foreground">
                {scenarioKey === "bear" && "Capex cuts delay crossing to early 2027"}
                {scenarioKey === "base" && "Current trajectory: mid-Q3 2026 (Epoch AI)"}
                {scenarioKey === "bull" && "Accelerated spending pulls crossing to mid-July"}
              </div>
            </div>
          </div>

          {/* Total Capex card */}
          <div className="p-5 rounded-xl border border-border/40 bg-card/30">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-[oklch(0.7_0.15_240)]" />
              <span className="font-mono text-fluid-xs font-bold text-[oklch(0.7_0.15_240)] uppercase tracking-wider">Total Top 8 Capex</span>
            </div>
            <div className="text-3xl font-mono font-bold text-foreground mb-1">
              ${totalCapex}B
            </div>
            <div className="text-xs text-muted-foreground">
              {capexMultiplier > 1 ? `+${Math.round((capexMultiplier - 1) * 100)}%` : capexMultiplier < 1 ? `${Math.round((capexMultiplier - 1) * 100)}%` : "±0%"} vs base
            </div>
            <div className="mt-3 pt-3 border-t border-border/20">
              <div className="flex items-center justify-between text-fluid-xs">
                <span className="text-muted-foreground">Aggregate FCF</span>
                <span className={`font-mono font-bold ${totalFCF < 0 ? "text-[oklch(0.65_0.2_25)]" : "text-[oklch(0.7_0.15_155)]"}`}>
                  ${totalFCF}B
                </span>
              </div>
            </div>
          </div>

          {/* Liabilities card */}
          <div className="p-5 rounded-xl border border-border/40 bg-card/30">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-[oklch(0.75_0.15_70)]" />
              <span className="font-mono text-fluid-xs font-bold text-[oklch(0.75_0.15_70)] uppercase tracking-wider">Total Liabilities</span>
            </div>
            <div className="text-3xl font-mono font-bold text-foreground mb-1">
              ${totalLiabilities}B+
            </div>
            <div className="text-xs text-muted-foreground">On + off balance sheet</div>
            <div className="mt-3 pt-3 border-t border-border/20">
              <div className="flex items-center justify-between text-fluid-xs">
                <span className="text-muted-foreground">2026 Debt Funded</span>
                <span className="font-mono font-bold text-[oklch(0.65_0.2_25)]">${debtFunded}B</span>
              </div>
            </div>
          </div>
        </div>

        {/* Per-company breakdown */}
        <div className="rounded-xl border border-border/30 overflow-hidden bg-card/20 backdrop-blur-sm">
          <div className="px-5 py-3 border-b border-border/30 bg-card/30 flex items-center justify-between">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider">Per-Company Projections</h3>
            <span className="font-mono text-fluid-xs text-muted-foreground">
              Capex ×{capexMultiplier.toFixed(2)} | FCF ×{fcfMultiplier.toFixed(2)}
            </span>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[1fr_80px_80px_80px_100px] gap-2 px-5 py-2 border-b border-border/20 text-fluid-xs font-mono text-muted-foreground uppercase tracking-wider">
            <span>Company</span>
            <span className="text-right">Base Capex</span>
            <span className="text-right">Projected</span>
            <span className="text-right">FCF</span>
            <span className="text-right">Capex Bar</span>
          </div>

          {/* Table rows */}
          {projectedData.map((company) => {
            const maxCapex = Math.max(...projectedData.map((c) => c.projectedCapex));
            const barWidth = (company.projectedCapex / maxCapex) * 100;

            return (
              <div
                key={company.ticker}
                className="grid grid-cols-[1fr_80px_80px_80px_100px] gap-2 px-5 py-2.5 border-b border-border/10 hover:bg-card/30 transition-colors items-center"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: company.color }} />
                  <span className="text-xs font-medium">{company.name}</span>
                  <span className="text-fluid-xs font-mono text-muted-foreground">{company.ticker}</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground text-right">${company.baseCapex}B</span>
                <span className="text-xs font-mono font-bold text-right" style={{ color: company.color }}>
                  ${company.projectedCapex}B
                </span>
                <span className={`text-xs font-mono font-bold text-right ${company.projectedFCF < 0 ? "text-[oklch(0.65_0.2_25)]" : "text-[oklch(0.7_0.15_155)]"}`}>
                  {company.projectedFCF > 0 ? "+" : ""}${company.projectedFCF}B
                </span>
                <div className="flex items-center justify-end">
                  <div className="w-full h-3 rounded-full bg-border/20 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-[transform,opacity,width,left] duration-500 ease-out"
                      style={{ width: `${barWidth}%`, backgroundColor: company.color }}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Totals row */}
          <div className="grid grid-cols-[1fr_80px_80px_80px_100px] gap-2 px-5 py-3 bg-card/40 border-t border-border/30 items-center">
            <span className="text-xs font-bold uppercase">Total</span>
            <span className="text-xs font-mono text-muted-foreground text-right">$828B</span>
            <span className="text-xs font-mono font-bold text-right text-foreground">${totalCapex}B</span>
            <span className={`text-xs font-mono font-bold text-right ${totalFCF < 0 ? "text-[oklch(0.65_0.2_25)]" : "text-[oklch(0.7_0.15_155)]"}`}>
              {totalFCF > 0 ? "+" : ""}${totalFCF}B
            </span>
            <span className="text-fluid-xs font-mono text-muted-foreground text-right">
              {capexMultiplier > 1 ? "↑" : capexMultiplier < 1 ? "↓" : "→"} {Math.abs(Math.round((capexMultiplier - 1) * 100))}%
            </span>
          </div>
        </div>

        {/* Scenario assumptions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.entries(scenarios) as [ScenarioKey, typeof scenarios.base][]).map(([key, s]) => {
            const Icon = s.icon;
            const isActive = key === scenarioKey;
            return (
              <button
                key={key}
                onClick={() => setSliderValue([key === "bear" ? 5 : key === "base" ? 50 : 95])}
                className={`p-4 rounded-xl border text-left transition-[transform,opacity,border-color,background-color] duration-200 ${
                  isActive
                    ? "border-border/60 bg-card/40 shadow-lg"
                    : "border-border/20 bg-card/10 opacity-60 hover:opacity-80"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4" style={{ color: s.color }} />
                  <span className="font-mono text-xs font-bold uppercase" style={{ color: s.color }}>{s.label}</span>
                </div>
                <p className="text-fluid-xs text-muted-foreground leading-relaxed">{s.description}</p>
                <div className="mt-2 pt-2 border-t border-border/20 flex items-center gap-3">
                  <span className="text-fluid-xs font-mono text-muted-foreground">
                    Capex: ×{s.capexMult}
                  </span>
                  <span className="text-fluid-xs font-mono text-muted-foreground">
                    FCF: ×{s.fcfMult}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Power constraint indicator */}
        <div className="mt-8 p-4 rounded-xl border border-border/30 bg-card/20">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-[oklch(0.75_0.15_70)]" />
            <span className="font-mono text-fluid-xs font-bold text-[oklch(0.75_0.15_70)] uppercase tracking-wider">Power Constraint Impact</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-lg font-mono font-bold text-foreground">
                {scenarioKey === "bear" ? "60%" : scenarioKey === "bull" ? "92%" : "85%"}
              </div>
              <div className="text-fluid-xs text-muted-foreground">Power Shortfall</div>
            </div>
            <div>
              <div className="text-lg font-mono font-bold text-foreground">
                {scenarioKey === "bear" ? "45 GW" : scenarioKey === "bull" ? "95 GW" : "69 GW"}
              </div>
              <div className="text-fluid-xs text-muted-foreground">Demand by 2028</div>
            </div>
            <div>
              <div className="text-lg font-mono font-bold text-foreground">
                {scenarioKey === "bear" ? "12 GW" : scenarioKey === "bull" ? "8 GW" : "10 GW"}
              </div>
              <div className="text-fluid-xs text-muted-foreground">Achievable Supply</div>
            </div>
          </div>
          <p className="text-fluid-xs text-muted-foreground mt-3 leading-relaxed">
            {scenarioKey === "bear" && "In the bear case, moratoriums and enterprise pullback reduce power demand, but grid expansion still lags. SpaceX orbital compute becomes less urgent."}
            {scenarioKey === "base" && "DOE estimates 69 GW needed by 2028 but only 10 GW achievable through grid connections. 4+ year wait times for new connections persist."}
            {scenarioKey === "bull" && "Bull case requires nuclear/SMR breakthroughs or SpaceX orbital compute. Without new power sources, even unlimited capital cannot build fast enough."}
          </p>
        </div>
      </div>
    </section>
  );
}
