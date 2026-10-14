import { ArrowRight, CircleAlert, FileText, Gauge, Landmark, Zap } from "lucide-react";

const cycleSignals = [
  { label: "AI capex · 2026", value: "$800B", detail: "Research-model baseline", tone: "gold" },
  { label: "Revenue gap", value: "$600B", detail: "Required to clear target returns", tone: "risk" },
  { label: "Power availability", value: "15%", detail: "Of modeled need achievable", tone: "cyan" },
] as const;

const watchlist = [
  { ticker: "ORCL", label: "Debt-funded buildout", value: "−$24B FCF", risk: "Elevated" },
  { ticker: "CRWV", label: "Refinancing transmission", value: "$35B capex", risk: "High" },
  { ticker: "NVDA", label: "Demand-cycle proxy", value: "$81.6B DC revenue", risk: "Watch" },
];

export function DashboardCommandHeader() {
  return (
    <section id="overview" className="border-b border-border pt-24 sm:pt-28" aria-labelledby="dashboard-title">
      <div className="container max-w-7xl pb-8 sm:pb-10">
        <div className="flex flex-col gap-8 border-b border-border pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2"><p className="observatory-kicker text-[var(--signal-gold)]">AI Capex Monitor · Current readout</p><span className="h-3 w-px bg-border" aria-hidden="true" /><p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--signal-cyan)]"><span className="observatory-signal-dot h-1.5 w-1.5" aria-hidden="true" /> Research model · quote feed updates separately</p></div>
            <h1 id="dashboard-title" className="mt-5 max-w-3xl font-serif text-[clamp(2.6rem,5.5vw,5.25rem)] font-medium leading-[0.87] tracking-[-0.055em] text-foreground">The cost of capital is becoming the marginal constraint.</h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--ink-soft)] sm:text-base">The base case is a high plateau, not an instant collapse. Investment-grade hyperscalers can absorb the buildout; highly levered infrastructure operators must pass the refinancing test while grid access limits deployment.</p>
            <div className="mt-7 flex flex-wrap items-center gap-3"><a href="#watchlist" className="observatory-button px-5">Inspect watchlist <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></a><a href="#sources" className="observatory-button observatory-button--quiet px-5"><FileText className="h-3.5 w-3.5" aria-hidden="true" /> Sources & methodology</a></div>
          </div>
          <aside className="max-w-md border-l border-[var(--rule-strong)] pl-5" aria-label="Research scope">
            <p className="observatory-kicker">Research scope</p><p className="mt-3 text-base font-semibold text-foreground">Evidence, assumptions, and output remain separate.</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Use the evidence ledger for observed facts; scenario tools expose modeled inputs and portfolio consequences.</p>
          </aside>
        </div>

        <div className="grid divide-y divide-border border-b border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {cycleSignals.map(signal => <article key={signal.label} className="py-5 first:pt-6 sm:px-5 sm:py-6 sm:first:pl-0"><div className="flex items-center justify-between gap-3"><p className="font-mono text-[10px] uppercase tracking-[0.13em] text-muted-foreground">{signal.label}</p>{signal.tone === "risk" ? <Landmark className="h-4 w-4 text-destructive" aria-hidden="true" /> : signal.tone === "cyan" ? <Zap className="h-4 w-4 text-[var(--signal-cyan)]" aria-hidden="true" /> : <Gauge className="h-4 w-4 text-[var(--signal-gold)]" aria-hidden="true" />}</div><p className={`mt-3 font-mono text-3xl font-semibold tracking-tight ${signal.tone === "risk" ? "text-destructive" : signal.tone === "cyan" ? "text-[var(--signal-cyan)]" : "text-[var(--signal-gold)]"}`}>{signal.value}</p><p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">{signal.detail}</p></article>)}
        </div>
      </div>
      <div className="border-t border-border bg-[var(--recessed)]"><div className="container max-w-7xl"><div className="observatory-scroll-rail flex items-center gap-5 overflow-x-auto py-3" aria-label="Priority watchlist"><span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--signal-gold)]">Priority watchlist</span>{watchlist.map(item => <a key={item.ticker} href="#watchlist" className="group flex min-w-[15rem] shrink-0 items-center justify-between gap-4 border-l border-border pl-4 first:border-l-0"><div><p className="font-mono text-xs font-semibold text-foreground">{item.ticker}</p><p className="mt-1 text-xs text-muted-foreground">{item.label}</p></div><div className="text-right"><p className="font-mono text-xs text-foreground">{item.value}</p><span className={item.risk === "High" ? "observatory-risktag mt-1 inline-flex px-1.5 py-0.5" : "mt-1 inline-flex font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--signal-cyan)]"}>{item.risk}</span></div></a>)}</div></div></div>
    </section>
  );
}
