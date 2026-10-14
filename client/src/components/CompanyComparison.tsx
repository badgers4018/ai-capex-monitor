import { useState, useMemo } from "react";
import { X, Plus, BarChart3 } from "lucide-react";

interface CompanyMetrics {
  ticker: string;
  name: string;
  color: string;
  capex2026: number;
  capex2025: number;
  capexGrowth: string;
  marketCap: string;
  revenue: string;
  cloudRevenue: string;
  totalLiabilities: number;
  offBalanceSheet: number;
  debtIssued2026: number;
  fcf: number;
  fcfStatus: string;
  capexToRevenue: string;
  debtToEquity: string;
  aiRevShare: string;
}

const allCompanies: CompanyMetrics[] = [
  {
    ticker: "AMZN", name: "Amazon", color: "oklch(0.75 0.15 70)",
    capex2026: 200, capex2025: 100, capexGrowth: "+100%",
    marketCap: "$2.6T", revenue: "$700B", cloudRevenue: "$37.6B/qtr",
    totalLiabilities: 380, offBalanceSheet: 200, debtIssued2026: 50, fcf: -5,
    fcfStatus: "Negative Q1 2026", capexToRevenue: "29%", debtToEquity: "120%", aiRevShare: "19%",
  },
  {
    ticker: "MSFT", name: "Microsoft", color: "oklch(0.7 0.15 240)",
    capex2026: 190, capex2025: 55, capexGrowth: "+245%",
    marketCap: "$2.8T", revenue: "$280B", cloudRevenue: "$40.9B/qtr",
    totalLiabilities: 273, offBalanceSheet: 100, debtIssued2026: 40, fcf: 12,
    fcfStatus: "Declining rapidly", capexToRevenue: "68%", debtToEquity: "85%", aiRevShare: "15%",
  },
  {
    ticker: "GOOGL", name: "Alphabet", color: "oklch(0.7 0.15 155)",
    capex2026: 185, capex2025: 50, capexGrowth: "+270%",
    marketCap: "$2.2T", revenue: "$420B", cloudRevenue: "$12.3B/qtr",
    totalLiabilities: 130, offBalanceSheet: 85, debtIssued2026: 25, fcf: 18,
    fcfStatus: "Positive but shrinking", capexToRevenue: "44%", debtToEquity: "25%", aiRevShare: "12%",
  },
  {
    ticker: "META", name: "Meta", color: "oklch(0.65 0.12 320)",
    capex2026: 130, capex2025: 72, capexGrowth: "+81%",
    marketCap: "$1.5T", revenue: "$220B", cloudRevenue: "Internal only",
    totalLiabilities: 85, offBalanceSheet: 50, debtIssued2026: 20, fcf: 25,
    fcfStatus: "Positive: ad revenue funds capex", capexToRevenue: "59%", debtToEquity: "45%", aiRevShare: "25%",
  },
  {
    ticker: "ORCL", name: "Oracle", color: "oklch(0.65 0.2 25)",
    capex2026: 50, capex2025: 16, capexGrowth: "+213%",
    marketCap: "$420B", revenue: "$67B", cloudRevenue: "$5.8B/qtr",
    totalLiabilities: 145, offBalanceSheet: 77, debtIssued2026: 43, fcf: -24,
    fcfStatus: "Deep negative: debt-funded", capexToRevenue: "75%", debtToEquity: "500%", aiRevShare: "35%",
  },
  {
    ticker: "SPCX", name: "SpaceX", color: "oklch(0.7 0.15 45)",
    capex2026: 21, capex2025: 14, capexGrowth: "+50%",
    marketCap: "$2.0T", revenue: "$15B", cloudRevenue: "$7.5B (Starlink)",
    totalLiabilities: 35, offBalanceSheet: 15, debtIssued2026: 100, fcf: 3,
    fcfStatus: "Positive from Starlink", capexToRevenue: "140%", debtToEquity: "40%", aiRevShare: "20%",
  },
  {
    ticker: "NVDA", name: "NVIDIA", color: "oklch(0.7 0.18 80)",
    capex2026: 12, capex2025: 8, capexGrowth: "+50%",
    marketCap: "$3.6T", revenue: "$326B", cloudRevenue: "N/A (chip seller)",
    totalLiabilities: 30, offBalanceSheet: 10, debtIssued2026: 5, fcf: 200,
    fcfStatus: "Massively positive", capexToRevenue: "4%", debtToEquity: "15%", aiRevShare: "90%",
  },
  {
    ticker: "CRWV", name: "CoreWeave", color: "oklch(0.7 0.18 280)",
    capex2026: 33, capex2025: 8, capexGrowth: "+313%",
    marketCap: "$57.7B", revenue: "$12.67B", cloudRevenue: "$2.08B/qtr GPU-aaS",
    totalLiabilities: 12, offBalanceSheet: 45, debtIssued2026: 3.25, fcf: -12,
    fcfStatus: "Negative: $740M Q1 loss", capexToRevenue: "260%", debtToEquity: "1200%", aiRevShare: "100%",
  },
  {
    ticker: "NBIS", name: "Nebius", color: "oklch(0.7 0.15 170)",
    capex2026: 12, capex2025: 3, capexGrowth: "+300%",
    marketCap: "$45B", revenue: "$5-7B ARR", cloudRevenue: "$399M/qtr AI Cloud",
    totalLiabilities: 8, offBalanceSheet: 12, debtIssued2026: 5, fcf: 4,
    fcfStatus: "Profitable: $584M net income", capexToRevenue: "170%", debtToEquity: "80%", aiRevShare: "98%",
  },
];

