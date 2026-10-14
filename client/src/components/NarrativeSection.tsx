import { Brain, Server, Cloud, Monitor, Cpu, Zap, Globe, Shield, TrendingUp, DollarSign, Rocket, AlertTriangle } from "lucide-react";

export function NarrativeSection() {
  return (
    <section id="analysis" className="py-24 relative">
      <div className="container max-w-5xl">

        {/* Key insight cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          <InsightCard
            icon={<Brain className="w-5 h-5" />}
            color="oklch(0.7 0.15 240)"
            title="AI Market"
            value="$2.59T"
            detail="Jevons Paradox: 280x cheaper → more spend"
          />
          <InsightCard
            icon={<Server className="w-5 h-5" />}
            color="oklch(0.75 0.15 70)"
            title="Hyperscaler Capex"
            value="$800B"
            detail="Goldman Sachs Jun 29 · Cloud alone $670B"
          />
          <InsightCard
            icon={<Zap className="w-5 h-5" />}
            color="oklch(0.65 0.2 25)"
            title="Power Constraint"
            value="85% shortfall"
            detail="THE binding limit · Not money, not chips"
          />
          <InsightCard
            icon={<Rocket className="w-5 h-5" />}
            color="oklch(0.7 0.15 45)"
            title="SpaceX (SPCX)"
            value="$2.0T"
            detail="$20.7B capex · Orbital compute wildcard"
          />
        </div>


        <div className="space-y-8">
          <NarrativeBlock title="The Jevons Paradox: Why Efficiency Accelerates Spending">
            <p className="text-base leading-relaxed text-foreground/90">
              The most counterintuitive finding: the cost per AI token has fallen <span className="font-mono text-[oklch(0.7_0.15_240)]">280x in three years</span>, yet total AI bills keep climbing. This is Jevons Paradox at planetary scale. DeepSeek made its 75% price cut permanent: same benchmark score as Claude, 28x cheaper: yet Uber blew through its entire 2026 AI budget in four months. NVIDIA's VP confirmed that "compute now costs more than employees" for many companies, with engineers generating $500-$2,000/month in token costs alone.
            </p>
            <p className="text-base leading-relaxed text-foreground/90 mt-4">
              This means efficiency gains (DeepSeek, model distillation, quantization) do NOT reduce infrastructure spending: they <em>accelerate</em> it by making AI economically viable for millions of new use cases. Gartner's $2.59 trillion AI spending figure for 2026 reflects this dynamic: as inference costs collapse, total compute demand explodes. The shift from episodic training to continuous 24/7 inference loads means data centers face sustained power demand, not burst capacity needs.
            </p>
          </NarrativeBlock>

          <NarrativeBlock title="The $800 Billion Hyperscaler Buildout: And Its 5:1 ROI Gap">
            <p className="text-base leading-relaxed text-foreground/90">
              Goldman Sachs (June 29, 2026) now projects cloud providers alone pouring <span className="font-mono text-[oklch(0.75_0.15_70)]">$670 billion into capex in 2026</span>, with total AI-related spending approaching <span className="font-mono text-[oklch(0.75_0.15_70)]">$800B (+95% YoY)</span>. Dell'Oro Group raised its 2026 data-center capex outlook above $1 trillion. IDC forecasts semiconductor revenue jumping 53% to $1.29T. Morgan Stanley projects $3 trillion cumulative between 2025-2028. Verified Q1 2026 earnings: Amazon $44.2B (+77%), Microsoft $31.9B (Q4 guided "over $40B"), Alphabet $35.7B (full-year raised to $180-190B), Meta $19.8B (full-year raised to $125-145B). NVIDIA beat with $81.6B revenue (+85.2% YoY), EPS $1.87 vs $1.76 est. This is <span className="font-mono text-[oklch(0.75_0.15_70)]">5.5x the dot-com peak</span> in absolute terms: internet/tech issuance peaked at $85B in 2001 vs. $465B projected for 2026 (Man Group).
            </p>
            <p className="text-base leading-relaxed text-foreground/90 mt-4">
              The <span className="font-mono text-[oklch(0.75_0.15_70)]">$600B revenue gap</span> (J.P. Morgan): the industry needs $650B in NEW annual revenue for a 10% return. Bain projects $2T needed by 2030. Current AI-attributable revenue: $50-150B. Capex is growing 46% faster than revenue: exceeding the 2001 telecom bubble's 32% divergence. Implied payback: 7.6 years. The debt maturity wall: $330B of tech debt matures through 2028, Morgan Stanley expects $570B in AI-related debt issuance in 2026. June alone saw $175B in high-grade bonds (record). Oracle's RPO hit a record <span className="font-mono text-[oklch(0.75_0.15_70)]">$638B (+363% YoY)</span> while FCF went negative $23.7B in FY2026: planning to raise $40B more in FY2027. Microsoft's cloud gross margin compressed to 67.6% (lowest since 2022) as memory costs soar. Capital intensity (capex/revenue) has reached 45-57%: utility-like, not tech-like. Yet the bull signals are also real: Google Cloud backlog <span className="font-mono text-[oklch(0.75_0.15_70)]">$460B+</span> (doubled), Cloud revenue +63% YoY to $20B/Q (capacity-constrained), AWS fastest growth in 15 quarters, Microsoft AI $37B ARR (+123%), BCG/Forrester finds AI agents pay back in 5.1 months median.
            </p>
          </NarrativeBlock>

          <NarrativeBlock title="Power Grid: The True Binding Constraint (Not Money, Not Chips)">
            <p className="text-base leading-relaxed text-foreground/90">
              Gartner's June 10, 2026 report reveals data center electricity demand will reach <span className="font-mono text-[oklch(0.65_0.2_25)]">565 TWh in 2026</span> (+26% YoY), with AI servers consuming 175 TWh: surpassing conventional servers by 2027. By 2030, demand exceeds 1,200 TWh. The US needs 69 GW of power for data centers between 2025-2028, but only 10 GW is achievable: an <span className="font-mono text-[oklch(0.65_0.2_25)]">85% shortfall</span>.
            </p>
            <p className="text-base leading-relaxed text-foreground/90 mt-4">
              Grid connection wait times exceed 4 years. Rep. Frank Pallone Jr. called for a national moratorium on AI data centers (June 25, 2026). The DOE's Jigar Shah confirmed: "delays are caused by energization, NOT construction or financing." Our July 2026 research confirms: <span className="font-mono text-[oklch(0.65_0.2_25)]">30-50% of large US AI data centers scheduled for 2026 will be delayed or cancelled</span>. Of 16 GW announced, only 5 GW is under construction: 11 GW shows no signs of breaking ground. High-power transformers now face 3-5 year delivery schedules (up from 24-30 months). Switchgear is sold out through 2028. The national grid interconnection queue has a 2,600 GW backlog with 80% of projects ultimately withdrawing. Nuclear SMRs (80+ designs in development, $900M DOE funding) won't arrive until 2030+. This means electricity: not capital, not chips: determines the pace of AI infrastructure expansion for the next 4-5 years. NVIDIA's Vera Rubin NVL72 racks will draw 600kW each by 2027, making the power problem exponentially worse.
            </p>
          </NarrativeBlock>

          <NarrativeBlock title="SpaceX (SPCX): The $2T Public Juggernaut">
            <p className="text-base leading-relaxed text-foreground/90">
              SpaceX (NASDAQ: SPCX) went public on June 12, 2026 in a record $75B IPO at $135/share, opening at $150 and currently trading at ~$152.80 with a ~$2.0T market cap. Just 11 days later, it raised <span className="font-mono text-[oklch(0.7_0.15_45)]">$25 billion in investment-grade bonds</span> (with $89B in demand), replacing costly pre-IPO debt. With $20.7B in 2025 capex, it operates at hyperscaler scale. Starlink generates $7.5B in revenue from 5M+ subscribers, enabling data center connectivity in locations where grid power exists but fiber doesn't. xAI's Colossus cluster (200,000 H100 GPUs) is the world's largest single GPU deployment.
            </p>
            <p className="text-base leading-relaxed text-foreground/90 mt-4">
              The longer-term play is orbital compute: free solar power in space, Starlink's laser mesh for connectivity, and compute co-located with satellites. This could bypass the ground-level power constraint entirely by 2030+. As Gradient Flow noted, "what does SpaceX see that the rest of us do not?": running the same capital-hungry model in orbit where the power constraint vanishes. The SpaceX-xAI synergy creates a vertically integrated AI infrastructure stack: launch (SpaceX) → connectivity (Starlink) → compute (xAI) → applications (Grok). The $25B bond deal's overwhelming demand ($89B) signals the debt market views SpaceX as investment-grade infrastructure: not a speculative bet.
            </p>
          </NarrativeBlock>

          <NarrativeBlock title="The Cascade of Bottlenecks & Geopolitical Duplication">
            <p className="text-base leading-relaxed text-foreground/90">
              Our research reveals a cascading bottleneck structure: <span className="font-mono text-[oklch(0.65_0.12_200)]">Power grid → CoWoS packaging → ABF substrates → HBM memory → Liquid cooling → Skilled labor</span>. Each bottleneck feeds the next: resolving one merely reveals the next constraint. TSMC is aggressively scaling CoWoS capacity to <span className="font-mono text-[oklch(0.65_0.12_200)]">120,000-140,000 wafers/month by end-2026</span>, narrowing the packaging gap from 20% to 10%. Broadcom just secured its 5th custom ASIC customer with a $1B order, and its Q2 FY26 AI semiconductor revenue hit $10.8B (+143% YoY). AMD's MI400 with HBM4 is positioned to capture significant inference share by Q4 2026. Gartner now forecasts semiconductor revenue exceeding $1.3T in 2026 (+64% YoY). But the hidden ABF substrate shortage (Ajinomoto sole supplier, 42% demand gap by 2028, 18-24 month factory lead times) constrains further expansion.
            </p>
            <p className="text-base leading-relaxed text-foreground/90 mt-4">
              Meanwhile, geopolitical fragmentation is multiplying total spending. The EU is joining the US pact to break reliance on Chinese AI supply chains. Taiwan is threatening chip flow restrictions. Gulf states are spending "hundreds of billions" on sovereign AI (Saudi PIF: $40B+ allocated). This sovereign AI mandate drives 2-3x infrastructure duplication compared to a cooperative global scenario. The result: even if individual company ROI disappoints, aggregate global AI infrastructure spending will continue accelerating due to geopolitical competition.
            </p>
          </NarrativeBlock>

          <NarrativeBlock title="Enterprise Budget Backlash: The Contrarian Signal">
            <p className="text-base leading-relaxed text-foreground/90">
              The Wall Street Journal reported (May 28, 2026): "Corporate America Is Starting to Ration AI as Cost Skyrockets." Only <span className="font-mono text-[oklch(0.7_0.15_300)]">18% of spending on AI coding tokens translates to shipped products</span>. One enterprise spent $500M on AI in a single month (governance failure). Forrester found 25% of enterprises postponing planned AI spend to 2027. OpenAI is reportedly weighing price cuts as businesses feel pain.
            </p>
            <p className="text-base leading-relaxed text-foreground/90 mt-4">
              Yet this backlash may paradoxically accelerate the Jevons cycle: as providers cut prices to retain customers, cheaper AI becomes viable for even more use cases, driving total spend higher. The EU AI Act adds compliance costs of €320,000-€600,000 per high-risk system: a "rounding error for OpenAI" but a "death sentence for a 5-person team": consolidating the market toward large players who can absorb regulatory overhead.
            </p>
          </NarrativeBlock>

          <NarrativeBlock title="Demand-Side Reality Check: Where Enterprise ROI Is Actually Landing">
            <p className="text-base leading-relaxed text-foreground/90">
              BCG and Forrester data show AI agents paying back in a median <span className="font-mono text-[oklch(0.7_0.15_300)]">5.1 months</span> when deployed correctly, but adoption is sharply bifurcated. The winners are concentrated in three use cases: code generation (GitHub Copilot saves 55% of developer time on routine tasks), customer service automation (Klarna replaced 700 agents with one AI system, cutting resolution time from 11 minutes to 2), and document processing (JP Morgan's COiN processes 12,000 contracts in seconds vs. 360,000 lawyer-hours annually). Outside these three categories, ROI timelines extend to 18-36 months, explaining why Forrester found 25% of enterprises postponing spend.
            </p>
            <p className="text-base leading-relaxed text-foreground/90 mt-4">
              The structural problem is governance, not technology. Enterprises that deployed AI without usage controls saw token costs spiral: one Fortune 500 firm spent <span className="font-mono text-[oklch(0.7_0.15_300)]">$500M in a single month</span> before implementing guardrails. The 18% token-to-shipped-product ratio cited by the WSJ reflects this governance gap, not a fundamental failure of AI productivity. Companies with mature FinOps practices for AI (tagging, budgeting, chargeback) are seeing 3-5x better ROI than those treating AI as an unmetered utility. The implication: enterprise AI spend will not collapse, but it will consolidate toward vendors offering cost-transparency tooling alongside capability.
            </p>
          </NarrativeBlock>

          <NarrativeBlock title="Physical Bottleneck Deep Dive: CoWoS, HBM4, and the Grid Queue">
            <p className="text-base leading-relaxed text-foreground/90">
              The semiconductor supply chain has a hidden chokepoint that most analyses miss: <span className="font-mono text-[oklch(0.65_0.12_200)]">CoWoS advanced packaging</span>. Every H100, H200, and Blackwell GPU requires CoWoS to connect HBM memory to the compute die. TSMC is the sole high-volume supplier. At peak 2024 demand, the wait for CoWoS capacity exceeded 52 weeks. TSMC is scaling to 130,000 wafers/month by end-2026 (from ~80,000), narrowing the gap from 20% to approximately 10%. But Broadcom's 5th custom ASIC win and AMD's MI400 ramp both compete for the same capacity, meaning the bottleneck eases but does not clear.
            </p>
            <p className="text-base leading-relaxed text-foreground/90 mt-4">
              HBM4 memory (required for next-generation inference at scale) faces a parallel constraint. SK Hynix controls ~50% of HBM supply; Samsung and Micron are ramping but face yield challenges at HBM4 density. SK Hynix guided $30B in 2026 capex specifically to defend this position. The grid interconnection queue is the third physical constraint: 2,600 GW of projects are queued in the US, with 80% ultimately withdrawing due to multi-year wait times. CBRE confirmed in July 2026 that <span className="font-mono text-[oklch(0.65_0.12_200)]">30-50% of announced 2026 US data center capacity</span> will not break ground. The companies that locked in power agreements in 2022-2023 (Amazon Virginia, Microsoft Iowa, Google South Carolina) hold a structural moat that cannot be replicated for 4+ years.
            </p>
          </NarrativeBlock>
        </div>

        {/* Stress-test scenarios */}
        <div className="mt-16 mb-8">
          <h3 className="font-sans font-semibold text-lg mb-6 text-foreground">Stress-Test Scenarios</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ScenarioCard
              title="Jevons Acceleration"
              probability="40-50%"
              description="Efficiency gains drive MORE demand. Spending exceeds projections. $1T+ annual hyperscaler capex by 2028. Power grid becomes binding globally."
              color="oklch(0.7 0.15 240)"
            />
            <ScenarioCard
              title="Power Grid Failure"
              probability="30-40%"
              description="85% of planned DC capacity can't get power. Projects delayed 2-4 years. Spending shifts to power infrastructure. Geographic redistribution."
              color="oklch(0.65 0.2 25)"
            />
            <ScenarioCard
              title="Debt Maturity Wall"
              probability="25-35%"
              description="$330B tech debt matures by 2028. 20-yr leases on 5-yr debt. Refinancing crisis if AI revenue lags. Oracle CDS at GFC levels. Private credit defaults spreading."
              color="oklch(0.75 0.15 70)"
            />
            <ScenarioCard
              title="Geopolitical Shock"
              probability="10-15%"
              description="Taiwan strait crisis disrupts foundry supply. 90%+ of advanced AI chips affected. 6-18 month supply disruption. Existing GPU prices spike 5-10x."
              color="oklch(0.6 0.15 350)"
            />
          </div>
        </div>

        {/* Council-identified risks */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <RiskCard
            icon={<Zap className="w-4 h-4" />}
            title="Power = Binding Limit"
            description="85% shortfall. 4+ yr grid waits. National moratorium proposed. SMRs not until 2030."
            color="oklch(0.65 0.2 25)"
          />
          <RiskCard
            icon={<Cpu className="w-4 h-4" />}
            title="Bottleneck Cascade"
            description="Power → CoWoS → ABF substrates → HBM → Cooling. Each resolved reveals the next."
            color="oklch(0.65 0.12 200)"
          />
          <RiskCard
            icon={<TrendingUp className="w-4 h-4" />}
            title="5:1 ROI Gap"
            description="$190B MSFT capex vs $37B AI revenue. CoreWeave $740M Q1 loss. Fed flags systemic risk."
            color="oklch(0.75 0.15 70)"
          />
          <RiskCard
            icon={<Globe className="w-4 h-4" />}
            title="Geopolitical 2-3x"
            description="Sovereign AI mandates duplicating infrastructure. EU, Gulf, India building parallel stacks."
            color="oklch(0.6 0.15 350)"
          />
          <RiskCard
            icon={<AlertTriangle className="w-4 h-4" />}
            title="Enterprise Backlash"
            description="25% postponing spend. Only 18% of tokens → products. $500M single-month governance failure."
            color="oklch(0.7 0.15 300)"
          />
          <RiskCard
            icon={<DollarSign className="w-4 h-4" />}
            title="$600B Revenue Gap"
            description="JPM: need $650B new revenue for 10% return. Bain: $2T by 2030. Current: $50-150B. Gap widening at 46%/yr."
            color="oklch(0.65 0.12 320)"
          />
        </div>
      </div>
    </section>
  );
}

function InsightCard({ icon, color, title, value, detail }: { icon: React.ReactNode; color: string; title: string; value: string; detail: string }) {
  return (
    <div className="p-5 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm hover:border-border transition-[transform,opacity,border-color,background-color] duration-300 group">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-md" style={{ backgroundColor: `color-mix(in oklch, ${color} 15%, transparent)` }}>
          <div style={{ color }}>{icon}</div>
        </div>
        <div>
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">{title}</div>
          <div className="text-lg font-mono font-bold" style={{ color }}>{value}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{detail}</div>
        </div>
      </div>
    </div>
  );
}

function NarrativeBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-border/50 pl-6">
      <h3 className="font-sans font-semibold text-xl mb-4 text-foreground">{title}</h3>
      {children}
    </div>
  );
}

function ScenarioCard({ title, probability, description, color }: { title: string; probability: string; description: string; color: string }) {
  return (
    <div className="p-5 rounded-lg border border-border/30 bg-card/20">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-sm font-semibold" style={{ color }}>{title}</span>
        <span className="text-fluid-xs font-mono px-2 py-0.5 rounded-full border border-border/50 text-muted-foreground">
          P: {probability}
        </span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function RiskCard({ icon, title, description, color }: { icon: React.ReactNode; title: string; description: string; color: string }) {
  return (
    <div className="p-4 rounded-lg border border-border/30 bg-card/20 flex items-start gap-3">
      <div className="p-1.5 rounded" style={{ backgroundColor: `color-mix(in oklch, ${color} 10%, transparent)` }}>
        <div style={{ color }}>{icon}</div>
      </div>
      <div>
        <div className="text-sm font-semibold text-foreground/90">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
      </div>
    </div>
  );
}
