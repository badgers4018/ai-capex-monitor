import React, { useState, useMemo } from "react";
import { Plus, Minus, X, TrendingUp, TrendingDown, Briefcase, BarChart3, AlertTriangle, Trash2 } from "lucide-react";
import { CorrelationMatrix } from "./CorrelationMatrix";
import { AI_CAPEX_COUNCIL } from "@/data/aiCapexCouncil";
import { AI_CAPEX_UNIVERSE } from "@/data/aiCapexMarketData";

// All tickers from the Scenario Deep Dive section with scenario context
interface TickerData {
  ticker: string;
  name: string;
  councilStance?: string;
  scenarios: {
    bull?: { role: "winner" | "loser"; reason: string };
    base?: { role: "winner" | "loser"; reason: string };
    bear?: { role: "winner" | "loser"; reason: string };
  };
}

const MODELED_TICKERS: TickerData[] = [
  { ticker: "NVDA", name: "Nvidia", scenarios: { bull: { role: "winner", reason: "Apex predator: Blackwell at scale" }, base: { role: "winner", reason: "Still dominant but margin compression" }, bear: { role: "loser", reason: "Revenue halves, write-downs on vendor financing" } } },
  { ticker: "TSM", name: "TSMC", scenarios: { bull: { role: "winner", reason: "Toll collector: monopoly on leading-edge" } } },
  { ticker: "AVGO", name: "Broadcom", scenarios: { bull: { role: "winner", reason: "Networking monopoly for 100K+ GPU clusters" }, base: { role: "winner", reason: "Custom silicon + networking essential" } } },
  { ticker: "CEG", name: "Constellation Energy", scenarios: { bull: { role: "winner", reason: "Behind-the-meter nuclear PPAs" } } },
  { ticker: "PWR", name: "Quanta Services", scenarios: { bull: { role: "winner", reason: "Record grid upgrade backlog" }, base: { role: "winner", reason: "Grid upgrades guaranteed regardless of AI ROI" } } },
  { ticker: "VRT", name: "Vertiv", scenarios: { bull: { role: "winner", reason: "Liquid cooling + power management" } } },
  { ticker: "MSFT", name: "Microsoft", scenarios: { base: { role: "winner", reason: "Self-funded capex, Azure dominance" }, bear: { role: "winner", reason: "Acquires distressed AI assets cheap" } } },
  { ticker: "GOOGL", name: "Alphabet", scenarios: { base: { role: "winner", reason: "Ad business subsidizes AI, custom TPU" } } },
  { ticker: "AMD", name: "AMD", scenarios: { base: { role: "winner", reason: "Second-source winner vs Nvidia pricing" } } },
  { ticker: "SNOW", name: "Snowflake", scenarios: { base: { role: "winner", reason: "Data readiness: enterprise bottleneck shifts" } } },
  { ticker: "DDOG", name: "Datadog", scenarios: { base: { role: "winner", reason: "Infrastructure optimization platform" } } },
  { ticker: "BX", name: "Blackstone", scenarios: { base: { role: "winner", reason: "Private credit rescue lending at 12-15%" } } },
  { ticker: "HLI", name: "Houlihan Lokey", scenarios: { bear: { role: "winner", reason: "Restructuring advisory fees surge" } } },
  { ticker: "TLT", name: "iShares 20Y Treasury", scenarios: { bear: { role: "winner", reason: "Deflationary shock forces Fed cuts" } } },
  { ticker: "INTC", name: "Intel", scenarios: { bull: { role: "loser", reason: "Server CPU cannibalized by accelerators" } } },
  { ticker: "ACN", name: "Accenture", scenarios: { bull: { role: "loser", reason: "Billable hours replaced by AI agents" } } },
  { ticker: "CRWV", name: "CoreWeave", scenarios: { base: { role: "loser", reason: "$7.6B maturing against depreciating GPUs" }, bear: { role: "loser", reason: "Chapter 11: GPU collateral at 20¢" } } },
  { ticker: "NBIS", name: "Nebius", scenarios: { base: { role: "loser", reason: "Circular financing dependency on Nvidia" }, bear: { role: "loser", reason: "Nvidia pulls $2B support" } } },
  { ticker: "ORCL", name: "Oracle", scenarios: { base: { role: "loser", reason: "$40B debt raise at punitive spreads" } } },
  { ticker: "MU", name: "Micron", scenarios: { bear: { role: "loser", reason: "HBM premiums collapse, overcapacity" } } },
  { ticker: "NEE", name: "NextEra Energy", scenarios: { base: { role: "winner", reason: "Renewables + storage backlog" } } },
  { ticker: "WMB", name: "Williams Companies", scenarios: { base: { role: "winner", reason: "Gas pipeline bridge fuel for data centers" } } },
  { ticker: "ETN", name: "Eaton", scenarios: { bull: { role: "winner", reason: "Transformer + switchgear pricing power" } } },
];

