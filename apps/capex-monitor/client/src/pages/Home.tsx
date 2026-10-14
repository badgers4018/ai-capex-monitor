import { AISearchBar } from "@/components/AISearchBar";
import { AiCapexUniverse } from "@/components/AiCapexUniverse";
import { CapacityTimeline } from "@/components/CapacityTimeline";
import { ChangelogFeed } from "@/components/ChangelogFeed";
import { CircularFinancingRisk } from "@/components/CircularFinancingRisk";
import { CompanyComparison } from "@/components/CompanyComparison";
import { CompanyDeepDive } from "@/components/CompanyDeepDive";
import { DashboardCommandHeader } from "@/components/DashboardCommandHeader";
import { DataStatusBar } from "@/components/DataStatusBar";
import { DebtMaturityWall } from "@/components/DebtMaturityWall";
import { EmailSubscription } from "@/components/EmailSubscription";
import { ExportPanel } from "@/components/ExportPanel";
import { FCFCountdown } from "@/components/FCFCountdown";
import { FlowchartSection } from "@/components/FlowchartSection";
import { Footer } from "@/components/Footer";
import { KeyFundamentals } from "@/components/KeyFundamentals";
import { MarketDataSection } from "@/components/MarketDataSection";
import { MetaCloudEntry } from "@/components/MetaCloudEntry";
import { MethodologySection } from "@/components/MethodologySection";
import { NarrativeSection } from "@/components/NarrativeSection";
import { NavigationBar } from "@/components/NavigationBar";
import { PositionBuilder } from "@/components/PositionBuilder";
import { RiskRadar } from "@/components/RiskRadar";
import { ScenarioCalculator } from "@/components/ScenarioCalculator";
import { ScenarioDeepDive } from "@/components/ScenarioDeepDive";
import { ScenarioModeler } from "@/components/ScenarioModeler";
import { SensitivityMatrix } from "@/components/SensitivityMatrix";
import { SourcesSection } from "@/components/SourcesSection";
import { SpreadsheetSection } from "@/components/SpreadsheetSection";
import { StrategicSection } from "@/components/StrategicSection";
import { SectionHeading } from "@/components/BrandMark";

function ObservatoryDivider({ left, right }: { left: string; right: string }) {
  return (
    <div className="border-y border-border/50 bg-[var(--recessed)]/70 py-4">
      <div className="container flex max-w-7xl items-center gap-4">
        <span className="observatory-kicker shrink-0 text-[var(--signal-gold)]">{left}</span>
        <div className="h-px flex-1 bg-border/70" />
        <span className="observatory-kicker shrink-0">{right}</span>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="observatory-shell">
      <a href="#overview" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">Skip to monitor</a>
      <NavigationBar />
      <main>
        <DashboardCommandHeader />

        <section id="watchlist" className="border-b border-border/50 py-14 sm:py-20">
          <div className="container max-w-7xl">
            <SectionHeading index="01" eyebrow="Capital commitments" title="The buildout leaderboard" description="A concentrated watchlist of the companies turning narrative conviction into deployed infrastructure capital." />
            <div className="mt-8"><CompanyDeepDive /></div>
          </div>
        </section>

        <section className="bg-[var(--recessed)]/50 py-8 sm:py-10">
          <div className="container max-w-4xl"><FCFCountdown /></div>
        </section>

        <DataStatusBar />
        <AISearchBar />
        <NarrativeSection />
        <MetaCloudEntry />
        <CapacityTimeline />
        <FlowchartSection />

        <ObservatoryDivider left="Evidence ledger" right="Spending & market data" />
        <SpreadsheetSection />
        <MarketDataSection />
        <KeyFundamentals />
        <AiCapexUniverse />

        <ObservatoryDivider left="Scenario architecture" right="Risk transmission" />
        <StrategicSection />
        <ScenarioModeler />
        <section id="export" className="py-16"><div className="container max-w-5xl"><ExportPanel /></div></section>
        <ChangelogFeed />
        <SensitivityMatrix />
        <RiskRadar />
        <CircularFinancingRisk />
        <DebtMaturityWall />
        <ScenarioCalculator />
        <ScenarioDeepDive />
        <PositionBuilder />
        <CompanyComparison />

        <ObservatoryDivider left="Research delivery" right="Sources & methodology" />
        <section id="subscribe" className="py-16 sm:py-20"><div className="container max-w-lg"><EmailSubscription /></div></section>
        <SourcesSection />
        <MethodologySection />
      </main>
      <Footer />
    </div>
  );
}
