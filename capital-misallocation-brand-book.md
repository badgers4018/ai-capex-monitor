# Capital Misallocation
## Brand Book — AI Capex Monitor

**Version:** 1.0 — flagship-design brief
**Status:** Approved brand direction; ready for landing and dashboard-header prototype only
**Applies to:** Capital Misallocation — AI Capex Monitor, its visitor-facing web surfaces, metadata, browser chrome, AI-search boundary, newsletter surfaces, and research-network navigation.
**Excludes in this pass:** visual redesign of downloaded PDF and CSV files.

---

## 1. Brand premise

> **A trillion-dollar buildout is now searching for its economic clearing price.**

**Capital Misallocation** is the author and research authority. The **AI Capex Monitor** is its specialized instrument for following the investment, financing, power, and evidence chain behind AI infrastructure.

The product should not present as a generic financial dashboard, an AI SaaS application, a Bloomberg imitation, or a neon-crypto terminal. It is an **interactive research publication with analytical machinery**: it makes a sharp contention, exposes the evidence and assumptions that can challenge it, then gives the reader precise tools to inspect the result.

### The signature experience

Every consequential surface follows the same intellectual sequence:

> **Thesis → observed evidence → assumptions / methodology → readout or scenario output → source / appendix**

A contrarian statement may open the analysis, but the interface must always make clear whether a statement is an **observed fact**, **modeled assumption**, **editorial inference**, or **scenario result**.

---

## 2. Brand architecture

| Layer | Approved expression | Role |
|---|---|---|
| Parent / author | **Capital Misallocation** | Primary identity, publication, and research network |
| Specialized product | **AI Capex Monitor** | Live research instrument |
| Standard UI lockup | **Capital Misallocation — AI Capex Monitor** | Navigation, dashboard header, page titles, metadata, social copy |
| Space-constrained lockup | **Capital Misallocation** / **AI Capex Monitor** | Two-line small-screen or compact contexts only |
| Editorial promise | **A trillion-dollar buildout is now searching for its economic clearing price.** | Flagship hero H1 |

Capital Misallocation must always carry the stronger visual weight. The AI Capex Monitor is a descriptor, never an independent brand. Use an en dash in polished presentation text; the approved hyphen can remain only in technical identifiers where required.

### Research ecosystem

The monitor is part of an explicit Capital Misallocation network:

| Property | Navigation label | Required purpose text |
|---|---|---|
| `capitalmisallocation.com` | **Capital Misallocation** | Essays, notes, conversations, and archive |
| `longshort.capitalmisallocation.com` | **Long/Short** | Interactive research on alpha, fees, and arithmetic |
| `ergodicity.capitalmisallocation.com` | **Ergodicity** | Sequence-of-returns simulation |
| This product | **AI Capex Monitor** | Specialized AI-infrastructure capital-cycle research |

Use a compact **Research** menu in global navigation and a quiet **Capital Misallocation Research** block in the footer. This network is research provenance—not a promotional carousel or app switcher.

---

## 3. Brand personality and writing voice

### Personality

- **Thesis-forward:** state the conclusion worth testing before listing features.
- **Contrarian, not careless:** challenge consensus; distinguish opinion from evidence.
- **Forensic:** attach a source, date, version, or methodology path to claims.
- **Exact:** controls, data labels, units, and scenario assumptions are explicit.
- **Calm:** no false urgency, superlatives, decorative live indicators, or hype language.

### Approved language

Use research vocabulary for editorial framing:

- **Thesis**
- **Evidence**
- **Readout**
- **Assumptions**
- **Methodology**
- **Appendix**
- **Current context**
- **Source coverage**

Use standard conventional labels for high-frequency actions:

- **Search**
- **Filter**
- **Watchlist**
- **Table**
- **Chart**
- **Export**
- **Reset**
- **Apply**
- **Compare**
- **Add position**

### Copy rules

1. Put the argument in headings; put the proof in a source-linked readout.
2. Do not use the Long/Short titles “The Multiplicative Indictment” or “The Causal Barbell.”
3. Do not claim “real-time intelligence” unless that state is demonstrably live and labelled as such.
4. Keep pricing, AI-search access, and gated research copy plain: state what is restricted, what stays available, and the one available action.
5. Never present model outputs as observed evidence. Label modelled, inferred, and observed content distinctly.

---

## 4. Official mark and asset system

### Interim official asset

