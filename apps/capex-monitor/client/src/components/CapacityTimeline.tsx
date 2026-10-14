import { useState, useRef, useEffect } from "react";
import { Clock, AlertTriangle, Shield, Zap, Building2, Cpu, Cloud } from "lucide-react";

interface TimelineEvent {
  id: string;
  date: string;
  year: number;
  quarter: number; // 1-4
  label: string;
  description: string;
  category: "meta-capacity" | "meta-compute" | "coreweave" | "nebius" | "risk-window";
  icon: React.ReactNode;
  significance: "critical" | "high" | "medium";
}

const timelineEvents: TimelineEvent[] = [
  {
    id: "meta-announce",
    date: "Jul 2026",
    year: 2026,
    quarter: 3,
    label: "Meta Compute Announced",
    description: "Bloomberg reports Meta exploring selling excess AI compute. CRWV -14%, NBIS -17% in single session.",
    category: "meta-compute",
    icon: <Cloud className="w-4 h-4" />,
    significance: "critical",
  },
  {
    id: "meta-chip",
    date: "Sep 2026",
    year: 2026,
    quarter: 3,
    label: "Meta MTIA Chip Production",
    description: "In-house 'Iris' AI chip enters mass production. New chip every 6 months through 2027, reducing NVIDIA dependency.",
    category: "meta-capacity",
    icon: <Cpu className="w-4 h-4" />,
    significance: "high",
  },
  {
    id: "meta-alberta",
    date: "Q4 2026",
    year: 2026,
    quarter: 4,
    label: "Alberta 1GW Groundbreaking",
    description: "Meta breaks ground on 1GW data center in Sturgeon County, Alberta: first Canadian facility.",
    category: "meta-capacity",
    icon: <Building2 className="w-4 h-4" />,
    significance: "medium",
  },
  {
    id: "nebius-delivery",
    date: "Early 2027",
    year: 2027,
    quarter: 1,
    label: "Nebius Dedicated Capacity Begins",
    description: "$12B dedicated NVIDIA Vera Rubin NVL72 compute delivery to Meta starts. Revenue recognition begins.",
    category: "nebius",
    icon: <Zap className="w-4 h-4" />,
    significance: "high",
  },
  {
    id: "meta-louisiana",
    date: "Q2 2027",
    year: 2027,
    quarter: 2,
    label: "Louisiana 1GW DC Operational",
    description: "$10B facility goes live. 245MW critical IT initial, scalable to 1GW. First major excess capacity source.",
    category: "meta-capacity",
    icon: <Building2 className="w-4 h-4" />,
    significance: "critical",
  },
  {
    id: "meta-14gw",
    date: "H2 2027",
    year: 2027,
    quarter: 3,
    label: "Meta Reaches 14GW Total Capacity",
    description: "Internal target achieved. At this scale, even 10-15% excess = 1.4-2.1GW available for external customers.",
    category: "meta-capacity",
    icon: <Zap className="w-4 h-4" />,
    significance: "critical",
  },
  {
    id: "meta-launch",
    date: "H2 2027",
    year: 2027,
    quarter: 4,
    label: "Meta Compute Likely Launch",
    description: "Estimated launch window for external cloud service. No enterprise sales team yet: likely starts with select partners.",
    category: "meta-compute",
    icon: <Cloud className="w-4 h-4" />,
    significance: "critical",
  },
  {
    id: "risk-window-1",
    date: "2028",
    year: 2028,
    quarter: 1,
    label: "Competition Intensifies",
    description: "Meta Compute scales up. Hyperscale capacity doubles globally vs 2025. Neocloud pricing pressure begins.",
    category: "risk-window",
    icon: <AlertTriangle className="w-4 h-4" />,
    significance: "high",
  },
  {
    id: "meta-excess",
    date: "2028-2029",
    year: 2028,
    quarter: 3,
    label: "Meta Excess Capacity at Scale",
    description: "Estimated 3-5GW available for external customers. Can subsidize pricing with ad revenue. Direct threat to neocloud unit economics.",
    category: "meta-compute",
    icon: <Cloud className="w-4 h-4" />,
    significance: "critical",
  },
  {
    id: "risk-window-2",
    date: "2029-2030",
    year: 2029,
    quarter: 2,
    label: "Pricing Pressure Peak",
    description: "If Meta undercuts by 30-50%, neoclouds must have diversified or face margin compression. Critical survival window.",
    category: "risk-window",
    icon: <AlertTriangle className="w-4 h-4" />,
    significance: "critical",
  },
  {
    id: "nebius-expiry",
    date: "Mid 2031",
    year: 2031,
    quarter: 2,
    label: "Nebius 5-Year Deal Expires",
    description: "$27B Meta agreement reaches end. Renewal depends on whether Meta still needs external capacity or has built enough internally.",
    category: "nebius",
    icon: <Shield className="w-4 h-4" />,
    significance: "critical",
  },
  {
    id: "crwv-original",
    date: "Dec 2031",
    year: 2031,
    quarter: 4,
    label: "CoreWeave Original Commitment Ends",
    description: "Original $14.2B Meta commitment expires. Take-or-pay protects revenue through this date regardless of competition.",
    category: "coreweave",
    icon: <Shield className="w-4 h-4" />,
    significance: "high",
  },
  {
    id: "crwv-extended",
    date: "Dec 2032",
    year: 2032,
    quarter: 4,
    label: "CoreWeave Extended Contract Expires",
    description: "Full $21B expanded deal ends. By this point, Meta will have 5+ years of cloud operations. Renewal highly uncertain.",
    category: "coreweave",
    icon: <Shield className="w-4 h-4" />,
    significance: "critical",
  },
];

