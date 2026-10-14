import { useState, useRef } from "react";
import { AlertTriangle, Calendar, DollarSign, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";

interface DebtTranche {
  company: string;
  ticker: string;
  color: string;
  type: string;
  amount: number; // in billions
  maturityDate: string;
  maturityYear: number;
  maturityQuarter: number;
  rate: string;
  notes: string;
  risk: "critical" | "high" | "medium" | "low";
}

const debtTranches: DebtTranche[] = [
  // CoreWeave - $35B+ total debt
  {
    company: "CoreWeave",
    ticker: "CRWV",
    color: "#f97316",
    type: "Secured Term Loan (DDTL 4.0)",
    amount: 7.6,
    maturityDate: "Jan 2027",
    maturityYear: 2027,
    maturityQuarter: 1,
    rate: "UST + 2.00%",
    notes: "Fixed rate tranche, avg weighted maturity 3.14yr. First major wall.",
    risk: "critical",
  },
  {
    company: "CoreWeave",
    ticker: "CRWV",
    color: "#f97316",
    type: "Senior Secured Notes",
    amount: 4.5,
    maturityDate: "Q2 2028",
    maturityYear: 2028,
    maturityQuarter: 2,
    rate: "8.75%",
    notes: "BB- rated by Fitch. Secured against GPU collateral.",
    risk: "high",
  },
  {
    company: "CoreWeave",
    ticker: "CRWV",
    color: "#f97316",
    type: "Revolving Credit Facility",
    amount: 3.2,
    maturityDate: "Q4 2028",
    maturityYear: 2028,
    maturityQuarter: 4,
    rate: "SOFR + 3.50%",
    notes: "Drawn for working capital. Covenants tied to backlog coverage.",
    risk: "medium",
  },
  {
    company: "CoreWeave",
    ticker: "CRWV",
    color: "#f97316",
    type: "Convertible Notes",
    amount: 5.0,
    maturityDate: "Q1 2029",
    maturityYear: 2029,
    maturityQuarter: 1,
    rate: "3.00% + conversion",
    notes: "Conversion at $55/share. Dilutive if stock stays below strike.",
    risk: "medium",
  },
  {
    company: "CoreWeave",
    ticker: "CRWV",
    color: "#f97316",
    type: "Infrastructure Bonds (Tranche B)",
    amount: 8.5,
    maturityDate: "Q3 2030",
    maturityYear: 2030,
    maturityQuarter: 3,
    rate: "7.25%",
    notes: "Backed by 15-year lease agreements with hyperscalers.",
    risk: "low",
  },
  {
    company: "CoreWeave",
    ticker: "CRWV",
    color: "#f97316",
    type: "Long-term Secured Debt",
    amount: 6.2,
    maturityDate: "2031+",
    maturityYear: 2031,
    maturityQuarter: 2,
    rate: "6.50-7.00%",
    notes: "Longest-dated tranches. Manageable if revenue scales.",
    risk: "low",
  },
  // Nebius - $15B total liabilities
  {
    company: "Nebius",
    ticker: "NBIS",
    color: "#8b5cf6",
    type: "Convertible Notes (Series A)",
    amount: 2.7,
    maturityDate: "Q3 2028",
    maturityYear: 2028,
    maturityQuarter: 3,
    rate: "Accretes to 120%",
    notes: "Accretes to 120% of principal at maturity. No cash coupon.",
    risk: "high",
  },
  {
    company: "Nebius",
    ticker: "NBIS",
    color: "#8b5cf6",
    type: "Convertible Notes (Series B)",
    amount: 3.0,
    maturityDate: "Q1 2029",
    maturityYear: 2029,
    maturityQuarter: 1,
    rate: "Accretes to 120%",
    notes: "Added Q4 2025. Same accretion structure as Series A.",
    risk: "high",
  },
  {
    company: "Nebius",
    ticker: "NBIS",
    color: "#8b5cf6",
    type: "Convertible Notes (Mar 2026)",
    amount: 4.34,
    maturityDate: "Q1 2031",
    maturityYear: 2031,
    maturityQuarter: 1,
    rate: "Accretes to 120%",
    notes: "Latest raise. Matures 2031/2033 split. $63.7M quarterly interest.",
    risk: "medium",
  },
  {
    company: "Nebius",
    ticker: "NBIS",
    color: "#8b5cf6",
    type: "30-Year Infrastructure Bonds",
    amount: 2.5,
    maturityDate: "2054+",
    maturityYear: 2054,
    maturityQuarter: 1,
    rate: "5.80%",
    notes: "Token Factory structure. Ultra-long dated, lowest near-term risk.",
    risk: "low",
  },
  // Oracle - $95B planned debt/equity raise
  {
    company: "Oracle",
    ticker: "ORCL",
    color: "#ef4444",
    type: "Senior Notes (2026 Maturity)",
    amount: 8.5,
    maturityDate: "Jul 2026",
    maturityYear: 2026,
    maturityQuarter: 3,
    rate: "3.25%",
    notes: "Payment date July 24, 2026. Immediate refinancing needed.",
    risk: "critical",
  },
  {
    company: "Oracle",
    ticker: "ORCL",
    color: "#ef4444",
    type: "Senior Notes (2027 Maturity)",
    amount: 12.0,
    maturityDate: "Q2 2027",
    maturityYear: 2027,
    maturityQuarter: 2,
    rate: "3.60%",
    notes: "Part of $40-50B new debt plan to fund $95B capex program.",
    risk: "high",
  },
  {
    company: "Oracle",
    ticker: "ORCL",
    color: "#ef4444",
    type: "New Issuance (2026 Bonds)",
    amount: 15.0,
    maturityDate: "Q4 2029",
    maturityYear: 2029,
    maturityQuarter: 4,
    rate: "4.50-5.25%",
    notes: "Part of record $182B tech bond issuance in H1 2026.",
    risk: "medium",
  },
  {
    company: "Oracle",
    ticker: "ORCL",
    color: "#ef4444",
    type: "Long-dated Bonds (2031-2036)",
    amount: 18.0,
    maturityDate: "2031-2036",
    maturityYear: 2033,
    maturityQuarter: 2,
    rate: "5.00-5.625%",
    notes: "Longest tranches from new issuance. Manageable at current FCF.",
    risk: "low",
  },
];

// Aggregate by year for the wall visualization
function getYearlyAggregates() {
  const years = [2026, 2027, 2028, 2029, 2030, 2031];
  return years.map((year) => {
    const tranches = debtTranches.filter(
      (t) => t.maturityYear === year || (year === 2031 && t.maturityYear > 2030 && t.maturityYear < 2055)
    );
    const total = tranches.reduce((sum, t) => sum + t.amount, 0);
    const byCompany = {
      CRWV: tranches.filter((t) => t.ticker === "CRWV").reduce((s, t) => s + t.amount, 0),
      NBIS: tranches.filter((t) => t.ticker === "NBIS").reduce((s, t) => s + t.amount, 0),
      ORCL: tranches.filter((t) => t.ticker === "ORCL").reduce((s, t) => s + t.amount, 0),
    };
    return { year, total, byCompany, tranches };
  });
}

function getRiskBadge(risk: DebtTranche["risk"]) {
  const styles = {
    critical: "bg-red-500/20 text-red-400 border-red-500/30",
    high: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  };
  return (
    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase border ${styles[risk]}`}>
      {risk}
    </span>
  );
}

export function DebtMaturityWall() {
  const [expandedYear, setExpandedYear] = useState<number | null>(2027);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; content: { ticker: string; company: string; color: string; amount: number; year: number; tranches: DebtTranche[] } | null }>({ visible: false, x: 0, y: 0, content: null });
  const containerRef = useRef<HTMLDivElement>(null);
  const yearlyData = getYearlyAggregates();
  const maxTotal = Math.max(...yearlyData.map((y) => y.total));

  const handleBarHover = (e: React.MouseEvent, ticker: string, year: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const yearTranches = debtTranches.filter((t) => t.ticker === ticker && (t.maturityYear === year || (year === 2031 && t.maturityYear >= 2031 && t.maturityYear < 2055)));
    const co = companies.find((c) => c.ticker === ticker);
    if (!co || yearTranches.length === 0) return;
    setTooltip({
      visible: true,
      x,
      y,
      content: { ticker, company: co.name, color: co.color, amount: yearTranches.reduce((s, t) => s + t.amount, 0), year, tranches: yearTranches },
    });
  };

  const handleBarLeave = () => {
    setTooltip({ visible: false, x: 0, y: 0, content: null });
  };

  const companies = [
    { ticker: "CRWV", name: "CoreWeave", color: "#f97316", totalDebt: "$35B", interestBurn: "$536M/qtr" },
    { ticker: "NBIS", name: "Nebius", color: "#8b5cf6", totalDebt: "$15B", interestBurn: "$63.7M/qtr" },
    { ticker: "ORCL", name: "Oracle", color: "#ef4444", totalDebt: "$95B plan", interestBurn: "$2.8B/qtr" },
  ];

  const filteredTranches = selectedCompany
    ? debtTranches.filter((t) => t.ticker === selectedCompany)
    : debtTranches;

  return (
    <section id="debt-wall" className="py-24 relative">
      <div className="container max-w-6xl">

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
            <Calendar className="w-6 h-6 text-red-400" />
            Refinancing Risk Timeline
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl">
            When the debt comes due. CoreWeave, Oracle, and Nebius collectively face{" "}
            <span className="text-red-400 font-mono font-bold">$95B+</span> in maturities through 2031.
            The critical window is 2026-2028 where $45B+ must be refinanced or repaid while AI revenue
            is still scaling.
          </p>
        </div>

        {/* Company summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {companies.map((co) => (
            <button
              key={co.ticker}
              onClick={() => setSelectedCompany(selectedCompany === co.ticker ? null : co.ticker)}
              className={`p-4 rounded-lg border text-left transition-[transform,opacity,border-color,background-color] duration-200 ${
                selectedCompany === co.ticker
                  ? "border-border bg-card/50 ring-1"
                  : "border-border/30 bg-card/10 hover:border-border/60"
              }`}
              style={{
                borderColor: selectedCompany === co.ticker ? co.color : undefined,
                boxShadow: selectedCompany === co.ticker ? `0 0 0 1px ${co.color}` : undefined,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold" style={{ color: co.color }}>
                  {co.ticker}
                </span>
                <span className="text-[10px] text-muted-foreground">{co.name}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-foreground">{co.totalDebt}</span>
                <span className="text-[10px] text-muted-foreground">total debt</span>
              </div>
              <div className="mt-1 text-[10px] text-muted-foreground">
                Interest burn: <span className="font-mono text-amber-400">{co.interestBurn}</span>
              </div>
            </button>
          ))}
        </div>

        {/* The Wall - Stacked bar chart */}
        <div className="mb-8 p-6 rounded-xl border border-border/30 bg-card/10 relative" ref={containerRef}>
          {/* Tooltip overlay */}
          {tooltip.visible && tooltip.content && (
            <div
              className="absolute z-50 pointer-events-none animate-in fade-in duration-150"
              style={{
                left: Math.min(tooltip.x, (containerRef.current?.offsetWidth || 400) - 280),
                top: tooltip.y - 10,
                transform: "translate(10px, -100%)",
              }}
            >
              <div className="p-3 rounded-lg border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl min-w-[240px] max-w-[300px]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tooltip.content.color }} />
                  <span className="font-mono text-xs font-bold" style={{ color: tooltip.content.color }}>{tooltip.content.ticker}</span>
                  <span className="text-xs text-muted-foreground">{tooltip.content.company}</span>
                  <span className="ml-auto font-mono text-xs font-bold text-foreground">${tooltip.content.amount.toFixed(1)}B</span>
                </div>
                <div className="text-[10px] text-muted-foreground mb-2">Maturing in {tooltip.content.year === 2031 ? "2031+" : tooltip.content.year}</div>
                <div className="space-y-1.5">
                  {tooltip.content.tranches.map((t, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px]">
                      <span className="flex-1 text-foreground/80 truncate">{t.type}</span>
                      <span className="font-mono font-bold text-foreground">${t.amount}B</span>
                      {getRiskBadge(t.risk)}
                    </div>
                  ))}
                </div>
                {tooltip.content.tranches.some((t) => t.risk === "critical") && (
                  <div className="mt-2 pt-2 border-t border-red-500/20 flex items-center gap-1.5 text-[10px] text-red-400">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Immediate refinancing required</span>
                  </div>
                )}
              </div>
            </div>
          )}
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-6 flex items-center gap-2">
            <DollarSign className="w-3.5 h-3.5" />
            Maturity Wall by Year (Billions USD)
          </h3>

          <div className="space-y-3">
            {yearlyData.map((yearData) => {
              const isExpanded = expandedYear === yearData.year;
              const barWidth = (yearData.total / maxTotal) * 100;
              const isCritical = yearData.year <= 2027;
              const yearTranches = yearData.tranches.filter(
                (t) => !selectedCompany || t.ticker === selectedCompany
              );
              const filteredTotal = selectedCompany
                ? yearData.byCompany[selectedCompany as keyof typeof yearData.byCompany] || 0
                : yearData.total;

              return (
                <div key={yearData.year}>
                  <button
                    onClick={() => setExpandedYear(isExpanded ? null : yearData.year)}
                    className="w-full group"
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <span
                        className={`font-mono text-sm font-bold w-12 ${
                          isCritical ? "text-red-400" : "text-muted-foreground"
                        }`}
                      >
                        {yearData.year === 2031 ? "31+" : yearData.year}
                      </span>

                      {/* Stacked bar */}
                      <div className="flex-1 h-8 bg-muted/10 rounded-md overflow-hidden relative">
                        {/* ORCL segment */}
                        {yearData.byCompany.ORCL > 0 && (
                          <div
                            className={`absolute inset-y-0 left-0 rounded-l-md transition-[transform,opacity,width,left] duration-500 ${!selectedCompany || selectedCompany === "ORCL" ? "cursor-pointer hover:brightness-150" : "pointer-events-none"}`}
                            style={{
                              width: `${(yearData.byCompany.ORCL / maxTotal) * 100}%`,
                              backgroundColor: selectedCompany && selectedCompany !== "ORCL" ? "transparent" : "#ef444440",
                              borderRight: "1px solid rgba(255,255,255,0.05)",
                            }}
                            onMouseMove={!selectedCompany || selectedCompany === "ORCL" ? (e) => handleBarHover(e, "ORCL", yearData.year) : undefined}
                            onMouseLeave={!selectedCompany || selectedCompany === "ORCL" ? handleBarLeave : undefined}
                          />
                        )}
                        {/* CRWV segment */}
                        {yearData.byCompany.CRWV > 0 && (
                          <div
                            className={`absolute inset-y-0 transition-[transform,opacity,width,left] duration-500 ${!selectedCompany || selectedCompany === "CRWV" ? "cursor-pointer hover:brightness-150" : "pointer-events-none"}`}
                            style={{
                              left: `${(yearData.byCompany.ORCL / maxTotal) * 100}%`,
                              width: `${(yearData.byCompany.CRWV / maxTotal) * 100}%`,
                              backgroundColor: selectedCompany && selectedCompany !== "CRWV" ? "transparent" : "#f9731640",
                              borderRight: "1px solid rgba(255,255,255,0.05)",
                            }}
                            onMouseMove={!selectedCompany || selectedCompany === "CRWV" ? (e) => handleBarHover(e, "CRWV", yearData.year) : undefined}
                            onMouseLeave={!selectedCompany || selectedCompany === "CRWV" ? handleBarLeave : undefined}
                          />
                        )}
                        {/* NBIS segment */}
                        {yearData.byCompany.NBIS > 0 && (
                          <div
                            className={`absolute inset-y-0 transition-[transform,opacity,width,left] duration-500 ${!selectedCompany || selectedCompany === "NBIS" ? "cursor-pointer hover:brightness-150" : "pointer-events-none"}`}
                            style={{
                              left: `${((yearData.byCompany.ORCL + yearData.byCompany.CRWV) / maxTotal) * 100}%`,
                              width: `${(yearData.byCompany.NBIS / maxTotal) * 100}%`,
                              backgroundColor: selectedCompany && selectedCompany !== "NBIS" ? "transparent" : "#8b5cf640",
                            }}
                            onMouseMove={!selectedCompany || selectedCompany === "NBIS" ? (e) => handleBarHover(e, "NBIS", yearData.year) : undefined}
                            onMouseLeave={!selectedCompany || selectedCompany === "NBIS" ? handleBarLeave : undefined}
                          />
                        )}
                        {/* Total bar outline */}
                        <div
                          className="absolute inset-y-0 left-0 rounded-md border transition-[transform,opacity,width,left] duration-500"
                          style={{
                            width: `${barWidth}%`,
                            borderColor: isCritical ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.1)",
                          }}
                        />
                        {/* Critical pulse */}
                        {isCritical && (
                          <div
                            className="absolute inset-y-0 left-0 rounded-md animate-pulse"
                            style={{
                              width: `${barWidth}%`,
                              background: "linear-gradient(90deg, rgba(239,68,68,0.05), rgba(239,68,68,0.15))",
                            }}
                          />
                        )}
                      </div>

                      <span className="font-mono text-sm font-bold w-16 text-right">
                        ${filteredTotal.toFixed(1)}B
                      </span>

                      {isCritical && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}

                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && yearTranches.length > 0 && (
                    <div className="ml-16 mt-2 mb-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      {yearTranches.map((tranche, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3 rounded-lg border border-border/20 bg-card/5"
                        >
                          <div
                            className="w-1 h-full min-h-[40px] rounded-full"
                            style={{ backgroundColor: tranche.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-[10px] font-bold" style={{ color: tranche.color }}>
                                {tranche.ticker}
                              </span>
                              <span className="text-xs font-medium text-foreground truncate">
                                {tranche.type}
                              </span>
                              <span className="ml-auto">{getRiskBadge(tranche.risk)}</span>
                            </div>
                            <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                              <span>
                                <span className="font-mono font-bold text-foreground">${tranche.amount}B</span>
                              </span>
                              <span>Due: {tranche.maturityDate}</span>
                              <span>Rate: {tranche.rate}</span>
                            </div>
                            <p className="mt-1 text-[10px] text-muted-foreground/70 leading-relaxed">
                              {tranche.notes}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-border/20 flex flex-wrap gap-4 text-[10px]">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#ef444440" }} />
              <span className="text-muted-foreground">Oracle</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#f9731640" }} />
              <span className="text-muted-foreground">CoreWeave</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#8b5cf640" }} />
              <span className="text-muted-foreground">Nebius</span>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 text-red-400" />
              <span className="text-muted-foreground">Critical refinancing window (2026-2027)</span>
            </div>
          </div>
        </div>

        {/* Key risk metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-xs font-mono uppercase text-red-400">Immediate Risk</span>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">$20.5B</div>
            <p className="text-[10px] text-muted-foreground">
              Due in next 12 months (Jul 2026 - Jul 2027). Oracle $8.5B senior notes due July 24, 2026.
              CoreWeave $7.6B DDTL matures Jan 2027.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-amber-500/20 bg-amber-500/5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono uppercase text-amber-400">Interest Burden</span>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">$3.4B/qtr</div>
            <p className="text-[10px] text-muted-foreground">
              Combined quarterly interest: ORCL $2.8B + CRWV $536M + NBIS $63.7M.
              CoreWeave's interest alone exceeds its Q1 2026 revenue.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-purple-500/20 bg-purple-500/5">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-mono uppercase text-purple-400">Accretion Trap</span>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">120%</div>
            <p className="text-[10px] text-muted-foreground">
              Nebius convertible notes accrete to 120% of principal at maturity.
              $10B principal becomes $12B owed: even without cash coupons.
            </p>
          </div>
        </div>

        {/* Refinancing scenario */}
        <div className="p-4 rounded-lg border border-border/20 bg-card/5">
          <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
            Refinancing Scenarios
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-emerald-400 font-mono font-bold">Bull Case:</span>
              <span className="text-muted-foreground ml-2">
                AI revenue scales 2-3x by 2027. Companies refinance at lower spreads as credit improves.
                CoreWeave achieves investment-grade by 2028. Total cost of refinancing: ~$45B at 5-6%.
              </span>
            </div>
            <div>
              <span className="text-red-400 font-mono font-bold">Bear Case:</span>
              <span className="text-muted-foreground ml-2">
                AI demand plateau or macro shock tightens credit. Spreads widen 200-400bps.
                CoreWeave forced to dilute equity or sell assets. Nebius accretion compounds.
                Potential cascade: one default triggers cross-acceleration clauses.
              </span>
            </div>
          </div>
        </div>

        {/* Footnote */}
        <p className="mt-6 text-[9px] text-muted-foreground/50 font-mono">
          Sources: CoreWeave S-1, Fitch Ratings (Jul 2026), Nebius Q1 2026 financials, Oracle FY2026 10-K,
          Beth Kindig / I/O Fund analysis (Jun 2026), Bank of England Financial Stability Report (Jul 2026).
          Amounts approximate; some tranches aggregated for clarity.
        </p>
      </div>
    </section>
  );
}
