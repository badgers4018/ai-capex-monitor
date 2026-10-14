import { useState, useEffect, useRef } from "react";
import { AlertTriangle, ArrowRight, DollarSign, TrendingDown, Building2, RefreshCw, Info } from "lucide-react";

interface FlowNode {
  id: string;
  label: string;
  sublabel: string;
  color: string;
  x: number;
  y: number;
  size: number;
}

interface FlowEdge {
  from: string;
  to: string;
  label: string;
  amount: string;
  risk: "high" | "medium" | "low";
}

// Positioned nodes for SVG diagram (centered layout)
const nodes: FlowNode[] = [
  { id: "nvidia", label: "NVIDIA", sublabel: "$81.6B Q1 Rev", color: "#76b900", x: 400, y: 100, size: 52 },
  { id: "coreweave", label: "CoreWeave", sublabel: "$17.3B Net Debt", color: "#a855f7", x: 180, y: 280, size: 44 },
  { id: "nebius", label: "Nebius", sublabel: "$27B Meta Deal", color: "#06b6d4", x: 620, y: 280, size: 44 },
  { id: "oracle", label: "Oracle", sublabel: "FCF -$23.7B", color: "#f97316", x: 400, y: 380, size: 40 },
  { id: "hyperscalers", label: "Hyperscalers", sublabel: "$800B Capex", color: "#3b82f6", x: 400, y: 520, size: 48 },
];

const edges: FlowEdge[] = [
  { from: "nvidia", to: "coreweave", label: "GPU Financing", amount: "GPU-backed debt", risk: "high" },
  { from: "nvidia", to: "nebius", label: "Direct Investment", amount: "$2B equity", risk: "high" },
  { from: "coreweave", to: "nvidia", label: "GPU Purchases", amount: "$31-35B capex", risk: "medium" },
  { from: "nebius", to: "nvidia", label: "GPU Purchases", amount: "$20-25B capex", risk: "medium" },
  { from: "hyperscalers", to: "coreweave", label: "Cloud Contracts", amount: "$99.4B backlog", risk: "low" },
  { from: "hyperscalers", to: "nebius", label: "Infra Deals", amount: "$27B Meta deal", risk: "low" },
  { from: "oracle", to: "nvidia", label: "GPU Purchases", amount: "$55.7B FY26 capex", risk: "medium" },
];

interface RiskMetric {
  label: string;
  value: string;
  context: string;
  severity: "critical" | "warning" | "elevated";
  trend: "worsening" | "stable" | "improving";
}

const riskMetrics: RiskMetric[] = [
  { label: "Nvidia → Customer Investment", value: "$2B+", context: "Direct equity in Nebius (buys Nvidia GPUs)", severity: "critical", trend: "worsening" },
  { label: "CoreWeave Net Debt", value: "$17.3B", context: "Largely GPU-backed financing from Nvidia", severity: "critical", trend: "worsening" },
  { label: "CoreWeave Top Customer", value: "45%", context: "Down from 72%, but still dangerous concentration", severity: "warning", trend: "improving" },
  { label: "Oracle FY2027 Debt Raise", value: "$40B", context: "To fund $70B capex: debt-funded growth at scale", severity: "critical", trend: "worsening" },
  { label: "Nebius Capex Guidance", value: "$20-25B", context: "On $399M quarterly revenue: 50x capex/revenue", severity: "warning", trend: "stable" },
  { label: "AI VC Circular Capital", value: "$270B", context: "65% of US VC in 2025: chipmakers fund buyers", severity: "elevated", trend: "stable" },
];

const cascadeScenarios = [
  {
    trigger: "Nvidia GPU demand softens 20%",
    cascade: [
      "Nvidia cuts investment in neoclouds",
      "CoreWeave/Nebius lose financing backstop",
      "Debt refinancing costs spike (already $17.3B)",
      "Neocloud capex cuts → Nvidia revenue drops further",
      "Hyperscaler contracts renegotiated at lower rates",
    ],
    probability: "15-25%",
    timeline: "6-12 months",
    severity: 85,
  },
  {
    trigger: "Single hyperscaler pauses AI capex",
    cascade: [
      "CoreWeave loses 45% customer (top concentration)",
      "Backlog write-downs from $99.4B",
      "Debt covenants breached at $17.3B net debt",
      "Contagion to Nebius via shared investor base",
      "GPU resale market floods → pricing collapse",
    ],
    probability: "10-15%",
    timeline: "3-6 months",
    severity: 92,
  },
  {
    trigger: "Interest rates rise 200bps",
    cascade: [
      "Oracle $40B raise becomes 2x more expensive",
      "CoreWeave refinancing costs explode",
      "GPU-backed debt marked down (asset depreciation)",
      "VC funding freeze → AI startup failures",
      "Nvidia loses demand from funded startups",
    ],
    probability: "20-30%",
    timeline: "12-18 months",
    severity: 72,
  },
];

