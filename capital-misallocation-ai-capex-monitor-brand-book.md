# Capital Misallocation
## AI Capex Monitor — Brand Book

**Version 1.0**
**Brand owner:** Capital Misallocation
**Product:** AI Capex Monitor
**Applies to:** The AI Capex Monitor website, dashboard, research tools, charts and tables, TradingView workspace, source/evidence panels, AI-search boundary, newsletter surfaces, browser metadata, and social-preview treatment.

---

## Brand statement

> **A trillion-dollar buildout is now searching for its economic clearing price.**

The **AI Capex Monitor** is Capital Misallocation’s evidence-led research instrument for examining the investment, financing, power, and return dynamics of AI infrastructure. It is designed for readers who want a direct argument, visible assumptions, inspectable data, and clear pathways back to sources.

The product is not a generic fintech dashboard, an AI SaaS interface, a terminal imitation, or a promotional market feed. It is an **interactive research instrument**: a sharp contention is followed by observed evidence, explicit assumptions, a readable analytical result, and a source path.

### The core sequence

| Stage | Purpose | Required expression |
|---|---|---|
| **Thesis** | State the claim worth testing | A declarative, specific proposition |
| **Evidence** | Ground the claim | Source name, as-of date, and observed data |
| **Assumptions** | Expose the model | Inputs, definitions, defaults, and methodology |
| **Readout** | Make the analytical result legible | Clear value, unit, interpretation, and limitations |
| **Appendix** | Preserve auditability | Sources, calculation notes, definitions, and version history |

A headline may be contrarian; it must never be indistinguishable from an observed fact. The interface explicitly labels **observed evidence**, **modeled assumptions**, **editorial inference**, and **scenario output**.

---

## Brand architecture

| Brand layer | Approved expression | Usage |
|---|---|---|
| Parent brand | **Capital Misallocation** | Primary authority and visual anchor |
| Product descriptor | **AI Capex Monitor** | Specialized analytical product |
| Standard lockup | **Capital Misallocation — AI Capex Monitor** | Navigation, dashboard header, page title, metadata, social copy |
| Compact lockup | **Capital Misallocation** / **AI Capex Monitor** | Narrow layouts only |
| Hero thesis | **A trillion-dollar buildout is now searching for its economic clearing price.** | First-view headline |

Capital Misallocation always receives greater visual emphasis than AI Capex Monitor. The product descriptor does not operate as a stand-alone brand.

---

## Personality and voice

The voice is **contrarian, sharp, and thesis-forward**, but never careless. The product should be exact enough that a reader can inspect the evidence that supports or challenges the argument.

| Attribute | In practice |
|---|---|
| **Thesis-forward** | Put the contention in the heading; do not lead with a generic feature list. |
| **Forensic** | Attach source, as-of time, version, and methodology routes to consequential claims. |
| **Exact** | Name units, scope, assumptions, scenario inputs, and observed-versus-modeled distinctions. |
| **Calm** | Avoid hype, fake urgency, count-up theatrics, and unqualified superlatives. |
| **Useful** | Preserve conventional labels for actions that users repeat often. |

### Editorial language

Use **Thesis, Evidence, Readout, Assumptions, Methodology, Appendix, Current Context**, and **Source Coverage** on editorial surfaces. Use **Search, Filter, Watchlist, Table, Chart, Export, Reset, Apply, Compare**, and **Add Position** on utility controls.

### Writing rules

1. Make the argument in the heading and the proof available in the adjacent readout.
2. Do not describe a modeled result as observed evidence.
3. Do not claim a feed is live unless the UI gives the actual source, state, and timestamp.
4. Keep AI-search and access-boundary copy factual: explain the restricted capability, what remains available, and the available action.
5. Use short, assertive labels; avoid vague phrases such as “next-generation intelligence” or “unprecedented insight.”

---

## Official mark and lockup

### Interim official source

**Official mark source:** `https://longshort.capitalmisallocation.com/logo.png`
**Interim format:** 320 × 320 PNG
**Future replacement:** A vector or higher-resolution original may replace this file. All placements must draw from a single replaceable **brand mark asset registry** so the upgrade does not require layout changes.

### Mark usage

