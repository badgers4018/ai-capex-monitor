import { useState } from "react";
import { Cloud, AlertTriangle, TrendingDown, TrendingUp, Shield, Zap, DollarSign, Users } from "lucide-react";

interface ImpactCardProps {
  company: string;
  ticker: string;
  dealValue: string;
  drawdown: string;
  exposure: string;
  risk: "high" | "critical" | "moderate";
  details: string[];
}

function ImpactCard({ company, ticker, dealValue, drawdown, exposure, risk, details }: ImpactCardProps) {
  const riskColors = {
    critical: "oklch(0.65 0.2 25)",
    high: "oklch(0.7 0.15 45)",
    moderate: "oklch(0.7 0.15 240)",
  };

  return (
    <div className="relative rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 sm:p-6 overflow-hidden group hover:border-border transition-[transform,opacity,border-color,background-color] duration-300">
      <div className="absolute top-0 left-0 w-full h-1" style={{ background: riskColors[risk] }} />
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-semibold text-base sm:text-lg text-foreground">{company}</h4>
          <span className="font-mono text-fluid-xs text-muted-foreground">{ticker}</span>
        </div>
        <span
          className="px-2 py-0.5 rounded-full text-fluid-xs font-mono font-medium"
          style={{ background: `color-mix(in oklch, ${riskColors[risk]} 20%, transparent)`, color: riskColors[risk] }}
        >
          {risk.toUpperCase()} RISK
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <p className="text-fluid-xs text-muted-foreground">Meta Deal</p>
          <p className="font-mono text-sm sm:text-base font-semibold text-foreground">{dealValue}</p>
        </div>
        <div>
          <p className="text-fluid-xs text-muted-foreground">Day-1 Drop</p>
          <p className="font-mono text-sm sm:text-base font-semibold" style={{ color: "oklch(0.65 0.2 25)" }}>{drawdown}</p>
        </div>
        <div>
          <p className="text-fluid-xs text-muted-foreground">Revenue Exposure</p>
          <p className="font-mono text-sm sm:text-base font-semibold text-foreground">{exposure}</p>
        </div>
      </div>

      <ul className="space-y-1.5">
        {details.map((d, i) => (
          <li key={i} className="flex items-start gap-2 text-fluid-sm text-foreground/80">
            <span className="w-1 h-1 rounded-full mt-2 shrink-0" style={{ background: riskColors[risk] }} />
            {d}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface ScenarioProps {
  title: string;
  probability: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  implications: string[];
}

function ScenarioCard({ title, probability, icon, color, description, implications }: ScenarioProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-xl border border-border/50 bg-card/30 p-4 sm:p-5 cursor-pointer hover:border-border transition-[transform,opacity,border-color,background-color] duration-300"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg" style={{ background: `color-mix(in oklch, ${color} 15%, transparent)`, color }}>
          {icon}
        </div>
        <div className="flex-1">
          <h5 className="font-semibold text-sm sm:text-base text-foreground">{title}</h5>
          <span className="font-mono text-fluid-xs" style={{ color }}>{probability}</span>
        </div>
        <span className="text-fluid-xs text-muted-foreground">{expanded ? "▲" : "▼"}</span>
      </div>
      <p className="text-fluid-sm text-foreground/80 leading-relaxed">{description}</p>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-border/30 space-y-1.5">
          {implications.map((imp, i) => (
            <p key={i} className="text-fluid-sm text-foreground/70 flex items-start gap-2">
              <span className="w-1 h-1 rounded-full mt-2 shrink-0" style={{ background: color }} />
              {imp}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export function MetaCloudEntry() {
  return (
    <section id="meta-cloud" className="py-24 relative">
      <div className="container max-w-5xl">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-12">
          <span className="font-mono text-xs text-muted-foreground tracking-wider uppercase">NEW</span>
          <div className="h-px flex-1 bg-border" />
          <span className="font-mono text-xs text-muted-foreground tracking-wider uppercase">Meta Cloud Entry Analysis</span>
        </div>

        {/* Alert banner */}
        <div className="mb-10 p-4 sm:p-5 rounded-xl border border-[oklch(0.7_0.15_45)]/30 bg-[oklch(0.7_0.15_45)]/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "oklch(0.7 0.15 45)" }} />
            <div>
              <h3 className="font-semibold text-base sm:text-lg text-foreground mb-1">
                Breaking: Meta Enters Cloud Computing Market
              </h3>
              <p className="text-fluid-sm text-foreground/80 leading-relaxed">
                On July 1, 2026, Bloomberg reported that Meta Platforms is exploring selling excess AI compute capacity
                under a new <span className="font-mono font-medium text-[oklch(0.7_0.15_45)]">"Meta Compute"</span> initiative.
                The announcement triggered the largest single-day sell-off in neocloud stocks since their IPOs, wiping
                approximately <span className="font-mono font-medium">$12B in combined market cap</span> from CoreWeave and Nebius.
              </p>
            </div>
          </div>
        </div>

        {/* Impact cards */}
        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-5 flex items-center gap-2">
          <TrendingDown className="w-5 h-5" style={{ color: "oklch(0.65 0.2 25)" }} />
          Direct Impact Assessment
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
          <ImpactCard
            company="CoreWeave"
            ticker="CRWV"
            dealValue="$21B"
            drawdown="-14%"
            exposure="~40%"
            risk="critical"
            details={[
              "Deal expanded from $14.2B (Sep 2025) to $21B (Apr 2026) through Dec 2032",
              "Meta is single largest customer: concentration risk now existential",
              "GPU-as-a-Service model directly competes with Meta Compute offering",
              "Already negative FCF (-$740M Q1): losing Meta would be catastrophic",
            ]}
          />
          <ImpactCard
            company="Nebius"
            ticker="NBIS"
            dealValue="$27B"
            drawdown="-17%"
            exposure="~55%"
            risk="critical"
            details={[
              "$12B dedicated capacity starting early 2027 + $15B additional over 5 years",
              "Highest single-customer concentration in the neocloud sector",
              "Full-stack AI cloud model offers differentiation but Meta can replicate",
              "Profitable ($584M net) but growth thesis depends on Meta deal expansion",
            ]}
          />
          <ImpactCard
            company="IREN"
            ticker="IREN"
            dealValue="N/A"
            drawdown="-6.5%"
            exposure="~15%"
            risk="moderate"
            details={[
              "Renewable-powered DC model less directly threatened",
              "Microsoft is primary customer, not Meta",
              "Infrastructure-layer play (power/cooling) retains value regardless",
              "Collateral damage from sector rotation, not direct competitive threat",
            ]}
          />
          <ImpactCard
            company="Meta Platforms"
            ticker="META"
            dealValue="N/A"
            drawdown="+9%"
            exposure="Beneficiary"
            risk="moderate"
            details={[
              "Monetizing excess capacity from $145B+ capex program",
              "Similar playbook to SpaceX (Starlink) and Amazon (AWS origin story)",
              "Building tens of gigawatts for Llama + superintelligence ambitions",
              "Cloud revenue would diversify beyond 97% advertising dependency",
            ]}
          />
        </div>

        {/* The Paradox section */}
        <div className="mb-12 p-5 sm:p-6 rounded-xl border border-border/50 bg-card/30">
          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" style={{ color: "oklch(0.7 0.15 155)" }} />
            The Meta Paradox: Customer Becomes Competitor
          </h3>
          <div className="space-y-4 text-fluid-sm sm:text-base text-foreground/85 leading-relaxed">
            <p>
              Meta's move exposes the fundamental tension in the neocloud business model: their largest customer
              has the capital, infrastructure, and technical capability to become their most dangerous competitor.
              CoreWeave and Nebius built their businesses around a compute shortage that hyperscalers couldn't fill
              fast enough. But Meta's $145B capex program means it will soon have <em>excess</em> capacity: and
              the economics of selling that excess are irresistible.
            </p>
            <p>
              The AWS origin story is instructive. Amazon built massive compute infrastructure for its retail
              operations, realized it had excess capacity, and created the $100B/year cloud business that now
              generates the majority of Amazon's operating profit. Meta appears to be following the same playbook:
              build for internal AI needs (Llama, Reels, advertising), then monetize the surplus.
            </p>
            <p>
              However, the bull case for neoclouds remains: Meta's willingness to spend $145B on AI infrastructure
              <em>validates</em> that compute demand is massive and growing. The question is whether neoclouds can
              diversify their customer base fast enough before Meta's excess capacity hits the market. CoreWeave's
              OpenAI and Anthropic relationships, and Nebius's European sovereign cloud deals, may provide the
              lifeline: but the clock is now ticking.
            </p>
          </div>
        </div>

        {/* Scenario analysis */}
        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-5 flex items-center gap-2">
          <Shield className="w-5 h-5" style={{ color: "oklch(0.7 0.15 240)" }} />
          Scenario Analysis: What Happens Next?
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          <ScenarioCard
            title="Coexistence"
            probability="45% probability"
            icon={<Users className="w-4 h-4" />}
            color="oklch(0.7 0.15 155)"
            description="Meta Compute launches but targets different workloads (inference at scale) while neoclouds retain training/fine-tuning niches. Existing contracts honored."
            implications={[
              "CRWV/NBIS contracts run to completion ($48B combined)",
              "Neoclouds pivot to specialized training clusters and sovereign cloud",
              "Market stabilizes at 15-20% discount to pre-announcement levels",
              "Meta captures inference market; neoclouds keep training market",
            ]}
          />
          <ScenarioCard
            title="Gradual Displacement"
            probability="35% probability"
            icon={<TrendingDown className="w-4 h-4" />}
            color="oklch(0.7 0.15 45)"
            description="Meta honors existing contracts but doesn't renew. Neoclouds lose their largest customer over 3-5 years as Meta builds internal capacity."
            implications={[
              "CRWV loses $21B renewal in 2032: must replace 40% of revenue",
              "NBIS $15B expansion tranche at risk of cancellation",
              "Neocloud margins compress as they compete on price",
              "Consolidation wave: weaker neoclouds acquired or fail",
            ]}
          />
          <ScenarioCard
            title="Aggressive Competition"
            probability="15% probability"
            icon={<AlertTriangle className="w-4 h-4" />}
            color="oklch(0.65 0.2 25)"
            description="Meta undercuts neocloud pricing by 30-50%, leveraging ad revenue to subsidize cloud losses (Google Cloud playbook). Existential threat."
            implications={[
              "Neocloud unit economics collapse: can't compete on price",
              "CRWV's negative FCF becomes terminal without new financing",
              "NBIS profitability erased; stock returns to $40-60 range",
              "Only neoclouds with unique tech (custom silicon, sovereign) survive",
            ]}
          />
          <ScenarioCard
            title="Meta Retreats"
            probability="5% probability"
            icon={<TrendingUp className="w-4 h-4" />}
            color="oklch(0.7 0.15 240)"
            description="Meta Compute remains internal-only or is shelved. Cloud is hard: Meta lacks enterprise sales DNA. Neoclouds recover fully."
            implications={[
              "CRWV/NBIS bounce back to pre-announcement levels (+15-20%)",
              "Validates neocloud moat: specialized > generalized",
              "Meta doubles down on being a customer, not competitor",
              "Neocloud sector re-rates upward on reduced competitive risk",
            ]}
          />
        </div>

        {/* Key metrics comparison */}
        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-5 flex items-center gap-2">
          <DollarSign className="w-5 h-5" style={{ color: "oklch(0.7 0.15 155)" }} />
          Competitive Position Comparison
        </h3>

        <div className="overflow-x-auto rounded-xl border border-border/50">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-card/50 border-b border-border/50">
                <th className="text-left p-3 text-fluid-sm font-semibold text-foreground">Metric</th>
                <th className="text-center p-3 text-fluid-sm font-semibold" style={{ color: "oklch(0.7 0.15 240)" }}>Meta Compute</th>
                <th className="text-center p-3 text-fluid-sm font-semibold" style={{ color: "oklch(0.65 0.2 25)" }}>CoreWeave</th>
                <th className="text-center p-3 text-fluid-sm font-semibold" style={{ color: "oklch(0.7 0.15 45)" }}>Nebius</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              <tr className="hover:bg-card/30 transition-colors">
                <td className="p-3 text-fluid-sm text-foreground/80">GPU Fleet Size</td>
                <td className="p-3 text-center font-mono text-fluid-sm text-foreground">~2M+ H100 equiv.</td>
                <td className="p-3 text-center font-mono text-fluid-sm text-foreground">~250K GPUs</td>
                <td className="p-3 text-center font-mono text-fluid-sm text-foreground">~150K GPUs</td>
              </tr>
              <tr className="hover:bg-card/30 transition-colors">
                <td className="p-3 text-fluid-sm text-foreground/80">2026 Capex</td>
                <td className="p-3 text-center font-mono text-fluid-sm text-foreground">$130-145B</td>
                <td className="p-3 text-center font-mono text-fluid-sm text-foreground">$33B</td>
                <td className="p-3 text-center font-mono text-fluid-sm text-foreground">$12B</td>
              </tr>
              <tr className="hover:bg-card/30 transition-colors">
                <td className="p-3 text-fluid-sm text-foreground/80">Cash / Financing</td>
                <td className="p-3 text-center font-mono text-fluid-sm text-foreground">$65B+ (self-funded)</td>
                <td className="p-3 text-center font-mono text-fluid-sm text-foreground">$3.25B (debt-funded)</td>
                <td className="p-3 text-center font-mono text-fluid-sm text-foreground">$5B (equity + debt)</td>
              </tr>
              <tr className="hover:bg-card/30 transition-colors">
                <td className="p-3 text-fluid-sm text-foreground/80">Pricing Power</td>
                <td className="p-3 text-center font-mono text-fluid-sm" style={{ color: "oklch(0.65 0.2 25)" }}>Can subsidize (ad revenue)</td>
                <td className="p-3 text-center font-mono text-fluid-sm text-foreground">Must charge premium</td>
                <td className="p-3 text-center font-mono text-fluid-sm text-foreground">Must charge premium</td>
              </tr>
              <tr className="hover:bg-card/30 transition-colors">
                <td className="p-3 text-fluid-sm text-foreground/80">Enterprise Sales DNA</td>
                <td className="p-3 text-center font-mono text-fluid-sm" style={{ color: "oklch(0.7 0.15 45)" }}>Weak (consumer-first)</td>
                <td className="p-3 text-center font-mono text-fluid-sm" style={{ color: "oklch(0.7 0.15 155)" }}>Strong (NVIDIA-native)</td>
                <td className="p-3 text-center font-mono text-fluid-sm" style={{ color: "oklch(0.7 0.15 155)" }}>Strong (Yandex heritage)</td>
              </tr>
              <tr className="hover:bg-card/30 transition-colors">
                <td className="p-3 text-fluid-sm text-foreground/80">Differentiation</td>
                <td className="p-3 text-center font-mono text-fluid-sm text-foreground">Scale + Llama ecosystem</td>
                <td className="p-3 text-center font-mono text-fluid-sm text-foreground">Speed-to-deploy + NVIDIA</td>
                <td className="p-3 text-center font-mono text-fluid-sm text-foreground">Full-stack + EU sovereign</td>
              </tr>
              <tr className="hover:bg-card/30 transition-colors">
                <td className="p-3 text-fluid-sm text-foreground/80">Key Vulnerability</td>
                <td className="p-3 text-center font-mono text-fluid-sm text-foreground">No cloud sales team</td>
                <td className="p-3 text-center font-mono text-fluid-sm" style={{ color: "oklch(0.65 0.2 25)" }}>40% Meta concentration</td>
                <td className="p-3 text-center font-mono text-fluid-sm" style={{ color: "oklch(0.65 0.2 25)" }}>55% Meta concentration</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bottom line */}
        <div className="mt-10 p-5 sm:p-6 rounded-xl border border-[oklch(0.7_0.15_155)]/30 bg-[oklch(0.7_0.15_155)]/5">
          <h4 className="font-semibold text-base sm:text-lg text-foreground mb-2 flex items-center gap-2">
            <Cloud className="w-5 h-5" style={{ color: "oklch(0.7 0.15 155)" }} />
            Bottom Line
          </h4>
          <p className="text-fluid-sm sm:text-base text-foreground/85 leading-relaxed">
            Meta's cloud entry is the most significant competitive threat to the neocloud sector since its inception.
            The "customer becomes competitor" dynamic mirrors AWS's origin (Amazon retail → cloud) and validates
            that AI compute demand is real: but also signals that the easy growth phase is ending. Neoclouds must
            now prove they can diversify beyond their anchor customer before Meta's excess capacity floods the market.
            The next 12 months will determine whether CoreWeave and Nebius are durable infrastructure businesses
            or transitional arbitrage plays that served their purpose during the compute shortage.
          </p>
        </div>
      </div>
    </section>
  );
}
