import { ExternalLink } from "lucide-react";

const sources = [
  {
    category: "Primary Research Firms",
    items: [
      { name: "Gartner AI Spending Forecast (May 2026)", detail: "Worldwide AI spending $2.59T; Total IT $6.31T; AI agents $206.5B", url: "https://www.gartner.com/en/newsroom/press-releases/2026-05-19-gartner-forecasts-worldwide-ai-spending-to-grow-47-percent-in-2026" },
      { name: "Gartner DC Electricity Demand (Jun 10, 2026)", detail: "565 TWh in 2026 (+26%); AI servers 175 TWh; >1,200 TWh by 2030", url: "https://www.gartner.com/en/newsroom/press-releases/2026-06-10-gartner-says-data-center-electricity-demand-to-grow-26-percent-in-2026" },
      { name: "Dell'Oro Group DC Capex Report (Jun 2026)", detail: "Global DC capex raised above $1T for 2026; $1.7T by 2030", url: "https://www.delloro.com/news/ai-infrastructure-buildouts-and-memory-cost-inflation-drove-data-center-capex-higher-in-1q-2026/" },
      { name: "TrendForce CoWoS Analysis (Jun 2026)", detail: "Supply-demand gap narrowing from 20% to 10% by end-2026", url: "https://www.trendforce.com/news/2026/06/15/news-tsmc-cowos-supply-demand-gap-reportedly-seen-narrowing-from-20-to-10-by-end-2026-as-capacity-expands/" },
      { name: "IDC Worldwide AI Spending Guide (Aug 2024)", detail: "AI market $632B by 2028; GenAI $202B by 2028 (59.2% CAGR)", url: "https://www.businesswire.com/news/home/20240819177906/en/" },
      { name: "Synergy Research Group (Q1 2026)", detail: "Cloud infra services $129B/quarter (+35% YoY)", url: "https://www.srgresearch.com" },
    ],
  },
  {
    category: "Company Earnings & Filings",
    items: [
      { name: "NVIDIA Q1 FY2027 Results (May 2026)", detail: "Revenue $81.6B; DC $75.2B (+92%); Q2 guidance $91B; ACIE $37B (+31% QoQ); Networking $14.8B (+199%)", url: "https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-first-quarter-fiscal-2027" },
      { name: "CoreWeave Q1 2026 Earnings (CRWV)", detail: "Revenue $2.08B (+112%); $99.4B backlog; $31-35B capex; EBITDA $1.15B (56% margin); Net debt $17.3B", url: "https://www.sec.gov/Archives/edgar/data/1769628/000176962826000220/coreweave1q26earningspress.htm" },
      { name: "Nebius Q1 2026 Earnings (NBIS)", detail: "Revenue $399M (+684%); Meta deal $27B (5yr); Nvidia $2B investment; 800MW-1GW power target", url: "https://nebius.com/newsroom/nebius-signs-new-ai-infrastructure-agreement-with-meta" },
      { name: "Microsoft Q3 FY2026 Earnings", detail: "AI ARR $37B (+123%); $190B CY2026 capex (+61%); Azure +40%; Cloud margin 67.6%", url: "https://www.cnbc.com/2026/04/29/microsoft-msft-q3-earnings-report-2026.html" },
      { name: "Alphabet Q1 2026 Earnings", detail: "Cloud +63% to $20B/Q; $460B+ backlog; FY2026 capex raised $180-190B; capacity-constrained", url: "https://futurumgroup.com/insights/alphabet-q1-fy-2026-ai-demand-surges-as-cloud-capacity-caps-growth/" },
      { name: "Amazon Q1 2026 Earnings", detail: "AWS +28%; Q1 capex $43.2B (+77%); $200B full-year; AWS OI $14.2B; Trainium direct sales", url: "https://ir.aboutamazon.com/news-release/news-release-details/2026/Amazon-com-Announces-First-Quarter-Results/default.aspx" },
      { name: "Oracle Q4 FY2026 Earnings (Jun 10, 2026)", detail: "RPO $638B (+363%); OCI +93% to $5.8B; Capex $55.7B; FCF -$23.7B; $40B raise planned", url: "https://investor.oracle.com/investor-news/news-details/2026/Oracle-Announces-Record-Q4-and-FY-2026-Results-Driven-by-Cloud-Infrastructure--Cloud-Applications/default.aspx" },
      { name: "Meta Infrastructure Buildout (Jul 2026)", detail: "$22B/GW build cost; 14GW by 2027; Iris chip Sept 2026; Meta Compute launch", url: "https://www.reuters.com/world/asia-pacific/meta-put-ai-chip-into-production-september-it-looks-double-computing-capacity-2026-07-09/" },
      { name: "AMD Q1 2026 Earnings", detail: "DC $5.78B (+57%); MI400 $12B AI GPU target; 46.2% x86 share", url: "https://ir.amd.com" },
    ],
  },
  {
    category: "SpaceX / xAI",
    items: [
      { name: "SpaceX IPO (NASDAQ: SPCX) Jun 12, 2026", detail: "$75B raised at $135/share; opened $150; ~$2.0T market cap", url: "https://www.cnbc.com" },
      { name: "SpaceX $25B Bond Deal (Jun 23, 2026)", detail: "Investment-grade bonds; $89B demand; replacing pre-IPO debt", url: "https://www.reuters.com" },
      { name: "Morningstar/Klover SpaceX Analysis (2026)", detail: "$20.7B capex; orbital compute plans; infrastructure economics", url: "https://www.klover.ai/xai_spacex_ipo_infrastructure_economics_of_compute_supply_chain_indepth_analysis_2026/" },
      { name: "xAI Colossus Cluster", detail: "200,000 H100 GPUs; world's largest single deployment", url: "https://x.ai" },
    ],
  },
  {
    category: "Investment Banks & Contrarian Evidence",
    items: [
      { name: "Goldman Sachs AI Capex & S&P 500 Target (Jun 29, 2026)", detail: "$800B total AI capex; $670B cloud alone; S&P target 8,000; 24% EPS growth from AI; half of earnings growth AI-driven", url: "https://www.goldmansachs.com" },
      { name: "Forbes: AI Capex-to-Revenue Gap (Jun 2, 2026)", detail: "$600B gap widening; 46% divergence; exceeds 2001 telecom bubble's 32%", url: "https://www.forbes.com/sites/jasonkirsch/2026/06/02/the-ai-capex-to-revenue-gap-is-widening/" },
      { name: "Man Group: AI Boom or Bubble? (Jun 2026)", detail: "$330B debt matures by 2028; 5.5x dot-com peak; 4/5 hyperscalers underperforming on spreads", url: "https://www.man.com" },
      { name: "Samsung $648B AI Capex Blueprint (Jun 2026)", detail: "1,000 trillion won over 10 years; competing on advanced packaging leadership", url: "https://www.moneycontrol.com" },
      { name: "J.P. Morgan: $650B Revenue Needed (Jun 2026)", detail: "Need $650B new annual revenue for 10% return; Bain: $2T by 2030; implied payback 7.6 years", url: "https://www.jpmorgan.com" },
      { name: "Gradient Flow: Bear Case for AI Data Centers", detail: "CoreWeave $740M Q1 loss; GPU rental price dynamics; ROI concerns", url: "https://gradientflow.com/the-bear-case-for-ai-data-centers/" },
      { name: "WSJ: Corporate America Rationing AI (May 28, 2026)", detail: "18% token→product rate; $500M single-month spend; budget backlash", url: "https://www.wsj.com" },
      { name: "Forrester Enterprise AI Survey (Jun 2026)", detail: "25% postponing AI spend to 2027; ROI 'severely lagging'", url: "https://www.forrester.com" },
      { name: "Bain & Company AI Survey (Jun 2026)", detail: "40% miss savings targets; only 7% autonomous agents in production", url: "https://www.bain.com" },
      { name: "Fed Financial Stability Report (Jun 2026)", detail: "AI flagged as 'top systemic risk'; concentration concerns", url: "https://www.federalreserve.gov" },
      { name: "Moody's Ratings: $662B Off-Balance Sheet (Feb 2026)", detail: "Top 5 hyperscalers; 113% of adjusted debt; leases not yet commenced", url: "https://finance.yahoo.com/news/moody-flags-662-billion-risk-081000616.html" },
      { name: "247WallSt: No Longer Enough Cash for AI (Jun 2026)", detail: "FCF crosses zero Q3 2026; $400B+ borrowing; off-balance nearing $1T", url: "https://247wallst.com/investing/2026/06/17/bad-news-for-nvidia-amazon-and-microsoft-theres-no-longer-enough-cash-for-ai/" },
      { name: "Epoch AI: Capex vs Cash Flow Model", detail: "Capex growing 70% YoY vs cash flow 23% YoY; aggregate FCF → zero", url: "https://epoch.ai" },
      { name: "Morgan Stanley Hyperscaler Debt Report (2026)", detail: "$400B+ borrowing in 2026; double 2025's $165B; IG index weighting 2x", url: "https://www.morganstanley.com" },
    ],
  },
  {
    category: "Energy & Power Grid",
    items: [
      { name: "DOE Grid Connection Analysis", detail: "69 GW needed, 10 GW achievable = 85% shortfall; energization delays", url: "https://www.energy.gov" },
      { name: "Rep. Pallone National Moratorium Call (Jun 25, 2026)", detail: "Proposed moratorium on AI data center construction", url: "https://pallone.house.gov" },
      { name: "IEA Data Centre Energy Report (2026)", detail: "Global DC electricity >1,200 TWh by 2030; rank 6th as 'country'", url: "https://www.iea.org" },
      { name: "Nuclear SMR Development Status", detail: "80+ designs; $900M DOE funding; not operational until 2030+", url: "https://www.energy.gov/ne" },
      { name: "AI Data Center Capacity Crisis (Apr-Jun 2026)", detail: "30-50% of 2026 DCs delayed; 11 GW no construction; transformers 3-5yr lead; switchgear sold out 2028", url: "https://www.theaiconsultingnetwork.com/blog/ai-data-center-capacity-crisis-power-grid-cre-investors-2026" },
      { name: "PJM Capacity Market Spike (2026)", detail: "Prices nearly 10x; retail electricity +42% since 2019; 2,600 GW interconnection queue backlog", url: "https://www.linkedin.com/posts/axecompute_the-power-problem-how-data-center-energy-activity-7462155050153418752-SRZ7" },
    ],
  },
  {
    category: "Geopolitical & Market Data",
    items: [
      { name: "IISS/Brookings Gulf AI Infrastructure", detail: "Saudi PIF $40B+; UAE pursuing 'technological sovereignty'", url: "https://www.iiss.org" },
      { name: "Fortune Business Insights - Sovereign Cloud", detail: "$195B (2026) to $1,318B (2034) at 27% CAGR", url: "https://www.fortunebusinessinsights.com/sovereign-cloud-market-112386" },
      { name: "OECD VC Investment Report (Feb 2026)", detail: "Global AI VC funding $258-270B in 2025; 65% of US VC", url: "https://www.oecd.org" },
      { name: "Yahoo Finance API (Jun 2026)", detail: "Live stock data: NVDA, CRWV, NBIS, MSFT, GOOGL, AMZN, META, AMD", url: "https://finance.yahoo.com" },
      { name: "Omdia/SIA Semiconductor Report (Jun 2026)", detail: "Q1'26 $319B quarterly; March $99.5B monthly (+79% YoY)", url: "https://omdia.tech.informa.com" },
      { name: "TrendForce: TSMC CoWoS Scaling (Jun 2026)", detail: "120-140K WPM by end-2026; supply gap 20%→10%; aggressive capacity expansion", url: "https://www.trendforce.com/news/2026/06/15/news-tsmc-cowos-supply-demand-gap-reportedly-seen-narrowing-from-20-to-10-by-end-2026-as-capacity-expands/" },
      { name: "Broadcom Q2 FY26 AI Revenue (Jul 2026)", detail: "AI semi revenue $10.8B (+143% YoY); 5th custom ASIC customer ($1B); Apple extended to 2031", url: "https://www.trefis.com/data/companies/AVGO" },
      { name: "Gartner Semiconductor Forecast (Jul 2026)", detail: "Worldwide semi revenue to exceed $1.3T in 2026 (+64% YoY)", url: "https://newmarketpitch.com/blogs/news/semiconductor-is-growing" },
    ],
  },
];