const metrics: { key: keyof CompanyMetrics; label: string; format: "dollar" | "percent" | "text" | "number" }[] = [
  { key: "capex2026", label: "2026 Capex ($B)", format: "dollar" },
  { key: "capex2025", label: "2025 Capex ($B)", format: "dollar" },
  { key: "capexGrowth", label: "Capex Growth", format: "text" },
  { key: "marketCap", label: "Market Cap", format: "text" },
  { key: "revenue", label: "Annual Revenue", format: "text" },
  { key: "cloudRevenue", label: "Cloud/DC Revenue", format: "text" },
  { key: "fcf", label: "FCF ($B)", format: "number" },
  { key: "fcfStatus", label: "FCF Status", format: "text" },
  { key: "totalLiabilities", label: "On-Balance Liabilities ($B)", format: "dollar" },
  { key: "offBalanceSheet", label: "Off-Balance Sheet ($B)", format: "dollar" },
  { key: "debtIssued2026", label: "2026 Debt Issued ($B)", format: "dollar" },
  { key: "capexToRevenue", label: "Capex/Revenue Ratio", format: "text" },
  { key: "debtToEquity", label: "Debt-to-Equity", format: "text" },
  { key: "aiRevShare", label: "AI Revenue Share", format: "text" },
];

function formatValue(value: string | number, format: string): string {
  if (format === "dollar" && typeof value === "number") return `$${value}B`;
  if (format === "number" && typeof value === "number") return value >= 0 ? `+$${value}B` : `-$${Math.abs(value)}B`;
  return String(value);
}