| Context | Required treatment |
|---|---|
| Editorial Paper | Geometry-preserving dark/ink mark on a clean paper field |
| Dark Research | Geometry-preserving light/paper mark on deep ink |
| Navigation | Compact mark with live editable lockup |
| Landing hero | Restrained mark; full image lockup may appear only in editorial/hero contexts |
| Dashboard header | Small mark with live editable product lockup |
| Footer | Small seal paired with text-first product information |
| Favicon / app icon | Tested derivative at 16, 32, 48, and 64px |
| Browser / social metadata | Mark derivative plus editable text and approved thesis |

### Mark rules

- Preserve geometry exactly. Do not redraw, crop, stretch, skew, outline, shade, gradient-fill, glow, filter, or animate the mark.
- Build transparent, ink-on-paper, paper-on-ink, favicon, and app-icon derivatives from one interim master.
- Test every derivative for soft edges, halos, aliasing, square backgrounds, and legibility before release.
- Maintain clear space equal to at least one internal mark unit.
- Do not place the mark over a cyan field, gold field, chart noise, dense grid, or busy image.
- Use live editable type for the product lockup. Do not rasterize normal navigation or header copy.

---

## Typography

| Typographic role | Typeface | Required uses |
|---|---|---|
| Editorial display | **Newsreader** | Hero thesis, section propositions, pull claims, considered analytical conclusions |
| Product interface | **IBM Plex Sans** | Navigation, controls, body copy, annotations, source metadata, error/validation copy |
| Data and precision | **IBM Plex Mono** | Tickers, prices, dates, timestamps, tables, formulae, axes, scenario values, live state |

### Typesetting principles

Newsreader creates editorial authority, but it is reserved for thesis-level hierarchy. IBM Plex Sans carries product reading and controls. IBM Plex Mono carries comparability and numerical precision.

- Sustained explanatory reading uses 16–18px IBM Plex Sans with approximately 1.45–1.6 line height.
- Tables use 12–14px Sans or Mono with approximately 1.2–1.35 line height when legibility remains intact.
- Use tabular figures for sortable and comparable values.
- Right-align numbers and decimals; left-align names and sources.
- Retain selective all caps for compact column labels, status tags, and abbreviated data labels only.
- Do not use display serif type in tables, utility controls, charts, axes, dense dashboard headers, or TradingView context.

---

## Theme system

The brand has two fully authored environments. They share information architecture, component anatomy, type scale, data semantics, keyboard behavior, and density. They are not inverse color schemes.

### Preference behavior

1. A saved, explicit visitor selection takes priority.
2. New visitors begin in **Editorial Paper**, regardless of operating-system color preference.
3. A deliberate **Reset to Editorial Paper** action is available.
4. Theme changes do not reset filters, scroll position, active workspace, unsaved scenario inputs, or selected positions.
5. The application must avoid a wrong-theme flash during initial load.

### Editorial Paper

Editorial Paper is the first-visit environment: an open, calm field for a thesis and its evidence.

| Token | Value | Role |
|---|---:|---|
| `surface.canvas` | `#FAFAFA` | Paper field |
| `surface.inset` | `#F3F3F1` | Quiet grouping plane |
| `ink.primary` | `#1C1C1C` | Primary reading and data ink |
| `ink.emphasis` | `#0D0D0D` | Primary actions and direct emphasis |
| `ink.secondary` | `#6A6A6A` | Secondary labels and metadata |
| `editorial.gold` | `#C9A227` | Measured archival/reference emphasis |
| `editorial.gold.strong` | `#8A7418` | Contrast-safe gold treatment |
| `data.risk` | `#A83232` | Risk and adverse scenario semantics |
| `data.positive` | `#2F4A3C` | Confirmed/favorable semantics |
| `status.live` | `#046E87` | Live, verified evidence, or infrastructure status |

Paper uses continuous fields, fine ink rules, deliberate white space, and limited `#F3F3F1` grouping. The primary action is deep ink with light text. Secondary actions are restrained outlined controls.

### Dark Research

Dark Research is a low-fatigue extended-analysis environment: deep ink, warm off-white reading text, deliberate charcoal grouping, and clearer dense-workspace boundaries.

