import React, { useState, useMemo } from "react";
import { AI_CAPEX_CORRELATION } from "@/data/aiCapexMarketData";

const CORR_TICKERS = AI_CAPEX_CORRELATION.tickers as readonly string[];
const CORR_MATRIX = AI_CAPEX_CORRELATION.matrix;
const CORR_META = { days: AI_CAPEX_CORRELATION.tradingDays, start: AI_CAPEX_CORRELATION.start, end: AI_CAPEX_CORRELATION.end };

// Color scale: -1 (red) → 0 (neutral) → +1 (green)
function getCorrelationColor(value: number): string {
  if (value >= 0) {
    const intensity = Math.min(value, 1);
    return `oklch(${0.45 + intensity * 0.2} ${intensity * 0.15} 145)`;
  } else {
    const intensity = Math.min(Math.abs(value), 1);
    return `oklch(${0.45 + intensity * 0.15} ${intensity * 0.18} 25)`;
  }
}

function getCorrelationBg(value: number): string {
  if (value >= 0.7) return "bg-emerald-900/60";
  if (value >= 0.4) return "bg-emerald-900/30";
  if (value >= 0.1) return "bg-emerald-900/10";
  if (value >= -0.1) return "bg-transparent";
  if (value >= -0.3) return "bg-red-900/10";
  if (value >= -0.5) return "bg-red-900/30";
  return "bg-red-900/50";
}

interface CorrelationMatrixProps {
  selectedTickers?: string[];
}

