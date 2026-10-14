import { useState } from "react";
import { X, TrendingUp, DollarSign, Server, AlertTriangle, Zap, Building2 } from "lucide-react";
import { useLiveQuotes } from "@/hooks/useLiveQuotes";

interface CompanyData {
  rank: number;
  name: string;
  ticker: string;
  color: string;
  capex2026: string;
  capex2025: string;
  capexGrowth: string;
  // Quarterly capex trend (6 quarters: Q4'24, Q1'25, Q2'25, Q3'25, Q4'25, Q1'26) in $B
  sparkline: number[];
  marketCap: string;
  stockPrice: string;
  revenue: string;
  revenueGrowth: string;
  cloudDCRevenue: string;
  totalLiabilities: string;
  offBalanceSheet: string;
  debtIssued2026: string;
  fcfStatus: string;
  keyMetric: string;
  keyMetricLabel: string;
  strategicPosition: string;
  risks: string[];
  catalysts: string[];
  aiInfraRole: string;
}

const companies: CompanyData[] = [
  {
    rank: 1,
    name: "Amazon",
    ticker: "AMZN",
    color: "oklch(0.75 0.15 70)",
    sparkline: [16, 20, 22, 25, 28, 50],
    capex2026: "$200B",
    capex2025: "$100B",
    capexGrowth: "+100%",
    marketCap: "$2.6T",
    stockPrice: "$244.39",
    revenue: "$700B+ (FY2026E)",
    revenueGrowth: "+12% YoY",
    cloudDCRevenue: "$37.6B/quarter (AWS)",
    totalLiabilities: "$380B on-balance",
    offBalanceSheet: "$200B (DC leases, purchase commitments)",
    debtIssued2026: "$50B",
    fcfStatus: "Negative Q1 2026: first time since 2022",
    keyMetric: "$200B",
    keyMetricLabel: "2026 Capex",
    strategicPosition: "AWS is the largest cloud provider (32% share). Doubling capex to $200B in 2026: the single largest infrastructure commitment in corporate history. Building custom Trainium chips to reduce NVIDIA dependency. Project Kuiper (satellite internet) competes with Starlink.",
    risks: ["FCF went negative Q1 2026", "AWS growth decelerating (28% vs 37% Azure)", "Massive DC lease commitments not on balance sheet", "$200B capex with uncertain ROI timeline"],
    catalysts: ["Trainium3 chips reduce GPU costs 40%", "Bedrock AI platform growing rapidly", "AWS backlog $189B", "Kuiper constellation launch 2026-2027"],
    aiInfraRole: "Largest cloud infrastructure provider. Custom silicon (Trainium, Inferentia) + NVIDIA GPUs. Graviton ARM processors for general compute.",
  },
  {
    rank: 2,
    name: "Microsoft",
    ticker: "MSFT",
    color: "oklch(0.7 0.15 240)",
    sparkline: [11, 13, 14, 16, 22, 47],
    capex2026: "$190B",
    capex2025: "$55B",
    capexGrowth: "+245%",
    marketCap: "$2.8T",
    stockPrice: "$379.40",
    revenue: "$280B+ (FY2026E)",
    revenueGrowth: "+15% YoY",
    cloudDCRevenue: "$34.7B/quarter (Intelligent Cloud)",
    totalLiabilities: "$273B on-balance",
    offBalanceSheet: "$170B (OpenAI commitment, DC leases, SPV structures)",
    debtIssued2026: "$45B",
    fcfStatus: "5:1 capex-to-incremental-revenue ratio",
    keyMetric: "5:1",
    keyMetricLabel: "Spend/Revenue",
    strategicPosition: "Deepest AI integration via OpenAI partnership ($13B+ invested). Azure growing 40% with AI services driving acceleration. Copilot embedded across Office 365 (400M+ seats). Stock down 20% in June on capex sustainability concerns. J.P. Morgan: industry needs $650B NEW revenue for 10% return. Man Group: AI bond issuance at 5.5x dot-com peak.",
    risks: ["Stock -20% in June on capex fears", "5:1 capex-to-revenue ratio unsustainable", "OpenAI relationship complex (capped profit)", "$100B+ in off-balance sheet SPV structures", "Copilot monetization slower than expected"],
    catalysts: ["Azure AI revenue growing 3x YoY", "Copilot upsell to 400M Office seats", "GitHub Copilot dominant in developer tools", "Stargate partnership with OpenAI"],
    aiInfraRole: "Primary OpenAI compute partner. Azure AI services. Custom Maia chips. Copilot platform across enterprise stack.",
  },
  {
    rank: 3,
    name: "Alphabet",
    ticker: "GOOGL",
    color: "oklch(0.7 0.15 155)",
    sparkline: [9, 12, 13, 14, 17, 46],
    capex2026: "$185B",
    capex2025: "$50B",
    capexGrowth: "+270%",
    marketCap: "$2.2T",
    stockPrice: "$368.03",
    revenue: "$420B+ (FY2026E)",
    revenueGrowth: "+14% YoY",
    cloudDCRevenue: "$20B/quarter (Google Cloud, +63% YoY)",
    totalLiabilities: "$135B on-balance",
    offBalanceSheet: "$95B (DC leases, submarine cables)",
    debtIssued2026: "$85B",
    fcfStatus: "Positive but declining rapidly",
    keyMetric: "63%",
    keyMetricLabel: "Cloud Growth",
    strategicPosition: "Fastest-growing cloud provider (63% YoY). Google Cloud margins crossed 30% for first time. DeepMind/Gemini models competitive with GPT-5. TPU v6 custom silicon reduces costs. Owns submarine cable network and 7 of world's largest DCs.",
    risks: ["Antitrust rulings could force Search restructuring", "Massive $85B debt issuance in 2026", "AI Overviews cannibalizing Search ad revenue", "Capex 270% increase in single year"],
    catalysts: ["Google Cloud 63% growth accelerating", "Gemini 2.0 competitive with GPT-5", "TPU v6 cost advantage vs NVIDIA", "Waymo autonomous driving scaling", "Cloud margins >30% and expanding"],
    aiInfraRole: "Custom TPU silicon (v6). Google Cloud AI platform. DeepMind research. Submarine cable infrastructure. Largest renewable energy buyer.",
  },
  {
    rank: 4,
    name: "Meta",
    ticker: "META",
    color: "oklch(0.65 0.12 320)",
    sparkline: [9, 12, 15, 18, 20, 32],
    capex2026: "$130B",
    capex2025: "$72B",
    capexGrowth: "+81%",
    marketCap: "$1.5T",
    stockPrice: "$577.22",
    revenue: "$220B+ (FY2026E)",
    revenueGrowth: "+20% YoY",
    cloudDCRevenue: "Internal (AI-powered ad targeting)",
    totalLiabilities: "$95B on-balance",
    offBalanceSheet: "$120B (DC leases, content commitments)",
    debtIssued2026: "$30B",
    fcfStatus: "Positive: ad revenue funds AI capex",
    keyMetric: "$130B",
    keyMetricLabel: "2026 Capex",
    strategicPosition: "Unique model: uses AI infrastructure internally for ad targeting (3.3B daily users) rather than selling cloud. Llama open-source models create ecosystem lock-in. Reality Labs (VR/AR) is the long bet. $130B capex is entirely self-funded from ad revenue: no cloud revenue to show for it.",
    risks: ["No direct cloud revenue from AI capex", "Reality Labs losing $15B+/year", "Open-source Llama strategy unclear monetization", "Regulatory pressure on data collection"],
    catalysts: ["AI ad targeting driving 20%+ revenue growth", "Llama ecosystem creates developer lock-in", "Meta AI assistant reaching 1B+ users", "Threads growing as X alternative"],
    aiInfraRole: "Largest internal AI compute consumer. Llama open-source models. Custom MTIA chips. AI-powered ad targeting across 3.3B daily users.",
  },
  {
    rank: 5,
    name: "Oracle",
    ticker: "ORCL",
    color: "oklch(0.65 0.2 25)",
    sparkline: [3, 4, 5, 7, 10, 12],
    capex2026: "$50B",
    capex2025: "$16B",
    capexGrowth: "+213%",
    marketCap: "$420B",
    stockPrice: "$150.26",
    revenue: "$67.4B (FY2026)",
    revenueGrowth: "+17% YoY",
    cloudDCRevenue: "$5.8B/quarter (OCI, +93% YoY)",
    totalLiabilities: "$145B on-balance",
    offBalanceSheet: "$77B (DC leases, purchase commitments)",
    debtIssued2026: "$43B",
    fcfStatus: "Negative $24B FCF: funded entirely by debt",
    keyMetric: "-$24B",
    keyMetricLabel: "FCF (Negative)",
    strategicPosition: "Fastest OCI growth (93% YoY) but funded entirely by debt. $553B contracted backlog provides revenue visibility. 500% debt-to-equity ratio: the most leveraged of the Big 8. CDS spreads at GFC-era levels. Stock down 12% in June. $330B of tech debt maturing by 2028: Oracle most exposed. Larry Ellison betting the company on AI infrastructure.",
    risks: ["Negative $24B FCF", "500% debt-to-equity ratio", "Stock -12% in June", "$45-50B raised in debt+equity for buildout", "Concentration risk: few large contracts"],
    catalysts: ["$553B contracted backlog (438% YoY growth)", "OCI 93% growth: fastest in cloud", "Multi-cloud partnerships expand TAM", "100+ DC locations globally", "Sovereign AI contracts"],
    aiInfraRole: "OCI cloud infrastructure. Multi-cloud AI training. Sovereign cloud deployments. Database + AI integration (Autonomous DB).",
  },
  {
    rank: 6,
    name: "SpaceX",
    ticker: "SPCX",
    color: "oklch(0.7 0.15 45)",
    sparkline: [3.2, 3.5, 4.0, 4.5, 5.0, 5.2],
    capex2026: "$21B",
    capex2025: "$20.7B",
    capexGrowth: "+50% YoY",
    marketCap: "$2.0T",
    stockPrice: "$152.80",
    revenue: "$15B+ (2026E)",
    revenueGrowth: "+60% YoY",
    cloudDCRevenue: "$7.5B (Starlink) + xAI compute",
    totalLiabilities: "$35B on-balance",
    offBalanceSheet: "$15B (launch contracts, satellite commitments)",
    debtIssued2026: "$100B ($75B IPO + $25B bonds)",
    fcfStatus: "Positive from Starlink; IPO + bonds fund expansion",
    keyMetric: "$2.0T",
    keyMetricLabel: "Market Cap",
    strategicPosition: "IPO'd June 12, 2026 (record $75B raise). $25B bond deal June 23 ($89B demand). Vertically integrated AI infrastructure: launch → connectivity (Starlink, 5M+ subs) → compute (xAI Colossus, 200K H100s) → applications (Grok). Orbital compute plans could bypass ground power constraint by 2030+.",
    risks: ["Newly public: limited financial history", "xAI Colossus profitability unproven", "Orbital compute is 2030+ timeline", "Regulatory risk (FCC, FAA)", "Musk concentration risk"],
    catalysts: ["$25B bonds at investment-grade ($89B demand)", "Starlink 5M+ subs, $7.5B revenue", "xAI Colossus largest GPU cluster (200K H100s)", "Orbital compute bypasses power constraint", "Starship enabling cheaper satellite deployment"],
    aiInfraRole: "Starlink connectivity for remote DCs. xAI Colossus GPU cluster. Orbital compute vision. Launch infrastructure for satellite constellations.",
  },
  {
    rank: 7,
    name: "NVIDIA",
    ticker: "NVDA",
    sparkline: [1.5, 1.8, 2.0, 2.2, 2.5, 3.0],
    color: "oklch(0.7 0.15 240)",
    capex2026: "$12B (R&D-heavy)",
    capex2025: "$8B",
    capexGrowth: "+50%",
    marketCap: "$5.2T",
    stockPrice: "$210.69",
    revenue: "$330B+ (FY2027E)",
    revenueGrowth: "+55% YoY",
    cloudDCRevenue: "$81.6B/quarter (Data Center segment)",
    totalLiabilities: "$45B on-balance",
    offBalanceSheet: "$20B (supply agreements, foundry commitments)",
    debtIssued2026: "$10B",
    fcfStatus: "Massively positive: $50B+/quarter FCF",
    keyMetric: "$81.6B",
    keyMetricLabel: "Q1 Revenue",
    strategicPosition: "The picks-and-shovels winner. Q1 FY2027 revenue $81.6B, Q2 guidance $91B. 90%+ market share in AI training GPUs. Blackwell architecture shipping at scale. Vera Rubin (next-gen) in 2027. Every dollar of hyperscaler capex flows through NVIDIA first. The only company where MORE spending by others = MORE revenue.",
    risks: ["Concentration: top 4 customers = 50%+ revenue", "Custom silicon (TPU, Trainium, MTIA) competition", "China export controls limit TAM", "CoWoS/foundry supply constraints cap shipments", "Valuation: $5.2T requires sustained growth"],
    catalysts: ["Blackwell shipping at scale", "Vera Rubin NVL72 in 2027 (600kW/rack)", "Inference demand growing faster than training", "CUDA moat: 4M+ developers", "Networking (Spectrum-X) growing 300%+"],
    aiInfraRole: "GPU monopoly (90%+ AI training). CUDA software ecosystem. Networking (InfiniBand, Spectrum-X). DGX Cloud. Full-stack AI platform.",
  },
  {
    rank: 8,
    name: "CoreWeave",
    ticker: "CRWV",
    sparkline: [0.3, 0.5, 0.8, 1.2, 1.6, 2.08],
    color: "oklch(0.7 0.18 280)",
    capex2026: "$31-35B",
    capex2025: "$8B",
    capexGrowth: "+313%",
    marketCap: "$57.7B",
    stockPrice: "$98.76",
    revenue: "$12.67B (FY2026E)",
    revenueGrowth: "+112% YoY",
    cloudDCRevenue: "$2.08B/quarter (GPU-as-a-Service)",
    totalLiabilities: "$12B on-balance",
    offBalanceSheet: "$45B (DC leases, GPU purchase commitments)",
    debtIssued2026: "$3.25B (9.625% senior notes)",
    fcfStatus: "Negative: $740M Q1 loss",
    keyMetric: "$99.4B",
    keyMetricLabel: "Backlog",
    strategicPosition: "#1 neocloud and OpenAI's primary infrastructure partner. IPO'd March 2025 at $40. $99.4B contracted revenue backlog (up from $14.7B a year earlier). Targeting 1.7 GW of active power by end-2026. Added to Nasdaq-100 June 2026. Heavy debt model: $3.25B in senior notes at 9.625%.",
    risks: ["Massive net losses (-$740M Q1 2026)", "Heavy debt load at high interest rates (9.625%)", "Customer concentration (OpenAI ~60% revenue)", "GPU depreciation risk if next-gen ships faster", "Stock -32% from highs on profitability concerns"],
    catalysts: ["$99.4B backlog provides multi-year visibility", "75%+ of 2027 capacity already sold", "Nasdaq-100 inclusion drives institutional buying", "Expanding beyond OpenAI to enterprise", "1.7 GW power target enables massive scale"],
    aiInfraRole: "#1 independent GPU cloud. OpenAI's primary compute partner. Largest neocloud by revenue. Massive contracted backlog.",
  },
  {
    rank: 9,
    name: "Nebius",
    ticker: "NBIS",
    sparkline: [0.02, 0.05, 0.1, 0.15, 0.23, 0.4],
    color: "oklch(0.7 0.15 170)",
    capex2026: "$10-12B",
    capex2025: "$3B",
    capexGrowth: "+300%",
    marketCap: "$45B",
    stockPrice: "$264.50",
    revenue: "$5-7B ARR target (FY2026)",
    revenueGrowth: "+684% YoY",
    cloudDCRevenue: "$399M/quarter (AI Cloud)",
    totalLiabilities: "$8B on-balance",
    offBalanceSheet: "$12B (infrastructure commitments)",
    debtIssued2026: "$5B",
    fcfStatus: "Profitable: $584M net income",
    keyMetric: "684%",
    keyMetricLabel: "Revenue Growth",
    strategicPosition: "European neocloud leader, spun off from Yandex. 684% YoY revenue growth in Q1 2026. 98% of revenue from AI cloud. $17.4B infrastructure deal with Microsoft and Meta. £1.7B UK investment. Targeting 800MW-1GW connected power. Already profitable unlike CoreWeave. Added to Nasdaq-100 June 2026.",
    risks: ["Yandex legacy/Russia association risk", "Smaller scale vs CoreWeave and hyperscalers", "European regulatory environment (EU AI Act)", "Customer concentration on MSFT/Meta deal", "Rapid growth may strain execution"],
    catalysts: ["684% growth rate: fastest in AI infra", "$17.4B MSFT/Meta deal provides revenue floor", "Already profitable (unlike CoreWeave)", "Nasdaq-100 inclusion June 2026", "European sovereign cloud demand tailwind"],
    aiInfraRole: "European neocloud leader. Yandex spinoff. NVIDIA-powered infrastructure. Microsoft/Meta strategic partner. Profitable at scale.",
  },
];