const categoryConfig = {
  "meta-capacity": { color: "oklch(0.7 0.15 240)", label: "Meta Infrastructure", bg: "oklch(0.7 0.15 240)" },
  "meta-compute": { color: "oklch(0.65 0.2 25)", label: "Meta Compute (Cloud)", bg: "oklch(0.65 0.2 25)" },
  "coreweave": { color: "oklch(0.7 0.15 155)", label: "CoreWeave Contract", bg: "oklch(0.7 0.15 155)" },
  "nebius": { color: "oklch(0.7 0.15 45)", label: "Nebius Contract", bg: "oklch(0.7 0.15 45)" },
  "risk-window": { color: "oklch(0.6 0.2 0)", label: "Risk Window", bg: "oklch(0.6 0.2 0)" },
};

function YearMarker({ year, isFirst }: { year: number; isFirst: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${isFirst ? "" : "mt-8"}`}>
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-card border-2 border-border flex items-center justify-center shrink-0">
        <span className="font-mono text-sm sm:text-base font-bold text-foreground">{year}</span>
      </div>
      <div className="h-px flex-1 bg-border/50" />
    </div>
  );
}

export function CapacityTimeline() {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [barsVisible, setBarsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setBarsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (barsRef.current) observer.observe(barsRef.current);
    return () => observer.disconnect();
  }, []);

  const filteredEvents = filter === "all"
    ? timelineEvents
    : timelineEvents.filter(e => e.category === filter);

  // Group events by year
  const eventsByYear = filteredEvents.reduce((acc, event) => {
    if (!acc[event.year]) acc[event.year] = [];
    acc[event.year].push(event);
    return acc;
  }, {} as Record<number, TimelineEvent[]>);

  const years = Object.keys(eventsByYear).map(Number).sort();

  return (
    <section id="timeline" className="py-24 relative">
      <div className="container max-w-5xl">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-12">
          <span className="font-mono text-xs text-muted-foreground tracking-wider uppercase">NEW</span>
          <div className="h-px flex-1 bg-border" />
          <span className="font-mono text-xs text-muted-foreground tracking-wider uppercase">Capacity Timeline</span>
        </div>

        {/* Title and description */}
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 flex items-center gap-3">
            <Clock className="w-6 h-6" style={{ color: "oklch(0.7 0.15 240)" }} />
            Meta Capacity vs. Neocloud Contracts
          </h2>
          <p className="text-fluid-sm sm:text-base text-foreground/70 leading-relaxed max-w-3xl">
            Interactive timeline showing when Meta's excess compute capacity hits the market relative to CoreWeave and Nebius
            contract expiration dates. The critical question: can neoclouds diversify their customer base before their anchor
            contracts expire and Meta becomes a direct competitor?
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
          {[
            { key: "all", label: "All Events" },
            { key: "meta-capacity", label: "Meta Infrastructure" },
            { key: "meta-compute", label: "Meta Compute" },
            { key: "coreweave", label: "CoreWeave" },
            { key: "nebius", label: "Nebius" },
            { key: "risk-window", label: "Risk Windows" },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-fluid-xs font-mono whitespace-nowrap transition-[transform,opacity,border-color,background-color] duration-200 shrink-0 ${
                filter === f.key
                  ? "bg-foreground text-background"
                  : "bg-card/50 border border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Capacity bar visualization */}
        <div ref={barsRef} className="mb-10 p-4 sm:p-5 rounded-xl border border-border/50 bg-card/30">
          <h4 className="text-fluid-sm font-semibold text-foreground mb-3">Estimated Meta Excess Capacity Available for Cloud</h4>
          <div className="space-y-2">
            {[
              { year: "2026", pct: 5, label: "~0.5 GW", note: "Announcement only", delay: 0 },
              { year: "2027", pct: 20, label: "~2 GW", note: "Louisiana + early facilities", delay: 100 },
              { year: "2028", pct: 40, label: "~4 GW", note: "Scaling phase", delay: 200 },
              { year: "2029", pct: 60, label: "~6 GW", note: "Full competition", delay: 300 },
              { year: "2030", pct: 75, label: "~8 GW", note: "Market saturation risk", delay: 400 },
              { year: "2031", pct: 85, label: "~10 GW", note: "Nebius deal expires", delay: 500 },
              { year: "2032", pct: 95, label: "~12 GW", note: "CoreWeave deal expires", delay: 600 },
            ].map(bar => (
              <div key={bar.year} className="flex items-center gap-3">
                <span className="font-mono text-fluid-xs text-muted-foreground w-10 shrink-0">{bar.year}</span>
                <div className="flex-1 h-6 bg-card/50 rounded-full overflow-hidden border border-border/30 relative">
                  <div
                    className="h-full rounded-full relative"
                    style={{
                      width: barsVisible ? `${bar.pct}%` : "0%",
                      background: `linear-gradient(90deg, oklch(0.7 0.15 240), oklch(0.65 0.2 25))`,
                      opacity: barsVisible ? 0.8 : 0,
                      transition: `width 1.2s cubic-bezier(0.23, 1, 0.32, 1) ${bar.delay}ms, opacity 0.4s ease-out ${bar.delay}ms`,
                    }}
                  />
                  <span
                    className="absolute inset-0 flex items-center px-3 text-fluid-xs font-mono text-foreground/70"
                    style={{
                      opacity: barsVisible ? 1 : 0,
                      transition: `opacity 0.5s ease-out ${bar.delay + 600}ms`,
                    }}
                  >
                    {bar.label}
                  </span>
                </div>
                <span
                  className="text-fluid-xs text-muted-foreground hidden sm:block w-36 shrink-0"
                  style={{
                    opacity: barsVisible ? 1 : 0,
                    transition: `opacity 0.5s ease-out ${bar.delay + 400}ms`,
                  }}
                >
                  {bar.note}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-4 text-fluid-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-2 rounded-sm" style={{ background: "oklch(0.7 0.15 240)" }} /> Meta internal capacity
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-2 rounded-sm" style={{ background: "oklch(0.65 0.2 25)" }} /> Available for external cloud
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div ref={containerRef} className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 sm:left-7 top-0 bottom-0 w-px bg-border/50" />

          {years.map((year, yi) => (
            <div key={year}>
              <YearMarker year={year} isFirst={yi === 0} />
              <div className="ml-6 sm:ml-7 pl-6 sm:pl-8 border-l border-transparent space-y-4 mt-4">
                {eventsByYear[year].map(event => {
                  const config = categoryConfig[event.category];
                  const isSelected = selectedEvent === event.id;

                  return (
                    <div
                      key={event.id}
                      className={`relative cursor-pointer transition-[transform,opacity,border-color,background-color] duration-300 ${
                        isSelected ? "scale-[1.01]" : "hover:scale-[1.005]"
                      }`}
                      onClick={() => setSelectedEvent(isSelected ? null : event.id)}
                    >
                      {/* Connector dot */}
                      <div
                        className="absolute -left-[29px] sm:-left-[37px] top-4 w-3 h-3 rounded-full border-2 border-background"
                        style={{ background: config.color }}
                      />

                      {/* Event card */}
                      <div
                        className={`p-4 sm:p-5 rounded-xl border transition-[transform,opacity,border-color,background-color] duration-300 ${
                          isSelected
                            ? "border-border bg-card/60 shadow-lg"
                            : "border-border/30 bg-card/20 hover:border-border/60 hover:bg-card/40"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="p-2 rounded-lg shrink-0"
                            style={{ background: `color-mix(in oklch, ${config.color} 15%, transparent)`, color: config.color }}
                          >
                            {event.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-mono text-fluid-xs" style={{ color: config.color }}>{event.date}</span>
                              {event.significance === "critical" && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[oklch(0.65_0.2_25)]/10 text-[oklch(0.65_0.2_25)]">
                                  CRITICAL
                                </span>
                              )}
                            </div>
                            <h4 className="font-semibold text-sm sm:text-base text-foreground">{event.label}</h4>
                            {isSelected && (
                              <p className="mt-2 text-fluid-sm text-foreground/75 leading-relaxed animate-in fade-in duration-200">
                                {event.description}
                              </p>
                            )}
                          </div>
                          <span className="text-fluid-xs text-muted-foreground shrink-0">{isSelected ? "▲" : "▼"}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Key takeaway */}
        <div className="mt-10 p-5 sm:p-6 rounded-xl border border-[oklch(0.65_0.2_25)]/30 bg-[oklch(0.65_0.2_25)]/5">
          <h4 className="font-semibold text-base sm:text-lg text-foreground mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" style={{ color: "oklch(0.65 0.2 25)" }} />
            Critical Window: 2027-2031
          </h4>
          <p className="text-fluid-sm sm:text-base text-foreground/85 leading-relaxed">
            The 4-year window between Meta Compute's likely launch (H2 2027) and the first major contract expiration
            (Nebius, mid-2031) is the survival period for neoclouds. During this time, CoreWeave and Nebius are protected
            by take-or-pay contracts: but must use that runway to diversify their customer base beyond Meta. If they
            enter 2031 still dependent on Meta for 40-55% of revenue, contract renewal negotiations will be brutal.
            The capacity bar above shows Meta's cloud offering reaching competitive scale by 2029, giving neoclouds
            roughly 2-3 years of protected revenue before facing full market competition.
          </p>
        </div>
      </div>
    </section>
  );
}
