import React, { useState } from "react";
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Users, AlertTriangle, Target, Clock, BarChart3 } from "lucide-react";
import { ScenarioUniverseMap } from "@/components/ScenarioUniverseMap";

type Scenario = "bull" | "base" | "bear";

interface WinnerEntry {
  ticker?: string;
  name: string;
  reason: string;
}

interface ScenarioData {
  id: Scenario;
  label: string;
  color: string;
  bgGradient: string;
  borderColor: string;
  icon: React.ReactNode;
  probability: number;
  thesis: string;
  assumptions: { label: string; value: string }[];
  outcomes: { label: string; value: string; direction: "up" | "down" | "flat" }[];
  companyWinners: WinnerEntry[];
  industryWinners: string[];
  assetClassWinners: string[];
  losers: WinnerEntry[];
  historicalAnalog: { event: string; period: string; lesson: string };
}

const scenarios: ScenarioData[] = [
  {
    id: "bull",
    label: "Bull Case",
    color: "text-emerald-400",
    bgGradient: "from-emerald-950/40 to-emerald-900/20",
    borderColor: "border-emerald-700/50",
    icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
    probability: 20,
    thesis: "Enterprise AI adoption inflects sharply in late 2026–2027 as agentic workflows move from pilot to production. The $600B revenue gap closes as inference demand explodes (Blackwell drives 25x cost reduction). Hyperscaler FCF recovers by 2028 via a disinflationary productivity shock that validates the capex cycle.",
    assumptions: [
      { label: "Demand Growth", value: "40%+ sustained through 2028" },
      { label: "Interest Rates", value: "Fed cuts to 3.5% by mid-2027" },
      { label: "GPU Supply", value: "CoWoS normalizes at 130K WPM, gap <5%" },
      { label: "Enterprise Adoption", value: "Inflection Q4 2026, 60%+ deploying by 2028" },
    ],
    outcomes: [
      { label: "Total AI Capex 2028", value: "$1T+", direction: "up" },
      { label: "Revenue Gap", value: "Narrows to <$200B", direction: "down" },
      { label: "Hyperscaler FCF", value: "Recovers to 2024 levels", direction: "up" },
      { label: "S&P 500 EPS Impact", value: "$350 (vs $280 base)", direction: "up" },
    ],
    companyWinners: [
      { ticker: "NVDA", name: "Nvidia", reason: "Apex predator: Blackwell at scale, vendor financing pays off at par" },
      { ticker: "TSM", name: "TSMC", reason: "Ultimate toll collector: monopoly on leading-edge logic + advanced packaging" },
      { ticker: "AVGO", name: "Broadcom", reason: "Networking monopoly: Tomahawk switches essential for 100K+ GPU clusters" },
      { ticker: "CEG", name: "Constellation Energy", reason: "Behind-the-meter nuclear PPAs with hyperscalers at premium rates" },
      { ticker: "PWR", name: "Quanta Services", reason: "Record grid upgrade backlog: substations, transmission lines" },
      { ticker: "VRT", name: "Vertiv", reason: "Liquid cooling + power management for high-density deployments" },
    ],
    industryWinners: [
      "Advanced packaging (CoWoS-L)",
      "HBM memory (HBM3E/HBM4)",
      "Liquid cooling systems",
      "Nuclear power generation",
      "AI-native enterprise SaaS",
      "Fiber optic networking",
    ],
    assetClassWinners: [
      "Growth equities (QQQ)",
      "Copper & uranium commodities",
      "Data center REITs (EQIX, DLR)",
      "Private AI venture (Series B/C)",
      "Semiconductor ETFs (SMH)",
    ],
    losers: [
      { ticker: "INTC", name: "Intel", reason: "Server CPU budgets permanently cannibalized by accelerators" },
      { ticker: "ACN", name: "Accenture", reason: "Billable hours replaced by AI agents at scale" },
      { name: "Sovereign Bonds (TLT)", reason: "Infrastructure spending crowds out and keeps neutral rate elevated" },
      { name: "Legacy SaaS wrappers", reason: "No proprietary data moat: commoditized by open-source" },
    ],
    historicalAnalog: {
      event: "Internet Backbone Buildout + AWS Cloud Transition",
      period: "1996–1999 / 2008–2012",
      lesson: "Massive infrastructure investment looked irrational until the application layer (Web 2.0, SaaS) validated it. Builders who survived captured generational returns.",
    },
  },
  {
    id: "base",
    label: "Base Case",
    color: "text-amber-400",
    bgGradient: "from-amber-950/40 to-amber-900/20",
    borderColor: "border-amber-700/50",
    icon: <Minus className="w-5 h-5 text-amber-400" />,
    probability: 59,
    thesis: "AI capex transitions from parabolic acceleration to a sustained high-plateau. The $600B revenue gap persists but stabilizes as hyperscalers moderate spend growth. A K-shaped outcome emerges: investment-grade hyperscalers thrive and consolidate, while high-yield neoclouds face punitive refinancing. Physical infrastructure bottlenecks force deceleration.",
    assumptions: [
      { label: "Demand Growth", value: "Decelerates to 15–20% YoY by 2027" },
      { label: "Interest Rates", value: "Fed holds 4.0–4.5%, no aggressive cuts" },
      { label: "GPU Supply", value: "Normalizes: secondary market pressure emerges" },
      { label: "Enterprise Adoption", value: "Linear, not exponential: pilot fatigue" },
    ],
    outcomes: [
      { label: "Total AI Capex 2028", value: "$850–900B plateau", direction: "flat" },
      { label: "Revenue Gap", value: "Hovers ~$500B", direction: "flat" },
      { label: "Neocloud Defaults", value: "2–3 restructurings by 2028", direction: "down" },
      { label: "NVDA Gross Margin", value: "Compresses to mid-60s%", direction: "down" },
    ],
    companyWinners: [
      { ticker: "MSFT", name: "Microsoft", reason: "Self-funded capex, Azure dominance, no refinancing risk" },
      { ticker: "GOOGL", name: "Alphabet", reason: "Core ad business subsidizes AI, custom TPU reduces NVDA dependency" },
      { ticker: "AMD", name: "AMD", reason: "Second-source winner as hyperscalers seek pricing leverage vs Nvidia" },
      { ticker: "PWR", name: "Quanta Services", reason: "Grid upgrades guaranteed regardless of software ROI" },
      { ticker: "SNOW", name: "Snowflake", reason: "Data readiness platform: enterprise bottleneck shifts to data integration" },
      { ticker: "BX", name: "Blackstone", reason: "Private credit rescue lending at 12–15% yields to distressed neoclouds" },
    ],
    industryWinners: [
      "Natural gas pipeline infrastructure",
      "Grid upgrades & substations",
      "Private credit / rescue lending",
      "Liquid cooling retrofits",
      "Infrastructure optimization software",
      "Data readiness platforms",
    ],
    assetClassWinners: [
      "IG tech bonds (MSFT, GOOGL)",
      "Private credit (12–15% yields)",
      "Utility equities (NEE, WMB)",
      "Infrastructure contractors",
      "Defensive quality factor (QUAL)",
    ],
    losers: [
      { ticker: "CRWV", name: "CoreWeave", reason: "$7.6B maturing 2027–2029 against depreciating GPU collateral" },
      { ticker: "NBIS", name: "Nebius", reason: "Circular financing dependency on Nvidia's $2B investment" },
      { ticker: "ORCL", name: "Oracle", reason: "$40B debt raise at punitive spreads, leverage concerns" },
      { name: "Tier-2 AI startups", reason: "Cerebras, SambaNova starved of oxygen as hyperscalers consolidate" },
      { name: "High-yield tech credit (JNK)", reason: "Spread widening as neocloud defaults begin" },
    ],
    historicalAnalog: {
      event: "Shale Oil Boom / Cloud Digestion Cycle",
      period: "2014–2016 / 2018–2019",
      lesson: "Massive capex led to supply glut and localized HY credit bust. Strong survived and consolidated. Levered players were wiped out. Broader economy unaffected.",
    },
  },
  {
    id: "bear",
    label: "Bear Case",
    color: "text-red-400",
    bgGradient: "from-red-950/40 to-red-900/20",
    borderColor: "border-red-700/50",
    icon: <TrendingDown className="w-5 h-5 text-red-400" />,
    probability: 21,
    thesis: "Enterprise demand disappoints as 25%+ postpone AI spend. The $600B revenue gap widens to crisis levels, triggering a Minsky moment. The $330B tech debt wall in 2027–2028 forces mass restructuring. Circular financing (Nvidia → Neoclouds → Nvidia GPUs) unwinds violently, exposing massive malinvestment and triggering a deflationary shock.",
    assumptions: [
      { label: "Demand Growth", value: "Collapses to <5% or negative" },
      { label: "Interest Rates", value: "Stay elevated 4.5%+ or rise on sticky inflation" },
      { label: "GPU Supply", value: "Massive oversupply: secondary market floods" },
      { label: "Enterprise Adoption", value: "Pullback accelerates, budgets frozen" },
    ],
    outcomes: [
      { label: "Total AI Capex 2028", value: "Collapses 40–50% to $400–500B", direction: "down" },
      { label: "Revenue Gap", value: "Widens to $800B+", direction: "down" },
      { label: "Neocloud Sector", value: "Mass bankruptcies, Chapter 11", direction: "down" },
      { label: "NVDA Revenue", value: "Data center halves to $40B/qtr", direction: "down" },
    ],
    companyWinners: [
      { name: "Oaktree / Elliott", reason: "Distressed debt funds buy impaired GPU clusters at 20¢ on the dollar" },
      { ticker: "HLI", name: "Houlihan Lokey", reason: "Restructuring advisory fees surge on neocloud defaults" },
      { ticker: "MSFT", name: "Microsoft", reason: "Acquires distressed AI assets and talent for pennies" },
      { name: "Thoma Bravo", reason: "Software roll-ups at distressed valuations" },
      { ticker: "TLT", name: "iShares 20Y Treasury", reason: "Deflationary shock forces Fed to cut aggressively" },
    ],
    industryWinners: [
      "Distressed debt & restructuring",
      "US Treasuries (long duration)",
      "Defensive consumer staples",
      "Healthcare equities",
      "Cash & money markets",
    ],
    assetClassWinners: [
      "Long-duration Treasuries (TLT, GOVT)",
      "Defensive equities (XLP, XLV)",
      "Distressed debt funds",
      "Cash / T-Bills",
      "Gold (flight to safety)",
    ],
    losers: [
      { ticker: "NVDA", name: "Nvidia", reason: "Revenue halves, massive write-downs on vendor financing & equity investments" },
      { ticker: "CRWV", name: "CoreWeave", reason: "Chapter 11: GPU collateral recoveries plummet to 20¢ as tech obsolesces" },
      { ticker: "NBIS", name: "Nebius", reason: "Circular financing unwinds, Nvidia pulls $2B support" },
      { ticker: "MU", name: "Micron", reason: "HBM premiums collapse, massive overcapacity write-downs" },
      { name: "Data center REITs", reason: "Lease abandonment spikes, powered shells flood market" },
      { name: "2023–2025 AI venture vintages", reason: "Portfolio markdowns of 60–80%" },
    ],
    historicalAnalog: {
      event: "Telecom Bust: Global Crossing, WorldCom, Lucent",
      period: "2000–2002",
      lesson: "Massive debt-funded infrastructure built on unrealistic demand projections. Vendor financing (Lucent/Cisco funding customers) masked insolvency. Pennies-on-dollar recoveries. Technology survived; equity holders did not.",
    },
  },
];