// Scenario probabilities from the council
const SCENARIO_PROBS = { bull: 0.20, base: 0.59, bear: 0.21 };

// Estimated scenario returns (simplified model based on council analysis)
const SCENARIO_RETURNS: Record<string, { bull: number; base: number; bear: number }> = {
  NVDA: { bull: 80, base: 15, bear: -55 },
  TSM: { bull: 60, base: 20, bear: -30 },
  AVGO: { bull: 70, base: 30, bear: -20 },
  CEG: { bull: 50, base: 25, bear: -10 },
  PWR: { bull: 45, base: 30, bear: 5 },
  VRT: { bull: 65, base: 10, bear: -40 },
  MSFT: { bull: 35, base: 15, bear: -15 },
  GOOGL: { bull: 40, base: 18, bear: -20 },
  AMD: { bull: 55, base: 25, bear: -45 },
  SNOW: { bull: 50, base: 20, bear: -30 },
  DDOG: { bull: 45, base: 22, bear: -25 },
  BX: { bull: 20, base: 25, bear: 15 },
  HLI: { bull: -5, base: 10, bear: 60 },
  TLT: { bull: -10, base: 5, bear: 35 },
  INTC: { bull: -20, base: -10, bear: -35 },
  ACN: { bull: -15, base: 5, bear: 10 },
  CRWV: { bull: 40, base: -30, bear: -80 },
  NBIS: { bull: 60, base: -20, bear: -70 },
  ORCL: { bull: 30, base: -5, bear: -35 },
  MU: { bull: 50, base: 10, bear: -50 },
  NEE: { bull: 30, base: 20, bear: -5 },
  WMB: { bull: 25, base: 15, bear: 0 },
  ETN: { bull: 45, base: 20, bear: -15 },
};

const councilByTicker = new Map(AI_CAPEX_COUNCIL.classifications.map((item) => [item.ticker, item]));
const modeledByTicker = new Map(MODELED_TICKERS.map((item) => [item.ticker, item]));
const AVAILABLE_TICKERS: TickerData[] = AI_CAPEX_UNIVERSE.map((company) => {
  const modeled = modeledByTicker.get(company.ticker);
  const council = councilByTicker.get(company.ticker);
  return modeled
    ? { ...modeled, name: company.name, councilStance: council?.stance }
    : { ticker: company.ticker, name: company.name, councilStance: council?.stance, scenarios: {} };
});

export const PORTFOLIO_TICKER_COUNT = AVAILABLE_TICKERS.length;
export const hasScenarioReturn = (ticker: string) => Boolean(SCENARIO_RETURNS[ticker]);

interface Position {
  ticker: string;
  name: string;
  direction: "long" | "short";
  weight: number; // percentage of portfolio
}

