import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Check, Loader2 } from "lucide-react";

export function ExportPanel() {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);

  const handleExport = async (type: string) => {
    setDownloading(type);

    // Generate the content based on type
    if (type === "excel") {
      // Direct download from storage
      const a = document.createElement("a");
      a.href = "/manus-storage/Tech_Spending_Analysis_Jul3_2026_9806ff8b.xlsx";
      a.download = "Tech_Spending_Analysis_Jul3_2026.xlsx";
      a.click();
    } else if (type === "csv") {
      generateCSV();
    } else if (type === "json") {
      generateJSON();
    } else if (type === "markdown") {
      generateMarkdown();
    }

    // Simulate brief processing time for UX
    await new Promise((resolve) => setTimeout(resolve, 800));
    setDownloading(null);
    setCompleted((prev) => [...prev, type]);
    setTimeout(() => setCompleted((prev) => prev.filter((t) => t !== type)), 3000);
  };

  return (
    <div className="rounded-xl border border-border/30 bg-card/30 backdrop-blur-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-[oklch(0.7_0.15_155)]" />
          <h3 className="font-mono text-sm font-semibold">Export Analysis</h3>
        </div>
        <span className="text-fluid-xs font-mono text-muted-foreground">Top 9 · 34 Data Points · Jul 12, 2026</span>
      </div>

      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <ExportButton
          icon={<FileSpreadsheet className="w-5 h-5" />}
          label="Excel (.xlsx)"
          description="3-sheet workbook: prices, capex data, weekly changes"
          type="excel"
          downloading={downloading}
          completed={completed}
          onExport={handleExport}
          color="oklch(0.7 0.18 155)"
        />
        <ExportButton
          icon={<FileSpreadsheet className="w-5 h-5" />}
          label="Spreadsheet (CSV)"
          description="Full dataset with all metrics, liabilities, and projections"
          type="csv"
          downloading={downloading}
          completed={completed}
          onExport={handleExport}
          color="oklch(0.7 0.15 155)"
        />
        <ExportButton
          icon={<FileText className="w-5 h-5" />}
          label="Report (Markdown)"
          description="Complete narrative analysis with sources and citations"
          type="markdown"
          downloading={downloading}
          completed={completed}
          onExport={handleExport}
          color="oklch(0.7 0.15 240)"
        />
        <ExportButton
          icon={<FileText className="w-5 h-5" />}
          label="Raw Data (JSON)"
          description="Structured data for programmatic use and integrations"
          type="json"
          downloading={downloading}
          completed={completed}
          onExport={handleExport}
          color="oklch(0.75 0.15 70)"
        />
      </div>
    </div>
  );
}

function ExportButton({
  icon,
  label,
  description,
  type,
  downloading,
  completed,
  onExport,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  type: string;
  downloading: string | null;
  completed: string[];
  onExport: (type: string) => void;
  color: string;
}) {
  const isDownloading = downloading === type;
  const isCompleted = completed.includes(type);

  return (
    <button
      onClick={() => onExport(type)}
      disabled={isDownloading}
      className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-border/30 bg-card/20 hover:bg-card/40 hover:border-border/60 transition-[transform,opacity,border-color,background-color] duration-200 active:scale-[0.97] disabled:opacity-60"
    >
      <div className="p-2 rounded-lg bg-accent/20 group-hover:bg-accent/40 transition-colors" style={{ color }}>
        {isDownloading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isCompleted ? (
          <Check className="w-5 h-5 text-green-400" />
        ) : (
          icon
        )}
      </div>
      <span className="font-mono text-xs font-semibold text-foreground">{label}</span>
      <span className="text-fluid-xs text-muted-foreground text-center leading-tight">{description}</span>
    </button>
  );
}

