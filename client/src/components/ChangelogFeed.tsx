import { AlertCircle, TrendingUp, TrendingDown, Zap, Building2, Globe, Search, X } from "lucide-react";
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";

interface ChangelogEntry {
  date: string;
  category: "revision" | "earnings" | "policy" | "market" | "infrastructure" | "geopolitical";
  title: string;
  detail: string;
  impact: "bullish" | "bearish" | "neutral";
  source: string;
}

const changelog: ChangelogEntry[] = [
  {
    date: "Jul 12, 2026",
    category: "infrastructure",
    title: "30-50% of 2026 US data centers delayed: power grid bottleneck confirmed",
    detail: "Only 5 GW of 16 GW announced 2026 capacity under construction. 11 GW shows no signs of breaking ground. Transformers face 3-5 year delivery. Switchgear sold out through 2028.",
    impact: "bearish",
    source: "CBRE / Grid Analytics",
  },
  {
    date: "Jul 12, 2026",
    category: "market",
    title: "TSMC CoWoS capacity scaling to 130K WPM: supply gap narrows to 10%",
    detail: "Advanced packaging bottleneck easing. Broadcom lands 5th custom ASIC customer ($1B order). Gartner: semiconductor revenue to exceed $1.3T in 2026 (+64% YoY).",
    impact: "bullish",
    source: "TrendForce / Gartner",
  },
  {
    date: "Jul 10, 2026",
    category: "market",
    title: "Meta Compute launch + Iris chip production Sept 2026: $22B/GW build cost",
    detail: "Meta building at half prior cost estimates. 14 GW target by 2027. Custom Iris chip enters manufacturing. Directly competing with AWS, CoreWeave on AI inference.",
    impact: "bullish",
    source: "Reuters / 247WallSt",
  },
  {
    date: "Jul 9, 2026",
    category: "earnings",
    title: "Oracle RPO hits record $638B (+363% YoY): FCF negative $23.7B",
    detail: "Q4 OCI revenue +93% to $5.8B. FY2026 capex $55.7B. Plans $40B debt/equity raise for FY2027. Capex guided $70B for FY2027.",
    impact: "neutral",
    source: "Oracle Q4 FY2026 Earnings",
  },
  {
    date: "Jul 7, 2026",
    category: "market",
    title: "Nebius-Meta deal confirmed at $27B: Nvidia invests $2B directly",
    detail: "$12B dedicated capacity + $15B additional compute over 5 years. Nebius targeting 800MW-1GW power. Circular financing concerns emerge (Nvidia funding its own customers).",
    impact: "bullish",
    source: "Nebius / CNBC / io-fund",
  },
  {
    date: "Jul 5, 2026",
    category: "revision",
    title: "Microsoft CY2026 capex guided $190B (+61% YoY): margin compression accelerates",
    detail: "Azure +40% YoY. AI revenue run rate $37B (+123%). But cloud gross margin hits 67.6% (lowest since 2022). Memory costs soaring.",
    impact: "neutral",
    source: "Microsoft Q3 FY2026 / CNBC",
  },
  {
    date: "Jul 5, 2026",
    category: "revision",
    title: "Alphabet raises FY2026 capex to $180-190B: Cloud constrained by capacity",
    detail: "Google Cloud +63% YoY to $20B/Q. Would be higher without capacity limits. Cloud backlog $460B+. Gemini Enterprise MAUs +40% QoQ.",
    impact: "bullish",
    source: "Alphabet Q1 FY2026 Earnings",
  },
  {
    date: "Jul 4, 2026",
    category: "earnings",
    title: "CoreWeave Q1: $2.08B revenue (+112% YoY), $99.4B backlog",
    detail: "Adj. EBITDA $1.15B (56% margin). Net debt $17.3B. Top customer concentration improved 72%→45%. Stock +365% from April 2025 low.",
    impact: "bullish",
    source: "CoreWeave Q1 2026 Earnings / SEC",
  },
  {
    date: "Jul 3, 2026",
    category: "market",
    title: "Meta announces cloud computing service: CRWV drops 10%, NBIS drops 8%",
    detail: "Meta enters cloud market leveraging $145B capex infrastructure. Neoclouds sell off on competitive fears. AMD hits record high $566 on MI400 demand.",
    impact: "bearish",
    source: "Reuters / Bloomberg",
  },
  {
    date: "Jul 2, 2026",
    category: "infrastructure",
    title: "DC lease commitments hit record $850B: vacancy rates below 2%",
    detail: "Northern Virginia, Dallas, and Phoenix markets fully committed through 2028. Power constraints now binding in 14 of top 20 US markets.",
    impact: "bullish",
    source: "CBRE / JLL Research",
  },
  {
    date: "Jul 1, 2026",
    category: "revision",
    title: "Nasdaq enters correction territory: down 10% from May peak",
    detail: "Tech-heavy index pulled back on rotation fears and capex sustainability questions. Breadth narrowing to AI-only names. VIX spikes to 22.",
    impact: "bearish",
    source: "Bloomberg / MarketWatch",
  },
  {
    date: "Jun 29, 2026",
    category: "revision",
    title: "Goldman Sachs raises S&P 500 target to 8,000: AI drives 24% earnings growth",
    detail: "Cloud providers to pour $670B into capex in 2026. Half of S&P 500 earnings growth from AI infrastructure. EPS $340 for 2026, $385 for 2027.",
    impact: "bullish",
    source: "Goldman Sachs / Crypto Briefing",
  },
  {
    date: "Jun 27, 2026",
    category: "market",
    title: "Broad tech sell-off: NVDA -7%, ORCL -15%, CRWV -16%, NBIS -10%",
    detail: "Goldman Sachs cut NVDA PT to $200. Itau BBA cut to $218. Oracle worst week since 2020. CoreWeave/Nebius profit-taking post Nasdaq-100 inclusion.",
    impact: "bearish",
    source: "MarketBeat / Yahoo Finance",
  },
  {
    date: "Jun 25, 2026",
    category: "revision",
    title: "Dell'Oro raises 2026 data-center capex outlook above $1 trillion",
    detail: "AI infrastructure spending in cloud/enterprise could surpass $1T. Optical transport market +16% in 2026. Liquid cooling $3B→$7B by 2029.",
    impact: "bullish",
    source: "Dell'Oro Group",
  },
  {
    date: "Jun 23, 2026",
    category: "market",
    title: "CoreWeave & Nebius join Nasdaq-100: then sell off sharply",
    detail: "Both AI neoclouds added effective Jun 22. CRWV surged to $111 then fell to $94. NBIS hit $284 then dropped to $255. Classic buy-the-rumor sell-the-news.",
    impact: "neutral",
    source: "Yahoo Finance / Zacks",
  },
  {
    date: "Jun 26, 2026",
    category: "infrastructure",
    title: "Samsung unveils $648B decade-long AI capex blueprint",
    detail: "1,000 trillion won over 10 years. Competing for advanced packaging leadership. SK Hynix: $30B for 2026.",
    impact: "bullish",
    source: "Maeil Business / MoneyControl",
  },
  {
    date: "Jun 26, 2026",
    category: "market",
    title: "MSFT -20% in June on capex sustainability concerns",
    detail: "Market questioning 5:1 capex-to-incremental-revenue ratio. Largest single-month decline since 2022.",
    impact: "bearish",
    source: "Yahoo Finance",
  },
  {
    date: "Jun 25, 2026",
    category: "policy",
    title: "National moratorium on AI data centers proposed",
    detail: "Bipartisan bill introduced citing grid strain. Would pause new DC permits for 18 months in 12 states.",
    impact: "bearish",
    source: "Reuters",
  },
  {
    date: "Jun 23, 2026",
    category: "market",
    title: "SpaceX $25B bond deal: $89B in demand",
    detail: "Investment-grade rating. 3.6x oversubscribed. Largest corporate bond since Apple 2020. Funds xAI Colossus expansion.",
    impact: "bullish",
    source: "Bloomberg",
  },
  {
    date: "Jun 20, 2026",
    category: "earnings",
    title: "Oracle OCI revenue +93% YoY, but FCF -$24B",
    detail: "$553B contracted backlog (438% YoY growth). Stock -12% as market prices in debt-funded growth.",
    impact: "neutral",
    source: "Oracle Q4 FY2026 Earnings",
  },

  {
    date: "Jun 16, 2026",
    category: "market",
    title: "Man Group: AI buildout: Boom or Bubble?",
    detail: "$330B tech debt matures by 2028. AI bond issuance 5.5x dot-com peak. 4 of 5 hyperscalers underperforming on spreads.",
    impact: "bearish",
    source: "Man Group H2 2026 Credit Outlook",
  },
  {
    date: "Jun 15, 2026",
    category: "revision",
    title: "Forbes: $600B revenue gap widening: 46% divergence",
    detail: "JPM: need $650B new revenue for 10% return. Capex growing 46% faster than revenue. Exceeds 2001 telecom bubble's 32%.",
    impact: "bearish",
    source: "Forbes / Sequoia / J.P. Morgan",
  },
  {
    date: "Jun 12, 2026",
    category: "market",
    title: "SpaceX IPO: $75B raised at $135/share",
    detail: "Largest IPO in history. $2.0T market cap on day one. Starlink + xAI + launch services valued together.",
    impact: "bullish",
    source: "SEC S-1 Filing",
  },
  {
    date: "Jun 10, 2026",
    category: "infrastructure",
    title: "Gartner: DC electricity demand +26% in 2026",
    detail: "AI workloads driving 69 GW demand by 2028. Only 10 GW achievable through grid connections. 85% shortfall confirmed.",
    impact: "bearish",
    source: "Gartner",
  },
  {
    date: "Jun 5, 2026",
    category: "earnings",
    title: "NVIDIA Q1 FY2027: $81.6B revenue, Q2 guide $91B",
    detail: "Data Center segment $81.6B/quarter. Blackwell shipping at scale. Vera Rubin NVL72 announced for 2027.",
    impact: "bullish",
    source: "NVIDIA Earnings Call",
  },
  {
    date: "May 28, 2026",
    category: "revision",
    title: "Forrester: 25% of enterprises postponing AI spend",
    detail: "Enterprise backlash emerging. Budget rationing as ROI timelines extend. Shift from 2026 to 2027 budgets.",
    impact: "bearish",
    source: "Forrester Enterprise AI Survey",
  },
  {
    date: "May 22, 2026",
    category: "geopolitical",
    title: "EU Sovereign AI mandate: all member states must have domestic compute",
    detail: "€50B+ in duplicated infrastructure spending. Benefits chipmakers/neoclouds but fragments global capacity.",
    impact: "neutral",
    source: "European Commission",
  },
  {
    date: "May 15, 2026",
    category: "revision",
    title: "Moody's flags $662B off-balance sheet DC commitments",
    detail: "Top 5 hyperscalers have $662B in undiscounted future lease obligations not on balance sheets. Credit watch negative.",
    impact: "bearish",
    source: "Moody's Ratings",
  },
];

