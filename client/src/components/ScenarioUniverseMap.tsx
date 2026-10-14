import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Layers3, ShieldAlert, Target } from "lucide-react";
import { AI_CAPEX_SCENARIO_LENS, scenarioLensCounts, type ScenarioExposureRole, type ScenarioLensId } from "@/data/aiCapexScenarioLens";

type Props = { activeScenario: ScenarioLensId };

const roleConfig: Record<ScenarioExposureRole, { label: string; className: string }> = {
  positive: { label: "Supported", className: "border-emerald-700/50 bg-emerald-950/30 text-emerald-300" },
  neutral: { label: "Mixed", className: "border-amber-700/50 bg-amber-950/30 text-amber-300" },
  negative: { label: "At risk", className: "border-red-700/50 bg-red-950/30 text-red-300" },
};

const scenarioCopy: Record<ScenarioLensId, string> = {
  bull: "A high-buildout lens: direct equipment, networking, grid, power, and cooling suppliers have the clearest structural support, while capacity owners still must execute.",
  base: "A high-plateau lens: structural bottlenecks and self-funded platforms remain supported; capacity owners with funding and utilization dependency are more vulnerable.",
  bear: "A capex-reset lens: direct cyclical equipment exposure and capital-intensive capacity models face the most downside sensitivity; diversified exposure remains mixed.",
};

export function ScenarioUniverseMap({ activeScenario }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [roleFilter, setRoleFilter] = useState<"all" | ScenarioExposureRole>("all");
  const counts = scenarioLensCounts(activeScenario);
  const rows = useMemo(() => AI_CAPEX_SCENARIO_LENS.filter((company) => roleFilter === "all" || company.scenarios[activeScenario].role === roleFilter), [activeScenario, roleFilter]);
  const visibleRows = expanded ? rows : rows.slice(0, 12);

  return (
    <section className="mt-8 rounded-[var(--radius-lg)] border border-border/60 bg-card/35 p-4 shadow-[var(--shadow-md)] sm:p-5">
      <div className="flex flex-col gap-4 border-b border-border/40 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--signal-cyan)]/40 bg-[var(--signal-cyan)]/10 text-[var(--signal-cyan)]">
            <Layers3 className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <p className="observatory-kicker text-[var(--signal-cyan)]">50-name scenario map</p>
            <h3 className="mt-1 text-base font-semibold text-foreground">Structural exposure under the active scenario</h3>
            <p className="mt-1 max-w-3xl text-xs leading-5 text-muted-foreground">{scenarioCopy[activeScenario]} This is a five-review structural exposure map—not an issuer-level price-target model.</p>
          </div>
        </div>
        <div className="inline-flex shrink-0 items-center gap-1 rounded-[var(--radius-sm)] border border-border/50 bg-[var(--recessed)] p-1">
          {(["all", "positive", "neutral", "negative"] as const).map((role) => (
            <button key={role} onClick={() => setRoleFilter(role)} className={`rounded px-2 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.08em] transition-colors ${roleFilter === role ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {role === "all" ? "All" : roleConfig[role].label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {(Object.keys(roleConfig) as ScenarioExposureRole[]).map((role) => (
          <button key={role} onClick={() => setRoleFilter(roleFilter === role ? "all" : role)} className={`rounded-[var(--radius-sm)] border p-3 text-left transition-[border-color,background-color,transform] duration-150 hover:-translate-y-0.5 active:scale-[0.99] ${roleFilter === role ? roleConfig[role].className : "border-border/40 bg-[var(--recessed)]/50"}`}>
            <span className="font-mono text-lg font-semibold text-foreground">{counts[role]}</span>
            <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">{roleConfig[role].label}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-[var(--radius-md)] border border-border/40">
        <table className="w-full min-w-[680px] border-collapse text-left">
          <thead className="bg-[var(--recessed)]/80 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
            <tr><th className="px-3 py-2.5">Ticker</th><th className="px-3 py-2.5">Company</th><th className="px-3 py-2.5">Sleeve</th><th className="px-3 py-2.5">Council stance</th><th className="px-3 py-2.5">Scenario lens</th></tr>
          </thead>
          <tbody>
            {visibleRows.map((company) => {
              const exposure = company.scenarios[activeScenario];
              return <tr key={company.ticker} className="border-t border-border/30 hover:bg-accent/15">
                <td className="px-3 py-2.5 font-mono text-xs font-bold text-[var(--signal-gold)]">{company.ticker}</td>
                <td className="px-3 py-2.5 text-xs font-medium text-foreground">{company.name}</td>
                <td className="px-3 py-2.5 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">{company.category}</td>
                <td className="px-3 py-2.5 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">{company.stance.replace("capex-", "")}</td>
                <td className="px-3 py-2.5"><span className={`inline-flex rounded-full border px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.07em] ${roleConfig[exposure.role].className}`}>{exposure.label}</span></td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>

      {rows.length > 12 && <button onClick={() => setExpanded((value) => !value)} className="mt-4 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.09em] text-[var(--signal-cyan)] transition-colors hover:text-foreground">{expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}{expanded ? "Show fewer names" : `Show all ${rows.length} names`}</button>}

      <div className="mt-4 flex gap-2 rounded-[var(--radius-sm)] border border-amber-700/30 bg-amber-950/15 p-3 text-[10px] leading-5 text-amber-100/75"><ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" aria-hidden="true" /><span>Structural labels reflect how a business model tends to transmit an AI-capex scenario. They do not predict security prices, valuation, or investment suitability.</span></div>
      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground"><Target className="h-3 w-3 text-[var(--signal-gold)]" aria-hidden="true" />Each row is traceable to the five-review council stance in the market universe.</div>
    </section>
  );
}
