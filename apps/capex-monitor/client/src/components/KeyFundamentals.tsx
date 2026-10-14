import React, { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type MetricKey = "revenue" | "operating_income" | "operating_margin" | "net_income" | "eps_growth" | "cfo" | "capex" | "fcf";
type YearKey = "2022" | "2023" | "2024" | "2025" | "2026E" | "2027E";
type CategoryFilter = "all" | "hyperscaler" | "semiconductor" | "neocloud";

interface YearData {
  type: "actual" | "estimate";
  revenue: number | null;
  operating_income: number | null;
  operating_margin: number | null;
  net_income: number | null;
  eps_growth: number | null;
  cfo: number | null;
  capex: number | null;
  fcf: number | null;
  note?: string;
}

interface CompanyData {
  ticker: string;
  name: string;
  category: "hyperscaler" | "semiconductor" | "neocloud";
  years: Partial<Record<YearKey, YearData>>;
}

// ─── Data (sourced from Yahoo Finance / SEC filings, as of July 12, 2026) ────
const YEARS: YearKey[] = ["2022", "2023", "2024", "2025", "2026E", "2027E"];

const fundamentalsData: CompanyData[] = [
  {
    ticker: "MSFT", name: "Microsoft", category: "hyperscaler",
    years: {
      "2022": { type: "actual", revenue: 198.3, operating_income: 83.4, operating_margin: 42.1, net_income: 72.7, eps_growth: null, cfo: 89.0, capex: 23.9, fcf: 65.1 },
      "2023": { type: "actual", revenue: 211.9, operating_income: 88.5, operating_margin: 41.8, net_income: 72.4, eps_growth: 0.3, cfo: 87.6, capex: 28.1, fcf: 59.5 },
      "2024": { type: "actual", revenue: 245.1, operating_income: 109.4, operating_margin: 44.6, net_income: 88.1, eps_growth: 21.9, cfo: 118.5, capex: 44.5, fcf: 74.1 },
      "2025": { type: "actual", revenue: 281.7, operating_income: 128.5, operating_margin: 45.6, net_income: 101.8, eps_growth: 15.6, cfo: 136.2, capex: 64.6, fcf: 71.6 },
      "2026E": { type: "estimate", revenue: 329.5, operating_income: 150.3, operating_margin: 45.6, net_income: 125.1, eps_growth: 23.3, cfo: 159.4, capex: 78.5, fcf: 80.9 },
      "2027E": { type: "estimate", revenue: 384.5, operating_income: 175.3, operating_margin: 45.6, net_income: 143.9, eps_growth: 15.1, cfo: 186.0, capex: 94.2, fcf: 91.8 },
    }
  },
  {
    ticker: "AMZN", name: "Amazon", category: "hyperscaler",
    years: {
      "2022": { type: "actual", revenue: 514.0, operating_income: 12.2, operating_margin: 2.4, net_income: -2.7, eps_growth: null, cfo: 46.8, capex: 63.6, fcf: -16.9 },
      "2023": { type: "actual", revenue: 574.8, operating_income: 36.9, operating_margin: 6.4, net_income: 30.4, eps_growth: 1174.1, cfo: 84.9, capex: 52.7, fcf: 32.2 },
      "2024": { type: "actual", revenue: 638.0, operating_income: 68.6, operating_margin: 10.8, net_income: 59.2, eps_growth: 90.7, cfo: 115.9, capex: 83.0, fcf: 32.9 },
      "2025": { type: "actual", revenue: 716.9, operating_income: 80.0, operating_margin: 11.2, net_income: 77.7, eps_growth: 29.7, cfo: 139.5, capex: 131.8, fcf: 7.7 },
      "2026E": { type: "estimate", revenue: 823.2, operating_income: 92.2, operating_margin: 11.2, net_income: 93.9, eps_growth: 21.3, cfo: 160.2, capex: 155.3, fcf: 4.9 },
      "2027E": { type: "estimate", revenue: 930.6, operating_income: 104.2, operating_margin: 11.2, net_income: 107.2, eps_growth: 13.7, cfo: 181.1, capex: 179.6, fcf: 1.5 },
    }
  },
  {
    ticker: "GOOGL", name: "Alphabet", category: "hyperscaler",
    years: {
      "2022": { type: "actual", revenue: 282.8, operating_income: 74.8, operating_margin: 26.5, net_income: 60.0, eps_growth: null, cfo: 91.5, capex: 31.5, fcf: 60.0 },
      "2023": { type: "actual", revenue: 307.4, operating_income: 84.3, operating_margin: 27.4, net_income: 73.8, eps_growth: 27.2, cfo: 101.7, capex: 32.3, fcf: 69.5 },
      "2024": { type: "actual", revenue: 350.0, operating_income: 112.4, operating_margin: 32.1, net_income: 100.1, eps_growth: 38.6, cfo: 125.3, capex: 52.5, fcf: 72.8 },
      "2025": { type: "actual", revenue: 402.8, operating_income: 129.0, operating_margin: 32.0, net_income: 132.2, eps_growth: 34.5, cfo: 164.7, capex: 91.4, fcf: 73.3 },
      "2026E": { type: "estimate", revenue: 488.5, operating_income: 156.5, operating_margin: 32.0, net_income: 173.9, eps_growth: 31.6, cfo: 199.7, capex: 114.8, fcf: 85.0 },
      "2027E": { type: "estimate", revenue: 583.6, operating_income: 187.0, operating_margin: 32.0, net_income: 178.0, eps_growth: 2.4, cfo: 238.6, capex: 141.6, fcf: 97.0 },
    }
  },
  {
    ticker: "META", name: "Meta", category: "hyperscaler",
    years: {
      "2022": { type: "actual", revenue: 116.6, operating_income: 28.9, operating_margin: 24.8, net_income: 23.2, eps_growth: null, cfo: 50.5, capex: 31.2, fcf: 19.3 },
      "2023": { type: "actual", revenue: 134.9, operating_income: 46.8, operating_margin: 34.7, net_income: 39.1, eps_growth: 73.1, cfo: 71.1, capex: 27.0, fcf: 44.1 },
      "2024": { type: "actual", revenue: 164.5, operating_income: 69.4, operating_margin: 42.2, net_income: 62.4, eps_growth: 60.5, cfo: 91.3, capex: 37.3, fcf: 54.1 },
      "2025": { type: "actual", revenue: 201.0, operating_income: 83.3, operating_margin: 41.4, net_income: 60.5, eps_growth: -1.6, cfo: 115.8, capex: 69.7, fcf: 46.1 },
      "2026E": { type: "estimate", revenue: 252.9, operating_income: 104.8, operating_margin: 41.4, net_income: 84.7, eps_growth: 7.6, cfo: 145.7, capex: 91.3, fcf: 54.4 },
      "2027E": { type: "estimate", revenue: 302.3, operating_income: 125.3, operating_margin: 41.4, net_income: 90.1, eps_growth: 13.7, cfo: 174.2, capex: 112.7, fcf: 61.5 },
    }
  },
  {
    ticker: "ORCL", name: "Oracle", category: "hyperscaler",
    years: {
      "2022": { type: "actual", revenue: null, operating_income: null, operating_margin: null, net_income: null, eps_growth: null, cfo: null, capex: null, fcf: null, note: "FY mismatch" },
      "2023": { type: "actual", revenue: 50.0, operating_income: 13.8, operating_margin: 27.6, net_income: 8.5, eps_growth: null, cfo: 17.2, capex: 8.7, fcf: 8.5 },
      "2024": { type: "actual", revenue: 53.0, operating_income: 16.1, operating_margin: 30.3, net_income: 10.5, eps_growth: 20.8, cfo: 18.7, capex: 6.9, fcf: 11.8 },
      "2025": { type: "actual", revenue: 57.4, operating_income: 18.1, operating_margin: 31.5, net_income: 12.4, eps_growth: 17.0, cfo: 20.8, capex: 21.2, fcf: -0.4 },
      "2026E": { type: "estimate", revenue: 89.2, operating_income: 28.1, operating_margin: 31.5, net_income: 23.1, eps_growth: 5.4, cfo: 32.4, capex: 35.3, fcf: -3.0 },
      "2027E": { type: "estimate", revenue: 130.2, operating_income: 40.9, operating_margin: 31.5, net_income: 31.3, eps_growth: 35.8, cfo: 47.2, capex: 54.8, fcf: -7.6 },
    }
  },
  {
    ticker: "NVDA", name: "NVIDIA", category: "semiconductor",
    years: {
      "2022": { type: "actual", revenue: null, operating_income: null, operating_margin: null, net_income: null, eps_growth: null, cfo: null, capex: null, fcf: null, note: "FY ends Jan" },
      "2023": { type: "actual", revenue: 27.0, operating_income: 5.6, operating_margin: 20.7, net_income: 4.4, eps_growth: null, cfo: 5.6, capex: 1.8, fcf: 3.8 },
      "2024": { type: "actual", revenue: 60.9, operating_income: 33.0, operating_margin: 54.1, net_income: 29.8, eps_growth: 583.9, cfo: 28.1, capex: 1.1, fcf: 27.0 },
      "2025": { type: "actual", revenue: 130.5, operating_income: 81.5, operating_margin: 62.4, net_income: 72.9, eps_growth: 147.1, cfo: 64.1, capex: 3.2, fcf: 60.9 },
      "2026E": { type: "estimate", revenue: 392.8, operating_income: 245.2, operating_margin: 62.4, net_income: 222.5, eps_growth: 88.2, cfo: 192.9, capex: 11.0, fcf: 181.9 },
      "2027E": { type: "estimate", revenue: 555.5, operating_income: 346.7, operating_margin: 62.4, net_income: 317.1, eps_growth: 42.5, cfo: 272.8, capex: 16.5, fcf: 256.3 },
    }
  },
  {
    ticker: "AMD", name: "AMD", category: "semiconductor",
    years: {
      "2022": { type: "actual", revenue: 23.6, operating_income: 1.3, operating_margin: 5.4, net_income: 1.3, eps_growth: null, cfo: 3.6, capex: 0.5, fcf: 3.1 },
      "2023": { type: "actual", revenue: 22.7, operating_income: 0.4, operating_margin: 1.8, net_income: 0.9, eps_growth: -36.9, cfo: 1.7, capex: 0.5, fcf: 1.1 },
      "2024": { type: "actual", revenue: 25.8, operating_income: 2.1, operating_margin: 8.1, net_income: 1.6, eps_growth: 88.7, cfo: 3.0, capex: 0.6, fcf: 2.4 },
      "2025": { type: "actual", revenue: 34.6, operating_income: 3.7, operating_margin: 10.7, net_income: 4.3, eps_growth: 165.0, cfo: 7.7, capex: 1.0, fcf: 6.7 },
      "2026E": { type: "estimate", revenue: 49.5, operating_income: 5.3, operating_margin: 10.7, net_income: 12.1, eps_growth: 77.6, cfo: 11.0, capex: 1.5, fcf: 9.5 },
      "2027E": { type: "estimate", revenue: 77.1, operating_income: 8.2, operating_margin: 10.7, net_income: 21.7, eps_growth: 79.3, cfo: 17.2, capex: 2.5, fcf: 14.7 },
    }
  },
  {
    ticker: "AVGO", name: "Broadcom", category: "semiconductor",
    years: {
      "2022": { type: "actual", revenue: 33.2, operating_income: 14.3, operating_margin: 43.0, net_income: 11.5, eps_growth: null, cfo: 16.7, capex: 0.4, fcf: 16.3 },
      "2023": { type: "actual", revenue: 35.8, operating_income: 16.5, operating_margin: 45.9, net_income: 14.1, eps_growth: 24.3, cfo: 18.1, capex: 0.5, fcf: 17.6 },
      "2024": { type: "actual", revenue: 51.6, operating_income: 15.0, operating_margin: 29.1, net_income: 5.9, eps_growth: -62.7, cfo: 20.0, capex: 0.5, fcf: 19.4 },
      "2025": { type: "actual", revenue: 63.9, operating_income: 26.1, operating_margin: 40.8, net_income: 23.1, eps_growth: 287.8, cfo: 27.5, capex: 0.6, fcf: 26.9 },
      "2026E": { type: "estimate", revenue: 106.0, operating_income: 43.3, operating_margin: 40.8, net_income: 56.4, eps_growth: 70.4, cfo: 45.7, capex: 1.1, fcf: 44.6 },
      "2027E": { type: "estimate", revenue: 172.2, operating_income: 70.3, operating_margin: 40.8, net_income: 94.0, eps_growth: 66.9, cfo: 74.2, capex: 2.0, fcf: 72.3 },
    }
  },
  {
    ticker: "CRWV", name: "CoreWeave", category: "neocloud",
    years: {
      "2022": { type: "actual", revenue: null, operating_income: null, operating_margin: null, net_income: null, eps_growth: null, cfo: null, capex: null, fcf: null, note: "Pre-IPO" },
      "2023": { type: "actual", revenue: null, operating_income: null, operating_margin: null, net_income: null, eps_growth: null, cfo: null, capex: null, fcf: null, note: "Pre-IPO" },
      "2024": { type: "actual", revenue: 1.9, operating_income: 0.3, operating_margin: 16.9, net_income: -0.9, eps_growth: null, cfo: 2.7, capex: 8.7, fcf: -6.0 },
      "2025": { type: "actual", revenue: 5.1, operating_income: -0.05, operating_margin: -0.9, net_income: -1.2, eps_growth: -39.2, cfo: 3.1, capex: 10.3, fcf: -7.3 },
      "2026E": { type: "estimate", revenue: 12.7, operating_income: null, operating_margin: null, net_income: -1.9, eps_growth: -68.9, cfo: 7.6, capex: 28.5, fcf: -20.9 },
      "2027E": { type: "estimate", revenue: 25.1, operating_income: null, operating_margin: null, net_income: -1.4, eps_growth: 27.5, cfo: 14.9, capex: 61.9, fcf: -47.0 },
    }
  },
  {
    ticker: "NBIS", name: "Nebius", category: "neocloud",
    years: {
      "2022": { type: "actual", revenue: null, operating_income: null, operating_margin: null, net_income: null, eps_growth: null, cfo: null, capex: null, fcf: null, note: "Pre-Listing" },
      "2023": { type: "actual", revenue: null, operating_income: null, operating_margin: null, net_income: null, eps_growth: null, cfo: null, capex: null, fcf: null, note: "Pre-Listing" },
      "2024": { type: "actual", revenue: 0.1, operating_income: -0.4, operating_margin: -436.7, net_income: -0.6, eps_growth: null, cfo: 0.2, capex: 0.8, fcf: -0.6 },
      "2025": { type: "actual", revenue: 0.5, operating_income: -0.6, operating_margin: -115.5, net_income: 0.1, eps_growth: 114.7, cfo: 0.4, capex: 4.1, fcf: -3.7 },
      "2026E": { type: "estimate", revenue: 3.4, operating_income: null, operating_margin: null, net_income: -0.4, eps_growth: null, cfo: 2.5, capex: 30.5, fcf: -28.0 },
      "2027E": { type: "estimate", revenue: 11.4, operating_income: null, operating_margin: null, net_income: -1.0, eps_growth: null, cfo: 8.3, capex: 116.7, fcf: -108.4 },
    }
  },
];

const METRICS: { key: MetricKey; label: string; unit: string; colorCoded?: boolean }[] = [
  { key: "revenue", label: "Revenue", unit: "$B" },
  { key: "operating_income", label: "Operating Income", unit: "$B" },
  { key: "operating_margin", label: "Operating Margin", unit: "%", colorCoded: true },
  { key: "net_income", label: "Net Income", unit: "$B" },
  { key: "eps_growth", label: "EPS Growth", unit: "%", colorCoded: true },
  { key: "cfo", label: "Cash from Ops", unit: "$B" },
  { key: "capex", label: "Capex", unit: "$B" },
  { key: "fcf", label: "Free Cash Flow", unit: "$B" },
];

const CATEGORY_FILTERS: { label: string; value: CategoryFilter; color: string }[] = [
  { label: "All Companies", value: "all", color: "oklch(0.6 0 0)" },
  { label: "Hyperscalers", value: "hyperscaler", color: "oklch(0.7 0.15 155)" },
  { label: "Semiconductors", value: "semiconductor", color: "oklch(0.65 0.12 200)" },
  { label: "Neoclouds", value: "neocloud", color: "oklch(0.7 0.18 280)" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatValue(value: number | null, unit: string, note?: string): string {
  if (note === "Pre-IPO" || note === "Pre-Listing" || note === "FY mismatch" || note === "FY ends Jan") {
    return "N/A";
  }
  if (value === null || value === undefined) return "-";
  if (unit === "%") return `${value.toFixed(1)}%`;
  if (unit === "$B") {
    if (Math.abs(value) < 0.05) return "$0.0B";
    return `$${value.toFixed(1)}B`;
  }
  return String(value);
}

function getNote(yearData: YearData | undefined): string | undefined {
  return yearData?.note;
}

// ─── Sparkline helper ────────────────────────────────────────────────────────
function CapexRevenueSparkline({ company }: { company: CompanyData }) {
  // Compute capex/revenue ratio for each year
  const ratios: number[] = [];
  const labels: string[] = [];
  for (const year of YEARS) {
    const yd = company.years[year];
    if (yd && yd.revenue && yd.capex && !yd.note) {
      ratios.push(Math.round((yd.capex / yd.revenue) * 1000) / 10);
      labels.push(year);
    }
  }
  if (ratios.length < 2) return null;

  const width = 120;
  const height = 28;
  const padding = 3;
  const min = Math.min(...ratios);
  const max = Math.max(...ratios);
  const range = max - min || 1;

  const points = ratios.map((value, i) => {
    const x = padding + (i / (ratios.length - 1)) * (width - padding * 2);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return { x, y, value, label: labels[i] };
  });

  const pathD = `M ${points.map(p => `${p.x},${p.y}`).join(" L ")}`;
  const areaD = `${pathD} L ${points[points.length - 1].x},${height - padding} L ${points[0].x},${height - padding} Z`;

  // Color: red if trending up (spending more), green if trending down
  const trend = ratios[ratios.length - 1] - ratios[0];
  const color = trend > 5 ? "#f87171" : trend < -3 ? "#34d399" : "#fbbf24";

  return (
    <div className="flex items-center gap-2">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
        <path d={areaD} fill={color} opacity={0.12} />
        <path d={pathD} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={2.5} fill={color} />
      </svg>
      <span className="text-[10px] font-mono whitespace-nowrap" style={{ color }}>
        {ratios[ratios.length - 1].toFixed(1)}%
      </span>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────
export function KeyFundamentals() {
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(
    new Set(fundamentalsData.map(c => c.ticker))
  );

  const filteredCompanies = useMemo(() => {
    if (filter === "all") return fundamentalsData;
    return fundamentalsData.filter(c => c.category === filter);
  }, [filter]);

  // Calculate medians for color-coding
  const medians = useMemo(() => {
    const result: Partial<Record<YearKey, { operating_margin: number; eps_growth: number }>> = {};
    for (const year of YEARS) {
      const margins: number[] = [];
      const epsGrowths: number[] = [];
      for (const company of filteredCompanies) {
        const yd = company.years[year];
        if (yd?.operating_margin !== null && yd?.operating_margin !== undefined && !yd?.note) {
          margins.push(yd.operating_margin);
        }
        if (yd?.eps_growth !== null && yd?.eps_growth !== undefined && !yd?.note) {
          epsGrowths.push(yd.eps_growth);
        }
      }
      margins.sort((a, b) => a - b);
      epsGrowths.sort((a, b) => a - b);
      result[year] = {
        operating_margin: margins.length > 0 ? margins[Math.floor(margins.length / 2)] : 0,
        eps_growth: epsGrowths.length > 0 ? epsGrowths[Math.floor(epsGrowths.length / 2)] : 0,
      };
    }
    return result;
  }, [filteredCompanies]);

  function getCellColor(metric: MetricKey, value: number | null, year: YearKey, note?: string): string {
    if (note || value === null || value === undefined) return "";
    if (metric !== "operating_margin" && metric !== "eps_growth") return "";
    
    const med = medians[year];
    if (!med) return "";
    
    const medianVal = metric === "operating_margin" ? med.operating_margin : med.eps_growth;
    const diff = value - medianVal;
    const threshold = metric === "operating_margin" ? 3 : 10; // 3pp for margin, 10pp for EPS growth
    
    if (diff > threshold) return "text-emerald-400 dark:text-emerald-400 font-semibold";
    if (diff < -threshold) return "text-red-400 dark:text-red-400 font-semibold";
    return "";
  }

  function toggleCompany(ticker: string) {
    setExpandedCompanies(prev => {
      const next = new Set(prev);
      if (next.has(ticker)) next.delete(ticker);
      else next.add(ticker);
      return next;
    });
  }

  return (
    <section id="fundamentals" className="py-24 relative">
      <div className="container max-w-7xl">

        <div className="mb-6">
          <h2 className="text-fluid-xl font-bold mb-2">Financial Fundamentals Comparison</h2>
          <p className="text-fluid-sm text-muted-foreground">
            Historical actuals (2022–2025) and analyst consensus estimates (2026E–2027E) across hyperscalers, semiconductors, and neoclouds.
          </p>
        </div>

        {/* Category filter pills */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-none pb-2">
          {CATEGORY_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-fluid-xs font-medium transition-[transform,opacity,border-color,background-color] duration-200 border ${
                filter === f.value
                  ? "bg-primary/20 border-primary/50 text-primary"
                  : "bg-card/50 border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Table container with horizontal scroll */}
        <div className="overflow-x-auto scrollbar-none rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm">
          <table className="w-full min-w-[900px] border-collapse">
            {/* Sticky header */}
            <thead>
              <tr className="border-b border-border/50">
                <th className="sticky left-0 z-20 bg-card/95 backdrop-blur-sm px-4 py-3 text-left text-fluid-xs font-semibold text-muted-foreground uppercase tracking-wider w-[200px] min-w-[200px]">
                  Company / Metric
                </th>
                {YEARS.map(year => (
                  <th
                    key={year}
                    className={`px-3 py-3 text-right text-fluid-xs font-semibold uppercase tracking-wider min-w-[100px] ${
                      year.includes("E")
                        ? "text-primary/80 bg-primary/5"
                        : "text-muted-foreground"
                    }`}
                  >
                    {year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((company, companyIdx) => {
                const isExpanded = expandedCompanies.has(company.ticker);
                const categoryColor = company.category === "hyperscaler"
                  ? "border-l-emerald-500/60"
                  : company.category === "semiconductor"
                  ? "border-l-blue-500/60"
                  : "border-l-purple-500/60";

                return (
                  <React.Fragment key={company.ticker}>
                    {/* Company header row - ticker only, no data */}
                    <tr
                      className={`cursor-pointer hover:bg-accent/30 transition-colors border-l-3 ${categoryColor}`}
                      onClick={() => toggleCompany(company.ticker)}
                    >
                      <td className="sticky left-0 z-10 bg-card/95 backdrop-blur-sm px-4 py-2.5 border-l-3 border-l-inherit" colSpan={YEARS.length + 1}>
                        <div className="flex items-center gap-2 flex-1">
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                          )}
                          <span className="font-bold text-fluid-sm text-foreground">{company.ticker}</span>
                          <span className="text-fluid-xs text-muted-foreground hidden sm:inline">{company.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            company.category === "hyperscaler" ? "bg-emerald-500/15 text-emerald-400" :
                            company.category === "semiconductor" ? "bg-blue-500/15 text-blue-400" :
                            "bg-purple-500/15 text-purple-400"
                          }`}>
                            {company.category === "hyperscaler" ? "Cloud" : company.category === "semiconductor" ? "Semi" : "Neo"}
                          </span>
                          <div className="ml-auto hidden md:flex items-center gap-1">
                            <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider">Capex/Rev</span>
                            <CapexRevenueSparkline company={company} />
                          </div>
                        </div>
                      </td>
                    </tr>

                    {/* All metric rows including Revenue (expanded) */}
                    {isExpanded && METRICS.map((metric) => (
                      <tr
                        key={`${company.ticker}-${metric.key}`}
                        className={`border-l-3 ${categoryColor} hover:bg-accent/10 transition-colors ${metric.key === "revenue" ? "bg-accent/5" : ""}`}
                      >
                        <td className="sticky left-0 z-10 bg-card/95 backdrop-blur-sm px-4 py-1.5 pl-10 border-l-3 border-l-inherit">
                          <span className={`text-fluid-xs ${metric.key === "revenue" ? "text-foreground font-semibold" : "text-muted-foreground"}`}>{metric.label}</span>
                        </td>
                        {YEARS.map(year => {
                          const yd = company.years[year];
                          const note = getNote(yd);
                          const val = yd?.[metric.key] as number | null;
                          const colorClass = metric.colorCoded ? getCellColor(metric.key, val, year, note) : "";
                          
                          return (
                            <td
                              key={year}
                              className={`px-3 py-1.5 text-right text-fluid-xs ${
                                year.includes("E") ? "bg-primary/5" : ""
                              } ${note ? "text-muted-foreground/50" : colorClass || "text-foreground/80"}`}
                            >
                              {note ? (
                                <span className="text-muted-foreground/40">-</span>
                              ) : (
                                formatValue(val, metric.unit)
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footnote */}
        <div className="mt-4 flex items-start gap-2 text-[11px] text-muted-foreground/70">
          <span className="shrink-0 mt-0.5">*</span>
          <p>
            Actuals sourced from SEC filings via Yahoo Finance. Revenue and EPS estimates (E) represent Wall Street analyst consensus as of July 12, 2026; other forward metrics are derived from consensus revenue/EPS plus trailing-margin extrapolation.
            Operating margin and EPS growth are color-coded: <span className="text-emerald-400 font-medium">green</span> = above median, <span className="text-red-400 font-medium">red</span> = below median among displayed companies.
            CRWV data begins 2024 (IPO Mar 2025, S-1 filed with 2024 actuals). NBIS data begins 2024 (Yandex spinoff, listed late 2024).
            NVDA and ORCL fiscal years end Jan and May respectively; calendar-year mapping applied.
          </p>
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-muted-foreground/60">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/30 border border-emerald-500/50" />
            <span>Hyperscaler</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-blue-500/30 border border-blue-500/50" />
            <span>Semiconductor</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-purple-500/30 border border-purple-500/50" />
            <span>Neocloud</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-primary/10 border border-primary/30 rounded-sm" />
            <span>Estimate column</span>
          </div>
        </div>
      </div>
    </section>
  );
}
