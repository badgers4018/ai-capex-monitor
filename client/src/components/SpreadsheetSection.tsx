import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useMemo } from "react";
import { Search, X, ArrowUpDown, ChevronUp, ChevronDown, ExternalLink } from "lucide-react";
import { categoryToneValue } from "@/lib/observatory";

const spendingData = [
  { category: "Artificial Intelligence", sub: "Total AI Spending 2026", current: "$1.76T (2025)", projection: "$2.59T (2026)", growth: "47% YoY", growthNum: 47, color: "oklch(0.7 0.15 240)", source: "Gartner May 2026", notes: "Jevons Paradox: cost/token fell 280x yet total bills climb. Cheaper AI = more use cases = more spend." },
  { category: "", sub: "AI Agent Software", current: "$206.5B (2026)", projection: "$376.3B (2027)", growth: "82% YoY", growthNum: 82, color: "oklch(0.7 0.15 240)", source: "Gartner May 2026", notes: "Only 17% deployed agents; 60% plan to within 2 years. 40%+ may cancel by 2027 (ROI)." },
  { category: "", sub: "AI Infrastructure", current: "$487B (2026)", projection: "Growing", growth: "49% YoY", growthNum: 49, color: "oklch(0.7 0.15 240)", source: "IDC Jun 2026", notes: "45% of all AI spending goes to infrastructure. Inference now dominates over training." },
  { category: "", sub: "Enterprise AI ROI Gap", current: "18% token→product", projection: "25% postponing to 2027", growth: "N/A", growthNum: null, color: "oklch(0.7 0.15 240)", source: "WSJ/Forrester Jun 2026", notes: "Only 18% of AI coding tokens translate to shipped products. Corporate America rationing AI." },
  { category: "", sub: "Microsoft AI ARR", current: "$37B annualized", projection: "$190B capex", growth: "5:1 spend:revenue", growthNum: null, color: "oklch(0.7 0.15 240)", source: "Microsoft Q3 FY2026", notes: "Stock down 20% in June on investor concerns. Historic rout over capex sustainability." },
  { category: "Data Center", sub: "Global DC Capex 2026", current: "$640B (2025)", projection: ">$1,000B (2026)", growth: "57%+ YoY", growthNum: 57, color: "oklch(0.75 0.15 70)", source: "Dell'Oro Jun 2026", notes: "Raised above $1T. BUT: 85% of planned capacity can't get power on schedule." },
  { category: "", sub: "Cloud Provider Capex", current: "$410B (2025)", projection: "$670B (2026)", growth: "63% YoY", growthNum: 63, color: "oklch(0.75 0.15 70)", source: "Goldman Sachs Jun 29, 2026", notes: "GS raised S&P target to 8,000. AMZN $200B, MSFT $190B, GOOGL $180-190B, META $135B. Total AI spend ~$800B." },
  { category: "", sub: "Cumulative 2026-2031", current: "$800B (2026)", projection: "$7.6T baseline", growth: "~14% CAGR", growthNum: 14, color: "oklch(0.75 0.15 70)", source: "Goldman Sachs Jun 29, 2026", notes: "McKinsey: $7T DC investment needed by 2030. IDC: Semi revenue +53% to $1.29T. ~$2T AI assets on balance sheets." },
  { category: "", sub: "NVIDIA DC Revenue (Q1 FY27)", current: "$81.6B/quarter", projection: "$91B Q2 guidance", growth: "92% YoY", growthNum: 92, color: "oklch(0.75 0.15 70)", source: "NVIDIA May 2026", notes: "Vera Rubin shipping Q3 2026. Supply commitments $119B. 350+ factory partners." },
  { category: "", sub: "Neocloud Market Share", current: "~5% (2026)", projection: "20% of $267B (2030)", growth: "~40% CAGR", growthNum: 40, color: "oklch(0.75 0.15 70)", source: "Gartner Jun 2026", notes: "CoreWeave, Lambda, xAI capturing share from hyperscalers. CoreWeave: $740M Q1 loss." },
  { category: "Power & Grid", sub: "DC Electricity 2026", current: "447 TWh (2025)", projection: "565 TWh (2026)", growth: "26% YoY", growthNum: 26, color: "oklch(0.65 0.2 25)", source: "Gartner Jun 10, 2026", notes: "AI servers: 175 TWh. Surpasses conventional servers in 2027. THE binding constraint." },
  { category: "", sub: "DC Power Demand", current: "104 GW (2025)", projection: "132 GW (2026)", growth: "27% YoY", growthNum: 27, color: "oklch(0.65 0.2 25)", source: "Gartner Jun 2026", notes: "290 GW by 2030. US needs 69 GW but only 10 GW achievable = 85% shortfall." },
  { category: "", sub: "DC Electricity 2030", current: "565 TWh (2026)", projection: ">1,200 TWh (2030)", growth: "~21% CAGR", growthNum: 21, color: "oklch(0.65 0.2 25)", source: "Gartner/IEA Jun 2026", notes: "Would rank 6th globally as a 'country.' Grid supply INSUFFICIENT. SMRs not ready until 2030+." },
  { category: "", sub: "Grid Connection Wait", current: "4+ years", projection: "Worsening", growth: "N/A", growthNum: null, color: "oklch(0.65 0.2 25)", source: "DOE/LinkedIn Jun 2026", notes: "Delays caused by energization, NOT construction. National moratorium proposed Jun 25, 2026." },
  { category: "", sub: "Liquid Cooling Market", current: "$8.2B (2026)", projection: "$33B+ (2030)", growth: "~40% CAGR", growthNum: 40, color: "oklch(0.65 0.2 25)", source: "Dell'Oro 2026", notes: "AI racks 120-150kW need liquid cooling. Vera Rubin NVL72: 600kW/rack by 2027." },
  { category: "Cloud Computing", sub: "Cloud Infra Services Q1 2026", current: "$129B/quarter", projection: "~$550B annualized", growth: "35% YoY", growthNum: 35, color: "oklch(0.7 0.15 155)", source: "Synergy Research Q1 2026", notes: "All hyperscalers beat expectations. Inference demand continuous (24/7) vs training (bursts)." },
  { category: "", sub: "Google Cloud Revenue", current: "$20B/qtr", projection: "Mid-80% growth H2", growth: "63% YoY", growthNum: 63, color: "oklch(0.7 0.15 155)", source: "Alphabet Q1 2026", notes: "Margins >32.9%. Backlog $462B (doubled QoQ). Sold 100-year bonds to fund expansion." },
  { category: "", sub: "Azure Revenue Growth", current: "40% YoY", projection: "Accelerating", growth: "40% YoY", growthNum: 40, color: "oklch(0.7 0.15 155)", source: "Microsoft Apr 2026", notes: "Commercial RPO $627B (+99% YoY). But MSFT stock in historic June rout." },
  { category: "", sub: "AWS Revenue", current: "$37.6B/qtr", projection: "$118B FY guided", growth: "28% YoY", growthNum: 28, color: "oklch(0.7 0.15 155)", source: "Amazon Q1 2026", notes: "Amazon may go cash-flow negative in 2026 for first time in years due to $200B capex." },
  { category: "", sub: "Sovereign Cloud Market", current: "$195B (2026)", projection: "$1,318B (2034)", growth: "27% CAGR", growthNum: 27, color: "oklch(0.7 0.15 155)", source: "Fortune BI May 2026", notes: "Geopolitical duplication: 2-3x infrastructure vs cooperative scenario." },
  { category: "Oracle (OCI)", sub: "Oracle FY2026 Capex", current: "$16B (FY2025)", projection: "$50B (FY2026)", growth: "213% YoY", growthNum: 213, color: "oklch(0.65 0.2 25)", source: "Oracle Jun 10, 2026", notes: "Raised $45-50B in debt+equity to fund buildout. 7x capex level from 2 years ago." },
  { category: "", sub: "OCI Revenue (Q4 FY26)", current: "$5.8B/quarter", projection: "$34B FY cloud", growth: "93% YoY", growthNum: 93, color: "oklch(0.65 0.2 25)", source: "Oracle Q4 FY2026", notes: "Total FY2026 revenue $67.4B (+17%). Cloud revenue $34B (+39%). OCI fastest growing." },
  { category: "", sub: "Oracle Backlog (RPO)", current: "$553B contracted", projection: "Growing", growth: "438% YoY", growthNum: 438, color: "oklch(0.65 0.2 25)", source: "Oracle Q2 FY2026", notes: "Massive contracted backlog. 100+ DC locations globally. Multi-cloud partnerships." },
  { category: "SpaceX / xAI (SPCX)", sub: "SpaceX IPO & Debt", current: "$75B IPO + $25B bonds", projection: "$2.0T mkt cap", growth: "IPO Jun 12", growthNum: null, color: "oklch(0.7 0.15 45)", source: "CNBC/Reuters Jun 2026", notes: "IPO at $135, opened $150, current ~$152.80. $25B debt deal Jun 23 ($89B demand). NASDAQ: SPCX." },
  { category: "", sub: "SpaceX Capex (2025)", current: "$20.7B", projection: "Growing", growth: "~50% YoY", growthNum: 50, color: "oklch(0.7 0.15 45)", source: "Morningstar/Klover 2026", notes: "Now public. Record $75B IPO. Orbital compute plans for 2030+. $25B investment-grade bonds." },
  { category: "", sub: "Starlink Revenue", current: "$7.5B (2025)", projection: "$12B+ (2026)", growth: "60%+ YoY", growthNum: 60, color: "oklch(0.7 0.15 45)", source: "SpaceX Financials 2026", notes: "5M+ subscribers. Enables remote DC connectivity. Laser mesh for edge compute." },
  { category: "", sub: "xAI Colossus Cluster", current: "200K H100 GPUs", projection: "Expanding", growth: "N/A", growthNum: null, color: "oklch(0.7 0.15 45)", source: "xAI 2026", notes: "Largest single GPU cluster. SpaceX + xAI synergy: orbital compute + ground inference." },
  { category: "End-User / IT", sub: "Total IT Spending 2026", current: "$5.56T (2025)", projection: "$6.31T (2026)", growth: "13.5% YoY", growthNum: 13.5, color: "oklch(0.7 0.15 300)", source: "Gartner May 2026", notes: "Revised upward from $6.15T. Server spending +36.9% (fastest IT category)." },
  { category: "", sub: "Enterprise AI Budget Backlash", current: "$1T+ cumulative", projection: "Savings 'severely lagging'", growth: "N/A", growthNum: null, color: "oklch(0.7 0.15 300)", source: "Forrester/WSJ Jun 2026", notes: "One enterprise spent $500M on AI in a single month. 25% postponing spend to 2027." },
  { category: "", sub: "EU AI Act Compliance", current: "€320K-600K per system", projection: "Fines up to 3% revenue", growth: "N/A", growthNum: null, color: "oklch(0.7 0.15 300)", source: "EU AI Act 2026", notes: "Fixed cost: 'rounding error for OpenAI, death sentence for 5-person team.' Consolidation." },
  { category: "Semiconductors", sub: "Global Semiconductor Revenue", current: "$1.0T (2025)", projection: "$1.3-1.5T (2026)", growth: "30-50% YoY", growthNum: 40, color: "oklch(0.65 0.12 200)", source: "Omdia/SIA Jun 2026", notes: "March 2026 monthly: $99.5B (+79% YoY). Memory +80% QoQ from HBM demand." },
  { category: "Neoclouds", sub: "CoreWeave (CRWV) Q1 2026", current: "$2.08B revenue", projection: "$12.67B FY2026", growth: "112% YoY", growthNum: 112, color: "oklch(0.7 0.18 280)", source: "CoreWeave Q1 2026 Earnings", notes: "$99.4B backlog. $740M net loss. $31-35B capex guided. 1.7 GW power target. OpenAI's primary infra partner." },
  { category: "", sub: "CoreWeave Debt Load", current: "$3.25B (Jun 2026)", projection: "Growing", growth: "N/A", growthNum: null, color: "oklch(0.7 0.18 280)", source: "CoreWeave Jun 11, 2026", notes: "$1.25B + €2B senior notes at 9.625%. Heavy leverage model. -$740M Q1 loss. Debt-to-equity ~12x." },
  { category: "", sub: "Nebius (NBIS) Q1 2026", current: "$399M revenue", projection: "$5-7B ARR target", growth: "684% YoY", growthNum: 684, color: "oklch(0.7 0.15 170)", source: "Nebius Q1 2026 Earnings", notes: "Yandex spinoff. 98% AI cloud revenue. $17.4B MSFT/Meta deal. £1.7B UK investment. Profitable ($584M net)." },
  { category: "", sub: "Neocloud Market Total", current: ">$25B (2025)", projection: "20% of $267B (2030)", growth: "~40% CAGR", growthNum: 40, color: "oklch(0.7 0.18 280)", source: "CRN/Gartner Jun 2026", notes: "CoreWeave, Nebius, Lambda, Crusoe. Circular financing with NVIDIA. Added to Nasdaq-100 Jun 2026." },
  { category: "", sub: "ABF Substrate Bottleneck", current: "Shortage (Ajinomoto)", projection: "42% demand gap (2028)", growth: "N/A", growthNum: null, color: "oklch(0.65 0.12 200)", source: "Industry Jun 2026", notes: "HIDDEN bottleneck below CoWoS. 18-24 month factory lead times. Sole-supplier risk." },
  { category: "", sub: "HBM Memory", current: "3 suppliers qualified", projection: "Fully booked to 2027", growth: "~100% YoY", growthNum: 100, color: "oklch(0.65 0.12 200)", source: "Samsung/SK Hynix/Micron", notes: "All 3 qualified for Vera Rubin (HBM4). Limits GPU capability. Price inflation ongoing." },
  { category: "Edge Computing", sub: "Edge Spending 2028", current: "Growing", projection: "$380B (2028)", growth: "~20% CAGR", growthNum: 20, color: "oklch(0.6 0.12 180)", source: "IDC", notes: "Inference shifting to edge reduces centralized DC load but increases total compute." },
  { category: "VC/Startups", sub: "AI Startup Funding 2025", current: "$270B", projection: "Growing", growth: "~100% YoY", growthNum: 100, color: "oklch(0.65 0.12 320)", source: "OECD/PitchBook 2026", notes: "Circular financing: chipmakers fund startups that buy their chips. 65% of US VC → AI." },
  { category: "Geopolitical", sub: "Gulf AI Infrastructure", current: "$40B+ (Saudi PIF)", projection: "Hundreds of billions", growth: "N/A", growthNum: null, color: "oklch(0.6 0.15 350)", source: "IISS/Brookings Jun 2026", notes: "UAE, Saudi pursuing 'technological sovereignty.' Drives global infrastructure duplication." },
  { category: "", sub: "US-China AI Decoupling", current: "Export controls active", projection: "EU joining US pact", growth: "N/A", growthNum: null, color: "oklch(0.6 0.15 350)", source: "FT/Reuters Jun 2026", notes: "Taiwan threatening chip flow restrictions. Friendshoring creating parallel supply chains." },
];

