import { useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Filter } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import { useLiveQuotes } from "@/hooks/useLiveQuotes";

// Research-model baseline. Live quote fields overlay these values at render time.
const stockData = [
  { symbol: "NVDA", name: "NVIDIA", price: 196.52, changePct: null as number | null, high52: 236.54, low52: 157.34, role: "AI GPU Monopoly", dcRevQ: "$81.6B", color: "oklch(0.7 0.15 240)", category: "semiconductor" },
  { symbol: "MSFT", name: "Microsoft", price: 385.62, changePct: null as number | null, high52: 555.45, low52: 349.20, role: "Azure + Copilot", dcRevQ: "$34.7B IC", color: "oklch(0.7 0.15 155)", category: "cloud" },
  { symbol: "GOOGL", name: "Alphabet", price: 363.87, changePct: null as number | null, high52: 408.61, low52: 172.77, role: "GCP 63% Growth", dcRevQ: "$20B Cloud", color: "oklch(0.7 0.15 155)", category: "cloud" },
  { symbol: "AMZN", name: "Amazon", price: 245.57, changePct: null as number | null, high52: 278.56, low52: 196.00, role: "AWS Leader", dcRevQ: "$37.6B AWS", color: "oklch(0.7 0.15 155)", category: "cloud" },
  { symbol: "META", name: "Meta", price: 592.53, changePct: null as number | null, high52: 796.25, low52: 520.26, role: "$145B Capex + Cloud", dcRevQ: "N/A", color: "oklch(0.75 0.15 70)", category: "hyperscaler" },
  { symbol: "ORCL", name: "Oracle", price: 142.54, changePct: null as number | null, high52: 345.72, low52: 134.57, role: "OCI +93% Growth", dcRevQ: "$5.8B OCI", color: "oklch(0.65 0.2 25)", category: "cloud" },
  { symbol: "SPCX", name: "SpaceX", price: 152.80, changePct: null as number | null, high52: 212.00, low52: 135.00, role: "Orbital + xAI", dcRevQ: "$7.5B Starlink", color: "oklch(0.7 0.15 45)", category: "infrastructure" },
  { symbol: "CRWV", name: "CoreWeave", price: 86.61, changePct: null as number | null, high52: 163.66, low52: 63.80, role: "#1 Neocloud · Nasdaq-100", dcRevQ: "$2.08B", color: "oklch(0.7 0.18 280)", category: "neocloud" },
  { symbol: "NBIS", name: "Nebius", price: 220.23, changePct: null as number | null, high52: 299.86, low52: 43.89, role: "EU Neocloud · Nasdaq-100", dcRevQ: "$399M", color: "oklch(0.7 0.15 170)", category: "neocloud" },
  { symbol: "AMD", name: "AMD", price: 565.92, changePct: null as number | null, high52: 584.73, low52: 133.50, role: "MI400 Challenger", dcRevQ: "$5.8B DC", color: "oklch(0.65 0.12 200)", category: "semiconductor" },
  { symbol: "AVGO", name: "Broadcom", price: 374.04, changePct: null as number | null, high52: 495.00, low52: 269.58, role: "Custom AI ASICs", dcRevQ: "Growing", color: "oklch(0.65 0.12 200)", category: "semiconductor" },
];

type MarketFilter = "all" | "cloud" | "semiconductor" | "hyperscaler" | "infrastructure" | "neocloud";

const marketFilters: { label: string; value: MarketFilter; color: string }[] = [
  { label: "All Companies", value: "all", color: "oklch(0.6 0 0)" },
  { label: "Cloud Providers", value: "cloud", color: "oklch(0.7 0.15 155)" },
  { label: "Neoclouds", value: "neocloud", color: "oklch(0.7 0.18 280)" },
  { label: "Semiconductors", value: "semiconductor", color: "oklch(0.65 0.12 200)" },
  { label: "Hyperscalers", value: "hyperscaler", color: "oklch(0.75 0.15 70)" },
  { label: "Infrastructure", value: "infrastructure", color: "oklch(0.7 0.15 45)" },
];