export function CompanyComparison() {
  const [selected, setSelected] = useState<string[]>(["AMZN", "MSFT", "GOOGL"]);

  const selectedCompanies = useMemo(
    () => selected.map((t) => allCompanies.find((c) => c.ticker === t)!).filter(Boolean),
    [selected]
  );

  const available = allCompanies.filter((c) => !selected.includes(c.ticker));

  const toggleCompany = (ticker: string) => {
    if (selected.includes(ticker)) {
      if (selected.length > 2) {
        setSelected(selected.filter((t) => t !== ticker));
      }
    } else if (selected.length < 4) {
      setSelected([...selected, ticker]);
    }
  };

  // Find best/worst for highlighting
  const getHighlight = (key: keyof CompanyMetrics, value: string | number): "best" | "worst" | "neutral" => {
    if (typeof value !== "number") return "neutral";
    const values = selectedCompanies.map((c) => c[key] as number);
    const isHigherBetter = key === "fcf"; // For FCF, higher is better
    const isLowerBetter = key === "totalLiabilities" || key === "offBalanceSheet" || key === "debtIssued2026"; // Lower is better
    if (isHigherBetter) {
      if (value === Math.max(...values)) return "best";
      if (value === Math.min(...values)) return "worst";
    } else if (isLowerBetter) {
      if (value === Math.min(...values)) return "best";
      if (value === Math.max(...values)) return "worst";
    }
    return "neutral";
  };

  return (
    <section id="compare" className="py-20 relative">
      <div className="container max-w-5xl">

        <div className="text-center mb-8">
          <h2 className="text-3xl font-sans font-semibold mb-3">Side-by-Side Comparison</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
            Select 2-4 companies to compare their financial metrics, risk profiles, and AI infrastructure positions.
            Green highlights = best in group. Red = worst in group.
          </p>
        </div>

        {/* Company selector */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center sm:flex-wrap">
          {allCompanies.map((company) => {
            const isSelected = selected.includes(company.ticker);
            return (
              <button
                key={company.ticker}
                onClick={() => toggleCompany(company.ticker)}
                disabled={!isSelected && selected.length >= 4}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-mono text-xs transition-[transform,opacity,border-color,background-color] duration-200 active:scale-[0.97] shrink-0 ${
                  isSelected
                    ? "border-2 text-foreground"
                    : "border border-border/30 text-muted-foreground hover:border-border/60 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                }`}
                style={isSelected ? { borderColor: company.color, backgroundColor: `color-mix(in oklch, ${company.color} 10%, transparent)` } : {}}
              >
                {isSelected ? (
                  <X className="w-3 h-3" style={{ color: company.color }} />
                ) : (
                  <Plus className="w-3 h-3" />
                )}
                <span style={isSelected ? { color: company.color } : {}}>{company.ticker}</span>
              </button>
            );
          })}
        </div>

        <p className="text-center text-fluid-xs font-mono text-muted-foreground mb-6">
          {selected.length}/4 selected · Min 2, Max 4
        </p>

        {/* Comparison table */}
        <div className="overflow-x-auto rounded-xl border border-border/30 bg-card/10">
          <table className="w-full border-collapse min-w-[550px]">
            <thead>
              <tr>
                <th className="p-4 text-left font-mono text-fluid-xs uppercase tracking-wider text-muted-foreground border-b border-border/20 min-w-[140px] sticky left-0 bg-card/50 backdrop-blur-sm z-10">
                  Metric
                </th>
                {selectedCompanies.map((company) => (
                  <th key={company.ticker} className="p-4 text-center border-b border-border/20 min-w-[130px]">
                    <div className="font-mono text-sm font-bold" style={{ color: company.color }}>{company.ticker}</div>
                    <div className="text-fluid-xs text-muted-foreground">{company.name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.map((metric) => (
                <tr key={metric.key} className="border-b border-border/10 last:border-0 hover:bg-card/20 transition-colors">
                  <td className="p-3 font-mono text-fluid-sm text-muted-foreground sticky left-0 bg-card/50 backdrop-blur-sm z-10">
                    {metric.label}
                  </td>
                  {selectedCompanies.map((company) => {
                    const value = company[metric.key];
                    const highlight = getHighlight(metric.key, value);
                    return (
                      <td key={company.ticker} className="p-3 text-center">
                        <span
                          className={`font-mono text-xs font-medium px-2 py-1 rounded ${
                            highlight === "best"
                              ? "bg-[oklch(0.7_0.15_155_/_0.1)] text-[oklch(0.75_0.12_155)]"
                              : highlight === "worst"
                              ? "bg-[oklch(0.65_0.2_25_/_0.1)] text-[oklch(0.75_0.15_25)]"
                              : "text-foreground/80"
                          }`}
                        >
                          {formatValue(value, metric.format)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Visual capex bar comparison */}
        <div className="mt-8 p-5 rounded-xl border border-border/30 bg-card/10">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">2026 Capex Comparison</h4>
          </div>
          <div className="space-y-3">
            {selectedCompanies
              .sort((a, b) => b.capex2026 - a.capex2026)
              .map((company) => {
                const maxCapex = Math.max(...selectedCompanies.map((c) => c.capex2026));
                const width = (company.capex2026 / maxCapex) * 100;
                return (
                  <div key={company.ticker} className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold w-12" style={{ color: company.color }}>
                      {company.ticker}
                    </span>
                    <div className="flex-1 h-7 rounded-md bg-background/30 overflow-hidden relative">
                      <div
                        className="h-full rounded-md transition-[transform,opacity,width,left] duration-500 ease-out flex items-center px-3"
                        style={{ width: `${width}%`, backgroundColor: `color-mix(in oklch, ${company.color} 30%, transparent)` }}
                      >
                        <span className="font-mono text-fluid-xs font-bold text-foreground whitespace-nowrap">
                          ${company.capex2026}B
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </section>
  );
}