const historicalParallels = [
  { era: "Lucent 1999", detail: "Vendor-financed $7B to customers who bought Lucent equipment. When telecom demand fell, both sides collapsed simultaneously.", loss: "$80B market cap" },
  { era: "Cisco 2000", detail: "Funded customers via Cisco Capital to buy routers. Wrote off $2.2B when dot-com customers defaulted.", loss: "$400B peak-to-trough" },
  { era: "Nortel 2001", detail: "Extended $4.3B in customer financing. Filed for bankruptcy when funded customers couldn't pay.", loss: "Complete wipeout" },
];

// SVG arrow path with curve
function getEdgePath(fromNode: FlowNode, toNode: FlowNode): string {
  const dx = toNode.x - fromNode.x;
  const dy = toNode.y - fromNode.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const nx = dx / dist;
  const ny = dy / dist;
  
  const startX = fromNode.x + nx * fromNode.size;
  const startY = fromNode.y + ny * fromNode.size;
  const endX = toNode.x - nx * toNode.size;
  const endY = toNode.y - ny * toNode.size;
  
  // Curve control point perpendicular to the line
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;
  const offset = dist * 0.15;
  const cx = midX + (-ny) * offset;
  const cy = midY + nx * offset;
  
  return `M ${startX} ${startY} Q ${cx} ${cy} ${endX} ${endY}`;
}

function getRiskColor(risk: "high" | "medium" | "low"): string {
  if (risk === "high") return "#ef4444";
  if (risk === "medium") return "#f59e0b";
  return "#6b7280";
}