// Capex comparison data (2025 vs 2026 guided) - Top 8
const capexData = [
  { company: "Amazon", capex2025: 100, capex2026: 200, color: "#f59e0b" },
  { company: "Microsoft", capex2025: 55, capex2026: 190, color: "#3b82f6" },
  { company: "Alphabet", capex2025: 50, capex2026: 185, color: "#8b5cf6" },
  { company: "Meta", capex2025: 72, capex2026: 135, color: "#10b981" },
  { company: "Oracle", capex2025: 16, capex2026: 50, color: "#ef4444" },
  { company: "CoreWeave", capex2025: 8, capex2026: 33, color: "#7c3aed" },
  { company: "SpaceX", capex2025: 14, capex2026: 21, color: "#f97316" },
  { company: "Nebius", capex2025: 3, capex2026: 12, color: "#14b8a6" },
];

// Big 8 Total Liabilities (on + off balance sheet): Moody's $662B off-balance sheet
const liabilitiesData = [
  { company: "Amazon", onBalance: 380, offBalance: 200, debtIssued2026: 50, color: "#f59e0b" },
  { company: "Microsoft", onBalance: 273, offBalance: 170, debtIssued2026: 45, color: "#3b82f6" },
  { company: "Alphabet", onBalance: 135, offBalance: 95, debtIssued2026: 85, color: "#8b5cf6" },
  { company: "Meta", onBalance: 95, offBalance: 120, debtIssued2026: 30, color: "#10b981" },
  { company: "Oracle", onBalance: 145, offBalance: 77, debtIssued2026: 43, color: "#ef4444" },
  { company: "CoreWeave", onBalance: 12, offBalance: 45, debtIssued2026: 3.25, color: "#7c3aed" },
  { company: "SpaceX", onBalance: 35, offBalance: 15, debtIssued2026: 100, color: "#f97316" },
  { company: "Nebius", onBalance: 8, offBalance: 12, debtIssued2026: 5, color: "#14b8a6" },
];

// Revenue growth trajectory data
const growthData = [
  { quarter: "Q1'25", googleCloud: 28, azure: 31, aws: 17, nvidiaDC: 73 },
  { quarter: "Q2'25", googleCloud: 35, azure: 33, aws: 19, nvidiaDC: 154 },
  { quarter: "Q3'25", googleCloud: 35, azure: 34, aws: 22, nvidiaDC: 112 },
  { quarter: "Q4'25", googleCloud: 45, azure: 37, aws: 24, nvidiaDC: 93 },
  { quarter: "Q1'26", googleCloud: 63, azure: 40, aws: 28, nvidiaDC: 92 },
  { quarter: "Q2'26E", googleCloud: 68, azure: 42, aws: 30, nvidiaDC: 85 },
];

