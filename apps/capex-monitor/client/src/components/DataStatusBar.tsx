import { ArrowRight, Database, Landmark, Zap } from "lucide-react";

const statusCards = [
  {
    label: "Capacity / capex",
    value: "240 MW",
    detail: "CoreWeave announced a Navi Mumbai buildout, with a further 240 MW expansion option.",
    note: "Planned · first phase mid-2028",
    icon: Zap,
    tone: "text-[var(--signal-gold)]",
  },
  {
    label: "Debt / financing",
    value: "In discussion",
    detail: "Oracle was reported to be discussing chip-purchase financing; no completed financing or amount was disclosed.",
    note: "Reported · not a completed deal",
    icon: Landmark,
    tone: "text-destructive",
  },
  {
    label: "Power availability",
    value: "2,100+ MW",
    detail: "PJM accepted its first expedited interconnection projects for a mid-2029 target.",
    note: "Accepted · not near-term capacity",
    icon: Database,
    tone: "text-[var(--signal-cyan)]",
  },
] as const;

/**
 * Makes the distinction between the monitor's research baseline and its
 * source-verified current-week developments visible before users interpret
 * the longer capex and credit models below.
 */
export function DataStatusBar() {
  return (
    <section className="border-b border-border/50 bg-[var(--recessed)]/55" aria-labelledby="data-status-title">
      <div className="container max-w-7xl py-8 sm:py-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="observatory-kicker text-[var(--signal-gold)]">Research refresh · October 11, 2026</p>
            <h2 id="data-status-title" className="mt-2 font-serif text-3xl leading-none tracking-[-0.035em] text-foreground sm:text-4xl">
              Capex and credit: updated without inventing revisions.
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              This week&apos;s source-checked pass found a small number of capacity and financing developments. Where issuers disclosed no new capex or debt figures, the monitor retains the prior baseline rather than presenting old estimates as fresh news.
            </p>
          </div>
          <a href="#changelog" className="inline-flex min-h-10 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--signal-gold)] transition-colors duration-150 hover:text-foreground">
            Review the dated source log <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {statusCards.map(({ label, value, detail, note, icon: Icon, tone }) => (
            <article key={label} className="observatory-panel p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
                <Icon className={`h-4 w-4 shrink-0 ${tone}`} aria-hidden="true" />
              </div>
              <p className={`mt-5 font-mono text-2xl font-semibold tracking-tight ${tone}`}>{value}</p>
              <p className="mt-2 text-sm leading-5 text-foreground/85">{detail}</p>
              <p className="mt-3 border-t border-border/50 pt-3 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">{note}</p>
            </article>
          ))}
        </div>

        <p className="mt-4 font-mono text-[10px] leading-5 text-muted-foreground">
          No current-week capex or debt-guidance revision was verified for NVIDIA, Nebius, Amazon, Microsoft, Alphabet, or Meta. Live equity prices refresh separately from Yahoo Finance every five minutes.
        </p>
      </div>
    </section>
  );
}
