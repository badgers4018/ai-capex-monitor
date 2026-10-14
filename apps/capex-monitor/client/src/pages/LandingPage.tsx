import { useState } from "react";
import { ArrowDownRight, ArrowRight, Check, Mail, Menu, MoveRight, X } from "lucide-react";
import { toast } from "sonner";
import { BrandEditorialMasthead, BrandLockup } from "@/components/BrandMark";
import { BrandPreferences } from "@/components/BrandPreferences";
import { Footer } from "@/components/Footer";
import { ResearchMenu } from "@/components/ResearchMenu";
import { BRAND } from "@/lib/brand";
import { trpc } from "@/lib/trpc";
import { useLiveQuotes } from "@/hooks/useLiveQuotes";

const evidence = [
  {
    category: "Buildout",
    value: "$800B",
    label: "AI capital expenditure tracked for 2026",
    source: "Goldman Sachs · company guidance",
    href: "/dashboard#data",
    tone: "text-[var(--signal-gold)]",
  },
  {
    category: "Clearing price",
    value: "$600B",
    label: "Incremental revenue required to support target returns",
    source: "J.P. Morgan research",
    href: "/dashboard#strategy",
    tone: "text-destructive",
  },
  {
    category: "Physical constraint",
    value: "4+ years",
    label: "Typical grid-interconnection waiting period",
    source: "Gartner · grid research",
    href: "/dashboard#timeline",
    tone: "text-[var(--signal-cyan)]",
  },
];

const monitorStages = [
  ["Thesis", "State the proposition worth testing."],
  ["Evidence", "Inspect spend, financing, power, and revenue signals."],
  ["Assumptions", "See the inputs underpinning each scenario."],
  ["Readout", "Compare the consequence across companies and positions."],
  ["Appendix", "Trace sources, timestamps, and methodology."],
];

const baseTickers = [
  { sym: "NVDA", price: "$196.52", change: "+2.1%", up: true },
  { sym: "MSFT", price: "$385.62", change: "+3.4%", up: true },
  { sym: "GOOGL", price: "$363.87", change: "+7.9%", up: true },
  { sym: "AMZN", price: "$245.57", change: "+5.5%", up: true },
  { sym: "META", price: "$592.53", change: "+7.7%", up: true },
  { sym: "CRWV", price: "$86.61", change: "−10.3%", up: false },
  { sym: "ORCL", price: "$142.54", change: "−4.0%", up: false },
  { sym: "AMD", price: "$565.92", change: "+8.5%", up: true },
];