const categoryConfig = {
  revision: { icon: AlertCircle, color: "oklch(0.75 0.15 70)", label: "Forecast Revision" },
  earnings: { icon: TrendingUp, color: "oklch(0.7 0.15 240)", label: "Earnings" },
  policy: { icon: Building2, color: "oklch(0.65 0.2 25)", label: "Policy" },
  market: { icon: TrendingDown, color: "oklch(0.7 0.15 155)", label: "Market" },
  infrastructure: { icon: Zap, color: "oklch(0.7 0.15 45)", label: "Infrastructure" },
  geopolitical: { icon: Globe, color: "oklch(0.65 0.12 320)", label: "Geopolitical" },
};

function mapTagToCategory(tag: string): ChangelogEntry["category"] {
  const lower = tag.toLowerCase();
  if (["nvidia", "coreweave", "nebius", "oracle", "meta", "microsoft", "alphabet", "amazon"].some(t => lower.includes(t))) return "earnings";
  if (lower.includes("power") || lower.includes("grid") || lower.includes("infrastructure")) return "infrastructure";
  if (lower.includes("semiconductor") || lower.includes("tsmc") || lower.includes("amd") || lower.includes("broadcom")) return "market";
  if (lower.includes("policy") || lower.includes("regulation")) return "policy";
  if (lower.includes("geopolitical")) return "geopolitical";
  return "revision";
}

