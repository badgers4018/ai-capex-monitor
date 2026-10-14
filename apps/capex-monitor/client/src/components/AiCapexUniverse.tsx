import { useMemo, useState } from "react";
import { ArrowDownUp, BarChart3, Database, ExternalLink, Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { AI_CAPEX_COUNCIL } from "@/data/aiCapexCouncil";
import { AI_CAPEX_CORRELATION, AI_CAPEX_UNIVERSE, AI_CAPEX_UNIVERSE_AS_OF, AI_CAPEX_UNIVERSE_METHODOLOGY } from "@/data/aiCapexMarketData";
import { TradingViewWorkspace } from "@/components/TradingViewWorkspace";

type SortKey = "rank" | "name" | "marketCap" | "category" | "stance";
type Stance = (typeof AI_CAPEX_COUNCIL.classifications)[number]["stance"];

const stanceLabel: Record<Stance, string> = {
  "capex-winner": "Winner",
  "capex-beneficiary": "Beneficiary",
  balanced: "Balanced",
  "capex-risk": "Capex risk",
};

const stanceClass: Record<Stance, string> = {
  "capex-winner": "border-emerald-700/50 bg-emerald-950/30 text-emerald-300",
  "capex-beneficiary": "border-cyan-700/50 bg-cyan-950/30 text-cyan-300",
  balanced: "border-amber-700/50 bg-amber-950/30 text-amber-300",
  "capex-risk": "border-red-700/50 bg-red-950/30 text-red-300",
};

function formatMarketCap(value: number | null) {
  if (value === null) return "—";
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  return `$${(value / 1e9).toFixed(1)}B`;
}

function tradingViewUrl(ticker: string, exchange: string) {
  return `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(`${exchange}:${ticker}`)}`;
}

export function AiCapexUniverse() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All sleeves");
  const [stance, setStance] = useState<"All views" | Stance>("All views");
  const [sort, setSort] = useState<SortKey>("rank");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedTicker, setSelectedTicker] = useState<string>(AI_CAPEX_UNIVERSE[0]?.ticker ?? "NVDA");

  const councilByTicker = useMemo(
    () => new Map(AI_CAPEX_COUNCIL.classifications.map((item) => [item.ticker, item])),
    []
  );
  const categories = useMemo(
    () => ["All sleeves", ...Array.from(new Set(AI_CAPEX_UNIVERSE.map((item) => item.category)))],
    []
  );

  const rows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = AI_CAPEX_UNIVERSE.filter((company) => {
      const council = councilByTicker.get(company.ticker);
      const matchesQuery = !normalizedQuery || [company.ticker, company.name, company.category, company.exposure]
        .some((value) => value.toLowerCase().includes(normalizedQuery));
      const matchesCategory = category === "All sleeves" || company.category === category;
      const matchesStance = stance === "All views" || council?.stance === stance;
      return matchesQuery && matchesCategory && matchesStance;
    });
    const direction = sortDirection === "asc" ? 1 : -1;
    return [...filtered].sort((left, right) => {
      const leftCouncil = councilByTicker.get(left.ticker);
      const rightCouncil = councilByTicker.get(right.ticker);
      if (sort === "rank") return direction * (left.rank - right.rank);
      if (sort === "marketCap") return direction * ((left.marketCap ?? 0) - (right.marketCap ?? 0));
      if (sort === "name") return direction * left.name.localeCompare(right.name);
      if (sort === "category") return direction * left.category.localeCompare(right.category);
      return direction * (leftCouncil?.stance ?? "").localeCompare(rightCouncil?.stance ?? "");
    });
  }, [category, councilByTicker, query, sort, sortDirection, stance]);

  const resetFilters = () => {
    setQuery("");
    setCategory("All sleeves");
    setStance("All views");
    setSort("rank");
    setSortDirection("asc");
  };

  const setSortKey = (next: SortKey) => {
    if (next === sort) setSortDirection((current) => current === "asc" ? "desc" : "asc");
    else {
      setSort(next);
      setSortDirection(next === "marketCap" ? "desc" : "asc");
    }
  };

  const focusChart = (ticker: string) => {
    setSelectedTicker(ticker);
    requestAnimationFrame(() => document.getElementById("tradingview")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  return (
    <section id="universe" className="scroll-mt-24 py-16 sm:py-20">
      <div className="container max-w-7xl">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs tracking-wider text-muted-foreground">06</span>
          <div className="h-px flex-1 bg-border" />
          <span className="observatory-kicker">Market universe</span>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="observatory-kicker text-[var(--signal-gold)]">50 names · live market metadata</p>
            <h2 className="mt-2 font-serif text-4xl leading-[0.92] tracking-[-0.04em] text-foreground sm:text-5xl">The full AI capex value chain.</h2>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
              A curated direct-exposure universe, market-cap-ranked within the screen: platforms financing capacity, the silicon and fabric inside clusters, equipment solving power and cooling constraints, and the more levered capacity owners.
            </p>
          </div>
          <div className="observatory-panel p-4">
            <div className="flex items-start gap-3">
              <Database className="mt-0.5 h-4 w-4 shrink-0 text-[var(--signal-cyan)]" aria-hidden="true" />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Data protocol</p>
                <p className="mt-1 text-xs leading-5 text-foreground/80">Curated by direct AI-capex transmission path, then ranked within this screen by Yahoo Finance trailing market capitalization. Adjusted daily prices align from {AI_CAPEX_CORRELATION.start} to {AI_CAPEX_CORRELATION.end} ({AI_CAPEX_CORRELATION.tradingDays} trading days).</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.entries(AI_CAPEX_COUNCIL.byStance) as [Stance, number][]).map(([key, count]) => (
            <button
              key={key}
              onClick={() => setStance((current) => current === key ? "All views" : key)}
              className={`rounded-[var(--radius-md)] border p-4 text-left transition-[border-color,background-color,transform] duration-150 hover:-translate-y-0.5 active:scale-[0.99] ${stance === key ? stanceClass[key] : "border-border/50 bg-card/30 hover:border-border"}`}
            >
              <span className="font-mono text-2xl font-semibold">{count}</span>
              <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.11em]">{stanceLabel[key]}</span>
              <span className="mt-1 block text-[10px] text-muted-foreground">Five-review consensus</span>
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-[var(--radius-lg)] border border-border/60 bg-card/35 p-3 shadow-[var(--shadow-md)] sm:p-4">
          <div className="grid gap-2 lg:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <span className="sr-only">Search the AI capex universe</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search ticker, company, sleeve, exposure..." className="h-10 w-full rounded-[var(--radius-sm)] border border-border/60 bg-[var(--recessed)] pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-[var(--signal-cyan)]" />
            </label>
            <label className="relative block">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <span className="sr-only">Filter by exposure sleeve</span>
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-10 w-full appearance-none rounded-[var(--radius-sm)] border border-border/60 bg-[var(--recessed)] pl-8 pr-3 font-mono text-xs text-foreground outline-none focus:border-[var(--signal-cyan)]">
                {categories.map((value) => <option key={value}>{value}</option>)}
              </select>
            </label>
            <label className="relative block">
              <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <span className="sr-only">Filter by council view</span>
              <select value={stance} onChange={(event) => setStance(event.target.value as "All views" | Stance)} className="h-10 w-full appearance-none rounded-[var(--radius-sm)] border border-border/60 bg-[var(--recessed)] pl-8 pr-3 font-mono text-xs text-foreground outline-none focus:border-[var(--signal-cyan)]">
                <option>All views</option>
                {(Object.keys(stanceLabel) as Stance[]).map((value) => <option key={value} value={value}>{stanceLabel[value]}</option>)}
              </select>
            </label>
            <label className="relative block">
              <ArrowDownUp className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <span className="sr-only">Sort the universe</span>
              <select value={sort} onChange={(event) => { setSort(event.target.value as SortKey); setSortDirection(event.target.value === "marketCap" ? "desc" : "asc"); }} className="h-10 w-full appearance-none rounded-[var(--radius-sm)] border border-border/60 bg-[var(--recessed)] pl-8 pr-3 font-mono text-xs text-foreground outline-none focus:border-[var(--signal-cyan)]">
                <option value="rank">Market-cap rank</option><option value="marketCap">Market cap</option><option value="name">Company name</option><option value="category">Sleeve</option><option value="stance">Council view</option>
              </select>
            </label>
            <button onClick={resetFilters} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border border-border/60 px-3 font-mono text-[10px] font-bold uppercase tracking-[0.09em] text-muted-foreground transition-colors hover:border-border hover:text-foreground active:scale-[0.97]"><X className="h-3.5 w-3.5" aria-hidden="true" /> Reset</button>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/40 pt-3 text-[10px] font-mono text-muted-foreground">
            <span>Showing <strong className="text-foreground">{rows.length}</strong> of {AI_CAPEX_UNIVERSE.length} names</span>
            <span className="hidden sm:block">As of {AI_CAPEX_UNIVERSE_AS_OF}</span>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-[var(--radius-lg)] border border-border/60 bg-card/30">
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead className="border-b border-border/60 bg-[var(--recessed)]/80">
                <tr className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                  <th className="w-14 px-4 py-3"><button onClick={() => setSortKey("rank")} className="hover:text-foreground">Rank</button></th>
                  <th className="px-4 py-3"><button onClick={() => setSortKey("name")} className="hover:text-foreground">Company</button></th>
                  <th className="px-4 py-3"><button onClick={() => setSortKey("marketCap")} className="hover:text-foreground">Market cap</button></th>
                  <th className="px-4 py-3"><button onClick={() => setSortKey("category")} className="hover:text-foreground">Exposure sleeve</button></th>
                  <th className="px-4 py-3"><button onClick={() => setSortKey("stance")} className="hover:text-foreground">Council view</button></th>
                  <th className="px-4 py-3 text-right">Chart</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((company) => {
                  const council = councilByTicker.get(company.ticker)!;
                  return <tr key={company.ticker} className="border-b border-border/30 transition-colors hover:bg-accent/20">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{company.rank}</td>
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><span className="font-mono text-xs font-bold text-[var(--signal-gold)]">{company.ticker}</span><span className="text-sm font-medium text-foreground">{company.name}</span></div><p className="mt-1 max-w-md text-[11px] leading-4 text-muted-foreground">{company.exposure}</p></td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground">{formatMarketCap(company.marketCap)}</td>
                    <td className="px-4 py-3"><span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{company.category}</span></td>
                    <td className="px-4 py-3"><span title={council.rationale} className={`inline-flex rounded-full border px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.08em] ${stanceClass[council.stance]}`}>{council.agreement === "split" ? "Split" : stanceLabel[council.stance]} · {council.voteCount}/5</span></td>
                    <td className="px-4 py-3 text-right"><div className="inline-flex items-center gap-2"><a href={tradingViewUrl(company.ticker, company.exchange)} target="_blank" rel="noreferrer" aria-label={`Open ${company.ticker} in TradingView`} className="text-muted-foreground transition-colors hover:text-[#3d83ff]"><ExternalLink className="h-3.5 w-3.5" /></a><button onClick={() => focusChart(company.ticker)} className="rounded border border-border/60 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:border-[#3d83ff]/60 hover:text-[#3d83ff] active:scale-[0.97]">Chart</button></div></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
          <div className="divide-y divide-border/30 sm:hidden">
            {rows.map((company) => {
              const council = councilByTicker.get(company.ticker)!;
              return <article key={company.ticker} className="p-4"><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><span className="font-mono text-xs text-muted-foreground">#{company.rank}</span><span className="font-mono text-sm font-bold text-[var(--signal-gold)]">{company.ticker}</span></div><h3 className="mt-1 text-sm font-semibold">{company.name}</h3></div><span className={`shrink-0 rounded-full border px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.08em] ${stanceClass[council.stance]}`}>{council.agreement === "split" ? "Split view" : stanceLabel[council.stance]}</span></div><p className="mt-2 text-xs leading-5 text-muted-foreground">{company.exposure}</p><div className="mt-3 flex items-center justify-between border-t border-border/30 pt-3"><span className="font-mono text-xs text-foreground">{formatMarketCap(company.marketCap)} <span className="text-muted-foreground">· {company.category}</span></span><button onClick={() => focusChart(company.ticker)} className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.09em] text-[#3d83ff]"><BarChart3 className="h-3.5 w-3.5" /> Chart</button></div></article>;
            })}
          </div>
        </div>

        <div className="mt-5">
          <TradingViewWorkspace activeTicker={selectedTicker} />
        </div>

        <p className="mt-4 max-w-5xl text-[10px] leading-5 text-muted-foreground">
          {AI_CAPEX_UNIVERSE_METHODOLOGY} Council labels summarize structural AI-capex exposure from five independent reviews; they are not price targets, personalized investment recommendations, or trade signals. Market data is time-stamped and can change after collection.
        </p>
      </div>
    </section>
  );
}