interface ConsensusItem {
  point: string;
  type: "agree" | "diverge";
}

const councilConsensus: ConsensusItem[] = [
  { point: "CoreWeave's debt structure is the most vulnerable single point of failure in the AI ecosystem", type: "agree" },
  { point: "Physical infrastructure (power grid) will dictate the pace of AI scaling regardless of GPU supply", type: "agree" },
  { point: "K-shaped outcome is most likely: IG hyperscalers survive, HY neoclouds struggle", type: "agree" },
  { point: "The $330B tech debt wall in 2027–2028 guarantees casualties among leveraged players", type: "agree" },
  { point: "Circular financing (Nvidia → Neoclouds → Nvidia GPUs) is an underpriced systemic risk", type: "agree" },
  { point: "Whether the binding constraint is cost of capital (Macro) vs. physics/power (Semi) vs. application value capture (VC)", type: "diverge" },
  { point: "Whether neoclouds face Chapter 11 (Credit) or just valuation haircuts (VC)", type: "diverge" },
  { point: "Whether physical bottlenecks actually SAVE the cycle from overbuild by forcing deceleration (Energy)", type: "diverge" },
  { point: "Timing: Semi says digestion Q3 2027, Credit says crisis Q1 2028, Energy says 10-year marathon", type: "diverge" },
];