type CategoryKey = ChangelogEntry["category"];
type ImpactKey = ChangelogEntry["impact"];

export function ChangelogFeed() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryKey | "all">("all");
  const [activeImpact, setActiveImpact] = useState<ImpactKey | "all">("all");

  // Fetch dynamic entries from DB (weekly refresh results)
  const { data: dbData } = trpc.changelog.list.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Merge DB entries with static entries, DB entries appear first
  const dbEntries: ChangelogEntry[] = (dbData?.entries || []).map((e) => ({
    date: e.date,
    category: mapTagToCategory(e.tag),
    title: e.headline,
    detail: e.detail || "",
    impact: e.signal as "bullish" | "bearish" | "neutral",
    source: e.source || "Automated Refresh",
  }));

  const allEntries = [...dbEntries, ...changelog];

  // Filtered entries based on search, category, and impact: sorted by date (newest first) within category
  const filteredEntries = useMemo(() => {
    const filtered = allEntries.filter(entry => {
      // Category filter
      if (activeCategory !== "all" && entry.category !== activeCategory) return false;
      // Impact filter
      if (activeImpact !== "all" && entry.impact !== activeImpact) return false;
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          entry.title.toLowerCase().includes(q) ||
          entry.detail.toLowerCase().includes(q) ||
          entry.source.toLowerCase().includes(q) ||
          entry.date.toLowerCase().includes(q)
        );
      }
      return true;
    });
    // Sort by date descending (newest first)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allEntries, searchQuery, activeCategory, activeImpact]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allEntries.length };
    for (const entry of allEntries) {
      counts[entry.category] = (counts[entry.category] || 0) + 1;
    }
    return counts;
  }, [allEntries]);

  return (
    <section id="changelog" className="py-20 relative">
      <div className="container max-w-4xl">

        <div className="text-center mb-10">
          <h2 className="text-3xl font-sans font-semibold mb-3">Projection Changelog</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
            Timestamped feed of events that shifted our projections. Updated weekly via automated refresh.
            Each entry shows what changed, the impact direction, and the source.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
            <input
              type="text"
              placeholder="Search changelog entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search changelog entries"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-muted/30 hover:bg-muted/50 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Category filter pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-[border-color,background-color,color] border ${
                activeCategory === "all"
                  ? "bg-primary/20 border-primary/50 text-primary"
                  : "bg-card/30 border-border/30 text-muted-foreground hover:border-primary/30"
              }`}
            >
              All ({categoryCounts.all})
            </button>
            {(Object.keys(categoryConfig) as CategoryKey[]).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? "all" : cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-[border-color,background-color,color] border flex items-center gap-1.5 ${
                  activeCategory === cat
                    ? "border-primary/50 text-primary bg-primary/10"
                    : "bg-card/30 border-border/30 text-muted-foreground hover:border-primary/30"
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryConfig[cat].color }} />
                {categoryConfig[cat].label}
                {categoryCounts[cat] ? ` (${categoryCounts[cat]})` : ""}
              </button>
            ))}
          </div>

          {/* Impact filter pills */}
          <div className="flex gap-2">
            {(["all", "bullish", "bearish", "neutral"] as const).map(impact => (
              <button
                key={impact}
                onClick={() => setActiveImpact(activeImpact === impact ? "all" : impact)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-[border-color,background-color,color] border ${
                  activeImpact === impact
                    ? impact === "bullish" ? "bg-[oklch(0.7_0.15_155_/_0.2)] border-[oklch(0.7_0.15_155_/_0.5)] text-[oklch(0.7_0.15_155)]"
                    : impact === "bearish" ? "bg-[oklch(0.65_0.2_25_/_0.2)] border-[oklch(0.65_0.2_25_/_0.5)] text-[oklch(0.65_0.2_25)]"
                    : impact === "neutral" ? "bg-muted/30 border-muted-foreground/30 text-muted-foreground"
                    : "bg-primary/20 border-primary/50 text-primary"
                    : "bg-card/30 border-border/30 text-muted-foreground hover:border-primary/30"
                }`}
              >
                {impact === "all" ? "All Signals" : impact.charAt(0).toUpperCase() + impact.slice(1)}
              </button>
            ))}
          </div>

          {/* Results count */}
          {(searchQuery || activeCategory !== "all" || activeImpact !== "all") && (
            <div className="text-xs text-muted-foreground">
              Showing {filteredEntries.length} of {allEntries.length} entries
              {searchQuery && <span> matching "{searchQuery}"</span>}
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border/40" />

          <div className="space-y-1">
            {filteredEntries.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-sm">No entries match your filters.</p>
                <button
                  onClick={() => { setSearchQuery(""); setActiveCategory("all"); setActiveImpact("all"); }}
                  className="mt-2 text-primary text-xs hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : null}
            {filteredEntries.map((entry, i) => {
              const config = categoryConfig[entry.category];
              const Icon = config.icon;

              return (
                <div key={i} className="relative pl-12 group">
                  {/* Timeline dot */}
                  <div
                    className="absolute left-[12px] top-5 w-[15px] h-[15px] rounded-full border-2 border-background flex items-center justify-center"
                    style={{ backgroundColor: config.color }}
                  >
                    <div className="w-[5px] h-[5px] rounded-full bg-background" />
                  </div>

                  {/* Card */}
                  <div className="p-4 rounded-xl border border-border/20 bg-card/10 hover:bg-card/20 hover:border-border/40 transition-[transform,opacity,border-color,background-color] duration-200 mb-2">
                    {/* Header row */}
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
                        <span className="text-fluid-xs font-mono uppercase tracking-wider" style={{ color: config.color }}>
                          {config.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-medium text-foreground/70 bg-card/40 border border-border/30 px-2 py-0.5 rounded">
                          {entry.date}
                        </span>
                        <span
                          className={`text-fluid-xs font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                            entry.impact === "bullish"
                              ? "bg-[oklch(0.7_0.15_155_/_0.15)] text-[oklch(0.7_0.15_155)]"
                              : entry.impact === "bearish"
                              ? "bg-[oklch(0.65_0.2_25_/_0.15)] text-[oklch(0.65_0.2_25)]"
                              : "bg-muted/30 text-muted-foreground"
                          }`}
                        >
                          {entry.impact}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className="text-sm font-medium text-foreground mb-1">{entry.title}</h4>

                    {/* Detail */}
                    <p className="text-xs text-muted-foreground leading-relaxed mb-2">{entry.detail}</p>

                    {/* Source + Date footer */}
                    <div className="flex items-center justify-between">
                      <span className="text-fluid-xs font-mono text-muted-foreground/60">Source: {entry.source}</span>
                      <span className="text-[10px] font-mono text-muted-foreground/40">{entry.date}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Auto-refresh note */}
        <div className="mt-8 p-4 rounded-xl border border-border/20 bg-card/10 text-center">
          <p className="text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[oklch(0.7_0.15_155)] animate-pulse" />
              Auto-refreshed every Sunday at 06:00 UTC via Heartbeat cron
            </span>
            {" · "}
            {dbData?.entries?.length ? `${dbData.entries.length} automated entries loaded` : "Next update pulls fresh earnings data, research reports, and policy changes."}
          </p>
        </div>
      </div>
    </section>
  );
}