// Enrich rows with resolved category for filtering/display
const enriched = (() => {
  let lastCat = "";
  let lastColor = "";
  return spendingData.map(row => {
    if (row.category) { lastCat = row.category; lastColor = row.color; }
    return { ...row, resolvedCategory: lastCat, resolvedColor: lastColor };
  });
})();

type FilterCategory = "all" | "ai" | "dc" | "power" | "cloud" | "oracle" | "spacex" | "neocloud" | "eu" | "semi" | "edge" | "vc" | "geo";
type SortKey = "default" | "growth_desc" | "growth_asc" | "metric_az" | "metric_za" | "category_az";

const filters: { label: string; value: FilterCategory; color?: string }[] = [
  { label: "All", value: "all" },
  { label: "AI", value: "ai", color: "oklch(0.7 0.15 240)" },
  { label: "Data Center", value: "dc", color: "oklch(0.75 0.15 70)" },
  { label: "Power", value: "power", color: "oklch(0.65 0.2 25)" },
  { label: "Cloud", value: "cloud", color: "oklch(0.7 0.15 155)" },
  { label: "Neoclouds", value: "neocloud", color: "oklch(0.7 0.18 280)" },
  { label: "Oracle", value: "oracle", color: "oklch(0.65 0.2 25)" },
  { label: "SpaceX", value: "spacex", color: "oklch(0.7 0.15 45)" },
  { label: "End-User", value: "eu", color: "oklch(0.7 0.15 300)" },
  { label: "Semis", value: "semi", color: "oklch(0.65 0.12 200)" },
  { label: "Edge", value: "edge", color: "oklch(0.6 0.12 180)" },
  { label: "VC", value: "vc", color: "oklch(0.65 0.12 320)" },
  { label: "Geo", value: "geo", color: "oklch(0.6 0.15 350)" },
];