| Token | Initial value | Role |
|---|---:|---|
| `surface.canvas` | `#0D0D0D` | Deep ink field |
| `surface.raised` | `#181816` | Operational grouped plane |
| `surface.inset` | `#141412` | Dense/recessed workspace |
| `ink.primary` | `#F3F3F1` | Primary reading text |
| `ink.secondary` | `#C8C4BD` | Readable secondary text |
| `rule.strong` | `#68645F` | Essential separators and controls |
| `editorial.gold` | `#E3C458` | Selected analytical reference |
| `data.risk` | `#FF8D86` | Risk/adverse state |
| `data.positive` | `#8ECCA7` | Confirmed/favorable state |
| `status.live` | `#75C9DA` | Live/evidence/infrastructure state |

Dark Research uses contiguous deep-ink planes, restrained elevation, and a clean hierarchy. It does not use blue-black gradients, persistent noise, decorative grids, neon cyan, or glow effects.

### Semantic color rules

| Family | Meaning | Required reinforcement | Never use it for |
|---|---|---|---|
| Ink / neutral | Ordinary analysis, core text, non-semantic data series | Hierarchy, labels, line weight | — |
| Gold | Archival context, selected reference, analytical threshold | Direct annotation or selected state | Primary CTA color or decoration |
| Oxblood | Risk, downside, adverse scenario | Text, icon, signed value, pattern, or marker | Color-only warning |
| Green | Confirmed, favorable, validated progress | Text, signed value, pattern, or marker | Color-only gain state |
| Cyan | Live feed, verified evidence, infrastructure status | Explicit label, timestamp, icon, or shape | General accent, arbitrary link, hero glow |

No risk, positive, live, or chart state may rely on color alone. Use labels, marker/line styles, patterns, values, and position to reinforce meaning.

---

## Interface grammar

### Landing: argument to instrument

The landing converts a thesis into an analytical action:

1. **Masthead:** official mark, live editable lockup, compact product navigation, theme and motion preferences.
2. **Hero thesis:** the approved H1 in Newsreader.
3. **Evidence-led deck:** a concise statement of the chain under observation: capex, financing/refinancing, power constraints, scenario outcomes, and the 50-name universe.
4. **Current Readout:** a thin-rule source-linked strip that carries measured evidence, as-of time, and version/methodology route.
5. **Primary route:** an ink-first action such as **Open AI Capex Monitor**.
6. **Secondary route:** a restrained **Read the current thesis** action.
7. **Evidence modules:** no more than three compact claims, each with a factual interpretation, source/date, and a route to the relevant monitor state or source panel.

The landing is a well-argued entry to the monitor, not a feature-card mosaic or generic KPI wall.

### Dashboard header: research command layer

The dashboard header is compact and operational, not a second marketing hero.

| Layer | Content | Constraint |
|---|---|---|
| Global utility band | Official mark, live lockup, primary monitor navigation, theme/motion preferences, necessary utility controls | Approximately 56–64px on desktop; stable height |
| Local research header | Workspace name, relevant date range/task controls, live/as-of/data-version status, Sources/Methodology route | Keep workspace controls below the global band |
| Context bar | Active universe, last refresh, source coverage, selected scenario, evidence state | Use only if it improves auditability |

The desktop priority is: **identity → workspace context → task access → live/as-of/source status → preferences**. On small screens, preserve identity, monitor navigation, freshness/status, and accessible preferences through a deliberate two-row or sheet pattern.

### Component behavior

| Component | Required behavior |
|---|---|
| Primary action | Deep-ink fill, light text, direct functional label |
| Secondary action | Paper/transparent field with ink rule; conventional label |
| Segmented control | Ink-first tabs; selected state not encoded by color alone; keyboard operable |
| Evidence readout | Value, unit, as-of time, source, factual interpretation, evidence route |
| Source row | Source name, date/timestamp, data or methodology version, visible action |
| Status chip | Text plus semantic color and icon/shape; live state includes actual timestamp |
| Data table | Sticky context where viable; textual sort state; tabular alignment; focusable rows |
| Chart | Factual annotation, named legend, unit, source/as-of, accessible value/summary route |
| Scenario panel | Named assumptions, units, slider plus keyboard numeric input, reset/default/current states |
| AI-search boundary | Research-access explanation, remaining availability, one clear action |
| TradingView pane | Clear external-tool boundary with ticker, interval, source/as-of context, and accessible summary |