export function CircularFinancingRisk() {
  const [activeScenario, setActiveScenario] = useState(0);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<number | null>(null);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [nodeTooltip, setNodeTooltip] = useState<{ node: FlowNode; connections: { direction: string; partner: string; label: string; amount: string; risk: string }[] } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Animate the flow arrows
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const visibleEdges = edges.filter(
    (e) => !hoveredNode || e.from === hoveredNode || e.to === hoveredNode
  );

  return (
    <section id="circular-risk" className="py-24 relative">
      <div className="container max-w-5xl">

        <div className="text-center mb-12">
          <h2 className="text-3xl font-sans font-semibold mb-3">Circular Financing Risk Map</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
            Nvidia funds its own customers. Those customers buy Nvidia GPUs. The capital flows in a circle.
            When the music stops, the entire chain unwinds simultaneously.
          </p>
        </div>

        {/* Enhanced SVG Flow Diagram */}
        <div className="mb-12 p-6 rounded-xl border border-border/30 bg-card/10 relative overflow-hidden">
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "8s" }} />
            Capital Flow Cycle (Confirmed Jul 2026)
            <span className="ml-auto text-[10px] text-muted-foreground/50">Hover nodes to filter flows</span>
          </h3>

          {/* SVG Diagram */}
          <div className="relative w-full" style={{ paddingBottom: "75%" }}>
            <svg
              ref={svgRef}
              viewBox="0 0 800 600"
              className="absolute inset-0 w-full h-full"
              style={{ filter: "drop-shadow(0 0 20px rgba(0,0,0,0.3))" }}
            >
              {/* Defs for gradients and markers */}
              <defs>
                {edges.map((edge, i) => {
                  const color = getRiskColor(edge.risk);
                  return (
                    <marker
                      key={`arrow-${i}`}
                      id={`arrowhead-${i}`}
                      markerWidth="8"
                      markerHeight="6"
                      refX="7"
                      refY="3"
                      orient="auto"
                    >
                      <polygon points="0 0, 8 3, 0 6" fill={color} opacity={0.8} />
                    </marker>
                  );
                })}
                {/* Animated dash pattern */}
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Background radial gradient hint */}
              <circle cx="400" cy="300" r="250" fill="url(#bgGrad)" opacity="0.03" />
              <defs>
                <radialGradient id="bgGrad">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
              </defs>

              {/* Edges with animated dashes */}
              {edges.map((edge, i) => {
                const fromNode = nodes.find((n) => n.id === edge.from)!;
                const toNode = nodes.find((n) => n.id === edge.to)!;
                const path = getEdgePath(fromNode, toNode);
                const color = getRiskColor(edge.risk);
                const isVisible = !hoveredNode || edge.from === hoveredNode || edge.to === hoveredNode;
                const isHovered = hoveredEdge === i;

                return (
                  <g key={i} opacity={isVisible ? 1 : 0.1} style={{ transition: "opacity 0.3s" }}>
                    {/* Shadow path */}
                    <path
                      d={path}
                      fill="none"
                      stroke={color}
                      strokeWidth={isHovered ? 4 : 2}
                      strokeOpacity={0.15}
                      strokeLinecap="round"
                    />
                    {/* Main path with animated dash */}
                    <path
                      d={path}
                      fill="none"
                      stroke={color}
                      strokeWidth={isHovered ? 3 : 1.5}
                      strokeOpacity={isHovered ? 1 : 0.7}
                      strokeLinecap="round"
                      strokeDasharray="8 4"
                      strokeDashoffset={-animationPhase * 0.5}
                      markerEnd={`url(#arrowhead-${i})`}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredEdge(i)}
                      onMouseLeave={() => setHoveredEdge(null)}
                      style={{ transition: "stroke-width 0.2s, stroke-opacity 0.2s" }}
                    />
                    {/* Edge label on hover */}
                    {isHovered && (
                      <g>
                        <rect
                          x={(fromNode.x + toNode.x) / 2 - 60}
                          y={(fromNode.y + toNode.y) / 2 - 24}
                          width="120"
                          height="32"
                          rx="6"
                          fill="rgba(0,0,0,0.85)"
                          stroke={color}
                          strokeWidth="1"
                        />
                        <text
                          x={(fromNode.x + toNode.x) / 2}
                          y={(fromNode.y + toNode.y) / 2 - 10}
                          textAnchor="middle"
                          fill={color}
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {edge.label}
                        </text>
                        <text
                          x={(fromNode.x + toNode.x) / 2}
                          y={(fromNode.y + toNode.y) / 2 + 2}
                          textAnchor="middle"
                          fill="white"
                          fontSize="10"
                          fontFamily="monospace"
                        >
                          {edge.amount}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Nodes */}
              {nodes.map((node) => {
                const isHovered = hoveredNode === node.id;
                const isConnected = !hoveredNode || hoveredNode === node.id ||
                  edges.some(e => (e.from === hoveredNode && e.to === node.id) || (e.to === hoveredNode && e.from === node.id));

                return (
                  <g
                    key={node.id}
                    opacity={isConnected ? 1 : 0.3}
                    style={{ transition: "opacity 0.3s, transform 0.2s" }}
                    onMouseEnter={(e) => {
                      setHoveredNode(node.id);
                      // Build tooltip data
                      const connections = edges
                        .filter(edge => edge.from === node.id || edge.to === node.id)
                        .map(edge => ({
                          direction: edge.from === node.id ? "→" : "←",
                          partner: edge.from === node.id
                            ? nodes.find(n => n.id === edge.to)?.label || ""
                            : nodes.find(n => n.id === edge.from)?.label || "",
                          label: edge.label,
                          amount: edge.amount,
                          risk: edge.risk,
                        }));
                      setNodeTooltip({ node, connections });
                      // Position tooltip relative to SVG container
                      if (svgRef.current) {
                        const rect = svgRef.current.getBoundingClientRect();
                        const scaleX = rect.width / 800;
                        const scaleY = rect.height / 600;
                        setTooltipPos({
                          x: node.x * scaleX,
                          y: node.y * scaleY - node.size * scaleY - 10,
                        });
                      }
                    }}
                    onMouseLeave={() => { setHoveredNode(null); setNodeTooltip(null); }}
                    className="cursor-pointer"
                  >
                    {/* Outer glow ring */}
                    {isHovered && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={node.size + 8}
                        fill="none"
                        stroke={node.color}
                        strokeWidth="2"
                        opacity={0.3}
                        filter="url(#glow)"
                      />
                    )}
                    {/* Node circle */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.size}
                      fill={`${node.color}15`}
                      stroke={node.color}
                      strokeWidth={isHovered ? 2.5 : 1.5}
                      style={{ transition: "stroke-width 0.2s" }}
                    />
                    {/* Inner pulse for high-risk nodes */}
                    {(node.id === "nvidia" || node.id === "coreweave") && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={node.size * 0.3}
                        fill={node.color}
                        opacity={0.2 + Math.sin(animationPhase * 0.06) * 0.1}
                      />
                    )}
                    {/* Label */}
                    <text
                      x={node.x}
                      y={node.y - 6}
                      textAnchor="middle"
                      fill={node.color}
                      fontSize="12"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {node.label}
                    </text>
                    {/* Sublabel */}
                    <text
                      x={node.x}
                      y={node.y + 10}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.5)"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {node.sublabel}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Node tooltip overlay */}
            {nodeTooltip && (
              <div
                className="absolute z-20 pointer-events-none"
                style={{
                  left: `${tooltipPos.x}px`,
                  top: `${tooltipPos.y}px`,
                  transform: "translate(-50%, -100%)",
                }}
              >
                <div className="bg-background/95 backdrop-blur-md border border-border/50 rounded-lg shadow-xl p-3 min-w-[200px] max-w-[280px]">
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/30">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: nodeTooltip.node.color }} />
                    <span className="font-mono text-xs font-bold" style={{ color: nodeTooltip.node.color }}>
                      {nodeTooltip.node.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-auto">{nodeTooltip.node.sublabel}</span>
                  </div>
                  <div className="space-y-1.5">
                    {nodeTooltip.connections.map((conn, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[10px]">
                        <span className="font-mono text-muted-foreground">{conn.direction}</span>
                        <span className="font-mono font-medium text-foreground">{conn.partner}</span>
                        <span className="text-muted-foreground/70 flex-1 truncate">{conn.label}</span>
                        <span className={`font-mono font-bold ${
                          conn.risk === "high" ? "text-red-400" :
                          conn.risk === "medium" ? "text-amber-400" : "text-muted-foreground"
                        }`}>{conn.amount}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-border/20">
                    <span className="text-[9px] text-muted-foreground/60">
                      {nodeTooltip.connections.filter(c => c.risk === "high").length} high-risk connections
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Edge legend below diagram */}
          <div className="mt-4 flex flex-wrap gap-4 justify-center text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-0.5 bg-[#ef4444] rounded" />
              <span>High Risk</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-0.5 bg-[#f59e0b] rounded" />
              <span>Medium Risk</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-0.5 bg-[#6b7280] rounded" />
              <span>Low Risk</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full border border-muted-foreground/30 animate-pulse" />
              <span>Animated = active capital flow</span>
            </div>
          </div>
        </div>

        {/* Flow detail table (visible on hover or always on mobile) */}
        <div className="mb-12 md:hidden">
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">Capital Flows</h3>
          <div className="space-y-2">
            {edges.map((edge, i) => {
              const fromNode = nodes.find((n) => n.id === edge.from);
              const toNode = nodes.find((n) => n.id === edge.to);
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border transition-[transform,opacity,border-color,background-color] duration-200 ${
                    edge.risk === "high"
                      ? "border-red-500/30 bg-red-500/5"
                      : edge.risk === "medium"
                      ? "border-amber-500/30 bg-amber-500/5"
                      : "border-border/20 bg-card/5"
                  }`}
                >
                  <span className="font-mono text-xs font-bold shrink-0" style={{ color: fromNode?.color }}>
                    {fromNode?.label}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="font-mono text-xs font-bold shrink-0" style={{ color: toNode?.color }}>
                    {toNode?.label}
                  </span>
                  <span className="text-xs text-muted-foreground flex-1">{edge.label}</span>
                  <span className="font-mono text-xs font-semibold text-foreground/80 shrink-0">{edge.amount}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk Metrics Grid with trend indicators */}
        <div className="mb-12">
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            Key Risk Indicators
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {riskMetrics.map((metric, i) => (
              <div
                key={i}
                className={`p-4 rounded-lg border transition-[transform,opacity,border-color,background-color] duration-200 hover:scale-[1.02] group relative ${
                  metric.severity === "critical"
                    ? "border-red-500/40 bg-red-500/5"
                    : metric.severity === "warning"
                    ? "border-amber-500/40 bg-amber-500/5"
                    : "border-border/40 bg-card/10"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{metric.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full ${
                        metric.trend === "worsening"
                          ? "bg-red-500/15 text-red-400"
                          : metric.trend === "improving"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-muted/30 text-muted-foreground"
                      }`}
                    >
                      {metric.trend === "worsening" ? "↑ worsening" : metric.trend === "improving" ? "↓ improving" : "→ stable"}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full uppercase ${
                        metric.severity === "critical"
                          ? "bg-red-500/15 text-red-400"
                          : metric.severity === "warning"
                          ? "bg-amber-500/15 text-amber-400"
                          : "bg-muted/30 text-muted-foreground"
                      }`}
                    >
                      {metric.severity}
                    </span>
                  </div>
                </div>
                <div className="font-mono text-lg font-bold text-foreground">{metric.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{metric.context}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Historical Parallels */}
        <div className="mb-12">
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <Info className="w-3.5 h-3.5" />
            Historical Parallels: Vendor Financing Collapses
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {historicalParallels.map((parallel, i) => (
              <div key={i} className="p-4 rounded-lg border border-border/30 bg-card/10 hover:bg-card/20 transition-[transform,opacity,border-color,background-color]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-foreground">{parallel.era}</span>
                  <span className="font-mono text-[10px] text-red-400">{parallel.loss}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{parallel.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cascade Scenarios with severity bar */}
        <div>
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <TrendingDown className="w-3.5 h-3.5" />
            Cascade Failure Scenarios
          </h3>

          {/* Scenario tabs */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {cascadeScenarios.map((scenario, i) => (
              <button
                key={i}
                onClick={() => setActiveScenario(i)}
                className={`px-3 py-1.5 text-xs font-mono rounded-full border transition-[transform,opacity,border-color,background-color] duration-200 active:scale-95 ${
                  activeScenario === i
                    ? "bg-red-500/15 border-red-500/50 text-red-400"
                    : "border-border/30 text-muted-foreground hover:text-foreground hover:border-border/60"
                }`}
              >
                Scenario {i + 1}: {scenario.trigger.split(" ").slice(0, 3).join(" ")}...
              </button>
            ))}
          </div>

          {/* Active scenario detail */}
          <div className="p-6 rounded-xl border border-red-500/30 bg-red-500/[0.03]">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h4 className="font-mono text-sm font-bold text-red-400">
                Trigger: {cascadeScenarios[activeScenario].trigger}
              </h4>
              <div className="flex gap-3 items-center">
                <span className="text-xs font-mono text-muted-foreground">
                  P: {cascadeScenarios[activeScenario].probability}
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  Timeline: {cascadeScenarios[activeScenario].timeline}
                </span>
              </div>
            </div>

            {/* Severity bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-muted-foreground font-mono">Severity Score</span>
                <span className="text-[10px] font-mono text-red-400">{cascadeScenarios[activeScenario].severity}/100</span>
              </div>
              <div className="h-1.5 rounded-full bg-border/30 overflow-hidden">
                <div
                  className="h-full rounded-full transition-[transform,opacity,width,left] duration-500"
                  style={{
                    width: `${cascadeScenarios[activeScenario].severity}%`,
                    background: `linear-gradient(90deg, #f59e0b, #ef4444)`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-3">
              {cascadeScenarios[activeScenario].cascade.map((step, i) => (
                <div key={i} className="flex items-start gap-3 group">
                  <div className="flex flex-col items-center shrink-0">
                    <span className="w-6 h-6 rounded-full bg-red-500/15 flex items-center justify-center border border-red-500/30">
                      <span className="font-mono text-xs text-red-400">{i + 1}</span>
                    </span>
                    {i < cascadeScenarios[activeScenario].cascade.length - 1 && (
                      <div className="w-px h-4 bg-red-500/20 mt-1" />
                    )}
                  </div>
                  <span className="text-sm text-foreground/90 pt-0.5 group-hover:text-foreground transition-colors">{step}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-border/20">
              <p className="text-xs text-muted-foreground italic">
                <DollarSign className="w-3 h-3 inline mr-1" />
                Key insight: The circular nature means a shock at ANY point propagates in BOTH directions simultaneously.
                Nvidia's revenue depends on customers it finances. Those customers' solvency depends on Nvidia's continued support.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom summary */}
        <div className="mt-8 p-4 rounded-lg border border-border/30 bg-card/10">
          <p className="text-sm text-muted-foreground">
            <span className="font-mono text-xs text-red-400 font-bold mr-2">SYSTEMIC RISK ASSESSMENT:</span>
            The AI infrastructure buildout has created a self-referential capital cycle where the supplier (Nvidia) finances the buyers (neoclouds),
            who then purchase from the supplier. Combined with $638B in Oracle RPO, $17.3B CoreWeave debt, and $40B planned Oracle raises,
            the system has limited tolerance for demand slowdowns. Monitor: Nvidia customer investment disclosures, neocloud debt covenants,
            and hyperscaler capex guidance revisions.
          </p>
        </div>
      </div>
    </section>
  );
}