export default function LandingPage() {
  const [subEmail, setSubEmail] = useState("");
  const [subDone, setSubDone] = useState(() => Boolean(localStorage.getItem("techspend_subscribed")));
  const [landingMenu, setLandingMenu] = useState(false);
  const { quoteMap, isLive, fetchedAt } = useLiveQuotes();
  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: result => {
      setSubDone(true);
      localStorage.setItem("techspend_subscribed", subEmail);
      toast.success(result.alreadySubscribed ? "You’re already on the list." : "Subscribed to the weekly research digest.");
    },
    onError: err => toast.error(err.message || "Could not save your subscription. Please try again."),
  });

  const liveTickers = baseTickers.map(ticker => {
    const live = quoteMap[ticker.sym];
    if (!live) return ticker;
    const pct = live.changePct;
    return { ...ticker, price: `$${live.price.toFixed(2)}`, change: pct === null ? ticker.change : `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`, up: pct === null ? ticker.up : pct >= 0 };
  });
  const marketStamp = isLive && fetchedAt
    ? `Verified quote feed · ${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(fetchedAt))}`
    : "Research reference snapshot · Jul 12, 2026";

  function handleSubscribe(event: React.FormEvent) {
    event.preventDefault();
    if (!subEmail || !subEmail.includes("@")) {
      toast.error("Enter a valid email address to receive the weekly digest.");
      return;
    }
    subscribeMutation.mutate({ email: subEmail, source: "landing" });
  }

  return (
    <div className="observatory-shell">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-[var(--radius-sm)] focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">Skip to main content</a>

      <header className="fixed inset-x-0 top-0 z-[100] border-b border-border bg-background/95 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between gap-3">
          <BrandLockup href="/" priority />
          <nav className="hidden items-center gap-5 md:flex" aria-label="Capital Misallocation navigation">
            <ResearchMenu />
            <a href="#thesis" className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground">Thesis</a>
            <a href="#method" className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground">Method</a>
          </nav>
          <div className="flex items-center gap-2">
            <BrandPreferences />
            <a href="/dashboard" className="observatory-button hidden px-4 sm:inline-flex">Open monitor <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></a>
            <button type="button" className="brand-icon-button md:hidden" onClick={() => setLandingMenu(value => !value)} aria-expanded={landingMenu} aria-controls="landing-navigation" aria-label={landingMenu ? "Close landing navigation" : "Open landing navigation"}>{landingMenu ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}</button>
          </div>
        </div>
        {landingMenu && <div id="landing-navigation" className="border-t border-border bg-background md:hidden"><div className="container grid gap-4 py-4"><a href="/dashboard" className="observatory-button px-4">Open monitor <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></a><div className="grid grid-cols-2 gap-2"><a href="#thesis" onClick={() => setLandingMenu(false)} className="min-h-11 border-b border-border py-2 text-sm text-foreground">Thesis</a><a href="#method" onClick={() => setLandingMenu(false)} className="min-h-11 border-b border-border py-2 text-sm text-foreground">Method</a></div><ResearchMenu mobile /></div></div>}
      </header>

      <main id="main-content" className="pt-16">
        <section id="thesis" className="border-b border-border" aria-labelledby="landing-title">
          <div className="container grid min-h-[calc(100svh-4rem)] max-w-7xl items-end gap-12 py-16 sm:py-24 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16 lg:py-28">
            <div className="max-w-5xl brand-reveal">
              <BrandEditorialMasthead priority />
              <div className="mt-10 flex items-center gap-3"><span className="observatory-signal-dot" aria-hidden="true" /><p className="observatory-kicker">AI infrastructure capital cycle · research instrument</p></div>
              <h1 id="landing-title" className="mt-6 max-w-5xl font-serif text-[clamp(3.2rem,6.7vw,6.5rem)] font-medium leading-[0.86] tracking-[-0.06em] text-foreground">{BRAND.thesis}</h1>
              <p className="mt-8 max-w-2xl text-base leading-8 text-[var(--ink-soft)] sm:text-lg">An evidence-led monitor for the investment, financing, power, and return dynamics shaping AI infrastructure. Start with the contention. Follow it to the balance sheet, the grid, and the source record.</p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <a href="/dashboard" className="observatory-button px-6">Open AI Capex Monitor <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
                <a href="#readout" className="inline-flex min-h-11 items-center gap-2 border-b border-foreground/30 text-sm font-medium text-foreground transition-colors duration-150 hover:border-foreground">Read the current thesis <ArrowDownRight className="h-4 w-4" aria-hidden="true" /></a>
              </div>
            </div>
            <aside className="border-l border-[var(--rule-strong)] pl-5 pb-1 lg:mb-1" aria-label="Monitor definition">
              <p className="observatory-kicker text-[var(--signal-gold)]">AI Capex Monitor</p>
              <p className="mt-4 font-serif text-3xl leading-[0.95] tracking-[-0.04em] text-foreground">Research that makes the assumption visible.</p>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">Observed evidence, modeled assumptions, editorial inference, and scenario output are separated on purpose.</p>
            </aside>
          </div>
        </section>

        <section id="readout" className="border-b border-border bg-[var(--recessed)] py-8 sm:py-10" aria-labelledby="readout-title">
          <div className="container max-w-7xl">
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3"><div><p className="observatory-kicker text-[var(--signal-gold)]">Current readout</p><h2 id="readout-title" className="mt-2 font-serif text-3xl tracking-[-0.035em] text-foreground">Three conditions determine the clearing price.</h2></div><p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--signal-cyan)]"><span className="observatory-signal-dot h-1.5 w-1.5" aria-hidden="true" /> {marketStamp}</p></div>
            <div className="grid divide-y divide-border border-y border-border md:grid-cols-3 md:divide-x md:divide-y-0">
              {evidence.map(item => <article key={item.category} className="px-0 py-5 first:pt-0 md:px-6 md:py-0 md:first:pl-0"><p className="observatory-kicker">{item.category}</p><p className={`mt-3 font-mono text-3xl font-semibold tracking-tight ${item.tone}`}>{item.value}</p><p className="mt-2 text-sm leading-6 text-foreground">{item.label}</p><div className="mt-4 flex items-center justify-between gap-3"><p className="font-mono text-[10px] leading-4 text-muted-foreground">{item.source}</p><a href={item.href} className="shrink-0 text-[11px] font-medium text-foreground underline decoration-[var(--signal-gold)] underline-offset-4">View evidence</a></div></article>)}
            </div>
          </div>
        </section>

        <section id="method" className="py-20 sm:py-28" aria-labelledby="method-title">
          <div className="container grid max-w-7xl gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start"><p className="observatory-kicker text-[var(--signal-gold)]">The monitor</p><h2 id="method-title" className="mt-4 font-serif text-5xl leading-[0.9] tracking-[-0.055em] text-foreground sm:text-6xl">An argument becomes an instrument.</h2><p className="mt-6 max-w-md text-base leading-7 text-[var(--ink-soft)]">A sharp thesis is only useful if a reader can test its terms. The monitor preserves the route from proposition to source and from scenario assumption to portfolio consequence.</p><a href="/dashboard#sources" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-foreground underline decoration-[var(--signal-gold)] underline-offset-4">Inspect sources and methodology <MoveRight className="h-4 w-4" aria-hidden="true" /></a></div>
            <ol className="border-t border-border">
              {monitorStages.map(([stage, description], index) => <li key={stage} className="grid grid-cols-[2.75rem_1fr_auto] gap-4 border-b border-border py-5 sm:grid-cols-[4rem_1fr_auto] sm:py-6"><span className="font-mono text-xs text-[var(--signal-gold)]">0{index + 1}</span><div><h3 className="text-base font-semibold text-foreground">{stage}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p></div><span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{index === 4 ? "Trace" : "Test"}</span></li>)}
            </ol>
          </div>
        </section>

        <section className="border-y border-border bg-[var(--recessed)] py-20 sm:py-24" aria-labelledby="tickers-title">
          <div className="container max-w-7xl"><div className="flex flex-wrap items-baseline justify-between gap-3"><div><p className="observatory-kicker text-[var(--signal-gold)]">Observed market context</p><h2 id="tickers-title" className="mt-3 font-serif text-4xl tracking-[-0.04em] text-foreground">Bellwethers are signal, not proof.</h2></div><a href="/dashboard#universe" className="text-sm font-medium text-foreground underline decoration-[var(--signal-gold)] underline-offset-4">View the 50-name universe</a></div><div className="mt-8 border-y border-border"><div className="observatory-scroll-rail flex gap-6 overflow-x-auto py-4" aria-label="Bellwether market snapshot">{liveTickers.map(ticker => <div key={ticker.sym} className="flex min-w-[8.5rem] items-baseline gap-2 border-r border-border pr-6 font-mono text-xs last:border-r-0"><span className="font-semibold text-foreground">{ticker.sym}</span><span className="text-muted-foreground">{ticker.price}</span><span className={ticker.up ? "text-[var(--signal-positive)]" : "text-destructive"}>{ticker.change}</span></div>)}</div></div><p className="mt-3 font-mono text-[10px] leading-5 text-muted-foreground">{marketStamp}. Prices update independently from the monitor’s dated evidence, assumptions, and scenarios.</p></div>
        </section>

        <section className="py-20 sm:py-28" aria-labelledby="digest-title">
          <div className="container max-w-2xl text-center"><p className="observatory-kicker text-[var(--signal-gold)]">Research delivery</p><h2 id="digest-title" className="mt-4 font-serif text-5xl leading-[0.9] tracking-[-0.055em] text-foreground sm:text-6xl">Keep the changing assumption in view.</h2><p className="mx-auto mt-6 max-w-xl text-base leading-7 text-[var(--ink-soft)]">A weekly digest covering the evidence that changes the monitor—not generic market commentary.</p>{subDone ? <div className="mt-8 inline-flex items-center gap-2 border border-[var(--signal-positive)]/40 bg-[var(--signal-positive)]/10 px-5 py-3 text-sm text-[var(--signal-positive)]"><Check className="h-4 w-4" aria-hidden="true" /> Subscribed. See you Monday.</div> : <form onSubmit={handleSubscribe} className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row" noValidate><label htmlFor="landing-email" className="sr-only">Email address</label><div className="relative flex-1"><Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><input id="landing-email" type="email" name="email" autoComplete="email" spellCheck={false} value={subEmail} onChange={event => setSubEmail(event.target.value)} placeholder="you@firm.com" className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-background py-2 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-[var(--signal-gold)] focus:outline-none" /></div><button type="submit" disabled={subscribeMutation.isPending} className="observatory-button px-5 disabled:cursor-not-allowed disabled:opacity-60">{subscribeMutation.isPending ? "Subscribing…" : "Subscribe"}</button></form>}<p className="mt-3 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Every Monday · 9 AM PT · Unsubscribe anytime</p></div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
