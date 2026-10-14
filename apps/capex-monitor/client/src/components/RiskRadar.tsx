import { useState } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip } from "recharts";
import { SectionHeading } from "@/components/BrandMark";

interface CompanyRisk {
  ticker: string;
  name: string;
  color: string;
  risks: {
    power: number;      // Power dependency risk (0-10)
    leverage: number;   // Financial leverage risk (0-10)
    concentration: number; // Revenue concentration risk (0-10)
    regulatory: number; // Regulatory/policy risk (0-10)
    execution: number;  // Execution/buildout risk (0-10)
    supply: number;     // Supply chain risk (0-10)
  };
}

const companies: CompanyRisk[] = [
  {
    ticker: "AMZN", name: "Amazon", color: "#f59e0b",
    risks: { power: 9, leverage: 7, concentration: 4, regulatory: 7, execution: 8, supply: 7 },
  },
  {
    ticker: "MSFT", name: "Microsoft", color: "#3b82f6",
    risks: { power: 8, leverage: 6, concentration: 5, regulatory: 6, execution: 9, supply: 7 },
  },
  {
    ticker: "GOOGL", name: "Alphabet", color: "#10b981",
    risks: { power: 8, leverage: 3, concentration: 6, regulatory: 9, execution: 7, supply: 5 },
  },
  {
    ticker: "META", name: "Meta", color: "#a855f7",
    risks: { power: 7, leverage: 4, concentration: 8, regulatory: 8, execution: 6, supply: 6 },
  },
  {
    ticker: "ORCL", name: "Oracle", color: "#ef4444",
    risks: { power: 8, leverage: 10, concentration: 7, regulatory: 5, execution: 9, supply: 8 },
  },
  {
    ticker: "SPCX", name: "SpaceX", color: "#f97316",
    risks: { power: 4, leverage: 4, concentration: 6, regulatory: 8, execution: 8, supply: 5 },
  },
  {
    ticker: "NVDA", name: "NVIDIA", color: "#84cc16",
    risks: { power: 2, leverage: 1, concentration: 9, regulatory: 7, execution: 3, supply: 4 },
  },
  {
    ticker: "CRWV", name: "CoreWeave", color: "#7c3aed",
    risks: { power: 8, leverage: 10, concentration: 9, regulatory: 3, execution: 7, supply: 8 },
  },
  {
    ticker: "NBIS", name: "Nebius", color: "#14b8a6",
    risks: { power: 6, leverage: 4, concentration: 7, regulatory: 5, execution: 6, supply: 7 },
  },
];

const riskDimensions = [
  { key: "power", label: "Power Dependency", description: "Exposure to electricity cost/availability constraints" },
  { key: "leverage", label: "Financial Leverage", description: "Debt burden and off-balance sheet obligations" },
  { key: "concentration", label: "Revenue Concentration", description: "Dependency on single revenue stream or customer" },
  { key: "regulatory", label: "Regulatory Risk", description: "Exposure to antitrust, moratoriums, export controls" },
  { key: "execution", label: "Execution Risk", description: "Complexity of current buildout vs. track record" },
  { key: "supply", label: "Supply Chain Risk", description: "Dependency on constrained components (CoWoS, HBM, etc.)" },
];