export function CompanyDeepDive() {
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null);
  const { quoteMap, isLive } = useLiveQuotes();
  const displayCompanies = companies.map((company) => {
    const liveQuote = quoteMap[company.ticker];
    return liveQuote
      ? { ...company, stockPrice: `$${liveQuote.price.toFixed(2)}` }
      : company;
  });

  const getWatchTone = (company: CompanyData) => {
    if (company.ticker === "ORCL" || company.ticker === "CRWV") return "var(--signal-risk)";
    if (company.ticker === "NVDA") return "var(--signal-gold)";
    return "var(--signal-cyan)";
  };

  return (
    <>
      {/* Top 9 clickable cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {displayCompanies.map((company) => {
          const tone = getWatchTone(company);
          return (
          <button
            key={company.ticker}
            onClick={() => setSelectedCompany(company)}
            aria-label={`Open ${company.name} infrastructure profile`}
            className="observatory-panel group p-4 text-left transition-[transform,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-[var(--company-tone)] hover:bg-[var(--panel-raised)] active:scale-[0.98] sm:p-5"
            style={{ "--company-tone": tone } as React.CSSProperties}
          >
            <div className="mb-5 flex items-center justify-between">
              <span className="text-fluid-xs font-mono text-muted-foreground">#{company.rank}</span>
              <span className="font-mono text-xs font-bold" style={{ color: tone }}>{company.ticker}</span>
            </div>
            <div className="font-mono text-2xl font-semibold tracking-tight" style={{ color: tone }}>
              {company.capex2026}
            </div>
            <div className="mt-1 text-sm font-medium text-foreground">{company.name}</div>
            {/* Sparkline */}
            <div className="mt-4 h-7">
              <Sparkline data={company.sparkline} color={tone} />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 text-fluid-xs text-muted-foreground"><span className="truncate">{company.keyMetricLabel}: {company.keyMetric}</span><span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.1em] text-foreground/70">Profile →</span></div>
          </button>
          );
        })}
      </div>

      {/* Modal */}
      {selectedCompany && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
          onClick={() => setSelectedCompany(null)}
        >
          <div
            className="relative max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-[var(--radius-lg)] border border-border/70 bg-[var(--panel)] shadow-[var(--shadow-lg)]"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedCompany.name} infrastructure profile`}
          >
            {/* Modal header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-border/30 bg-card/95 backdrop-blur-sm rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: getWatchTone(selectedCompany) }} />
                <div>
                  <h2 className="text-xl font-semibold">{selectedCompany.name}</h2>
                  <span className="font-mono text-xs text-muted-foreground">{selectedCompany.ticker} · #{selectedCompany.rank} Infrastructure Spender</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCompany(null)}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
                aria-label="Close company details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal content */}
            <div className="p-5 space-y-6">
              {/* Key metrics grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MetricCard icon={<DollarSign className="w-4 h-4" />} label="2026 Capex" value={selectedCompany.capex2026} color={selectedCompany.color} />
                <MetricCard icon={<TrendingUp className="w-4 h-4" />} label="Capex Growth" value={selectedCompany.capexGrowth} color={selectedCompany.color} />
                <MetricCard icon={<Building2 className="w-4 h-4" />} label="Market Cap" value={selectedCompany.marketCap} color={selectedCompany.color} />
                <MetricCard icon={<Server className="w-4 h-4" />} label={isLive ? "Stock Price · live" : "Stock Price · reference"} value={selectedCompany.stockPrice} color={selectedCompany.color} />
              </div>

              {/* Financial details */}
              <div className="rounded-xl border border-border/30 overflow-hidden">
                <div className="px-4 py-2.5 bg-accent/20 border-b border-border/30">
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-wider">Financial Profile</h3>
                </div>
                <div className="divide-y divide-border/20">
                  <FinancialRow label="Revenue" value={selectedCompany.revenue} />
                  <FinancialRow label="Revenue Growth" value={selectedCompany.revenueGrowth} />
                  <FinancialRow label="Cloud/DC Revenue" value={selectedCompany.cloudDCRevenue} />
                  <FinancialRow label="On-Balance Liabilities" value={selectedCompany.totalLiabilities} />
                  <FinancialRow label="Off-Balance Sheet" value={selectedCompany.offBalanceSheet} highlight />
                  <FinancialRow label="2026 Debt Issued" value={selectedCompany.debtIssued2026} />
                  <FinancialRow label="FCF Status" value={selectedCompany.fcfStatus} highlight />
                </div>
              </div>

              {/* Strategic position */}
              <div>
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Strategic Position</h3>
                <p className="text-sm text-foreground/90 leading-relaxed">{selectedCompany.strategicPosition}</p>
              </div>

              {/* AI Infrastructure Role */}
              <div className="p-4 rounded-xl border border-border/30 bg-accent/10">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4" style={{ color: selectedCompany.color }} />
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-wider" style={{ color: selectedCompany.color }}>AI Infrastructure Role</h3>
                </div>
                <p className="text-sm text-foreground/80">{selectedCompany.aiInfraRole}</p>
              </div>

              {/* Risks and Catalysts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-[oklch(0.65_0.2_25)]" />
                    <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[oklch(0.65_0.2_25)]">Key Risks</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {selectedCompany.risks.map((risk, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-[oklch(0.65_0.2_25)] mt-1.5 shrink-0" />
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-[oklch(0.7_0.15_155)]" />
                    <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[oklch(0.7_0.15_155)]">Catalysts</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {selectedCompany.catalysts.map((catalyst, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-[oklch(0.7_0.15_155)] mt-1.5 shrink-0" />
                        {catalyst}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MetricCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="p-3 rounded-lg border border-border/30 bg-accent/10">
      <div className="flex items-center gap-1.5 mb-1">
        <span style={{ color }}>{icon}</span>
        <span className="text-fluid-xs font-mono text-muted-foreground uppercase">{label}</span>
      </div>
      <div className="font-mono text-sm font-bold" style={{ color }}>{value}</div>
    </div>
  );
}

function FinancialRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-4 py-2.5 ${highlight ? "bg-[oklch(0.65_0.2_25_/_0.05)]" : ""}`}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-xs font-mono font-medium ${highlight ? "text-[oklch(0.65_0.2_25)]" : "text-foreground"}`}>{value}</span>
    </div>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const width = 100;
  const height = 24;
  const padding = 2;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(" L ")}`;
  // Area fill path
  const areaD = `${pathD} L ${padding + ((data.length - 1) / (data.length - 1)) * (width - padding * 2)},${height - padding} L ${padding},${height - padding} Z`;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
      {/* Area fill */}
      <path d={areaD} fill={color} opacity={0.1} />
      {/* Line */}
      <path d={pathD} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* End dot */}
      <circle
        cx={padding + ((data.length - 1) / (data.length - 1)) * (width - padding * 2)}
        cy={height - padding - ((data[data.length - 1] - min) / range) * (height - padding * 2)}
        r={2.5}
        fill={color}
      />
    </svg>
  );
}