**Authorized source:** `https://longshort.capitalmisallocation.com/logo.png`
**Current format:** 320 × 320 PNG
**Replacement rule:** the owner may provide an original vector/high-resolution asset later. The implementation must use a single replaceable **`brand.mark`** asset registry so replacement does not require layout changes.

### Required logo behavior

| Context | Treatment |
|---|---|
| Editorial Paper | Tested ink/dark version on a clean paper field |
| Dark Research | Tested light/paper version on deep ink |
| Navigation | Compact official mark + live editable lockup |
| Landing / editorial hero | Restrained official mark; complete image lockup is allowed only here and in social/editorial moments |
| Footer | Small seal beside text-first research-network content |
| Favicon / app icon | Geometry-preserving derivative tested at 16, 32, 48, and 64 px |
| Metadata / social preview | Official-mark derivative and live text / approved hero statement |

### Non-negotiable logo rules

- Replace the current custom observatory mark everywhere in scope.
- Preserve the official geometry exactly: **no redrawing, tracing, cropping, stretching, skewing, outlining, shadows, gradients, glow, CSS filter, or animated distortion.**
- Create transparent, ink-on-paper, paper-on-ink, favicon, and app-icon variants from one interim master; test each for haloing, square backgrounds, aliasing, and recognizability.
- Keep clear space equal to at least one meaningful internal mark unit.
- Never place the mark on cyan, gold, chart noise, a dense grid, or a visually busy background.
- Use live text in product UI. Do not rasterize the normal lockup.

---

## 5. Typography

| Role | Typeface | Primary use | Do not use for |
|---|---|---|---|
| Editorial display | **Newsreader** | Hero thesis, section propositions, pull claims, editorial readouts | Tables, controls, chart labels, dense dashboard headers |
| Product / UI | **IBM Plex Sans** | Navigation, controls, body copy, labels, source metadata, annotations, validation | Competing Manrope styles |
| Data / precision | **IBM Plex Mono** | Tickers, prices, dates, status, tables, axes, formulae, scenario values | Competing JetBrains Mono styles |

### Typesetting rules

- Use Newsreader with restraint: a forceful proposition, not a page-wide decorative texture.
- Sustained reading: **16–18px IBM Plex Sans**, approximately **1.45–1.6** line height, controlled line length.
- Dense tables: **12–14px IBM Plex Sans / Mono**, approximately **1.2–1.35** line height when legible.
- Apply tabular figures to all comparable/sortable numbers.
- Right-align numeric values and decimals; left-align names and sources; preserve fixed-width status/time columns where useful.
- Retain selective all caps only for compact utility labels, table headers, status tags, and abbreviations. Do not use all caps for body copy, the brand lockup, or editorial propositions.
- Retire Instrument Serif, Manrope, and JetBrains Mono from visitor-facing product identity.

---

## 6. Adaptive theme system

The product has two equally intentional environments. **Editorial Paper** is the default for first-time visitors. **Dark Research** is a deliberate extended-analysis environment.

### Preference precedence

1. A visitor’s explicit saved theme choice wins across routes and return visits.
2. Without a saved choice, show **Editorial Paper**, even when the operating system prefers dark mode.
3. Offer a deliberate **Reset to Editorial Paper** action.
4. Changing themes must not reset filters, scroll position, unsaved scenario inputs, selected positions, or workspace context.
5. Eliminate flash of the wrong theme before initial paint.

### Editorial Paper

| Semantic role | Value | Use |
|---|---:|---|
| `surface.canvas` | `#FAFAFA` | Default paper field |
| `ink.primary` | `#1C1C1C` | Core body text, rules, data ink |
| `ink.emphasis` | `#0D0D0D` | Primary actions, direct data emphasis |
| `surface.inset` | `#F3F3F1` | Quiet grouping; never pervasive card stacking |
| `ink.secondary` | `#6A6A6A` | Noncritical labels and metadata |
| `editorial.gold` | `#C9A227` | Measured archival/reference emphasis |
| `editorial.gold.strong` | `#8A7418` | Stronger contrast treatment; not ordinary body text without validation |
| `data.risk` | `#A83232` | Downside / adverse scenario semantics |
| `data.positive` | `#2F4A3C` | Confirmed / favorable / restraint semantics |
| `status.live` | `#046E87` | Live, verified-evidence, or infrastructure status only |

**Paper rules:** continuous paper fields, fine ink rules, deliberate white space, and selective soft-paper grouping. Black/deep-ink primary actions use white text. Secondary actions are restrained outlines. No blue-black card stack, glass, gradients, persistent noise, generic SaaS tile mosaics, or decorative cyan.

### Dark Research