export function RiskRadar() {
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>(["AMZN", "NVDA", "ORCL"]);

  const toggleCompany = (ticker: string) => {
    if (selectedCompanies.includes(ticker)) {
      if (selectedCompanies.length > 1) {
        setSelectedCompanies(selectedCompanies.filter((t) => t !== ticker));
      }
    } else if (selectedCompanies.length < 4) {
      setSelectedCompanies([...selectedCompanies, ticker]);
    }
  };

  // Transform data for Recharts radar
  const radarData = riskDimensions.map((dim) => {
    const point: Record<string, string | number> = { dimension: dim.label };
    selectedCompanies.forEach((ticker) => {
      const company = companies.find((c) => c.ticker === ticker)!;
      point[ticker] = company.risks[dim.key as keyof CompanyRisk["risks"]];
    });
    return point;
  });

  // Calculate composite risk score
  const getCompositeScore = (ticker: string): number => {
    const company = companies.find((c) => c.ticker === ticker)!;
    const values = Object.values(company.risks);
    return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
  };

  return (
    <section id="risk-radar" className="py-20 relative">
      <div className="container max-w-5xl">

        <SectionHeading index="07" eyebrow="Risk transmission" title="Multi-dimensional risk profile" description="Overlay up to four companies across six exposure dimensions. Larger area indicates higher aggregate risk." align="center" />

        {/* Company selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {companies.map((company) => {
            const isSelected = selectedCompanies.includes(company.ticker);
            return (
              <button
                key={company.ticker}
                onClick={() => toggleCompany(company.ticker)}
                disabled={!isSelected && selectedCompanies.length >= 4}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-mono text-xs transition-[transform,opacity,border-color,background-color] duration-200 active:scale-[0.97] ${
                  isSelected
                    ? "border-2 text-foreground"
                    : "border border-border/30 text-muted-foreground hover:border-border/60 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                }`}
                style={isSelected ? { borderColor: company.color, backgroundColor: `${company.color}15` } : {}}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: isSelected ? company.color : "transparent", border: `1px solid ${isSelected ? company.color : "currentColor"}` }}
                />
                <span style={isSelected ? { color: company.color } : {}}>{company.ticker}</span>
                {isSelected && (
                  <span className="text-fluid-xs opacity-60">({getCompositeScore(company.ticker)})</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Radar chart */}
        <div className="observatory-panel mt-8 p-4 sm:p-6">
          <div role="img" aria-label="Multi-dimensional risk radar chart">
              <ResponsiveContainer width="100%" height={420}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid className="[&_line]:stroke-border" strokeDasharray="3 3" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fontSize: 11, fontFamily: "monospace" }}
                className="[&_text]:fill-muted-foreground"
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 10]}
                tick={{ fontSize: 9 }}
                className="[&_text]:fill-muted-foreground"
                tickCount={6}
              />
              {selectedCompanies.map((ticker) => {
                const company = companies.find((c) => c.ticker === ticker)!;
                return (
                  <Radar
                    key={ticker}
                    name={`${company.ticker} (${getCompositeScore(ticker)})`}
                    dataKey={ticker}
                    stroke={company.color}
                    fill={company.color}
                    fillOpacity={0.12}
                    strokeWidth={2}
                    dot={{ r: 3, fill: company.color }}
                  />
                );
              })}
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontFamily: "monospace",
                  fontSize: "11px",
                  color: "var(--foreground)",
                }}
                labelStyle={{ color: "var(--foreground)" }}
              />
              <Legend
                wrapperStyle={{ fontFamily: "monospace", fontSize: "11px" }}
              />
            </RadarChart>
          </ResponsiveContainer>
              </div>
        </div>

        {/* Risk dimension explanations */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-3">
          {riskDimensions.map((dim) => (
            <div key={dim.key} className="rounded-[var(--radius-sm)] border border-border/50 bg-[var(--recessed)] p-3">
              <h5 className="font-mono text-fluid-xs font-bold uppercase tracking-wider text-foreground/70 mb-1">{dim.label}</h5>
              <p className="text-fluid-xs text-muted-foreground leading-relaxed">{dim.description}</p>
            </div>
          ))}
        </div>

        {/* Composite score ranking */}
        <div className="observatory-panel mt-6 border-destructive/30 bg-[linear-gradient(110deg,rgb(74_24_25_/_0.34),var(--panel)_55%)] p-5">
          <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Composite Risk Ranking (Higher = Riskier)</h4>
          <div className="space-y-2">
            {[...companies]
              .sort((a, b) => getCompositeScore(b.ticker) - getCompositeScore(a.ticker))
              .map((company, i) => {
                const score = getCompositeScore(company.ticker);
                const width = (score / 10) * 100;
                return (
                  <div key={company.ticker} className="flex items-center gap-3">
                    <span className="font-mono text-fluid-xs text-muted-foreground w-4">{i + 1}.</span>
                    <span className="font-mono text-xs font-bold w-12" style={{ color: company.color }}>{company.ticker}</span>
                    <div className="flex-1 h-5 rounded bg-background/30 overflow-hidden">
                      <div
                        className="h-full rounded transition-[transform,opacity,width,left] duration-500"
                        style={{ width: `${width}%`, backgroundColor: `${company.color}40` }}
                      />
                    </div>
                    <span className="font-mono text-xs font-bold text-foreground/70 w-8">{score}</span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </section>
  );
}