export function SourcesSection() {
  return (
    <section id="sources" className="py-24">
      <div className="container max-w-5xl">
        <p className="text-muted-foreground mb-12 max-w-3xl">
          {sources.reduce((acc, g) => acc + g.items.length, 0)} sources across {sources.length} categories.
          All data verified through multi-source cross-validation.
          Updated July 12, 2026.
        </p>

        {/* Sources grid */}
        <div className="space-y-8">
          {sources.map((group, gi) => (
            <div key={gi}>
              <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">{group.category}</h3>
              <div className="space-y-2">
                {group.items.map((item, ii) => (
                  <a
                    key={ii}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-3 p-3 rounded-lg border border-border/30 bg-card/20 hover:bg-card/40 hover:border-border/50 transition-[transform,opacity,border-color,background-color] duration-200"
                  >
                    <ExternalLink className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0 group-hover:text-foreground transition-colors" />
                    <div>
                      <span className="text-sm text-foreground/90 group-hover:text-foreground transition-colors">{item.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">{item.detail}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-12 p-4 rounded-lg border border-border/20 bg-card/10">
          <p className="text-fluid-xs font-mono text-muted-foreground/60 leading-relaxed">
            Disclaimer: This analysis synthesizes publicly available data from the sources listed above.
            Projections are based on research firm estimates and company guidance as of June 2026.
            Actual outcomes may differ materially. This is not investment advice. Weekly auto-refresh configured.
          </p>
        </div>
      </div>
    </section>
  );
}
