import { BrandLockup } from "@/components/BrandMark";
import { BRAND } from "@/lib/brand";

export function Footer() {
  return (
    <footer className="border-t border-border bg-[var(--recessed)]" aria-label="Capital Misallocation footer">
      <div className="container max-w-7xl py-10 sm:py-12">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <BrandLockup href="/" markClassName="h-10 w-10" />
            <p className="mt-5 max-w-sm text-sm leading-6 text-[var(--ink-soft)]">An evidence-led research instrument for examining the investment, financing, power, and return dynamics of AI infrastructure.</p>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Research and analysis · Not personalized investment advice</p>
          </div>
          <div>
            <p className="observatory-kicker text-[var(--signal-gold)]">AI Capex Monitor</p>
            <nav className="mt-4 grid gap-2 text-sm" aria-label="AI Capex Monitor footer navigation"><a href="/dashboard" className="text-[var(--ink-soft)] transition-colors duration-150 hover:text-foreground">Open monitor</a><a href="/dashboard#universe" className="text-[var(--ink-soft)] transition-colors duration-150 hover:text-foreground">50-name universe</a><a href="/dashboard#sources" className="text-[var(--ink-soft)] transition-colors duration-150 hover:text-foreground">Sources & methodology</a></nav>
          </div>
          <div>
            <p className="observatory-kicker text-[var(--signal-gold)]">Research</p>
            <nav className="mt-4 grid gap-3" aria-label="Capital Misallocation research network">{BRAND.research.map(item => <a key={item.label} href={item.href} target="_blank" rel="noreferrer" className="group"><span className="block text-sm font-medium text-foreground transition-colors duration-150 group-hover:text-[var(--signal-gold)]">{item.label} <span aria-hidden="true">↗</span></span><span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{item.description}</span></a>)}</nav>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-5 font-mono text-[10px] leading-5 text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><p>Sources and dates are available in the monitor’s evidence ledger and methodology appendix.</p><p>Capital Misallocation — AI Capex Monitor</p></div>
      </div>
    </footer>
  );
}