// --- Export generators ---

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function generateCSV() {
  const headers = [
    "Rank", "Company", "Ticker", "2026 Capex ($B)", "2025 Capex ($B)", "Capex Growth",
    "Market Cap", "Stock Price", "Revenue (FY2026E)", "Revenue Growth",
    "Cloud/DC Revenue", "On-Balance Liabilities", "Off-Balance Sheet",
    "2026 Debt Issued", "FCF Status", "AI Infrastructure Role"
  ];

  const rows = [
    [1, "Amazon", "AMZN", 200, 100, "+100%", "$2.6T", "$245.57", "$700B+", "+12%", "$37.6B/qtr AWS", "$380B", "$200B", "$50B", "Negative Q1 2026", "Largest cloud provider"],
    [2, "Microsoft", "MSFT", 190, 55, "+245%", "$2.8T", "$385.62", "$280B+", "+15%", "$34.7B/qtr IC", "$273B", "$170B", "$45B", "5:1 capex/revenue ratio", "Azure + OpenAI partner"],
    [3, "Alphabet", "GOOGL", 185, 50, "+270%", "$2.2T", "$363.87", "$420B+", "+14%", "$20B/qtr Cloud", "$135B", "$95B", "$85B", "Positive but declining", "GCP + TPU + DeepMind"],
    [4, "Meta", "META", 130, 72, "+81%", "$1.5T", "$592.53", "$220B+", "+20%", "Internal AI", "$95B", "$120B", "$30B", "Positive (ad-funded)", "Internal AI + Llama"],
    [5, "Oracle", "ORCL", 50, 16, "+213%", "$420B", "$142.54", "$67.4B", "+17%", "$5.8B/qtr OCI", "$145B", "$77B", "$43B", "Negative $24B FCF", "OCI + sovereign cloud"],
    [6, "SpaceX", "SPCX", 21, 20.7, "+50%", "$2.0T", "$152.80", "$15B+", "+60%", "$7.5B Starlink", "$35B", "$15B", "$100B (IPO+bonds)", "Positive from Starlink", "Orbital compute + xAI"],
    [7, "NVIDIA", "NVDA", 12, 8, "+50%", "$4.8T", "$196.52", "$330B+", "+55%", "$81.6B/qtr DC", "$45B", "$20B", "$10B", "Massively positive $50B+/qtr", "GPU monopoly (90%+)"],
    [8, "CoreWeave", "CRWV", 33, 8, "+313%", "$43B", "$86.61", "$12.67B", "+112%", "$2.08B/qtr GPU-aaS", "$12B", "$45B", "$3.25B", "Negative (-$740M Q1)", "#1 Neocloud / Nasdaq-100"],
    [9, "Nebius", "NBIS", 12, 3, "+300%", "$37B", "$220.23", "$5-7B ARR", "+684%", "$399M/qtr AI Cloud", "$8B", "$12B", "$5B", "Profitable ($584M net)", "EU Neocloud / Nasdaq-100"],
  ];

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))
  ].join("\n");

  // Add summary rows
  const summary = `\n\n"SUMMARY"\n"Total Top 8 Capex 2026","$846B+"\n"Big 8 Total Liabilities (on+off)","$1.6T+"\n"Moody's Off-Balance Sheet","$662B"\n"FCF Zero Crossing","Q3 2026 (Epoch AI)"\n"Power Shortfall","85% (DOE)"\n"Total AI Market 2026","$2.59T (Gartner)"\n\n"SOURCES"\n"Gartner IT Spending Forecast (May 2026)"\n"Goldman Sachs AI Capex Report (Jun 2026)"\n"Epoch AI FCF Model"\n"Moody's Ratings Off-Balance Sheet (Feb 2026)"\n"Company quarterly earnings (Q1 2026)"\n"Yahoo Finance (Jul 12, 2026)"`;

  downloadFile(csvContent + summary, "Tech_Spending_Top8_Analysis_June2026.csv", "text/csv");
}

