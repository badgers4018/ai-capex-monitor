import { useState, useCallback, useRef, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface FlowNode {
  id: string;
  label: string;
  sublabel: string;
  color: string;
  tier: number; // 0=top, 1=middle, 2=bottom
  col: number; // column position within tier
  description: string;
}

const nodes: FlowNode[] = [
  {
    id: "vc",
    label: "VC / Startups",
    sublabel: "$270B AI funding",
    color: "oklch(0.65 0.12 320)",
    tier: 0,
    col: 0,
    description: "AI startups raised $270B in 2025 (65% of US VC). Circular financing: chipmakers fund startups that buy their chips. Capital lock-in subsidizes enterprise adoption. Concentrated demand from few heavily-funded but unprofitable AI companies.",
  },
  {
    id: "ai",
    label: "AI Spending",
    sublabel: "$2.59T (2026)",
    color: "oklch(0.7 0.15 240)",
    tier: 0,
    col: 1,
    description: "Primary catalyst: $2.59T in 2026 (Gartner). Cost per token fell 280x in 3 years, yet total AI bills keep climbing: Jevons Paradox at planetary scale. Uber blew its entire 2026 AI budget in 4 months. Cheaper AI → more use cases → MORE compute demand.",
  },
  {
    id: "semiconductor",
    label: "Semiconductors",
    sublabel: "$1.3-1.5T revenue",
    color: "oklch(0.65 0.12 200)",
    tier: 0,
    col: 2,
    description: "NVIDIA $81.6B revenue Q1 FY27, Q2 guidance $91B. CoWoS packaging gap narrowing from 20% to 10% by end-2026. ABF substrate shortage (Ajinomoto sole supplier): 42% demand gap by 2028. Hidden bottleneck below CoWoS.",
  },
  {
    id: "edge",
    label: "Edge Computing",
    sublabel: "$380B by 2028",
    color: "oklch(0.6 0.12 180)",
    tier: 1,
    col: 0,
    description: "Edge spending $380B by 2028. As inference shifts to edge, reduces centralized DC load but increases total compute. 5G-enabled computing + IoT ($991B by 2028). Starlink enables edge DCs in remote locations.",
  },
  {
    id: "cloud",
    label: "Cloud Computing",
    sublabel: "$129B/Q (+35%)",
    color: "oklch(0.7 0.15 155)",
    tier: 1,
    col: 1,
    description: "Cloud infra $129B/quarter (+35%). Neoclouds (CoreWeave, Lambda, xAI) to capture 20% of $267B AI cloud market by 2030. Google Cloud 63% growth, margins >30%. Inference now dominates GPU demand: continuous 24/7 load vs episodic training.",
  },
  {
    id: "dc",
    label: "Data Center Capex",
    sublabel: "$725B Top 4",
    color: "oklch(0.75 0.15 70)",
    tier: 1,
    col: 2,
    description: "Goldman Sachs: $725B combined capex from Amazon ($200B), Microsoft ($190B), Alphabet ($180-190B), Meta ($115-135B). $7.6T baseline aggregate 2026-2031. CoreWeave lost $740M in Q1 alone. 5:1 spend-to-revenue ratio at Microsoft.",
  },
  {
    id: "power",
    label: "Power & Grid",
    sublabel: "85% shortfall",
    color: "oklch(0.65 0.2 25)",
    tier: 1,
    col: 3,
    description: "THE binding limit. 2026: 565 TWh (+26% YoY). AI servers: 175 TWh. By 2030: >1,200 TWh. US needs 69 GW for DCs but only 10 GW achievable: 85% shortfall. Grid wait times 4+ years. National moratorium proposed (Jun 25, 2026). SMRs not ready until 2030+.",
  },
  {
    id: "spacex",
    label: "SpaceX (SPCX)",
    sublabel: "$2.0T mkt cap",
    color: "oklch(0.7 0.15 45)",
    tier: 2,
    col: 0,
    description: "SpaceX (SPCX): $20.7B capex, $2.0T market cap. IPO Jun 12 ($75B), $25B bonds Jun 23 ($89B demand). Starlink: $7.5B revenue, 5M+ subs. xAI Colossus: 200K H100 GPUs. Orbital compute: free solar power + Starlink laser mesh. Could bypass ground power constraint by 2030+.",
  },
  {
    id: "eu",
    label: "End-User IT",
    sublabel: "$6.31T total",
    color: "oklch(0.7 0.15 300)",
    tier: 2,
    col: 1,
    description: "Gartner: $6.31T in 2026 (+13.5%). BUT: Forrester says 25% of enterprises postponing AI spend to 2027. Only 18% of AI coding tokens translate to shipped products. WSJ: 'Corporate America rationing AI.' OpenAI weighing price cuts as businesses feel pain.",
  },
  {
    id: "geo",
    label: "Geopolitical",
    sublabel: "2-3x duplication",
    color: "oklch(0.6 0.15 350)",
    tier: 2,
    col: 2,
    description: "EU joining US pact to break China AI supply chain reliance. Taiwan threatening chip flow restrictions. Gulf states spending hundreds of billions (Saudi PIF $40B+). Sovereign AI mandates driving 2-3x infrastructure duplication vs cooperative scenario.",
  },
];

interface Connection {
  from: string;
  to: string;
  label: string;
  isConstraint?: boolean;
}

const connections: Connection[] = [
  { from: "vc", to: "ai", label: "Circular funding" },
  { from: "ai", to: "dc", label: "Drives $725B capex" },
  { from: "ai", to: "cloud", label: "Jevons: more demand" },
  { from: "semiconductor", to: "dc", label: "CoWoS bottleneck" },
  { from: "dc", to: "cloud", label: "Physical capacity" },
  { from: "cloud", to: "eu", label: "AI SaaS & tools" },
  { from: "eu", to: "ai", label: "Revenue feedback" },
  { from: "power", to: "dc", label: "BINDING LIMIT", isConstraint: true },
  { from: "edge", to: "cloud", label: "Offloads inference" },
  { from: "spacex", to: "edge", label: "Starlink connectivity" },
  { from: "spacex", to: "dc", label: "Orbital compute 2030+" },
  { from: "geo", to: "dc", label: "Sovereignty duplication", isConstraint: true },
];

export function FlowchartSection() {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [lockedNode, setLockedNode] = useState<string | null>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});

  // Click toggles the node (for mobile). If same node clicked again, close it.
  const handleNodeClick = useCallback((nodeId: string) => {
    setLockedNode(prev => {
      if (prev === nodeId) {
        setActiveNode(null);
        return null;
      }
      setActiveNode(nodeId);
      return nodeId;
    });
  }, []);

  const handleNodeEnter = useCallback((nodeId: string) => {
    if (!lockedNode) setActiveNode(nodeId);
  }, [lockedNode]);

  const handleNodeLeave = useCallback(() => {
    if (!lockedNode) setActiveNode(null);
  }, [lockedNode]);

  const handleBackgroundClick = useCallback(() => {
    setLockedNode(null);
    setActiveNode(null);
  }, []);

  const effectiveActive = lockedNode || activeNode;
  const activeNodeData = nodes.find(n => n.id === effectiveActive);

  const constraintColor = isDark ? "oklch(0.5 0.18 25)" : "oklch(0.55 0.18 25)";

  // Measure node positions for SVG connections
  useEffect(() => {
    const measurePositions = () => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const positions: Record<string, { x: number; y: number }> = {};

      nodes.forEach(node => {
        const el = container.querySelector(`[data-node-id="${node.id}"]`) as HTMLElement;
        if (el) {
          const rect = el.getBoundingClientRect();
          positions[node.id] = {
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top + rect.height / 2,
          };
        }
      });
      setNodePositions(positions);
    };

    // Measure after layout
    const timer = setTimeout(measurePositions, 100);
    window.addEventListener("resize", measurePositions);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", measurePositions);
    };
  }, []);

  return (
    <section id="flowchart" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 opacity-20">
        <img
          src="https://d2xsxph8kpxj0f.cloudfront.net/310519663305152617/ZGmmwtuoPH63p4k3Y3pKpf/flowchart-bg-iREpMFAZHNnV4ieMS2bLqt.webp"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </div>

      <div className="container relative z-10">
        <p className="text-muted-foreground mb-4 max-w-3xl text-fluid-base">
          Includes SpaceX/xAI, the Jevons Paradox feedback loop,
          power grid as binding constraint (85% shortfall), geopolitical duplication, and enterprise budget backlash.
        </p>
        <p className="text-fluid-xs text-muted-foreground/70 mb-12 max-w-3xl font-mono">
          10 nodes · 12 causal connections · Click nodes to explore. Dashed red lines = constraints.
        </p>

        {/* Interactive Flowchart - HTML/CSS Grid based */}
        <div
          ref={containerRef}
          className="relative w-full max-w-6xl mx-auto rounded-2xl border border-border/40 bg-card/20 dark:bg-card/10 backdrop-blur-sm shadow-xl dark:shadow-2xl dark:shadow-black/30 p-6 sm:p-8 lg:p-10"
          onClick={handleBackgroundClick}
        >
          {/* SVG layer for connections - positioned absolutely behind nodes */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            preserveAspectRatio="none"
          >
            <defs>
              <marker id="arrow-default" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill={isDark ? "oklch(0.4 0.02 250)" : "oklch(0.65 0.01 250)"} />
              </marker>
              <marker id="arrow-active" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="oklch(0.7 0.15 240)" />
              </marker>
              <marker id="arrow-constraint" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill={constraintColor} />
              </marker>
            </defs>

            {/* Render connections */}
            {Object.keys(nodePositions).length > 0 && connections.map((conn, i) => {
              const fromPos = nodePositions[conn.from];
              const toPos = nodePositions[conn.to];
              if (!fromPos || !toPos) return null;

              const isHighlighted = effectiveActive === conn.from || effectiveActive === conn.to;
              const isConstraintLine = conn.isConstraint;
              const strokeColor = isConstraintLine
                ? constraintColor
                : isHighlighted
                  ? "oklch(0.7 0.15 240)"
                  : isDark ? "oklch(0.35 0.02 250)" : "oklch(0.72 0.01 250)";

              return (
                <line
                  key={i}
                  x1={fromPos.x}
                  y1={fromPos.y}
                  x2={toPos.x}
                  y2={toPos.y}
                  stroke={strokeColor}
                  strokeWidth={isHighlighted ? 2 : 1}
                  strokeDasharray={isConstraintLine ? "6 3" : "none"}
                  opacity={effectiveActive && !isHighlighted ? 0.2 : 0.6}
                  markerEnd={`url(#arrow-${isConstraintLine ? "constraint" : isHighlighted ? "active" : "default"})`}
                  className="transition-[transform,opacity,border-color,background-color] duration-300"
                />
              );
            })}
          </svg>

          {/* Desktop layout: CSS Grid with 3 tiers */}
          <div className="relative z-10 hidden sm:block">
            {/* Tier labels */}
            <div className="mb-2">
              <span className="text-fluid-xs font-mono text-muted-foreground/60 uppercase tracking-wider">Catalysts</span>
            </div>

            {/* Tier 0: 3 columns */}
            <div className="grid grid-cols-3 gap-4 lg:gap-6 mb-12">
              {nodes.filter(n => n.tier === 0).map(node => (
                <NodeCard
                  key={node.id}
                  node={node}
                  isActive={effectiveActive === node.id}
                  isConnected={connections.some(c => (c.from === node.id || c.to === node.id) && (c.from === effectiveActive || c.to === effectiveActive))}
                  isDimmed={effectiveActive !== null && effectiveActive !== node.id && !connections.some(c => (c.from === node.id || c.to === node.id) && (c.from === effectiveActive || c.to === effectiveActive))}
                  onClick={handleNodeClick}
                  onEnter={handleNodeEnter}
                  onLeave={handleNodeLeave}
                />
              ))}
            </div>

            {/* Tier separator */}
            <div className="border-t border-dashed border-border/30 mb-4" />
            <div className="mb-2">
              <span className="text-fluid-xs font-mono text-muted-foreground/60 uppercase tracking-wider">Infrastructure</span>
            </div>

            {/* Tier 1: 4 columns */}
            <div className="grid grid-cols-4 gap-3 lg:gap-5 mb-12">
              {nodes.filter(n => n.tier === 1).map(node => (
                <NodeCard
                  key={node.id}
                  node={node}
                  isActive={effectiveActive === node.id}
                  isConnected={connections.some(c => (c.from === node.id || c.to === node.id) && (c.from === effectiveActive || c.to === effectiveActive))}
                  isDimmed={effectiveActive !== null && effectiveActive !== node.id && !connections.some(c => (c.from === node.id || c.to === node.id) && (c.from === effectiveActive || c.to === effectiveActive))}
                  onClick={handleNodeClick}
                  onEnter={handleNodeEnter}
                  onLeave={handleNodeLeave}
                />
              ))}
            </div>

            {/* Tier separator */}
            <div className="border-t border-dashed border-border/30 mb-4" />
            <div className="mb-2">
              <span className="text-fluid-xs font-mono text-muted-foreground/60 uppercase tracking-wider">Demand & Forces</span>
            </div>

            {/* Tier 2: 3 columns */}
            <div className="grid grid-cols-3 gap-4 lg:gap-6 mb-6">
              {nodes.filter(n => n.tier === 2).map(node => (
                <NodeCard
                  key={node.id}
                  node={node}
                  isActive={effectiveActive === node.id}
                  isConnected={connections.some(c => (c.from === node.id || c.to === node.id) && (c.from === effectiveActive || c.to === effectiveActive))}
                  isDimmed={effectiveActive !== null && effectiveActive !== node.id && !connections.some(c => (c.from === node.id || c.to === node.id) && (c.from === effectiveActive || c.to === effectiveActive))}
                  onClick={handleNodeClick}
                  onEnter={handleNodeEnter}
                  onLeave={handleNodeLeave}
                />
              ))}
            </div>
          </div>

          {/* Mobile layout: Vertical stacked */}
          <div className="relative z-10 sm:hidden space-y-6">
            {/* Tier 0 */}
            <div>
              <span className="text-fluid-xs font-mono text-muted-foreground/60 uppercase tracking-wider block mb-3">Catalysts</span>
              <div className="space-y-3">
                {nodes.filter(n => n.tier === 0).map(node => (
                  <NodeCard
                    key={node.id}
                    node={node}
                    isActive={effectiveActive === node.id}
                    isConnected={connections.some(c => (c.from === node.id || c.to === node.id) && (c.from === effectiveActive || c.to === effectiveActive))}
                    isDimmed={effectiveActive !== null && effectiveActive !== node.id && !connections.some(c => (c.from === node.id || c.to === node.id) && (c.from === effectiveActive || c.to === effectiveActive))}
                    onClick={handleNodeClick}
                    onEnter={handleNodeEnter}
                    onLeave={handleNodeLeave}
                    mobile
                  />
                ))}
              </div>
            </div>

            {/* Connection indicator */}
            <div className="flex items-center justify-center gap-2 py-2">
              <div className="h-6 w-px bg-border/50" />
              <span className="text-fluid-xs font-mono text-muted-foreground/50">↓ feeds into ↓</span>
              <div className="h-6 w-px bg-border/50" />
            </div>

            {/* Tier 1 */}
            <div>
              <span className="text-fluid-xs font-mono text-muted-foreground/60 uppercase tracking-wider block mb-3">Infrastructure</span>
              <div className="grid grid-cols-2 gap-3">
                {nodes.filter(n => n.tier === 1).map(node => (
                  <NodeCard
                    key={node.id}
                    node={node}
                    isActive={effectiveActive === node.id}
                    isConnected={connections.some(c => (c.from === node.id || c.to === node.id) && (c.from === effectiveActive || c.to === effectiveActive))}
                    isDimmed={effectiveActive !== null && effectiveActive !== node.id && !connections.some(c => (c.from === node.id || c.to === node.id) && (c.from === effectiveActive || c.to === effectiveActive))}
                    onClick={handleNodeClick}
                    onEnter={handleNodeEnter}
                    onLeave={handleNodeLeave}
                    mobile
                  />
                ))}
              </div>
            </div>

            {/* Connection indicator */}
            <div className="flex items-center justify-center gap-2 py-2">
              <div className="h-6 w-px bg-border/50" />
              <span className="text-fluid-xs font-mono text-muted-foreground/50">↓ drives ↓</span>
              <div className="h-6 w-px bg-border/50" />
            </div>

            {/* Tier 2 */}
            <div>
              <span className="text-fluid-xs font-mono text-muted-foreground/60 uppercase tracking-wider block mb-3">Demand & Forces</span>
              <div className="space-y-3">
                {nodes.filter(n => n.tier === 2).map(node => (
                  <NodeCard
                    key={node.id}
                    node={node}
                    isActive={effectiveActive === node.id}
                    isConnected={connections.some(c => (c.from === node.id || c.to === node.id) && (c.from === effectiveActive || c.to === effectiveActive))}
                    isDimmed={effectiveActive !== null && effectiveActive !== node.id && !connections.some(c => (c.from === node.id || c.to === node.id) && (c.from === effectiveActive || c.to === effectiveActive))}
                    onClick={handleNodeClick}
                    onEnter={handleNodeEnter}
                    onLeave={handleNodeLeave}
                    mobile
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Info panel - expanded node description */}
          {activeNodeData && (
            <div
              className="relative z-20 mt-6 p-4 sm:p-5 rounded-xl bg-card/80 dark:bg-card/60 backdrop-blur-md border border-border/30 transition-[transform,opacity,border-color,background-color] duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div
                  className="w-3 h-3 rounded-full shadow-lg shrink-0"
                  style={{ backgroundColor: activeNodeData.color, boxShadow: `0 0 8px ${activeNodeData.color}` }}
                />
                <span className="font-mono text-fluid-sm font-bold" style={{ color: activeNodeData.color }}>
                  {activeNodeData.label}
                </span>
                <span className="text-fluid-xs text-muted-foreground font-mono">- {activeNodeData.sublabel}</span>
              </div>
              <p className="text-fluid-sm text-muted-foreground leading-relaxed max-w-4xl">
                {activeNodeData.description}
              </p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-8">
          {nodes.map((node) => (
            <div
              key={node.id}
              className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
              onMouseEnter={() => handleNodeEnter(node.id)}
              onMouseLeave={handleNodeLeave}
              onClick={() => handleNodeClick(node.id)}
            >
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: node.color }} />
              <span className="text-fluid-xs font-mono text-muted-foreground">{node.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 ml-4 pl-4 border-l border-border/50">
            <div className="w-5 h-px border-t border-dashed" style={{ borderColor: constraintColor }} />
            <span className="text-fluid-xs font-mono text-muted-foreground">= Constraint</span>
          </div>
        </div>

        {/* Feedback Loops Summary */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: "Jevons Efficiency Paradox", desc: "Cheaper inference → More use cases → More compute → More GPUs → More DCs → More power", color: "oklch(0.7 0.15 240)" },
            { name: "Capex-Revenue Spiral", desc: "Hyperscaler capex → GPU buys → NVIDIA R&D → Better GPUs → More efficiency → More demand → More capex", color: "oklch(0.75 0.15 70)" },
            { name: "Geopolitical Duplication", desc: "US-China tensions → Export controls → Sovereign mandates → 2-3x global infrastructure spending", color: "oklch(0.6 0.15 350)" },
            { name: "Power-Location Constraint", desc: "Grid limits → DCs where power exists → Need Starlink connectivity → SpaceX demand → Orbital compute", color: "oklch(0.65 0.2 25)" },
            { name: "Financial Leverage Spiral", desc: "Cheap debt → More DC capacity → Falling GPU rental prices → Need more scale → More debt → Rate vulnerability", color: "oklch(0.65 0.12 320)" },
            { name: "Enterprise Backlash Loop", desc: "High AI costs → Budget rationing → Price cuts from providers → More adoption → Higher total spend", color: "oklch(0.7 0.15 300)" },
          ].map((loop) => (
            <div key={loop.name} className="p-4 rounded-xl border border-border/30 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-colors duration-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: loop.color }} />
                <span className="text-fluid-xs font-mono font-semibold" style={{ color: loop.color }}>{loop.name}</span>
              </div>
              <p className="text-fluid-xs text-muted-foreground leading-relaxed">{loop.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Node Card Component ─── */
interface NodeCardProps {
  node: FlowNode;
  isActive: boolean;
  isConnected: boolean;
  isDimmed: boolean;
  onClick: (id: string) => void;
  onEnter: (id: string) => void;
  onLeave: () => void;
  mobile?: boolean;
}

function NodeCard({ node, isActive, isConnected, isDimmed, onClick, onEnter, onLeave, mobile }: NodeCardProps) {
  return (
    <div
      data-node-id={node.id}
      className={`
        relative rounded-xl border p-3 sm:p-4 cursor-pointer
        transition-[transform,opacity,border-color,background-color] duration-300 select-none
        ${isActive
          ? "border-current shadow-lg scale-[1.02]"
          : isConnected
            ? "border-border/60 bg-card/40 dark:bg-card/20"
            : "border-border/30 bg-card/20 dark:bg-card/10 hover:bg-card/40 dark:hover:bg-card/20"
        }
        ${isDimmed ? "opacity-30" : "opacity-100"}
        ${mobile ? "" : ""}
      `}
      style={{
        borderColor: isActive ? node.color : undefined,
        boxShadow: isActive ? `0 4px 20px ${node.color}33` : undefined,
      }}
      onClick={(e) => { e.stopPropagation(); onClick(node.id); }}
      onMouseEnter={() => onEnter(node.id)}
      onMouseLeave={onLeave}
    >
      {/* Color accent bar */}
      <div
        className="absolute top-0 left-3 right-3 h-1 rounded-b-full"
        style={{ backgroundColor: node.color, opacity: isActive ? 0.9 : 0.5 }}
      />

      {/* Label */}
      <h4
        className="font-mono font-bold text-fluid-sm sm:text-fluid-base mt-1 leading-tight"
        style={{ color: isActive ? node.color : undefined }}
      >
        {node.label}
      </h4>

      {/* Sublabel */}
      <p className="font-mono text-fluid-xs text-muted-foreground mt-1">
        {node.sublabel}
      </p>

      {/* Active indicator */}
      {isActive && (
        <div
          className="absolute -top-px -left-px -right-px -bottom-px rounded-xl border-2 pointer-events-none animate-pulse"
          style={{ borderColor: node.color, opacity: 0.4 }}
        />
      )}
    </div>
  );
}