Dark Research is not a palette inversion. It uses a deep-ink canvas with warm off-white reading text, authored charcoal planes, fewer clearer boundaries, and a separately tested semantic palette.

| Semantic role | Initial reference value | Use |
|---|---:|---|
| `surface.canvas` | `#0D0D0D` | Deep ink base |
| `surface.raised` | `#181816` | Operational grouped plane |
| `surface.inset` | `#141412` | Dense / recessed data workspace |
| `ink.primary` | `#F3F3F1` | Primary reading text |
| `ink.secondary` | `#C8C4BD` | Secondary but readable metadata |
| `rule.strong` | `#68645F` | Essential separators and controls |
| `editorial.gold` | `#E3C458` | Selected analytical reference / archival emphasis |
| `data.risk` | `#FF8D86` | Risk / adverse state—always labelled |
| `data.positive` | `#8ECCA7` | Confirmed / favorable state—always labelled |
| `status.live` | `#75C9DA` | Live, evidence, or infrastructure status—always labelled |

**Dark rules:** use large contiguous ink planes, restrained elevation, clean rule contrast, and no blue-black gradient/noise inheritance. Never turn cyan into a hero glow or general accent. Reserve pure white for direct emphasis and focus—not every table cell or surface.

### Verified reference contrast

The following pairs were verified for the intended parent surfaces:

| Pair | Contrast ratio |
|---|---:|
| Paper ink / paper canvas | 16.33:1 |
| Paper secondary / paper canvas | 5.18:1 |
| Paper dark gold / paper canvas | 6.57:1 |
| Paper risk / paper canvas | 6.35:1 |
| Paper positive / paper canvas | 9.29:1 |
| Paper live cyan / paper canvas | 5.61:1 |
| Dark ink / dark canvas | 17.49:1 |
| Dark secondary / dark canvas | 11.19:1 |
| Dark gold / dark canvas | 11.39:1 |
| Dark risk / dark canvas | 8.71:1 |
| Dark positive / dark canvas | 10.50:1 |
| Dark live cyan / dark canvas | 10.29:1 |
| Dark rule / dark canvas | 3.31:1 |

Every actual component still requires its own contrast check against its local surface. Normal text and interactive controls require **WCAG 2.2 AA (4.5:1)**. Essential non-text UI boundaries, focus indicators, chart strokes, and graphical objects require **3:1** where applicable.

---

## 7. Semantic color governance

Color communicates a bounded meaning; it is never merely decoration.

| Semantic family | Meaning | Required non-color reinforcement | Prohibited use |
|---|---|---|---|
| Ink / neutral | Primary analysis, ordinary series, core UI | Labels, line weight, hierarchy | Not applicable |
| Gold | Archival context, selected reference, measured analytical emphasis | Label, selected treatment, or direct annotation | Primary CTA wash, “premium” decoration, hero glow |
| Oxblood / risk | Downside, risk, adverse scenario, alert | Text label, icon, signed value, pattern or marker | Generic negative decoration, color-only warning |
| Green / positive | Confirmed, favorable, validated progress | Text label, signed value, pattern or marker | Color-only gain state |
| Cyan / live | Live feed, verified evidence, infrastructure status | Explicit status text, date/timestamp, icon or shape | General accent, default link, ambient glow, arbitrary chart highlight |

Data-series semantics must not change by theme. Use direct labels, marker/line style, pattern, signed values, and/or position in addition to color. Do not rely on red/green or any color alone.

---

## 8. Interface grammar

### Landing: argument → instrument

The first-view landing composition is intentionally editorial:

1. **Masthead:** official mark + editable lockup, compact Research menu, theme/motion preferences, only necessary utilities.
2. **Hero H1:** the approved clearing-price statement, in Newsreader.
3. **Evidence-led deck:** a concise explanation of the monitored causal chain—AI infrastructure capex, financing/refinancing, power constraints, scenario outcomes, and the 50-name universe.
4. **Current Readout:** thin-rule, timestamped evidence strip with source/version route.
5. **Primary action:** ink-first **Open AI Capex Monitor** or **Read the live monitor**.
6. **Secondary action:** a restrained **Read the current thesis** route.
7. **Evidence modules:** two or three evidence cards only, each with a specific claim, source/date, factual interpretation, and link to the relevant dashboard state or source panel.

The landing is an opening argument that becomes a tool. It is not a feature-card or KPI-wall landing page.

### Dashboard header: research command layer

The dashboard header must be compact and stable. It is not a second hero.