export function PositionBuilder() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterScenario, setFilterScenario] = useState<"all" | "bull" | "base" | "bear">("all");

  const addPosition = (ticker: TickerData, direction: "long" | "short") => {
    if (positions.find(p => p.ticker === ticker.ticker && p.direction === direction)) return;
    setPositions(prev => [...prev, {
      ticker: ticker.ticker,
      name: ticker.name,
      direction,
      weight: Math.round(100 / (positions.length + 1)),
    }]);
    setShowPicker(false);
    setSearchTerm("");
  };

  const removePosition = (index: number) => {
    setPositions(prev => prev.filter((_, i) => i !== index));
  };

  const updateWeight = (index: number, weight: number) => {
    setPositions(prev => prev.map((p, i) => i === index ? { ...p, weight: Math.max(0, Math.min(100, weight)) } : p));
  };

  const equalizeWeights = () => {
    const w = Math.round(100 / positions.length);
    setPositions(prev => prev.map(p => ({ ...p, weight: w })));
  };

  // Portfolio analytics
  const analytics = useMemo(() => {
    if (positions.length === 0) return null;

    // The new 50-name universe has verified market and correlation data, but not
    // an issuer-specific three-scenario return model for every name. Never turn a
    // missing model into a fictional 0% return inside portfolio analytics.
    if (positions.some((position) => !hasScenarioReturn(position.ticker))) return null;

    const totalWeight = positions.reduce((s, p) => s + p.weight, 0);
    if (totalWeight === 0) return null;

    let bullReturn = 0, baseReturn = 0, bearReturn = 0;

    positions.forEach(p => {
      const returns = SCENARIO_RETURNS[p.ticker] || { bull: 0, base: 0, bear: 0 };
      const normalizedWeight = p.weight / totalWeight;
      const multiplier = p.direction === "short" ? -1 : 1;

      bullReturn += returns.bull * multiplier * normalizedWeight;
      baseReturn += returns.base * multiplier * normalizedWeight;
      bearReturn += returns.bear * multiplier * normalizedWeight;
    });

    const expectedReturn = bullReturn * SCENARIO_PROBS.bull + baseReturn * SCENARIO_PROBS.base + bearReturn * SCENARIO_PROBS.bear;

    // Sharpe-like ratio (simplified: expected return / volatility proxy)
    const variance = SCENARIO_PROBS.bull * (bullReturn - expectedReturn) ** 2
      + SCENARIO_PROBS.base * (baseReturn - expectedReturn) ** 2
      + SCENARIO_PROBS.bear * (bearReturn - expectedReturn) ** 2;
    const volatility = Math.sqrt(variance);
    const sharpe = volatility > 0 ? expectedReturn / volatility : 0;

    // Max drawdown (worst scenario)
    const maxDrawdown = Math.min(bullReturn, baseReturn, bearReturn);

    // Scenario skew
    const longCount = positions.filter(p => p.direction === "long").length;
    const shortCount = positions.filter(p => p.direction === "short").length;

    return {
      bullReturn: bullReturn.toFixed(1),
      baseReturn: baseReturn.toFixed(1),
      bearReturn: bearReturn.toFixed(1),
      expectedReturn: expectedReturn.toFixed(1),
      volatility: volatility.toFixed(1),
      sharpe: sharpe.toFixed(2),
      maxDrawdown: maxDrawdown.toFixed(1),
      totalWeight,
      longCount,
      shortCount,
    };
  }, [positions]);

  const unmodeledPositions = positions.filter((position) => !hasScenarioReturn(position.ticker));

  const filteredTickers = AVAILABLE_TICKERS.filter(t => {
    const matchesSearch = t.ticker.toLowerCase().includes(searchTerm.toLowerCase()) || t.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterScenario === "all") return matchesSearch;
    return matchesSearch && t.scenarios[filterScenario];
  });

  return (
    <section id="position-builder" className="py-20 relative">
      <div className="container max-w-7xl">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono text-xs text-muted-foreground tracking-wider uppercase">10</span>
          <div className="h-px flex-1 bg-border" />
          <span className="font-mono text-xs text-muted-foreground tracking-wider uppercase">Position Builder</span>
        </div>
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Scenario-Weighted Portfolio Constructor</h2>
          <p className="text-muted-foreground text-sm max-w-3xl">
            Select from the 50-name AI-capex universe to build a hypothetical portfolio. Correlation is available for every name; probability-weighted returns remain limited to names with explicit Bull, Base, and Bear assumptions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Position List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Positions Table */}
            <div className="rounded-xl border border-border/50 bg-card/30 overflow-hidden">
              <div className="p-4 border-b border-border/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-bold">Portfolio Positions</span>
                  <span className="text-xs text-muted-foreground">({positions.length} positions)</span>
                </div>
                <div className="flex gap-2">
                  {positions.length > 1 && (
                    <button
                      onClick={equalizeWeights}
                      className="text-xs px-3 py-1 rounded border border-border/50 hover:bg-accent/50 transition-colors text-muted-foreground"
                    >
                      Equalize
                    </button>
                  )}
                  <button
                    onClick={() => setShowPicker(true)}
                    className="text-xs px-3 py-1.5 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Position
                  </button>
                </div>
              </div>

              {positions.length === 0 ? (
                <div className="p-10 text-center">
                  <Briefcase className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No positions yet. Click "Add Position" to start building your portfolio.</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Select from scenario winners and losers to construct a probability-weighted view.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/20">
                  {positions.map((pos, idx) => {
                    const tickerData = AVAILABLE_TICKERS.find(t => t.ticker === pos.ticker);
                    const returns = SCENARIO_RETURNS[pos.ticker];
                    const multiplier = pos.direction === "short" ? -1 : 1;
                    const expRet = returns
                      ? returns.bull * multiplier * SCENARIO_PROBS.bull + returns.base * multiplier * SCENARIO_PROBS.base + returns.bear * multiplier * SCENARIO_PROBS.bear
                      : null;

                    return (
                      <div key={`${pos.ticker}-${pos.direction}-${idx}`} className="p-4 flex items-center gap-4 hover:bg-accent/5 transition-colors">
                        {/* Direction badge */}
                        <div className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          pos.direction === "long" ? "bg-emerald-900/50 text-emerald-400 border border-emerald-700/50" : "bg-red-900/50 text-red-400 border border-red-700/50"
                        }`}>
                          {pos.direction === "long" ? "LONG" : "SHORT"}
                        </div>

                        {/* Ticker & Name */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm">{pos.ticker}</span>
                            <span className="text-xs text-muted-foreground truncate">{pos.name}</span>
                          </div>
                          {/* Scenario badges */}
                          <div className="flex gap-1 mt-1">
                            {tickerData?.scenarios.bull && (
                              <span className={`text-[9px] px-1.5 py-0.5 rounded ${tickerData.scenarios.bull.role === "winner" ? "bg-emerald-900/30 text-emerald-500" : "bg-red-900/30 text-red-500"}`}>
                                Bull {tickerData.scenarios.bull.role === "winner" ? "↑" : "↓"}
                              </span>
                            )}
                            {tickerData?.scenarios.base && (
                              <span className={`text-[9px] px-1.5 py-0.5 rounded ${tickerData.scenarios.base.role === "winner" ? "bg-amber-900/30 text-amber-500" : "bg-red-900/30 text-red-500"}`}>
                                Base {tickerData.scenarios.base.role === "winner" ? "↑" : "↓"}
                              </span>
                            )}
                            {tickerData?.scenarios.bear && (
                              <span className={`text-[9px] px-1.5 py-0.5 rounded ${tickerData.scenarios.bear.role === "winner" ? "bg-blue-900/30 text-blue-500" : "bg-red-900/30 text-red-500"}`}>
                                Bear {tickerData.scenarios.bear.role === "winner" ? "↑" : "↓"}
                              </span>
                            )}
                            {!returns && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/30 text-cyan-400">Correlation only</span>
                            )}
                          </div>
                        </div>

                        {/* Weight slider */}
                        <div className="flex items-center gap-2 w-36">
                          <input
                            type="range"
                            min={0}
                            max={50}
                            value={pos.weight}
                            onChange={(e) => updateWeight(idx, parseInt(e.target.value))}
                            aria-label={`Weight for ${pos.ticker}`}
                            className="w-full h-1.5 rounded-full appearance-none bg-border/50 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                          />
                          <span className="text-xs font-mono w-8 text-right">{pos.weight}%</span>
                        </div>

                        {/* Expected Return */}
                        {expRet === null ? (
                          <div className="w-14 text-right font-mono text-[10px] text-amber-400">MODEL N/A</div>
                        ) : (
                          <div className={`text-xs font-mono w-14 text-right ${expRet >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {expRet >= 0 ? "+" : ""}{expRet.toFixed(1)}%
                          </div>
                        )}

                        {/* Remove */}
                        <button onClick={() => removePosition(idx)} className="p-1 hover:bg-red-900/30 rounded transition-colors" aria-label={`Remove ${pos.ticker} from portfolio`}>
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-red-400" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Scenario Breakdown */}
            {analytics && (
              <div className="rounded-xl border border-border/50 bg-card/30 p-4">
                <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">Scenario Return Breakdown</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-700/30">
                    <div className="text-[10px] font-mono text-emerald-400/70 mb-1">BULL (20%)</div>
                    <div className={`text-lg font-bold ${parseFloat(analytics.bullReturn) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {parseFloat(analytics.bullReturn) >= 0 ? "+" : ""}{analytics.bullReturn}%
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-700/30">
                    <div className="text-[10px] font-mono text-amber-400/70 mb-1">BASE (59%)</div>
                    <div className={`text-lg font-bold ${parseFloat(analytics.baseReturn) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {parseFloat(analytics.baseReturn) >= 0 ? "+" : ""}{analytics.baseReturn}%
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-red-950/30 border border-red-700/30">
                    <div className="text-[10px] font-mono text-red-400/70 mb-1">BEAR (21%)</div>
                    <div className={`text-lg font-bold ${parseFloat(analytics.bearReturn) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {parseFloat(analytics.bearReturn) >= 0 ? "+" : ""}{analytics.bearReturn}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Portfolio Summary */}
          <div className="space-y-4">
            {/* Expected Return Card */}
            <div className="rounded-xl border border-border/50 bg-card/30 p-5">
              <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="w-3.5 h-3.5" /> Portfolio Analytics
              </h4>
              {analytics ? (
                <div className="space-y-4">
                  {/* Expected Return - Hero Metric */}
                  <div className="text-center p-4 rounded-lg bg-background/30 border border-border/30">
                    <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Probability-Weighted Expected Return</div>
                    <div className={`text-3xl font-bold ${parseFloat(analytics.expectedReturn) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {parseFloat(analytics.expectedReturn) >= 0 ? "+" : ""}{analytics.expectedReturn}%
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-background/30 border border-border/30">
                      <div className="text-[10px] font-mono text-muted-foreground">Volatility</div>
                      <div className="text-sm font-bold">{analytics.volatility}%</div>
                    </div>
                    <div className="p-3 rounded-lg bg-background/30 border border-border/30">
                      <div className="text-[10px] font-mono text-muted-foreground">Sharpe Ratio</div>
                      <div className={`text-sm font-bold ${parseFloat(analytics.sharpe) >= 1 ? "text-emerald-400" : parseFloat(analytics.sharpe) >= 0.5 ? "text-amber-400" : "text-red-400"}`}>
                        {analytics.sharpe}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-background/30 border border-border/30">
                      <div className="text-[10px] font-mono text-muted-foreground">Max Drawdown</div>
                      <div className="text-sm font-bold text-red-400">{analytics.maxDrawdown}%</div>
                    </div>
                    <div className="p-3 rounded-lg bg-background/30 border border-border/30">
                      <div className="text-[10px] font-mono text-muted-foreground">Total Weight</div>
                      <div className={`text-sm font-bold ${analytics.totalWeight === 100 ? "text-emerald-400" : "text-amber-400"}`}>
                        {analytics.totalWeight}%
                      </div>
                    </div>
                  </div>

                  {/* Position Mix */}
                  <div className="p-3 rounded-lg bg-background/30 border border-border/30">
                    <div className="text-[10px] font-mono text-muted-foreground mb-2">Position Mix</div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                        <span className="text-xs">{analytics.longCount} Long</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingDown className="w-3 h-3 text-red-400" />
                        <span className="text-xs">{analytics.shortCount} Short</span>
                      </div>
                    </div>
                    <div className="mt-2 h-2 rounded-full overflow-hidden bg-border/30 flex">
                      <div
                        className="bg-emerald-500/70 transition-[transform,opacity,border-color,background-color]"
                        style={{ width: `${(analytics.longCount / (analytics.longCount + analytics.shortCount)) * 100}%` }}
                      />
                      <div
                        className="bg-red-500/70 transition-[transform,opacity,border-color,background-color]"
                        style={{ width: `${(analytics.shortCount / (analytics.longCount + analytics.shortCount)) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Warning */}
                  {analytics.totalWeight !== 100 && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-950/30 border border-amber-700/30">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                      <p className="text-[10px] text-amber-400/80">Weights sum to {analytics.totalWeight}%. Adjust to 100% for accurate portfolio-level metrics.</p>
                    </div>
                  )}
                </div>
              ) : positions.length > 0 ? (
                <div className="py-8 text-center">
                  <AlertTriangle className="mx-auto mb-2 h-6 w-6 text-amber-400/70" />
                  <p className="text-xs text-foreground">Scenario model incomplete</p>
                  <p className="mx-auto mt-1 max-w-[220px] text-[10px] leading-4 text-muted-foreground">{unmodeledPositions.map((position) => position.ticker).join(", ")} {unmodeledPositions.length === 1 ? "does" : "do"} not yet have issuer-level scenario-return assumptions.</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Add positions to see portfolio analytics</p>
                </div>
              )}
            </div>

            {/* Quick Add Presets */}
            <div className="rounded-xl border border-border/50 bg-card/30 p-4">
              <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">Quick Presets</h4>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setPositions([
                      { ticker: "NVDA", name: "Nvidia", direction: "long", weight: 20 },
                      { ticker: "AVGO", name: "Broadcom", direction: "long", weight: 20 },
                      { ticker: "PWR", name: "Quanta Services", direction: "long", weight: 20 },
                      { ticker: "CEG", name: "Constellation Energy", direction: "long", weight: 20 },
                      { ticker: "MSFT", name: "Microsoft", direction: "long", weight: 20 },
                    ]);
                  }}
                  className="w-full text-left text-xs p-2.5 rounded-lg border border-emerald-700/30 bg-emerald-950/20 hover:bg-emerald-950/40 transition-colors"
                >
                  <span className="font-bold text-emerald-400">Bull Portfolio</span>
                  <span className="text-muted-foreground ml-2">NVDA, AVGO, PWR, CEG, MSFT</span>
                </button>
                <button
                  onClick={() => {
                    setPositions([
                      { ticker: "MSFT", name: "Microsoft", direction: "long", weight: 20 },
                      { ticker: "PWR", name: "Quanta Services", direction: "long", weight: 15 },
                      { ticker: "SNOW", name: "Snowflake", direction: "long", weight: 15 },
                      { ticker: "BX", name: "Blackstone", direction: "long", weight: 15 },
                      { ticker: "CRWV", name: "CoreWeave", direction: "short", weight: 20 },
                      { ticker: "NBIS", name: "Nebius", direction: "short", weight: 15 },
                    ]);
                  }}
                  className="w-full text-left text-xs p-2.5 rounded-lg border border-amber-700/30 bg-amber-950/20 hover:bg-amber-950/40 transition-colors"
                >
                  <span className="font-bold text-amber-400">Base Case Hedge</span>
                  <span className="text-muted-foreground ml-2">Long quality, short neoclouds</span>
                </button>
                <button
                  onClick={() => {
                    setPositions([
                      { ticker: "TLT", name: "iShares 20Y Treasury", direction: "long", weight: 25 },
                      { ticker: "HLI", name: "Houlihan Lokey", direction: "long", weight: 20 },
                      { ticker: "MSFT", name: "Microsoft", direction: "long", weight: 15 },
                      { ticker: "NVDA", name: "Nvidia", direction: "short", weight: 20 },
                      { ticker: "CRWV", name: "CoreWeave", direction: "short", weight: 20 },
                    ]);
                  }}
                  className="w-full text-left text-xs p-2.5 rounded-lg border border-red-700/30 bg-red-950/20 hover:bg-red-950/40 transition-colors"
                >
                  <span className="font-bold text-red-400">Bear Protection</span>
                  <span className="text-muted-foreground ml-2">Long TLT/HLI, short NVDA/CRWV</span>
                </button>
                <button
                  onClick={() => {
                    setPositions([
                      { ticker: "PWR", name: "Quanta Services", direction: "long", weight: 20 },
                      { ticker: "AVGO", name: "Broadcom", direction: "long", weight: 20 },
                      { ticker: "MSFT", name: "Microsoft", direction: "long", weight: 20 },
                      { ticker: "BX", name: "Blackstone", direction: "long", weight: 15 },
                      { ticker: "CRWV", name: "CoreWeave", direction: "short", weight: 15 },
                      { ticker: "INTC", name: "Intel", direction: "short", weight: 10 },
                    ]);
                  }}
                  className="w-full text-left text-xs p-2.5 rounded-lg border border-blue-700/30 bg-blue-950/20 hover:bg-blue-950/40 transition-colors"
                >
                  <span className="font-bold text-blue-400">All-Weather</span>
                  <span className="text-muted-foreground ml-2">Balanced across all scenarios</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Ticker Picker Modal */}
        {showPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowPicker(false)}>
            <div className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[70vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="p-4 border-b border-border/50 flex items-center justify-between">
                <h3 className="font-bold text-sm">Add Position</h3>
                <button onClick={() => setShowPicker(false)} className="p-1 hover:bg-accent rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search & Filter */}
              <div className="p-3 border-b border-border/30 space-y-2">
                <input
                  type="text"
                  placeholder="Search ticker or company..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border/50 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  autoFocus
                />
                <div className="flex gap-1">
                  {(["all", "bull", "base", "bear"] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setFilterScenario(s)}
                      className={`text-[10px] px-2.5 py-1 rounded-full font-mono uppercase transition-colors ${
                        filterScenario === s
                          ? s === "bull" ? "bg-emerald-900/50 text-emerald-400 border border-emerald-700/50"
                            : s === "base" ? "bg-amber-900/50 text-amber-400 border border-amber-700/50"
                            : s === "bear" ? "bg-red-900/50 text-red-400 border border-red-700/50"
                            : "bg-primary text-primary-foreground"
                          : "text-muted-foreground border border-border/50 hover:bg-accent/50"
                      }`}
                    >
                      {s === "all" ? "All" : s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ticker List */}
              <div className="flex-1 overflow-y-auto p-2">
                {filteredTickers.map(t => {
                  const alreadyLong = positions.some(p => p.ticker === t.ticker && p.direction === "long");
                  const alreadyShort = positions.some(p => p.ticker === t.ticker && p.direction === "short");

                  return (
                    <div key={t.ticker} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-accent/10 transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm">{t.ticker}</span>
                          <span className="text-xs text-muted-foreground">{t.name}</span>
                        </div>
                        <div className="flex gap-1 mt-0.5">
                          {t.scenarios.bull && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded ${t.scenarios.bull.role === "winner" ? "bg-emerald-900/30 text-emerald-500" : "bg-red-900/30 text-red-500"}`}>
                              Bull {t.scenarios.bull.role}
                            </span>
                          )}
                          {t.scenarios.base && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded ${t.scenarios.base.role === "winner" ? "bg-amber-900/30 text-amber-500" : "bg-red-900/30 text-red-500"}`}>
                              Base {t.scenarios.base.role}
                            </span>
                          )}
                          {t.scenarios.bear && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded ${t.scenarios.bear.role === "winner" ? "bg-blue-900/30 text-blue-500" : "bg-red-900/30 text-red-500"}`}>
                              Bear {t.scenarios.bear.role}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => addPosition(t, "long")}
                          disabled={alreadyLong}
                          className={`text-[10px] px-2.5 py-1 rounded font-mono flex items-center gap-1 transition-colors ${
                            alreadyLong ? "opacity-30 cursor-not-allowed" : "bg-emerald-900/40 text-emerald-400 border border-emerald-700/50 hover:bg-emerald-900/70"
                          }`}
                        >
                          <Plus className="w-2.5 h-2.5" /> Long
                        </button>
                        <button
                          onClick={() => addPosition(t, "short")}
                          disabled={alreadyShort}
                          className={`text-[10px] px-2.5 py-1 rounded font-mono flex items-center gap-1 transition-colors ${
                            alreadyShort ? "opacity-30 cursor-not-allowed" : "bg-red-900/40 text-red-400 border border-red-700/50 hover:bg-red-900/70"
                          }`}
                        >
                          <Minus className="w-2.5 h-2.5" /> Short
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Correlation Matrix */}
        <div className="mt-8">
          <CorrelationMatrix selectedTickers={positions.map(p => p.ticker)} />
        </div>

        {/* Footnote */}
        <p className="mt-6 text-[10px] text-muted-foreground font-mono leading-relaxed max-w-4xl">
          Disclaimer: This tool is for educational and illustrative purposes only. Estimated returns are derived from AI council scenario analysis and do not constitute investment advice.
          Actual returns will differ materially. Past performance of historical analogs does not predict future results.
          Scenario probabilities are subjective assessments, not statistical forecasts.
        </p>
      </div>
    </section>
  );
}
