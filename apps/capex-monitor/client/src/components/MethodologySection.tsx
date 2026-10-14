export function MethodologySection() {
  const steps = [
    {
      step: "01",
      title: "Gap Identification",
      description: "Map the known unknowns: which data points are missing, contradicted, or underweighted in consensus coverage. Focus on non-obvious interdependencies between supply chain, demand, and financing.",
      color: "oklch(0.7 0.15 240)",
    },
    {
      step: "02",
      title: "Supply Chain Bottleneck Analysis",
      description: "Trace physical constraints from raw materials (HBM DRAM, CoWoS packaging, power transformers) through to end-user deployment. Identify cascade failure points and lead-time asymmetries.",
      color: "oklch(0.7 0.15 155)",
    },
    {
      step: "03",
      title: "Earnings Validation",
      description: "Cross-reference management guidance against analyst consensus, actual capex disbursements, and revenue recognition patterns. Flag divergences between stated intent and financial reality.",
      color: "oklch(0.78 0.15 85)",
    },
    {
      step: "04",
      title: "Interdependency Mapping",
      description: "Model second-order effects: how Jevons Paradox feedback loops interact with circular financing risk, how power grid constraints affect neocloud default probability, and how enterprise ROI data shapes hyperscaler pricing power.",
      color: "oklch(0.7 0.15 300)",
    },
    {
      step: "05",
      title: "Contrarian Stress-Testing",
      description: "Construct bear cases with equal rigor as the base case. Apply historical analogues (dot-com capex cycle, 5G overbuild) to stress-test assumptions. Identify the specific conditions under which consensus is most wrong.",
      color: "oklch(0.65 0.2 25)",
    },
  ];

  const sources = [
    { category: "Investment Banks", items: ["Goldman Sachs", "J.P. Morgan", "Morgan Stanley", "Man Group"] },
    { category: "Research Firms", items: ["Gartner", "IDC", "Dell'Oro", "Forrester", "TrendForce", "Epoch AI"] },
    { category: "Company Filings", items: ["NVIDIA", "Microsoft", "Alphabet", "Amazon", "Meta", "Oracle", "CoreWeave", "Nebius"] },
    { category: "Credit & Risk", items: ["Moody's", "CBRE", "BCG", "WSJ", "Forbes"] },
  ];

  return (
    <section id="methodology" className="py-16 border-t border-border/30">
      <div className="container max-w-5xl">
        <div className="mb-10">
          <h2 className="text-2xl sm:text-3xl font-sans font-semibold mb-3">Research Methodology</h2>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            This monitor synthesizes primary source data through a five-stage analytical process designed to surface non-consensus insights and stress-test conventional assumptions about the AI infrastructure cycle.
          </p>
        </div>

        {/* Five-stage process */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {steps.map((s) => (
            <div key={s.step} className="p-5 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-xs font-bold" style={{ color: s.color }}>{s.step}</span>
                <div className="h-px flex-1" style={{ backgroundColor: s.color, opacity: 0.3 }} />
              </div>
              <h3 className="font-sans font-semibold text-sm mb-2 text-foreground">{s.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
            </div>
          ))}
          {/* Sixth card: AI Council */}
          <div className="p-5 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <span className="font-mono text-xs font-bold text-[oklch(0.65_0.12_200)]">06</span>
              <div className="h-px flex-1 bg-[oklch(0.65_0.12_200)]/30" />
            </div>
            <h3 className="font-sans font-semibold text-sm mb-2 text-foreground">AI Council Review</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              A 10-member expert council spanning semiconductor supply chain, enterprise software, macro finance, energy infrastructure, and competitive strategy independently critiques each analytical layer and surfaces blind spots.
            </p>
          </div>
        </div>

        {/* Sources grid */}
        <div className="border-t border-border/30 pt-8">
          <h3 className="font-sans font-semibold text-sm mb-4 text-muted-foreground uppercase tracking-wider">Primary Sources</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {sources.map((group) => (
              <div key={group.category}>
                <div className="font-mono text-xs text-muted-foreground/60 uppercase tracking-wider mb-2">{group.category}</div>
                <ul className="space-y-1">
                  {group.items.map((item) => (
                    <li key={item} className="text-xs text-foreground/70 font-mono">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-8 text-xs text-muted-foreground/50 font-mono">
          Not investment advice. All figures sourced from public filings, earnings calls, and research reports. Data as of July 12, 2026.
        </p>
      </div>
    </section>
  );
}