| Layer | Contents | Constraint |
|---|---|---|
| Global utility band | Official compact mark, editable lockup, Research menu, theme/motion controls, account/newsletter/AI-search utility as applicable | Approximately 56–64px on desktop; stable height |
| Local research header | Current workspace, page title, relevant date range/task controls, live/as-of/data version status, Sources/Methodology route | Workspace controls remain below global chrome |
| Optional context bar | Active universe, last refresh, source coverage/readout, selected scenario, explicit evidence status | Approximately 32–40px; include only when it improves auditability |

Desktop priority is: **identity → workspace context → primary task access → live/as-of/source state → preferences and utilities**. Mobile may use two deliberate rows or a sheet, but cannot hide identity, freshness/status, primary monitor navigation, or preference access behind hover-only behavior.

### Component recipes

| Component | Required Capital Misallocation behavior |
|---|---|
| Primary action | Deep ink fill, light text, Plex Sans; direct functional copy; no gold CTA fill |
| Secondary action | Paper/transparent field with ink rule; conventional label; no glass effect |
| Segmented control | Ink-first segmented tabs, selected state readable without color only; keyboard operable |
| Evidence readout | Value + unit + as-of + source + one factual interpretation + evidence route |
| Source row | Source name, date/timestamp, data/methodology version, visible source action—not an icon-only mystery control |
| Status chip | Text plus semantic family and icon/shape; live includes actual timestamp/state |
| Data table | Sticky context where viable, visible sort state, tabular alignment, source/detail path, focusable rows |
| Chart | Factual annotation, named legend, unit, source/as-of, keyboard-accessible values or equivalent, non-color series distinction |
| Correlation matrix | Signed value + hue + pattern/label + robust cell focus; selected-name/list alternative on small screens |
| Scenario panel | Named assumptions, units, slider plus keyboard numeric input, default/current/reset states, observed vs modeled labels |
| AI-search boundary | Research-access explanation, what stays available, one clear action; no urgency shimmer/glow or generic sales language |
| TradingView pane | Clearly bounded external research workspace with ticker, interval/market state, as-of/source context, focus boundary, and accessible alternative summary |

---

## 9. Motion and preferences

Expose a visible, keyboard-operable preference surface:

- **Theme:** Editorial Paper / Dark Research
- **Motion:** Quiet / Standard / Dynamic

Persist theme and motion separately. A system `prefers-reduced-motion: reduce` setting is a hard override to **Quiet** regardless of a saved user choice.

| Motion mode | Allowed | Prohibited |
|---|---|---|
| **Quiet** | Immediate feedback, static charts and values, static live indicator | Loops, shimmer, parallax, chart redraws, number rollups, hover displacement |
| **Standard** *(adaptive default)* | Short 120–180ms opacity/color feedback and restrained user-initiated transitions | Autonomous loops, animated values, layout movement, delayed data visibility |
| **Dynamic** | One-time capped/interruptible editorial reveal; purposeful scenario before/after and chart narration | Repeated autoplay, looping logo/value animation, rapid flashes, 3D/parallax, motion as sole evidence |

Theme changes preserve focus and operational state. Quiet and reduced-motion switches are immediate. No mode may delay data reading, block a control, alter a value, or convey a state solely through motion.

---

## 10. Dense workspace rules

Data density is part of the brand’s proof, not clutter to eliminate. Keep the monitor exact, compact, and evidence-linked.

- Paper uses open paper, fine ink rules, and soft-paper grouping for dense modules.
- Dark uses contiguous deep-ink planes with clear boundaries and separately tested chart/table tokens.
- The subtle grid is allowed **only** inside genuinely dense analytic modules and must always sit below data contrast.
- Preserve geometry, columns, control placement, row rhythm, keyboard paths, and density presets across themes.
- Maintain functionality for the 50-name universe, 50×50 correlation matrix, scenario map, position builder, quote state, TradingView workspace, tables/charts, source panels, newsletter, and AI-search boundary.
- Do not substitute oversized blank cards, generic metric tiles, glassmorphism, stock-terminal ornament, or promotional containers for structured comparison.

### Tables, charts, and mobile

- Use sticky headers and, where viable, a sticky first identifier column.
- Sort state must be textual as well as visual.
- Provide a labelled horizontal-scroll region for wide data; do not proportionally shrink a matrix into illegibility.
- On narrow screens, offer selected-name comparison or ranked-list modes for the correlation matrix.
- Every chart requires title, factual annotation, named legend, unit, source/as-of, and accessible value/summary route.
- Only request a matching TradingView theme where the vendor supports it; otherwise use an honest, labelled container rather than forcing the vendor UI to imitate the product.