export function MarketDataSection() {
  const [activeFilter, setActiveFilter] = useState<MarketFilter>("all");

  const { quoteMap, isLive, fetchedAt } = useLiveQuotes();

  // Merge live quotes over the static baseline; static values remain the fallback
  const mergedStocks = stockData.map((s) => {
    const live = quoteMap[s.symbol];
    if (!live) return s;
    return {
      ...s,
      price: live.price,
      changePct: live.changePct,
      high52: live.high52 ?? s.high52,
      low52: live.low52 ?? s.low52,
    };
  });

  const filteredStocks = mergedStocks.filter(s => activeFilter === "all" || s.category === activeFilter);

  const dataStamp = isLive && fetchedAt
    ? new Date(fetchedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    : null;

  return (
    <section id="market" className="py-24 relative">
      <div className="container">
        <p className="text-muted-foreground mb-6 max-w-3xl">
          {dataStamp
            ? `Live market data for AI-infrastructure bellwethers. Updated ${dataStamp}. `
            : "Reference market data for AI-infrastructure bellwethers. "}
          Price, daily move, and 52-week range update independently from the research-model baseline; capex, debt, and revenue fields remain explicitly dated estimates or reported figures.
        </p>

        {/* Filter pills */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-muted-foreground mr-1" />
          {marketFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-fluid-xs font-mono uppercase tracking-wider border transition-[transform,opacity,border-color,background-color] duration-200 active:scale-95 whitespace-nowrap shrink-0 ${
                activeFilter === f.value
                  ? "border-primary/50 bg-primary/10 text-primary shadow-sm"
                  : "border-border/40 text-muted-foreground hover:text-foreground hover:border-border/80 hover:bg-accent/30"
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }} />
              {f.label}
            </button>
          ))}
          {activeFilter !== "all" && (
            <span className="text-fluid-xs font-mono text-muted-foreground ml-2">
              Showing {filteredStocks.length} of {stockData.length}
            </span>
          )}
        </div>

        {/* Stock ticker strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 mb-12">
          {filteredStocks.map((stock) => {
            const pctFromHigh = ((stock.price - stock.high52) / stock.high52 * 100);
            return (
              <div key={stock.symbol} className="p-3 rounded-lg border border-border/30 bg-card/30 backdrop-blur-sm hover:border-border/60 transition-[transform,opacity,border-color,background-color]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold" style={{ color: stock.color }}>{stock.symbol}</span>
                  {stock.changePct !== null && stock.changePct >= 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-400" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-amber-400" />
                  )}
                </div>
                <div className="font-mono text-sm font-bold text-foreground">${stock.price.toFixed(2)}</div>
                <div className="text-fluid-xs text-muted-foreground mt-0.5 font-mono">
                  {stock.changePct !== null ? `${stock.changePct >= 0 ? "+" : ""}${stock.changePct.toFixed(2)}% today · ` : ""}{pctFromHigh.toFixed(0)}% from 52w high
                </div>
                <div className="text-fluid-xs text-muted-foreground/60 mt-0.5">{stock.role}</div>
              </div>
            );
          })}
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Capex comparison chart */}
          <div className="p-6 rounded-xl border border-border/30 bg-card/30 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-[oklch(0.75_0.15_70)]" />
              <h3 className="font-mono text-sm font-semibold">Top 6 Capex: 2025 vs 2026 ($B)</h3>
            </div>
            <p className="text-fluid-xs text-muted-foreground mb-4">Combined Top 6 capex: $776B in 2026. Capex growing 70% YoY vs cash flow 23% YoY.</p>
            <div role="img" aria-label="Stock price and financial data chart">
              <ResponsiveContainer width="100%" height={220}>
              <BarChart data={capexData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="[&_line]:stroke-border" />
                <XAxis dataKey="company" tick={{ fontSize: 10 }} className="[&_text]:fill-muted-foreground" />
                <YAxis tick={{ fontSize: 10 }} className="[&_text]:fill-muted-foreground" />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "11px", color: "var(--foreground)" }}
                  labelStyle={{ color: "var(--foreground)" }}
                />
                <Legend wrapperStyle={{ fontSize: "10px" }} />
                <Bar dataKey="capex2025" name="2025 Actual" fill="oklch(0.5 0.1 240)" radius={[2, 2, 0, 0]} />
                <Bar dataKey="capex2026" name="2026 Guided" radius={[2, 2, 0, 0]}>
                  {capexData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
              </div>
            <p className="text-fluid-xs text-muted-foreground mt-2">Top 6 combined: $776B in 2026 capex. Source: Company earnings, Goldman Sachs, Epoch AI.</p>
          </div>

          {/* Revenue growth trajectory */}
          <div className="p-6 rounded-xl border border-border/30 bg-card/30 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-[oklch(0.7_0.15_155)]" />
              <h3 className="font-mono text-sm font-semibold">Cloud & DC Revenue Growth (% YoY)</h3>
            </div>
            <p className="text-fluid-xs text-muted-foreground mb-4">Google Cloud accelerating fastest; NVIDIA DC normalizing from extreme base</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={growthData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="[&_line]:stroke-border" />
                <XAxis dataKey="quarter" tick={{ fontSize: 10 }} className="[&_text]:fill-muted-foreground" />
                <YAxis tick={{ fontSize: 10 }} className="[&_text]:fill-muted-foreground" unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "11px", color: "var(--foreground)" }}
                  labelStyle={{ color: "var(--foreground)" }}
                />
                <Legend wrapperStyle={{ fontSize: "10px" }} />
                <Area type="monotone" dataKey="googleCloud" name="Google Cloud" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
                <Area type="monotone" dataKey="azure" name="Azure" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2} />
                <Area type="monotone" dataKey="aws" name="AWS" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={2} />
                <Area type="monotone" dataKey="nvidiaDC" name="NVIDIA DC" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
            <p className="text-fluid-xs text-muted-foreground mt-2">Source: Company quarterly earnings (Q1'25 through Q1'26). Growth rates in constant currency where available.</p>
          </div>
        </div>

        {/* Big 6 Total Liabilities Chart */}
        <div className="mt-6 p-6 rounded-xl border border-border/30 bg-card/30 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-[oklch(0.65_0.2_25)]" />
            <h3 className="font-mono text-sm font-semibold">Big 6 Total Liabilities: On + Off Balance Sheet ($B)</h3>
          </div>
          <p className="text-fluid-xs text-muted-foreground mb-4">
            Moody's: $662B in off-balance sheet DC leases. Combined obligations nearing $1.6T+. FCF crosses zero Q3 2026 (Epoch AI).
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={liabilitiesData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="[&_line]:stroke-border" />
              <XAxis dataKey="company" tick={{ fontSize: 10 }} className="[&_text]:fill-muted-foreground" />
              <YAxis tick={{ fontSize: 10 }} className="[&_text]:fill-muted-foreground" />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "11px", color: "var(--foreground)" }}
                labelStyle={{ color: "var(--foreground)" }}
              />
              <Legend wrapperStyle={{ fontSize: "10px" }} />
              <Bar dataKey="onBalance" name="On-Balance Sheet" fill="oklch(0.5 0.15 240)" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="offBalance" name="Off-Balance Sheet" fill="oklch(0.65 0.2 25)" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="debtIssued2026" name="2026 Debt Issued" fill="oklch(0.6 0.15 350)" stackId="a" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-fluid-xs text-muted-foreground mt-2">Source: Moody's Ratings (Feb 2026), SEC 10-K/10-Q filings, 247WallSt, company earnings. SpaceX includes $75B IPO + $25B bond (Jun 23).</p>
        </div>

        {/* Key financial metrics table */}
        <div className="mt-8 rounded-xl border border-border/30 bg-card/30 backdrop-blur-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border/30 flex items-center justify-between">
            <h3 className="font-mono text-sm font-semibold">Key Financial Metrics: AI Infrastructure Bellwethers</h3>
            {activeFilter !== "all" && (
              <span className="text-fluid-xs font-mono text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                Filtered: {marketFilters.find(f => f.value === activeFilter)?.label}
              </span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left px-4 py-2 font-mono text-fluid-xs uppercase text-muted-foreground">Company</th>
                  <th className="text-right px-4 py-2 font-mono text-fluid-xs uppercase text-muted-foreground">Stock Price</th>
                  <th className="text-right px-4 py-2 font-mono text-fluid-xs uppercase text-muted-foreground">52W Range</th>
                  <th className="text-right px-4 py-2 font-mono text-fluid-xs uppercase text-muted-foreground">DC/Cloud Rev/Qtr</th>
                  <th className="text-left px-4 py-2 font-mono text-fluid-xs uppercase text-muted-foreground">Role in AI Infra</th>
                </tr>
              </thead>
              <tbody>
                {filteredStocks.map((stock) => (
                  <tr key={stock.symbol} className="border-b border-border/20 hover:bg-accent/20 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stock.color }} />
                        <span className="font-semibold">{stock.symbol}</span>
                        <span className="text-muted-foreground">{stock.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold">${stock.price.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-muted-foreground">
                      ${stock.low52.toFixed(0)} – ${stock.high52.toFixed(0)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono" style={{ color: stock.color }}>{stock.dcRevQ}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{stock.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-border/30 bg-card/20">
            <p className="text-fluid-xs text-muted-foreground font-mono">
              {dataStamp
                ? `Data: Yahoo Finance · Live prices as of ${dataStamp} · Unlisted tickers (e.g. SPCX) show latest reference values`
                : "Data: reference price snapshot shown where a live Yahoo Finance quote is unavailable"}
              {" "}· Price fields update separately from reported revenue, capex, and debt figures
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