function generateJSON() {
  const data = {
    title: "Top 8 AI Infrastructure Spending Analysis",
    date: "July 12, 2026",
    methodology: "10-member AI Council + Multi-Source Cross-Validation",
    summary: {
      totalTop8Capex2026: "$846B+",
      big8TotalLiabilities: "$1.6T+",
      moodysOffBalanceSheet: "$662B",
      fcfZeroCrossing: "Q3 2026",
      powerShortfall: "85%",
      totalAIMarket2026: "$2.59T",
      bindingConstraint: "Electricity: not money, not chips",
    },
    companies: [
      { rank: 1, name: "Amazon", ticker: "AMZN", capex2026: "$200B", marketCap: "$2.6T", cloudRevenue: "$37.6B/qtr", liabilities: { onBalance: "$380B", offBalance: "$200B", debtIssued2026: "$50B" } },
      { rank: 2, name: "Microsoft", ticker: "MSFT", capex2026: "$190B", marketCap: "$2.8T", cloudRevenue: "$34.7B/qtr", liabilities: { onBalance: "$273B", offBalance: "$170B", debtIssued2026: "$45B" } },
      { rank: 3, name: "Alphabet", ticker: "GOOGL", capex2026: "$185B", marketCap: "$2.2T", cloudRevenue: "$20B/qtr", liabilities: { onBalance: "$135B", offBalance: "$95B", debtIssued2026: "$85B" } },
      { rank: 4, name: "Meta", ticker: "META", capex2026: "$130B", marketCap: "$1.5T", cloudRevenue: "Internal", liabilities: { onBalance: "$95B", offBalance: "$120B", debtIssued2026: "$30B" } },
      { rank: 5, name: "Oracle", ticker: "ORCL", capex2026: "$50B", marketCap: "$420B", cloudRevenue: "$5.8B/qtr", liabilities: { onBalance: "$145B", offBalance: "$77B", debtIssued2026: "$43B" } },
      { rank: 6, name: "SpaceX", ticker: "SPCX", capex2026: "$21B", marketCap: "$2.0T", cloudRevenue: "$7.5B Starlink", liabilities: { onBalance: "$35B", offBalance: "$15B", debtIssued2026: "$100B" } },
      { rank: 7, name: "NVIDIA", ticker: "NVDA", capex2026: "$12B", marketCap: "$5.2T", cloudRevenue: "$81.6B/qtr DC", liabilities: { onBalance: "$45B", offBalance: "$20B", debtIssued2026: "$10B" } },
      { rank: 8, name: "CoreWeave", ticker: "CRWV", capex2026: "$31-35B", marketCap: "$57.7B", cloudRevenue: "$2.08B/qtr GPU-aaS", liabilities: { onBalance: "$12B", offBalance: "$45B", debtIssued2026: "$3.25B" } },
      { rank: 9, name: "Nebius", ticker: "NBIS", capex2026: "$10-12B", marketCap: "$45B", cloudRevenue: "$399M/qtr AI Cloud", liabilities: { onBalance: "$8B", offBalance: "$12B", debtIssued2026: "$5B" } },
    ],
    keyFindings: [
      "Jevons Paradox: AI cost per token fell 280x in 3 years, yet total spending accelerates",
      "Power is THE binding constraint: 85% shortfall (69 GW needed, 10 GW achievable)",
      "Aggregate Big 8 FCF crosses zero in Q3 2026: all incremental spending becomes debt-funded",
      "Moody's: $662B in off-balance sheet DC leases across top 5 hyperscalers",
      "SpaceX orbital compute could bypass ground power constraint by 2030+",
      "Enterprise backlash: 25% postponing AI spend to 2027 (Forrester)",
    ],
    feedbackLoops: [
      "Jevons Efficiency Paradox: Cheaper inference → More use cases → More compute → More GPUs → More DCs → More power",
      "Capex-Revenue Spiral: Hyperscaler capex → GPU buys → NVIDIA R&D → Better GPUs → More efficiency → More demand",
      "Geopolitical Duplication: US-China tensions → Export controls → Sovereign mandates → 2-3x infrastructure spending",
      "Power-Location Constraint: Grid limits → DCs where power exists → Need Starlink → SpaceX demand → Orbital compute",
      "Financial Leverage Spiral: Cheap debt → More DC capacity → Falling GPU rental prices → Need more scale → More debt",
      "Enterprise Backlash Loop: High AI costs → Budget rationing → Price cuts → More adoption → Higher total spend",
    ],
    sources: [
      "Gartner IT Spending Forecast (May 2026)",
      "Goldman Sachs AI Capex Report (Jun 2026)",
      "Epoch AI: Capex vs Cash Flow Model",
      "Moody's Ratings: $662B Off-Balance Sheet (Feb 2026)",
      "Dell'Oro Group: Data Center Capex (Q1 2026)",
      "CoreWeave Q1 2026 Earnings / $99.4B Backlog",
      "Nebius Q1 2026 Earnings / 684% Growth",
      "Company quarterly earnings (Q1 2026)",
      "Yahoo Finance (Jul 12, 2026)",
      "SpaceX S-1 Filing / IPO (Jun 12, 2026)",
      "DOE Grid Connection Analysis",
    ],
  };

  downloadFile(JSON.stringify(data, null, 2), "Tech_Spending_Top8_Analysis_June2026.json", "application/json");
}