export function CorrelationMatrix({ selectedTickers }: CorrelationMatrixProps) {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const [showFullMatrix, setShowFullMatrix] = useState(false);

  // Filter to only show selected tickers (or all if none selected)
  const displayTickers = useMemo(() => {
    if (selectedTickers && selectedTickers.length >= 2) {
      return selectedTickers.filter(t => CORR_TICKERS.includes(t));
    }
    return showFullMatrix ? CORR_TICKERS : CORR_TICKERS.slice(0, 10); // Default show top 10
  }, [selectedTickers, showFullMatrix]);

  // Get indices for the display tickers
  const displayIndices = useMemo(() => {
    return displayTickers.map(t => CORR_TICKERS.indexOf(t));
  }, [displayTickers]);

  // Compute portfolio-level concentration risk
  const concentrationMetrics = useMemo(() => {
    if (!selectedTickers || selectedTickers.length < 2) return null;

    const indices = selectedTickers
      .map(t => CORR_TICKERS.indexOf(t))
      .filter(i => i >= 0);

    if (indices.length < 2) return null;

    let totalCorr = 0;
    let pairCount = 0;
    let maxCorr = -1;
    let maxPair: [string, string] = ["", ""];
    let minCorr = 1;
    let minPair: [string, string] = ["", ""];

    for (let i = 0; i < indices.length; i++) {
      for (let j = i + 1; j < indices.length; j++) {
        const corr = CORR_MATRIX[indices[i]][indices[j]];
        totalCorr += corr;
        pairCount++;
        if (corr > maxCorr) {
          maxCorr = corr;
          maxPair = [CORR_TICKERS[indices[i]], CORR_TICKERS[indices[j]]];
        }
        if (corr < minCorr) {
          minCorr = corr;
          minPair = [CORR_TICKERS[indices[i]], CORR_TICKERS[indices[j]]];
        }
      }
    }

    const avgCorr = totalCorr / pairCount;
    const diversificationScore = Math.max(0, Math.min(100, Math.round((1 - avgCorr) * 100)));

    return { avgCorr, maxCorr, maxPair, minCorr, minPair, diversificationScore, pairCount };
  }, [selectedTickers]);

  return (
    <div className="rounded-xl border border-border/50 bg-card/30 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border/30 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold flex items-center gap-2">
            180-Day Correlation Matrix
          </h4>
          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
            {CORR_META.start} → {CORR_META.end} · {CORR_META.days} trading days · Pearson daily returns
          </p>
        </div>
        {(!selectedTickers || selectedTickers.length < 2) && (
          <button
            onClick={() => setShowFullMatrix(!showFullMatrix)}
            className="text-[10px] px-2.5 py-1 rounded border border-border/50 hover:bg-accent/50 transition-colors text-muted-foreground"
          >
            {showFullMatrix ? "Show Top 10" : `Show All ${CORR_TICKERS.length}`}
          </button>
        )}
      </div>

      {/* Concentration Risk Summary (when portfolio is selected) */}
      {concentrationMetrics && (
        <div className="p-4 border-b border-border/30 bg-background/30">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-2.5 rounded-lg border border-border/30">
              <div className="text-[9px] font-mono text-muted-foreground uppercase">Diversification</div>
              <div className={`text-lg font-bold ${
                concentrationMetrics.diversificationScore >= 70 ? "text-emerald-400" :
                concentrationMetrics.diversificationScore >= 40 ? "text-amber-400" : "text-red-400"
              }`}>
                {concentrationMetrics.diversificationScore}/100
              </div>
            </div>
            <div className="p-2.5 rounded-lg border border-border/30">
              <div className="text-[9px] font-mono text-muted-foreground uppercase">Avg Correlation</div>
              <div className={`text-lg font-bold ${
                concentrationMetrics.avgCorr <= 0.3 ? "text-emerald-400" :
                concentrationMetrics.avgCorr <= 0.5 ? "text-amber-400" : "text-red-400"
              }`}>
                {concentrationMetrics.avgCorr.toFixed(2)}
              </div>
            </div>
            <div className="p-2.5 rounded-lg border border-border/30">
              <div className="text-[9px] font-mono text-muted-foreground uppercase">Most Correlated</div>
              <div className="text-xs font-mono font-bold text-red-400">
                {concentrationMetrics.maxPair[0]}/{concentrationMetrics.maxPair[1]}
              </div>
              <div className="text-[9px] text-muted-foreground">{concentrationMetrics.maxCorr.toFixed(2)}</div>
            </div>
            <div className="p-2.5 rounded-lg border border-border/30">
              <div className="text-[9px] font-mono text-muted-foreground uppercase">Least Correlated</div>
              <div className="text-xs font-mono font-bold text-emerald-400">
                {concentrationMetrics.minPair[0]}/{concentrationMetrics.minPair[1]}
              </div>
              <div className="text-[9px] text-muted-foreground">{concentrationMetrics.minCorr.toFixed(2)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Heatmap */}
      <div className="p-4 overflow-x-auto">
        <div className="min-w-fit">
          {/* Column headers */}
          <div className="flex">
            <div className="w-14 flex-shrink-0" /> {/* Spacer for row labels */}
            {displayTickers.map((ticker, colIdx) => (
              <div
                key={ticker}
                className={`w-10 flex-shrink-0 text-center text-[9px] font-mono pb-1 transition-colors ${
                  hoveredCell?.col === colIdx ? "text-foreground font-bold" : "text-muted-foreground"
                }`}
              >
                {ticker.length > 4 ? ticker.slice(0, 4) : ticker}
              </div>
            ))}
          </div>

          {/* Matrix rows */}
          {displayTickers.map((rowTicker, rowIdx) => (
            <div key={rowTicker} className="flex items-center">
              {/* Row label */}
              <div className={`w-14 flex-shrink-0 text-[9px] font-mono pr-2 text-right transition-colors ${
                hoveredCell?.row === rowIdx ? "text-foreground font-bold" : "text-muted-foreground"
              }`}>
                {rowTicker}
              </div>
              {/* Cells */}
              {displayTickers.map((colTicker, colIdx) => {
                const value = CORR_MATRIX[displayIndices[rowIdx]][displayIndices[colIdx]];
                const isDiagonal = rowIdx === colIdx;
                const isHovered = hoveredCell?.row === rowIdx && hoveredCell?.col === colIdx;

                return (
                  <div
                    key={`${rowTicker}-${colTicker}`}
                    className={`w-10 h-8 flex-shrink-0 flex items-center justify-center text-[9px] font-mono border border-border/10 transition-[background-color,color] cursor-crosshair ${
                      isDiagonal ? "bg-foreground/5" : getCorrelationBg(value)
                    } ${isHovered ? "ring-1 ring-primary z-10 scale-110" : ""}`}
                    style={!isDiagonal ? { backgroundColor: getCorrelationColor(value) } : undefined}
                    onMouseEnter={() => setHoveredCell({ row: rowIdx, col: colIdx })}
                    onMouseLeave={() => setHoveredCell(null)}
                    title={`${rowTicker} × ${colTicker}: ${value.toFixed(3)}`}
                  >
                    {isDiagonal ? (
                      <span className="text-muted-foreground/50">-</span>
                    ) : (
                      <span className={`${
                        Math.abs(value) >= 0.5 ? "text-white font-bold" :
                        Math.abs(value) >= 0.3 ? "text-white/80" : "text-white/50"
                      }`}>
                        {value.toFixed(2)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="text-[9px] font-mono text-red-400">-1.0</span>
          <div className="flex h-3 w-40 rounded-full overflow-hidden">
            <div className="flex-1" style={{ background: "oklch(0.55 0.18 25)" }} />
            <div className="flex-1" style={{ background: "oklch(0.50 0.09 25)" }} />
            <div className="flex-1" style={{ background: "oklch(0.45 0.02 90)" }} />
            <div className="flex-1" style={{ background: "oklch(0.50 0.07 145)" }} />
            <div className="flex-1" style={{ background: "oklch(0.60 0.15 145)" }} />
          </div>
          <span className="text-[9px] font-mono text-emerald-400">+1.0</span>
        </div>

        {/* Tooltip */}
        {hoveredCell && (
          <div className="mt-3 p-2.5 rounded-lg border border-border/50 bg-background/80 backdrop-blur-sm text-center">
            <span className="font-mono text-xs font-bold">{displayTickers[hoveredCell.row]}</span>
            <span className="text-muted-foreground text-xs mx-2">×</span>
            <span className="font-mono text-xs font-bold">{displayTickers[hoveredCell.col]}</span>
            <span className="text-muted-foreground text-xs mx-2">=</span>
            <span className={`font-mono text-sm font-bold ${
              CORR_MATRIX[displayIndices[hoveredCell.row]][displayIndices[hoveredCell.col]] >= 0.5 ? "text-emerald-400" :
              CORR_MATRIX[displayIndices[hoveredCell.row]][displayIndices[hoveredCell.col]] >= 0 ? "text-emerald-400/70" :
              CORR_MATRIX[displayIndices[hoveredCell.row]][displayIndices[hoveredCell.col]] >= -0.3 ? "text-red-400/70" : "text-red-400"
            }`}>
              {CORR_MATRIX[displayIndices[hoveredCell.row]][displayIndices[hoveredCell.col]].toFixed(3)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
