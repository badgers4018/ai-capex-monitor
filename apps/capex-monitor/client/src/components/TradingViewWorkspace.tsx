import { useEffect, useMemo, useRef } from "react";
import { Download, ExternalLink, LineChart, Radio, ShieldCheck } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { AI_CAPEX_UNIVERSE } from "@/data/aiCapexMarketData";

interface TradingViewWorkspaceProps {
  activeTicker: string;
}

function toTradingViewSymbol(ticker: string) {
  const company = AI_CAPEX_UNIVERSE.find((item) => item.ticker === ticker);
  return `${company?.exchange ?? "NASDAQ"}:${ticker}`;
}

function tradingViewUrl(symbol: string) {
  return `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(symbol)}`;
}

export function TradingViewWorkspace({ activeTicker }: TradingViewWorkspaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const symbol = toTradingViewSymbol(activeTicker);
  const watchlist = useMemo(
    () => AI_CAPEX_UNIVERSE.map((company) => toTradingViewSymbol(company.ticker)),
    []
  );

  const exportWatchlist = () => {
    const contents = [
      "# Capital Misallocation — AI Capex Monitor — TradingView symbols",
      "# Generated from the 50-name market universe. Paste symbols into a TradingView watchlist.",
      ...watchlist,
    ].join("\n");
    const blob = new Blob([contents], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "capital-misallocation-ai-capex-monitor-watchlist.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.replaceChildren();
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.textContent = JSON.stringify({
      autosize: true,
      symbol,
      interval: "D",
      timezone: "exchange",
      theme: theme === "dark" ? "dark" : "light",
      style: "1",
      locale: "en",
      withdateranges: true,
      hide_side_toolbar: false,
      allow_symbol_change: true,
      save_image: false,
      calendar: false,
      watchlist,
      support_host: "https://www.tradingview.com",
    });
    container.appendChild(script);

    return () => container.replaceChildren();
  }, [symbol, theme, watchlist]);

  return (
    <section id="tradingview" className="scroll-mt-24 rounded-[var(--radius-lg)] border border-border/60 bg-card/45 p-4 shadow-[var(--shadow-md)] sm:p-5">
      <div className="mb-4 flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[rgb(41_98_255_/_0.4)] bg-[rgb(41_98_255_/_0.12)] text-[#3d83ff]">
            <LineChart className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <p className="observatory-kicker text-[#3d83ff]">TradingView market workstation</p>
            <h3 className="mt-1 text-base font-semibold text-foreground">Live chart + 50-name watchlist</h3>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
              Select a name in the research ledger to focus the chart. The embedded watchlist preserves the full AI-capex universe and supports interval, indicator, and symbol controls in the widget.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportWatchlist} className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border border-border/70 bg-[var(--recessed)] px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-foreground transition-colors duration-150 hover:border-[#3d83ff]/60 hover:text-[#3d83ff] active:scale-[0.97]">
            Export 50 symbols <Download className="h-3 w-3" aria-hidden="true" />
          </button>
          <a
            href={tradingViewUrl(symbol)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border border-border/70 bg-[var(--recessed)] px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-foreground transition-colors duration-150 hover:border-[#3d83ff]/60 hover:text-[#3d83ff] active:scale-[0.97]"
          >
            Open {activeTicker} <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        </div>
      </div>

      <div className="relative h-[520px] overflow-hidden rounded-[var(--radius-md)] border border-border/50 bg-[var(--recessed)] sm:h-[640px]">
        <div ref={containerRef} className="h-full w-full" aria-label={`Interactive TradingView chart for ${activeTicker}`} />
      </div>

      <div className="mt-3 flex flex-col gap-2 text-[10px] leading-5 text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex items-center gap-1.5"><Radio className="h-3 w-3 text-[var(--signal-cyan)]" aria-hidden="true" /> Widget market data is supplied by TradingView.</span>
        <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3 w-3 text-[var(--signal-gold)]" aria-hidden="true" /> Charting is informational only—not a trade execution surface.</span>
      </div>
    </section>
  );
}
