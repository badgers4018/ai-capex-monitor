import { useEffect, useState } from "react";
import { AlertTriangle, Clock, TrendingDown } from "lucide-react";

const TARGET_DATE = new Date("2026-09-15T00:00:00Z");

function calculateTimeRemaining() {
  const diff = TARGET_DATE.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    expired: false,
  };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex min-w-0 flex-col items-center">
      <div className="font-mono text-2xl font-semibold tabular-nums text-foreground sm:text-4xl">{String(value).padStart(2, "0")}</div>
      <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">{label}</div>
    </div>
  );
}

export function FCFCountdown() {
  const [time, setTime] = useState(calculateTimeRemaining());

  useEffect(() => {
    const interval = window.setInterval(() => setTime(calculateTimeRemaining()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="observatory-panel relative overflow-hidden border-destructive/50 bg-[linear-gradient(110deg,rgb(74_24_25_/_0.52),var(--panel)_45%,var(--panel))]" aria-labelledby="fcf-countdown-title">
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" /><div><p className="observatory-kicker text-destructive">Balance-sheet signal</p><h3 id="fcf-countdown-title" className="mt-1 font-mono text-sm font-bold uppercase tracking-wider text-foreground">FCF zero-crossing model</h3></div></div>
          <span className="observatory-risktag inline-flex shrink-0 px-2 py-1">{time.expired ? "Model point reached" : "Live countdown"}</span>
        </div>

        {time.expired ? (
          <div className="my-6 rounded-[var(--radius-sm)] border border-destructive/30 bg-destructive/10 px-4 py-5 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-destructive">Model date reached</p>
            <p className="mt-2 font-serif text-3xl leading-none tracking-[-0.035em] text-foreground">Revalidate the cash-flow thesis.</p>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">The Sep. 15, 2026 zero-crossing was a model reference point—not a live reported aggregate. The current research refresh now flags it as a baseline that requires updated company cash-flow and capex disclosures.</p>
          </div>
        ) : (
          <div className="my-6 flex items-center justify-center gap-3 sm:gap-5">
            <CountdownUnit value={time.days} label="Days" />
            <span className="font-mono text-xl text-destructive/70 sm:text-2xl">:</span>
            <CountdownUnit value={time.hours} label="Hours" />
            <span className="font-mono text-xl text-destructive/70 sm:text-2xl">:</span>
            <CountdownUnit value={time.minutes} label="Min" />
            <span className="font-mono text-xl text-destructive/70 sm:text-2xl">:</span>
            <CountdownUnit value={time.seconds} label="Sec" />
          </div>
        )}

        <div className="flex flex-col items-start gap-3 rounded-[var(--radius-sm)] border border-border/50 bg-[var(--recessed)] p-3 sm:flex-row sm:items-center">
          <TrendingDown className="h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
          <p className="text-sm leading-6 text-muted-foreground">Aggregate Big 8 free cash flow is projected to cross zero by mid-Q3 2026. After that point, incremental AI infrastructure spend relies on debt funding rather than internally generated cash.</p>
        </div>

        <dl className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
          <div className="rounded-[var(--radius-sm)] bg-[var(--recessed)] p-2 text-center"><dt className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">Capex growth</dt><dd className="mt-1 font-mono text-sm font-semibold text-foreground">70%</dd></div>
          <div className="rounded-[var(--radius-sm)] bg-[var(--recessed)] p-2 text-center"><dt className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">Cash-flow growth</dt><dd className="mt-1 font-mono text-sm font-semibold text-foreground">23%</dd></div>
          <div className="rounded-[var(--radius-sm)] bg-[var(--recessed)] p-2 text-center"><dt className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">2026 borrowing</dt><dd className="mt-1 font-mono text-sm font-semibold text-destructive">$400B+</dd></div>
        </dl>

        <div className="mt-4 flex items-start gap-2 border-t border-border/40 pt-3"><Clock className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" aria-hidden="true" /><p className="font-mono text-[10px] leading-5 text-muted-foreground">Source: Epoch AI, Morgan Stanley, 247WallSt · Target: Sept 15, 2026 (mid-Q3) · Countdown is a model estimate.</p></div>
      </div>
    </section>
  );
}