---

## Data-workspace standards

Density is part of the product’s evidence. The monitor remains compact, source-linked, and exact in both themes.

- Use a subtle grid only behind genuinely dense workspaces; never behind the landing hero, navigation, or ordinary editorial surfaces.
- Preserve table columns, control order, row rhythm, keyboard behavior, and data-series meaning between themes.
- Maintain full utility for the universe, correlation matrix, scenario map, position builder, quote state, TradingView workspace, source panels, newsletter, and AI-search boundary.
- Avoid decorative glass, oversized empty cards, generic metric tiles, and stock-terminal ornament.
- Use sticky headers and, where viable, sticky identifiers for wide tables.
- Provide labelled horizontal scrolling for wide data; do not shrink a matrix into illegibility.
- On narrow screens, use selected-name comparison or ranked-list modes for dense matrices.
- Charts must show title, interpretation, named legend, unit, source/as-of, and an accessible path to exact values.

---

## Motion and preference model

The product exposes visible, keyboard-operable controls for:

- **Theme:** Editorial Paper / Dark Research
- **Motion:** Quiet / Standard / Dynamic

Theme and motion preferences persist independently. `prefers-reduced-motion: reduce` is a hard override to Quiet behavior.

| Mode | Allowed behavior | Disallowed behavior |
|---|---|---|
| **Quiet** | Immediate feedback; static charts and values | Loops, shimmer, parallax, count-ups, animated chart redraws |
| **Standard** | 120–180ms opacity/color feedback; restrained user-initiated transition | Autonomous motion, layout shifts, delayed data visibility |
| **Dynamic** | One-time capped editorial reveal; purposeful scenario or chart narration | Repeated autoplay, flashing, looping logo/value animation, 3D/parallax |

Motion can clarify a changed state or relationship; it cannot be the sole way to communicate data, price movement, risk, or evidence freshness.

---

## Accessibility baseline

The AI Capex Monitor brand is only valid when it is accessible.

- Meet **WCAG 2.2 AA** for normal text and interactive controls.
- Maintain at least **3:1** contrast for essential non-text UI boundaries, focus indicators, and graphical objects where applicable.
- Use a visible 2px+ focus treatment that is distinct from selected and live states.
- Do not rely on color, motion, hover, or iconography alone for essential states.
- Support keyboard operation for theme/motion preferences, navigation, tables, source routes, scenario inputs, and the AI-search boundary.
- Preserve state and focus when preferences change.
- Validate at 200% zoom, with text-spacing overrides, and under reduced-motion settings.
- Keep risk, positive, live, and chart distinctions understandable for people with color-vision differences.

---

## Anti-patterns

The following are prohibited:

1. A Bloomberg-like terminal clone.
2. A generic rounded-card fintech dashboard.
3. Neon crypto or ambient AI glow.
4. A light theme that is merely a dark dashboard on white.
5. A dark theme that is a simple paper-color inversion.
6. Display serif type in charts, controls, tables, or vendor-tool context.
7. Gold as a premium CTA or general decorative wash.
8. Cyan as a decorative brand accent.
9. Source-less contrarian claims.
10. A large editorial header that crowds out monitoring work.
11. A raw raster mark pasted onto dark fields without tested derivatives.
12. Animation used to simulate urgency or conceal missing data provenance.

---

## Flagship implementation standard

The first implementation pass is limited to the **landing page and dashboard header**. It passes review only when a new visitor can:

1. Recognize Capital Misallocation as the parent authority.
2. Read the clearing-price thesis before decorative treatment.
3. Find dated evidence and a source/methodology route.
4. Enter the monitor without friction.
5. Understand observed, modeled, inferred, live, and risk states without color or motion alone.
6. Change theme and motion preferences without losing state.
7. Complete dense-data tasks with the same meaning in both themes.

The resulting product should feel like a **research publication that becomes an instrument**: opinionated in its thesis, meticulous in its evidence, and uncompromisingly useful in its data workspace.

*Capital Misallocation — AI Capex Monitor is research and analysis, not personalized investment advice.*