const sortOptions: { label: string; value: SortKey }[] = [
  { label: "Default order", value: "default" },
  { label: "Growth %: High to Low", value: "growth_desc" },
  { label: "Growth %: Low to High", value: "growth_asc" },
  { label: "Metric A → Z", value: "metric_az" },
  { label: "Metric Z → A", value: "metric_za" },
  { label: "Category A → Z", value: "category_az" },
];

function matchesFilter(row: typeof enriched[0], filter: FilterCategory): boolean {
  if (filter === "all") return true;
  const cat = row.resolvedCategory.toLowerCase();
  const color = row.resolvedColor;
  if (filter === "ai") return color === "oklch(0.7 0.15 240)";
  if (filter === "dc") return color === "oklch(0.75 0.15 70)";
  if (filter === "power") return cat.includes("power") || cat.includes("grid");
  if (filter === "oracle") return cat.includes("oracle");
  if (filter === "cloud") return color === "oklch(0.7 0.15 155)";
  if (filter === "spacex") return cat.includes("spacex") || cat.includes("xai");
  if (filter === "eu") return cat.includes("end-user") || cat.includes("it");
  if (filter === "neocloud") return cat.includes("neocloud") || color === "oklch(0.7 0.18 280)" || color === "oklch(0.7 0.15 170)";
  if (filter === "semi") return cat.includes("semi");
  if (filter === "edge") return cat.includes("edge");
  if (filter === "vc") return cat.includes("vc");
  if (filter === "geo") return cat.includes("geo");
  return true;
}