const highestConvictionCalls = [
  { expert: "Macro Strategist", call: "Short HY tech credit + Long nuclear utilities (CEG, VST)", color: "text-blue-400" },
  { expert: "Semiconductor Analyst", call: "Long AVGO + Short INTC through 2028", color: "text-purple-400" },
  { expert: "Credit Analyst", call: "Short CoreWeave unsecured debt + Buy ORCL CDS", color: "text-red-400" },
  { expert: "Energy Specialist", call: "Long Quanta Services (PWR) through 2028", color: "text-yellow-400" },
  { expert: "Venture Investor", call: "Short Neoclouds + Long SNOW/DDOG through Q4 2027", color: "text-green-400" },
];

export function ScenarioDeepDive() {
  const [expandedScenario, setExpandedScenario] = useState<Scenario | null>("base");
  const [activeTab, setActiveTab] = useState<"winners" | "losers" | "analog">("winners");
  const activeScenarioLens = expandedScenario ?? "base";

  return (
    <section id="scenario-deep-dive" className="py-20 relative">
      <div className="container max-w-7xl">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono text-xs text-muted-foreground tracking-wider uppercase">09</span>
          <div className="h-px flex-1 bg-border" />
          <span className="font-mono text-xs text-muted-foreground tracking-wider uppercase">Scenario Deep Dive</span>
        </div>
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-2">AI Capex Scenario Analysis: Through 2028</h2>
          <p className="text-muted-foreground text-sm max-w-3xl">
            Stress-tested by a council of 5 domain experts (macro strategist, semiconductor analyst, credit specialist, energy/infrastructure expert, venture investor). 
            Probability-weighted outcomes with company, industry, and asset class implications.
          </p>
        </div>

        {/* Probability Bar */}
        <div className="mb-10 p-4 rounded-lg border border-border/50 bg-card/30">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Council Probability Weighting</span>
          </div>
          <div className="flex h-8 rounded-md overflow-hidden">
            <div 
              className="bg-emerald-600/80 flex items-center justify-center text-xs font-bold text-white transition-[transform,opacity,border-color,background-color]"
              style={{ width: "20%" }}
            >
              Bull 20%
            </div>
            <div 
              className="bg-amber-600/80 flex items-center justify-center text-xs font-bold text-white transition-[transform,opacity,border-color,background-color]"
              style={{ width: "59%" }}
            >
              Base 59%
            </div>
            <div 
              className="bg-red-600/80 flex items-center justify-center text-xs font-bold text-white transition-[transform,opacity,border-color,background-color]"
              style={{ width: "21%" }}
            >
              Bear 21%
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 font-mono">Average across 5 expert probability assessments. Updated July 2026.</p>
        </div>

        {/* Scenario Tiles */}
        <div className="space-y-4">
          {scenarios.map((scenario) => {
            const isExpanded = expandedScenario === scenario.id;
            return (
              <div
                key={scenario.id}
                className={`rounded-xl border ${scenario.borderColor} bg-gradient-to-br ${scenario.bgGradient} transition-[transform,opacity,border-color,background-color] duration-300`}
              >
                {/* Tile Header: Always Visible */}
                <button
                  onClick={() => setExpandedScenario(isExpanded ? null : scenario.id)}
                  className="w-full p-5 flex items-center justify-between text-left cursor-pointer hover:bg-white/[0.02] transition-colors rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-background/50 border border-border/50">
                      {scenario.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className={`text-lg font-bold ${scenario.color}`}>{scenario.label}</h3>
                        <span className={`text-xs font-mono px-2 py-0.5 rounded border ${scenario.borderColor} ${scenario.color}`}>
                          {scenario.probability}% probability
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 max-w-2xl line-clamp-2">
                        {scenario.thesis}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-5 pb-6 space-y-6 border-t border-border/30 pt-5">
                    {/* Thesis */}
                    <div>
                      <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                        <Target className="w-3.5 h-3.5" /> Thesis
                      </h4>
                      <p className="text-sm text-foreground/90 leading-relaxed">{scenario.thesis}</p>
                    </div>

                    {/* Key Assumptions */}
                    <div>
                      <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">Key Assumptions</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {scenario.assumptions.map((a, i) => (
                          <div key={i} className="p-3 rounded-lg bg-background/30 border border-border/30">
                            <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1">{a.label}</div>
                            <div className="text-sm font-medium">{a.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quantified Outcomes */}
                    <div>
                      <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">Quantified Outcomes</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {scenario.outcomes.map((o, i) => (
                          <div key={i} className="p-3 rounded-lg bg-background/30 border border-border/30">
                            <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1">{o.label}</div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold">{o.value}</span>
                              {o.direction === "up" && <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
                              {o.direction === "down" && <TrendingDown className="w-3.5 h-3.5 text-red-400" />}
                              {o.direction === "flat" && <Minus className="w-3.5 h-3.5 text-amber-400" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="border-b border-border/30">
                      <div className="flex gap-1">
                        {(["winners", "losers", "analog"] as const).map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors border-b-2 -mb-px ${
                              activeTab === tab
                                ? `${scenario.color} border-current`
                                : "text-muted-foreground border-transparent hover:text-foreground"
                            }`}
                          >
                            {tab === "winners" ? "Winners" : tab === "losers" ? "Losers / At-Risk" : "Historical Analog"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tab Content */}
                    {activeTab === "winners" && (
                      <div className="space-y-5">
                        {/* Company Winners */}
                        <div>
                          <h5 className="text-xs font-mono text-muted-foreground uppercase mb-2">Illustrative company cases</h5>
                          <p className="mb-2 text-[10px] leading-4 text-muted-foreground">Representative, conviction-rich examples. The complete 50-name structural exposure map follows these scenario cards.</p>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-border/30">
                                  <th className="text-left py-2 px-3 text-xs font-mono text-muted-foreground">Ticker</th>
                                  <th className="text-left py-2 px-3 text-xs font-mono text-muted-foreground">Company</th>
                                  <th className="text-left py-2 px-3 text-xs font-mono text-muted-foreground">Rationale</th>
                                </tr>
                              </thead>
                              <tbody>
                                {scenario.companyWinners.map((w, i) => (
                                  <tr key={i} className="border-b border-border/20">
                                    <td className={`py-2 px-3 font-mono font-bold ${scenario.color}`}>{w.ticker || "-"}</td>
                                    <td className="py-2 px-3 font-medium">{w.name}</td>
                                    <td className="py-2 px-3 text-muted-foreground text-xs">{w.reason}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Industry Winners */}
                        <div>
                          <h5 className="text-xs font-mono text-muted-foreground uppercase mb-2">Industry Winners</h5>
                          <div className="flex flex-wrap gap-2">
                            {scenario.industryWinners.map((ind, i) => (
                              <span key={i} className={`text-xs px-3 py-1.5 rounded-full border ${scenario.borderColor} bg-background/30`}>
                                {ind}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Asset Class Winners */}
                        <div>
                          <h5 className="text-xs font-mono text-muted-foreground uppercase mb-2">Asset Class Winners</h5>
                          <div className="flex flex-wrap gap-2">
                            {scenario.assetClassWinners.map((ac, i) => (
                              <span key={i} className={`text-xs px-3 py-1.5 rounded-full border ${scenario.borderColor} bg-background/30 font-medium`}>
                                {ac}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "losers" && (
                      <div>
                        <div className="overflow-x-auto">
                          <p className="mb-2 text-[10px] leading-4 text-muted-foreground">Representative risk cases. The complete 50-name structural exposure map follows these scenario cards.</p>
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border/30">
                                <th className="text-left py-2 px-3 text-xs font-mono text-muted-foreground">Ticker</th>
                                <th className="text-left py-2 px-3 text-xs font-mono text-muted-foreground">Name</th>
                                <th className="text-left py-2 px-3 text-xs font-mono text-muted-foreground">Risk Factor</th>
                              </tr>
                            </thead>
                            <tbody>
                              {scenario.losers.map((l, i) => (
                                <tr key={i} className="border-b border-border/20">
                                  <td className="py-2 px-3 font-mono font-bold text-red-400">{l.ticker || "-"}</td>
                                  <td className="py-2 px-3 font-medium">{l.name}</td>
                                  <td className="py-2 px-3 text-muted-foreground text-xs">{l.reason}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {activeTab === "analog" && (
                      <div className="p-4 rounded-lg bg-background/30 border border-border/30">
                        <div className="flex items-start gap-3">
                          <Clock className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-bold text-sm mb-1">{scenario.historicalAnalog.event}</div>
                            <div className="text-xs font-mono text-muted-foreground mb-2">{scenario.historicalAnalog.period}</div>
                            <p className="text-sm text-foreground/80 leading-relaxed">{scenario.historicalAnalog.lesson}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <ScenarioUniverseMap activeScenario={activeScenarioLens} />

        {/* Council Consensus Section */}
        <div className="mt-10 p-6 rounded-xl border border-border/50 bg-card/30">
          <div className="flex items-center gap-2 mb-5">
            <Users className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-lg font-bold">Council Consensus & Divergence</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Agreed */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> All 5 Experts Agreed
              </h4>
              <ul className="space-y-2">
                {councilConsensus.filter(c => c.type === "agree").map((item, i) => (
                  <li key={i} className="text-sm text-foreground/80 pl-4 border-l-2 border-emerald-700/50 py-1">
                    {item.point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Diverged */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5" /> Key Points of Divergence
              </h4>
              <ul className="space-y-2">
                {councilConsensus.filter(c => c.type === "diverge").map((item, i) => (
                  <li key={i} className="text-sm text-foreground/80 pl-4 border-l-2 border-amber-700/50 py-1">
                    {item.point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Highest Conviction Calls */}
        <div className="mt-6 p-6 rounded-xl border border-border/50 bg-card/30">
          <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">Highest Conviction Calls (Per Expert)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {highestConvictionCalls.map((call, i) => (
              <div key={i} className="p-3 rounded-lg bg-background/30 border border-border/30">
                <div className={`text-[10px] font-mono uppercase mb-1 ${call.color}`}>{call.expert}</div>
                <div className="text-xs font-medium leading-relaxed">{call.call}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footnote */}
        <p className="mt-6 text-[10px] text-muted-foreground font-mono leading-relaxed max-w-4xl">
          Disclaimer: This analysis is for informational purposes only and does not constitute investment advice. 
          Probability weightings represent the average assessment of 5 AI-simulated domain experts and should not be interpreted as precise forecasts. 
          All scenarios are subject to rapid change based on earnings, policy, and market developments. Council analysis conducted July 2026.
        </p>
      </div>
    </section>
  );
}
