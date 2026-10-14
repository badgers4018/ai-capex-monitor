import { useState, useEffect } from "react";
import { ArrowDown } from "lucide-react";
import { CompanyDeepDive } from "./CompanyDeepDive";

function AnimatedCounter({ end, duration = 2000, prefix = "$", suffix = "", decimals = 0 }: { end: number; duration?: number; prefix?: string; suffix?: string; decimals?: number }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.5 }
    );
    const el = document.getElementById("hero-counters");
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(end * eased * Math.pow(10, decimals)) / Math.pow(10, decimals));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [started, end, duration, decimals]);

  return (
    <span className="font-mono font-bold">
      {prefix}{decimals > 0 ? count.toFixed(decimals) : count.toLocaleString()}{suffix}
    </span>
  );
}

export function HeroSection() {
  return (
    <section id="overview" className="relative h-[100vh] max-h-[900px] overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://d2xsxph8kpxj0f.cloudfront.net/310519663305152617/ZGmmwtuoPH63p4k3Y3pKpf/hero-bg-KX9tjECA5M7UwFLjrNAFjd.webp"
          alt=""
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 container max-w-6xl text-center pt-24 sm:pt-28 pb-6 sm:pb-10">
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm mb-4 sm:mb-8">
          <span className="w-2 h-2 rounded-full bg-[oklch(0.65_0.2_25)] animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Top 8 Spenders: Last Updated: July 12, 2026
          </span>
        </div>

        {/* Brand Logo */}
        <div className="flex justify-center mb-2 sm:mb-4">
          <img
            src="/manus-storage/brand-logo_d3def2d5.png"
            alt="Capital Misallocation"
            className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 opacity-90 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
          />
        </div>

        {/* Subtitle */}
        <p className="text-lg sm:text-2xl lg:text-4xl font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-1 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]" >
          CAPITAL MISALLOCATION
        </p>

        {/* Main Title */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold uppercase leading-tight mb-3 sm:mb-4 tracking-tight text-[oklch(0.78_0.15_85)] drop-shadow-[0_0_30px_oklch(0.78_0.15_85_/_0.4)]">
          AI CAPEX BOOM MONITOR
        </h1>

        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto mb-4 sm:mb-6 leading-relaxed">
          Goldman Sachs (Jul 3): AI capex supercycle hits{" "}
          <span className="text-foreground font-medium">$800B in 2026 (+95% YoY)</span>.{" "}
          Cloud providers alone pouring <span className="text-foreground font-medium">$670B into capex</span> while a{" "}
          <span className="text-[oklch(0.65_0.2_25)] font-medium">$600B revenue gap</span> widens and{" "}
          <span className="text-foreground font-medium">Dell'Oro raises DC capex above $1T</span>.
        </p>

        {/* Top 8 Clickable Company Cards */}
        <div id="hero-counters" className="max-w-5xl mx-auto mb-4">
          <CompanyDeepDive />
        </div>

        {/* Key metrics row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 max-w-4xl mx-auto mb-4 sm:mb-6">
          <div className="p-3 rounded-lg border border-border/30 bg-card/20 backdrop-blur-sm">
            <div className="text-lg font-mono font-bold text-foreground">
              <AnimatedCounter end={800} prefix="$" suffix="B" />
            </div>
            <div className="text-fluid-xs font-mono text-muted-foreground">Global AI Spend 2026</div>
          </div>
          <div className="p-3 rounded-lg border border-border/30 bg-card/20 backdrop-blur-sm">
            <div className="text-lg font-mono font-bold text-[oklch(0.65_0.2_25)]">85%</div>
            <div className="text-fluid-xs font-mono text-muted-foreground">Power Shortfall (Gartner)</div>
          </div>
          <div className="p-3 rounded-lg border border-border/30 bg-card/20 backdrop-blur-sm">
            <div className="text-lg font-mono font-bold text-[oklch(0.7_0.15_240)]">$600B</div>
            <div className="text-fluid-xs font-mono text-muted-foreground">Revenue Gap (JPM)</div>
          </div>
          <div className="p-3 rounded-lg border border-border/30 bg-card/20 backdrop-blur-sm">
            <div className="text-lg font-mono font-bold text-[oklch(0.65_0.2_25)]">$3T</div>
            <div className="text-fluid-xs font-mono text-muted-foreground">Cumulative 2025-28 (MS)</div>
          </div>
        </div>

        {/* Bellwether stock strip */}
        <div className="flex flex-wrap justify-center gap-1.5 mb-4 max-w-5xl mx-auto">
          {[
            { sym: "NVDA", price: "$196.52", color: "oklch(0.7 0.15 240)", note: "+2.1%" },
            { sym: "CRWV", price: "$86.61", color: "oklch(0.7 0.18 280)", note: "↓10.3%" },
            { sym: "NBIS", price: "$220.23", color: "oklch(0.7 0.15 170)", note: "↓8.4%" },
            { sym: "MSFT", price: "$385.62", color: "oklch(0.7 0.15 155)", note: "+3.4%" },
            { sym: "GOOGL", price: "$363.87", color: "oklch(0.7 0.15 155)", note: "+7.9%" },
            { sym: "AMZN", price: "$245.57", color: "oklch(0.7 0.15 155)", note: "+5.5%" },
            { sym: "META", price: "$592.53", color: "oklch(0.75 0.15 70)", note: "+7.7%" },
            { sym: "ORCL", price: "$142.54", color: "oklch(0.65 0.2 25)", note: "↓4.0%" },
            { sym: "SPCX", price: "$152.80", color: "oklch(0.7 0.15 45)", note: "IPO Jun 12" },
            { sym: "AMD", price: "$565.92", color: "oklch(0.65 0.12 200)", note: "+8.5%" },
            { sym: "AVGO", price: "$374.04", color: "oklch(0.65 0.12 200)", note: "+2.5%" },
          ].map((s) => (
            <div key={s.sym} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border/30 bg-card/20 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="font-mono text-fluid-xs font-semibold text-foreground/80">{s.sym}</span>
              <span className="font-mono text-fluid-xs text-muted-foreground">{s.price}</span>
              {s.note && <span className="font-mono text-fluid-xs text-destructive">{s.note}</span>}
            </div>
          ))}
        </div>

        <div className="block">
          <a
            href="#analysis"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="font-mono uppercase tracking-wider">Explore Analysis</span>
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          </a>
        </div>
      </div>
    </section>
  );
}