function matchesSearch(row: typeof enriched[0], q: string): boolean {
  if (!q) return true;
  const lower = q.toLowerCase();
  return (
    row.sub.toLowerCase().includes(lower) ||
    row.resolvedCategory.toLowerCase().includes(lower) ||
    row.notes.toLowerCase().includes(lower) ||
    row.source.toLowerCase().includes(lower) ||
    row.current.toLowerCase().includes(lower) ||
    row.projection.toLowerCase().includes(lower)
  );
}

function sortRows(rows: typeof enriched, key: SortKey): typeof enriched {
  if (key === "default") return rows;
  const copy = [...rows];
  if (key === "growth_desc") return copy.sort((a, b) => (b.growthNum ?? -Infinity) - (a.growthNum ?? -Infinity));
  if (key === "growth_asc") return copy.sort((a, b) => (a.growthNum ?? Infinity) - (b.growthNum ?? Infinity));
  if (key === "metric_az") return copy.sort((a, b) => a.sub.localeCompare(b.sub));
  if (key === "metric_za") return copy.sort((a, b) => b.sub.localeCompare(a.sub));
  if (key === "category_az") return copy.sort((a, b) => a.resolvedCategory.localeCompare(b.resolvedCategory));
  return rows;
}

export function SpreadsheetSection() {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");
  const [sortKey, setSortKey] = useState<SortKey>("default");
  const [search, setSearch] = useState("");
  const [selectedRow, setSelectedRow] = useState<(typeof enriched)[number] | null>(null);

  const rows = useMemo(() => {
    const filtered = enriched.filter(r => matchesFilter(r, activeFilter) && matchesSearch(r, search));
    return sortRows(filtered, sortKey);
  }, [activeFilter, sortKey, search]);

  const activeFilterLabel = filters.find(f => f.value === activeFilter)?.label ?? "All";
  const activeSortLabel = sortOptions.find(s => s.value === sortKey)?.label ?? "Default order";

  return (
    <section id="data" className="py-24 relative">
      <div className="absolute inset-0 opacity-15">
        <img
          src="https://d2xsxph8kpxj0f.cloudfront.net/310519663305152617/ZGmmwtuoPH63p4k3Y3pKpf/data-section-bg-Lqrkr5JsR9B2NchHrvombE.webp"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </div>

      <div className="container relative z-10 max-w-7xl">
        <div className="mb-7 flex flex-col gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="observatory-kicker text-[var(--signal-gold)]">Evidence ledger</p>
            <h2 className="mt-3 font-serif text-4xl leading-none tracking-[-0.04em] text-foreground sm:text-5xl">AI infrastructure data sheet</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{spendingData.length} tracked observations across eleven categories, structured around the spending, power, revenue, and credit conditions defining the cycle.</p>
          </div>
          <div className="observatory-panel flex shrink-0 items-center gap-4 px-4 py-3">
            <div><p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Evidence status</p><p className="mt-1 font-mono text-xs text-[var(--signal-cyan)]">Source-indexed</p></div>
            <div className="h-8 w-px bg-border" />
            <div><p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Last reviewed</p><p className="mt-1 font-mono text-xs text-foreground">Jun 26, 2026</p></div>
          </div>
        </div>

        {/* ── Controls row ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search metrics, sources, notes…"
              aria-label="Search spreadsheet rows"
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-border/40 bg-card/30 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-[border-color,box-shadow]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-accent transition-colors"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="relative shrink-0">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50 pointer-events-none" />
            <select
              value={sortKey}
              onChange={e => setSortKey(e.target.value as SortKey)}
              aria-label="Sort rows"
              className="pl-9 pr-8 py-2 rounded-lg border border-border/40 bg-card/80 text-sm text-foreground focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-[border-color,box-shadow] appearance-none cursor-pointer min-w-[200px]"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50 pointer-events-none" />
          </div>
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2 mb-5 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-wider transition-colors whitespace-nowrap ${
                activeFilter === f.value
                  ? "bg-accent text-foreground border border-border"
                  : "text-muted-foreground hover:text-foreground border border-transparent hover:border-border/40"
              }`}
            >
              {f.color && <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: f.value === "power" || f.value === "oracle" || f.value === "neocloud" ? "var(--signal-risk)" : f.value === "dc" || f.value === "semi" ? "var(--signal-gold)" : "var(--signal-cyan)" }} />}
              {f.label}
            </button>
          ))}
        </div>

        {/* Active filter / sort summary */}
        {(activeFilter !== "all" || sortKey !== "default" || search) && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Active:</span>
            {activeFilter !== "all" && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent border border-border font-mono text-[10px] text-foreground">
                {activeFilterLabel}
                <button onClick={() => setActiveFilter("all")} aria-label="Clear category filter" className="ml-0.5 hover:text-primary">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {sortKey !== "default" && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent border border-border font-mono text-[10px] text-foreground">
                {activeSortLabel}
                <button onClick={() => setSortKey("default")} aria-label="Clear sort" className="ml-0.5 hover:text-primary">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {search && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent border border-border font-mono text-[10px] text-foreground">
                "{search}"
                <button onClick={() => setSearch("")} aria-label="Clear search filter" className="ml-0.5 hover:text-primary">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Data table */}
        <div className="observatory-panel hidden overflow-hidden md:block">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/50 hover:bg-transparent">
                  <TableHead className="font-mono text-fluid-xs uppercase tracking-wider text-muted-foreground py-3">
                    <button
                      onClick={() => setSortKey(sortKey === "category_az" ? "default" : "category_az")}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      Category
                      {sortKey === "category_az" ? <ChevronUp className="w-3 h-3" /> : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                    </button>
                  </TableHead>
                  <TableHead className="font-mono text-fluid-xs uppercase tracking-wider text-muted-foreground py-3">
                    <button
                      onClick={() => setSortKey(sortKey === "metric_az" ? "metric_za" : "metric_az")}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      Metric
                      {sortKey === "metric_az" ? <ChevronUp className="w-3 h-3" /> : sortKey === "metric_za" ? <ChevronDown className="w-3 h-3" /> : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                    </button>
                  </TableHead>
                  <TableHead className="font-mono text-fluid-xs uppercase tracking-wider text-muted-foreground py-3 text-right">Current</TableHead>
                  <TableHead className="font-mono text-fluid-xs uppercase tracking-wider text-muted-foreground py-3 text-right">Projection</TableHead>
                  <TableHead className="font-mono text-fluid-xs uppercase tracking-wider text-muted-foreground py-3 text-right">
                    <button
                      onClick={() => setSortKey(sortKey === "growth_desc" ? "growth_asc" : "growth_desc")}
                      className="flex items-center gap-1 ml-auto hover:text-foreground transition-colors"
                    >
                      Growth
                      {sortKey === "growth_desc" ? <ChevronDown className="w-3 h-3" /> : sortKey === "growth_asc" ? <ChevronUp className="w-3 h-3" /> : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                    </button>
                  </TableHead>
                  <TableHead className="font-mono text-fluid-xs uppercase tracking-wider text-muted-foreground py-3 hidden lg:table-cell">Source</TableHead>
                  <TableHead className="font-mono text-fluid-xs uppercase tracking-wider text-muted-foreground py-3 hidden xl:table-cell">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-muted-foreground text-sm">
                      No rows match your filters.{" "}
                      <button
                        onClick={() => { setSearch(""); setActiveFilter("all"); setSortKey("default"); }}
                        className="text-primary underline hover:no-underline"
                      >
                        Clear all
                      </button>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row, i) => (
                    <TableRow key={i} className="border-b border-border/30 hover:bg-accent/30 transition-colors">
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: categoryToneValue(row.resolvedCategory) }} />
                          <span className="font-semibold text-xs whitespace-nowrap">{row.resolvedCategory}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5 text-xs text-foreground/80">{row.sub}</TableCell>
                      <TableCell className="py-2.5 text-right font-mono text-xs">{row.current}</TableCell>
                      <TableCell className="py-2.5 text-right font-mono text-xs font-semibold" style={{ color: categoryToneValue(row.resolvedCategory) }}>{row.projection}</TableCell>
                      <TableCell className="py-2.5 text-right">
                        <span className="inline-flex px-1.5 py-0.5 rounded text-fluid-xs font-mono font-semibold" style={{ backgroundColor: `color-mix(in oklch, ${categoryToneValue(row.resolvedCategory)} 15%, transparent)`, color: categoryToneValue(row.resolvedCategory) }}>
                          {row.growth}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5 text-fluid-xs text-muted-foreground hidden lg:table-cell">{row.source}</TableCell>
                      <TableCell className="py-2.5 text-fluid-xs text-muted-foreground max-w-[200px] hidden xl:table-cell">{row.notes}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="px-4 py-3 border-t border-border/30 bg-card/20 flex items-center justify-between flex-wrap gap-2">
            <p className="text-fluid-xs text-muted-foreground font-mono">
              <span className="text-foreground font-semibold">{rows.length}</span> of {spendingData.length} rows
              {activeFilter !== "all" && <> · <span className="text-foreground/70">{activeFilterLabel}</span></>}
              {search && <> · matching "<span className="text-foreground/70">{search}</span>"</>}
              {sortKey !== "default" && <> · sorted by <span className="text-foreground/70">{activeSortLabel}</span></>}
            </p>
            <span className="text-fluid-xs text-muted-foreground font-mono">Updated: June 26, 2026</span>
          </div>
        </div>

        <div className="space-y-2 md:hidden">
          <div className="flex items-center justify-between px-1 pb-1 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground"><span>{rows.length} observations</span><span>Tap a row for source context</span></div>
          {rows.map(row => {
            const tone = categoryToneValue(row.resolvedCategory);
            return (
              <button key={`${row.resolvedCategory}-${row.sub}`} type="button" onClick={() => setSelectedRow(row)} className="observatory-panel w-full p-4 text-left transition-[border-color,background-color] duration-150 hover:border-[var(--signal-gold)]">
                <div className="flex items-start justify-between gap-4"><div className="min-w-0"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: tone }} /><span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">{row.resolvedCategory}</span></div><p className="mt-2 text-sm font-medium text-foreground">{row.sub}</p></div><ExternalLink className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" /></div>
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border/50 pt-3"><div><p className="font-mono text-[9px] uppercase tracking-[0.09em] text-muted-foreground">Current</p><p className="mt-1 font-mono text-xs text-foreground">{row.current}</p></div><div><p className="font-mono text-[9px] uppercase tracking-[0.09em] text-muted-foreground">Projection</p><p className="mt-1 font-mono text-xs" style={{ color: tone }}>{row.projection}</p></div></div>
              </button>
            );
          })}
        </div>

        {selectedRow && (
          <div className="fixed inset-0 z-[260] flex items-end bg-black/70 p-3 backdrop-blur-sm sm:items-center sm:justify-center" role="presentation" onClick={() => setSelectedRow(null)}>
            <article role="dialog" aria-modal="true" aria-label={`${selectedRow.sub} evidence detail`} className="observatory-panel w-full max-w-lg p-5 shadow-[var(--shadow-lg)]" onClick={event => event.stopPropagation()}>
              <div className="flex items-start justify-between gap-4"><div><p className="observatory-kicker text-[var(--signal-gold)]">{selectedRow.resolvedCategory}</p><h3 className="mt-2 font-serif text-3xl leading-none tracking-[-0.04em] text-foreground">{selectedRow.sub}</h3></div><button type="button" onClick={() => setSelectedRow(null)} aria-label="Close evidence detail" className="rounded-[var(--radius-sm)] border border-border px-2 py-1 font-mono text-xs text-muted-foreground transition-colors duration-150 hover:text-foreground">Close</button></div>
              <dl className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-[var(--radius-sm)] bg-[var(--recessed)] p-3"><dt className="observatory-kicker">Current</dt><dd className="mt-2 font-mono text-sm text-foreground">{selectedRow.current}</dd></div><div className="rounded-[var(--radius-sm)] bg-[var(--recessed)] p-3"><dt className="observatory-kicker">Projection</dt><dd className="mt-2 font-mono text-sm text-[var(--signal-cyan)]">{selectedRow.projection}</dd></div><div className="col-span-2 rounded-[var(--radius-sm)] bg-[var(--recessed)] p-3"><dt className="observatory-kicker">Growth signal</dt><dd className="mt-2 font-mono text-sm text-foreground">{selectedRow.growth}</dd></div></dl>
              <div className="mt-5 border-t border-border/50 pt-4"><p className="observatory-kicker">Evidence note</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{selectedRow.notes}</p><p className="mt-4 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--signal-gold)]">Source · {selectedRow.source}</p></div>
            </article>
          </div>
        )}
      </div>
    </section>
  );
}
