import { useEffect, useRef, useState } from "react";
import { BookOpen, Database, Lock, Scale } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";

const suggestedQueries = [
  "How does a 30% demand slowdown change refinancing risk?",
  "What does the debt wall imply for CoreWeave?",
  "Where does capital intensity diverge from revenue realization?",
];

const boundaryFeatures = [
  { icon: BookOpen, label: "Cross-source retrieval" },
  { icon: Database, label: "Evidence synthesis" },
  { icon: Scale, label: "Scenario comparison" },
];

export function AISearchBar() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setActive(true);
        window.setTimeout(() => setActive(false), 650);
      }
      if (event.key === "Escape") inputRef.current?.blur();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const acknowledgeBoundary = () => {
    setActive(true);
    window.setTimeout(() => setActive(false), 650);
  };

  return (
    <section aria-labelledby="research-access-title">
      <div className="sticky top-16 z-40 border-y border-border bg-background/96 py-2 backdrop-blur-md">
        <div className="container max-w-4xl">
          <div className={`flex items-center gap-3 border px-4 py-3 transition-[border-color,background-color] duration-150 ${active ? "border-[var(--signal-gold)] bg-[var(--signal-gold-soft)]" : "border-border bg-[var(--panel)]"}`}>
            <Lock className="h-4 w-4 shrink-0 text-[var(--signal-gold)]" aria-hidden="true" />
            <input ref={inputRef} type="text" readOnly placeholder="Evidence-query workspace is currently unavailable" aria-label="Evidence-query workspace: currently unavailable" className="min-w-0 flex-1 bg-transparent text-sm text-muted-foreground placeholder:text-muted-foreground focus:outline-none" onFocus={acknowledgeBoundary} onClick={acknowledgeBoundary} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); acknowledgeBoundary(); } }} />
            <span className="hidden border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">⌘K</span>
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.09em] text-[var(--signal-gold)]">Research access</span>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl py-5 sm:py-7">
        <div className="border-y border-border py-6 sm:py-8">
          <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:gap-6">
            <BrandMark className="h-12 w-12" decorative />
            <div><p className="observatory-kicker text-[var(--signal-gold)]">Research-access boundary</p><h2 id="research-access-title" className="mt-3 font-serif text-3xl tracking-[-0.04em] text-foreground">The evidence-query workspace is held back; the monitor is not.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Cross-source question answering is intentionally unavailable while the research-access model is being defined. The evidence ledger, sources, scenarios, watchlist, universe, and charts remain open without interruption.</p><div className="mt-5 flex flex-wrap gap-2">{boundaryFeatures.map(({ icon: Icon, label }) => <span key={label} className="inline-flex items-center gap-1.5 border border-border bg-[var(--recessed)] px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.07em] text-[var(--ink-soft)]"><Icon className="h-3 w-3 text-[var(--signal-gold)]" aria-hidden="true" />{label}</span>)}</div></div>
          </div>
          <div className="mt-6 border-t border-border pt-4"><p className="font-mono text-[10px] uppercase tracking-[0.11em] text-muted-foreground">Examples reserved for the query workspace</p><div className="mt-3 flex flex-wrap gap-2">{suggestedQueries.map(question => <button key={question} type="button" onClick={acknowledgeBoundary} className="border border-border px-2.5 py-1.5 text-left text-xs text-muted-foreground transition-colors duration-150 hover:border-[var(--rule-strong)] hover:text-foreground"><Lock className="mr-1.5 inline h-3 w-3 text-[var(--signal-gold)]" aria-hidden="true" />{question}</button>)}</div></div>
        </div>
      </div>
    </section>
  );
}