---

## 11. Research-network navigation

### Global Research menu

Place **Research** immediately after identity and before conversion/account utilities. The menu is accessible by click/tap and keyboard (Enter/Space; visible focus; Escape close; predictable focus return; arrow behavior for a menu pattern). It never relies on hover alone.

| Destination | Description |
|---|---|
| **Capital Misallocation** | Essays, notes, conversations, and archive |
| **Long/Short** | Interactive research on alpha, fees, and arithmetic |
| **Ergodicity** | Sequence-of-returns simulation |

On mobile, retain the same destination descriptions in an accessible drawer or sheet with 44px touch targets where feasible. Make cross-property navigation clear; never imply shared state, watchlists, scenarios, or AI-search context without an explicit handoff mechanism.

### Footer

Place a restrained **Capital Misallocation Research** block beside a small official seal and the same three destination descriptions. Use text-first hierarchy and fine rules. Do not use logo carousels, promotional tiles, or a generic link cloud.

---

## 12. Accessibility acceptance criteria

The brand system is only valid when it remains accessible in both environments.

- WCAG 2.2 AA minimum for normal text and interactive controls; 3:1 minimum for essential non-text/focus/chart boundaries as appropriate.
- Visible **2px+** focus indicator, distinct from selected and live states.
- No color-only, motion-only, hover-only, or icon-only essential states.
- Keyboard operation for Research menu, theme/motion controls, scenario inputs, source routes, data-table focus, and AI-search boundary.
- 200% zoom and text-spacing checks without lost functionality.
- Color-vision-safe risk, positive, live, and chart series distinctions.
- Reduced-motion hard override; no automatic count-up, ticker movement, or persistent pulse in Quiet mode.
- Page and theme changes preserve focus, filters, scroll, unsaved inputs, selected positions, and dense-workspace state.

---

## 13. Explicit anti-patterns

Reject any proposal that produces one of these outcomes:

1. A dark Bloomberg/terminal clone.
2. A generic rounded-card fintech dashboard.
3. Neon crypto or AI glow treatment.
4. A light theme that is merely the current dashboard with a white background.
5. A dark theme that is simply inverted paper colors.
6. Serif type in dense controls, charts, tables, or TradingView contexts.
7. Gold as an all-purpose premium CTA color.
8. Cyan as a decorative brand color.
9. Source-less contrarian claims.
10. A large editorial header that crowds out active monitoring work.
11. Research-network links that become promotional cards or dashboard-tool clutter.
12. Raw 320×320 logo PNG pasted onto dark fields without tested derivatives.

---

## 14. Flagship review gate

Only the **landing page and dashboard header** should be redesigned after this book is approved. Approve that flagship only if a new visitor can:

1. Recognize Capital Misallocation as the parent authority.
2. Read the exact clearing-price thesis before decorative treatment.
3. Locate dated evidence and its source/methodology route.
4. Enter the monitor without friction.
5. Understand observed, modeled, inferred, live, and risk states without color or motion alone.
6. Switch theme/motion preferences without losing state.
7. Navigate the wider research ecosystem without mistaking it for dashboard tooling.
8. Complete dense-data tasks with equal meaning in Editorial Paper and Dark Research.

### Fixed review set

Validate the flagship in:

- First-visit Editorial Paper
- Selected Dark Research
- Quiet, Standard, and Dynamic motion settings
- Operating-system reduced motion
- Keyboard-only navigation
- 200% zoom and text-spacing conditions
- Color-vision / contrast checks
- Mobile Research menu
- Real universe table, chart, correlation matrix, scenario control panel, TradingView wrapper, and AI-search boundary

**Pass condition:** source-brand continuity plus successful research-tool task completion—not visual novelty.

---

## 15. Implementation sequence after approval

1. Build the official-mark asset registry and contrast-safe variants.
2. Replace conflicting identity primitives: custom observatory mark, Instrument Serif, Manrope, JetBrains Mono, blue-black card stack, background noise, and decorative cyan.
3. Establish semantic Paper/Dark tokens and preference precedence before visual component edits.
4. Implement global type, numerical alignment, source/provenance, theme, motion, and Research-navigation foundations.
5. Prototype the Editorial Paper landing and compact dashboard header only.
6. Run the fixed flagship review gate and obtain approval.
7. Extend the system across remaining visitor-facing monitor surfaces.

*Capital Misallocation — AI Capex Monitor is research and analysis, not personalized investment advice.*
