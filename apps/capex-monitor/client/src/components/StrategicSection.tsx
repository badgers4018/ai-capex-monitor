import { AlertTriangle, Lightbulb, Rocket, Target, TrendingUp, Zap } from "lucide-react";
import { SectionHeading } from "@/components/BrandMark";

const strategicInsights = [
  { icon: Zap, title: "Power grid: the binding constraint", tone: "var(--signal-risk)", body: "US data centers need 69 GW of new capacity but only about 10 GW is achievable on schedule. The key scarcity is energization, not money, chips, or construction labour. Secured power is the ultimate structural moat.", source: "Gartner, DOE, Rep. Pallone · Jun 2026" },
  { icon: TrendingUp, title: "Efficiency is still demand-positive", tone: "var(--signal-cyan)", body: "Cost per token has fallen sharply, yet total AI bills continue climbing. Cheaper inference makes more use cases viable; continuous inference adds a second demand curve beneath bursty training workloads.", source: "DeepSeek, NVIDIA, enterprise disclosures" },
  { icon: AlertTriangle, title: "The 5:1 ROI gap is binary", tone: "var(--signal-risk)", body: "The market needs a faster conversion of infrastructure capacity into durable revenue. A 20–30% order trim by a major buyer would travel directly through GPUs, neoclouds, memory, and equipment suppliers.", source: "Goldman Sachs, Gradient Flow, Fed · Jun 2026" },
  { icon: Rocket, title: "Orbital compute is a long-duration call", tone: "var(--signal-gold)", body: "SpaceX’s vertical stack—launch, connectivity, compute, applications—offers a possible 2030s path around ground power constraints. The thesis is compelling but sits beyond the current investment horizon.", source: "SpaceX filings, Reuters, xAI" },
  { icon: Target, title: "Each bottleneck reveals the next", tone: "var(--signal-cyan)", body: "Power, CoWoS, ABF substrate, HBM memory, and liquid cooling form a serial constraint stack. Solving one does not remove the next; it often exposes a new capital requirement.", source: "TrendForce, Dell’Oro, industry research" },
  { icon: Lightbulb, title: "Sovereign duplication sustains the spend", tone: "var(--signal-silver)", body: "Export controls, national AI mandates, and Gulf investment are producing parallel infrastructure stacks. Even if commercial ROI underwhelms, strategic duplication can keep aggregate capex elevated.", source: "IISS, Brookings, Fortune BI, FT/Reuters" },
];

export function StrategicSection() {
  return (
    <section id="strategy" className="py-20 sm:py-28">
      <div className="container max-w-6xl">
        <SectionHeading index="05" eyebrow="Strategic evidence" title="Read the constraints, not the headlines." description="The capex cycle is a system of physical bottlenecks, demand conversion, financing, and policy. These are the transmission points that matter." />
        <div className="mt-10 grid gap-3 md:grid-cols-2">
          {strategicInsights.map(({ icon: Icon, title, tone, body, source }) => (
            <article key={title} className="observatory-panel--feature p-6 transition-[transform,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-[var(--signal-gold)]">
              <div className="flex items-start gap-4"><div className="rounded-[var(--radius-sm)] border border-border/60 bg-[var(--recessed)] p-2.5" style={{ color: tone }}><Icon className="h-5 w-5" aria-hidden="true" /></div><div><h3 className="font-serif text-3xl leading-none tracking-[-0.035em] text-foreground">{title}</h3><p className="mt-4 text-sm leading-6 text-muted-foreground">{body}</p><p className="mt-5 border-t border-border/50 pt-3 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{source}</p></div></div>
            </article>
          ))}
        </div>
        <aside className="observatory-panel mt-10 p-6" aria-label="Research methodology">
          <p className="observatory-kicker text-[var(--signal-gold)]">Research discipline</p>
          <div className="mt-4 grid gap-6 md:grid-cols-2"><div><h3 className="text-sm font-semibold text-foreground">Multi-domain review</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Semiconductors, energy, cloud economics, enterprise adoption, venture capital, geopolitics, markets, and governance are evaluated as one investment system.</p></div><div><h3 className="text-sm font-semibold text-foreground">Contradiction-first method</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">The research lens prioritizes variance between reported growth, cash generation, physical capacity, and financing commitments before adding a directional conclusion.</p></div></div>
        </aside>
      </div>
    </section>
  );
}