function generateMarkdown() {
  const md = `# Top 8 AI Infrastructure Spending Analysis
## July 12, 2026 | 10 AI Experts · 34 Data Points

---

## Executive Summary

The Top 9 infrastructure spenders: Amazon, Microsoft, Alphabet, Meta, Oracle, SpaceX, NVIDIA, CoreWeave, and Nebius: are committing **$850B+ in 2026 capex**. The key finding: **electricity: not money, not chips: is the binding constraint**.

Aggregate Big 8 free cash flow is projected to cross zero by mid-Q3 2026 (Epoch AI), meaning all incremental AI infrastructure spending after that point is debt-funded. Moody's has flagged $662B in off-balance sheet data center lease commitments. Combined on + off balance sheet liabilities exceed **$1.6 trillion**.

---

## Top 9 Capex Rankings (2026)

| Rank | Company | Ticker | 2026 Capex | Growth | Market Cap | Key Risk |
|------|---------|--------|-----------|--------|------------|----------|
| 1 | Amazon | AMZN | $200B | +100% | $2.6T | FCF negative Q1 |
| 2 | Microsoft | MSFT | $190B | +245% | $2.8T | 5:1 spend/revenue |
| 3 | Alphabet | GOOGL | $185B | +270% | $2.2T | $85B debt issued |
| 4 | Meta | META | $130B | +81% | $1.5T | No cloud revenue |
| 5 | Oracle | ORCL | $50B | +213% | $420B | -$24B FCF |
| 6 | SpaceX | SPCX | $21B | +50% | $2.0T | Newly public |
| 7 | NVIDIA | NVDA | $12B | +50% | $5.2T | Customer concentration |
| 8 | CoreWeave | CRWV | $31-35B | +313% | $57.7B | -$740M Q1 loss, 1200% D/E |
| 9 | Nebius | NBIS | $10-12B | +300% | $45B | Yandex legacy, scale |

---

## Key Findings

### Loop 1: Data Contradictions Resolved
- SpaceX IPO'd June 12 ($75B raised), $25B bonds June 23 ($89B demand)
- CoreWeave $99.4B backlog (up from $14.7B YoY), added to Nasdaq-100
- Nebius 684% revenue growth, $17.4B MSFT/Meta infrastructure deal
- NVIDIA Q1 FY2027: $81.6B revenue, Q2 guidance $91B

### Loop 2: Supply Chain Bottlenecks
- Power grid: 85% shortfall (69 GW needed, 10 GW achievable)
- Bottleneck cascade: Power → CoWoS → ABF substrates → HBM → Cooling
- Grid connection wait times exceed 4 years

### Loop 3: Earnings vs Projections
- Hyperscaler capex growing 70% YoY vs cash flow 23% YoY
- Microsoft 5:1 capex-to-incremental-revenue ratio
- Oracle negative $24B FCF, 500% debt-to-equity

### Loop 4: Non-Obvious Interdependencies
- Jevons Paradox: 280x cheaper AI → MORE total spending
- SpaceX orbital compute could bypass ground power constraint
- Circular VC financing: chipmakers fund startups that buy their chips

### Loop 5: Contrarian Evidence
- National moratorium proposed on AI data centers (Jun 25, 2026)
- 25% of enterprises postponing AI spend to 2027 (Forrester)
- Only 18% of AI coding tokens translate to shipped products

---

## Liabilities Summary

| Company | On-Balance | Off-Balance | 2026 Debt | Total |
|---------|-----------|-------------|-----------|-------|
| Amazon | $380B | $200B | $50B | $630B |
| Microsoft | $273B | $170B | $45B | $488B |
| Alphabet | $135B | $95B | $85B | $315B |
| Meta | $95B | $120B | $30B | $245B |
| Oracle | $145B | $77B | $43B | $265B |
| SpaceX | $35B | $15B | $100B | $150B |
| NVIDIA | $45B | $20B | $10B | $75B |
| CoreWeave | $12B | $45B | $3.25B | $60B |
| Nebius | $8B | $12B | $5B | $25B |
| **TOTAL** | **$1,128B** | **$734B** | **$371B** | **$2,233B** |

---

## Sources

- Gartner IT Spending Forecast (May 2026)
- Goldman Sachs AI Capex Report (Jun 2026)
- Epoch AI: Capex vs Cash Flow Model
- Moody's Ratings: $662B Off-Balance Sheet (Feb 2026)
- Dell'Oro Group: Data Center Capex (Q1 2026)
- CoreWeave Q1 2026 Earnings / $99.4B Backlog
- Nebius Q1 2026 Earnings / 684% Growth
- Company quarterly earnings (Q1 2026)
- Yahoo Finance (Jul 12, 2026)
- SpaceX S-1 Filing / IPO (Jun 12, 2026)
- DOE Grid Connection Analysis
- Gradient Flow: Bear Case for AI Data Centers
- WSJ: Corporate America Rationing AI (May 28, 2026)
- Forrester Enterprise AI Survey (Jun 2026)

---

*Generated by Tech Spending Monitor · Methodology: 10-member AI Council + Multi-Source Cross-Validation*
*Last updated: July 12, 2026*
`;

  downloadFile(md, "Tech_Spending_Top8_Analysis_June2026.md", "text/markdown");
}
