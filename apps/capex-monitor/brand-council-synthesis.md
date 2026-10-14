# Capital Misallocation — AI Capex Monitor
## Five-Role Brand Council Synthesis

**Status:** Implementation brief for the brand book and the approved flagship review only (landing + dashboard header).  
**Decision hierarchy:** This synthesis preserves the approved project input. Where council views differ, the governing resolution is stated below.  
**Rollout rule:** Define and validate the shared system first; redesign the flagship; obtain approval; then extend the system to the wider product. **Do not use this phase to undertake a wholesale dashboard rewrite.**

## Executive summary

The AI Capex Monitor should become a **Capital Misallocation research instrument**, not a standalone fintech application, Bloomberg-like terminal, generic SaaS dashboard, or neon-crypto product. The source brand must remain the author and editorial authority; the monitor is its specialized live instrument. The user journey should begin with a falsifiable, thesis-led proposition and visible evidence paths, then move immediately into an exacting high-density workspace that exposes assumptions, sources, timestamps, modeled outputs, and counterevidence.

The governing expression is a single semantic system with two deliberately authored environments: **Editorial Paper** for all first visits and thesis/evidence entry, and **Dark Research** for deliberate extended analysis. They must preserve the same information architecture, type hierarchy, component anatomy, control order, data-series semantics, and keyboard behavior. They are not palette inversions. The flagship must prove the system through an Editorial Paper landing and a compact, provenance-rich dashboard header while preserving all live research workflows and capacity.

---

# 1. Consensus rules

## 1.1 Brand and product hierarchy

- **Capital Misallocation** is the parent, author, and primary visual identity.
- **AI Capex Monitor** is a subordinate descriptor and specialized live research instrument.
- Standard polished lockup: **`Capital Misallocation — AI Capex Monitor`**. Use an en dash in presentation text; retain the approved technical hyphen only where technically required.
- In constrained spaces, the relationship may become two lines or `Capital Misallocation / AI Capex Monitor`; never allow “AI Capex” to read as an independent brand after the parent relationship has been established.
- Use parent-brand continuity in page titles and social labels: **`Capital Misallocation — AI Capex Monitor | [specific page or readout]`**. The parent precedes page-specific thesis language.

## 1.2 The signature interaction pattern

Every consequential research surface should follow a repeatable sequence:

> **Thesis → observed evidence → assumptions/methodology → readout/scenario output → source/appendix route**

- A sharp claim may frame the work, but it must not masquerade as observed fact.
- Clearly distinguish **observed evidence**, **modeled assumption**, **editorial inference**, and **scenario output** in label, copy, and source treatment.
- Every material assertion, hero metric, risk conclusion, chart annotation, and scenario readout requires an on-surface source name, as-of date/timestamp, and version or methodology/assumptions route.
- Use thesis language in headlines, section propositions, and disciplined annotations—not in routine controls, alerts, empty states, or every metric.

## 1.3 System invariants

The following are invariant across themes and responsive breakpoints:

- Information architecture, control placement/order, component anatomy, grid, type scale, density presets, and keyboard paths.
- The meaning of data states and named series; theme may alter contrast-safe values but may **not** reverse series identity or semantic meaning.
- Visible source/evidence hierarchy, status/readout ordering, and access to methodology.
- Data capacity: the 50-name universe, 50×50 correlation matrix, scenario map, position builder, live quote state, TradingView workspace, charts/tables, source panels, newsletter, and AI-search boundary remain functional and accessible.

## 1.4 Semantic-token contract

Create semantic roles before components. Components consume roles; they do not introduce one-off hexadecimal values. At minimum define and document:

| Semantic role | Required meaning / use |
|---|---|
| `surface.canvas`, `surface.raised`, `surface.inset` | Primary field, grouped plane, dense/recessed workspace |
| `ink.primary`, `ink.secondary`, `ink.muted` | Reading and hierarchy; muted text remains readable, not decorative |
| `rule.subtle`, `rule.strong` | Structural separation; rules alone never define actionable regions |
| `action.primary`, `action.secondary`, `selected`, `disabled` | Stable interaction states independent of theme |
| `focus` | Visible 2px+ focus treatment, distinct from selected and live states |
| `status.live` / `live-evidence` | Live connection, verified evidence, or infrastructure status only |
| `data.risk`, `data.positive`, `data.caution` | Risk/downside, favorable/confirmed, and qualified/reference semantics |
| `editorial.gold` | Archival emphasis, active research categorization, measured reference emphasis |
| `chart.*` | Named, purpose-defined series roles with non-color identifiers |
| `overlay`, `input`, `error`, `unavailable`, `stale` | Explicit state values in both themes |

For every token, specify Paper and Dark values, permitted contexts, default/hover/active/selected/disabled/focus/live/stale variants, contrast ratios on actual parent surfaces, and the non-color indicator used when the token communicates a state.

---

# 2. Editorial Paper system

## 2.1 Role and default behavior

**Editorial Paper** is the mandatory first-visit environment and the governing reference for the system. It is a calm, high-whitespace thesis-and-evidence field—not a light skin applied to the current terminal.

- For a visitor without an explicit saved selection, render Paper even if the operating system prefers dark mode.
- A saved explicit visitor selection overrides the first-visit default on return visits and across routes.
- Provide a deliberate reset action to return to Editorial Paper.
- Paper is especially appropriate for landing, editorial framing, source reading, entry states, and ordinary research navigation; it must also support dense workspaces without turning them into marketing cards.

## 2.2 Required Paper foundation

| Token / purpose | Approved Paper value | Implementation rule |
|---|---:|---|
| Canvas | `#FAFAFA` | Default paper field |
| Primary ink | `#1C1C1C` | Body ink, fine rules, core reading hierarchy |
| Deep ink | `#0D0D0D` | Primary actions and direct data emphasis |
| Soft paper | `#F3F3F1` | Quiet grouping/inset planes; not pervasive card stacking |
| Secondary label | `#6A6A6A` | Noncritical labels only; preserve readable contrast |
| Archival gold | `#C9A227` | Measured editorial/reference emphasis only |
| Paper-safe darker gold | `#8A7418` | Use where gold requires stronger contrast; not normal body text on Paper without verified treatment |
| Risk | `#A83232` | Downside/adverse-scenario semantics only, never color alone |
| Positive / confirmed | `#2F4A3C` | Favorable/validated/restraint semantics only, never color alone |

## 2.3 Paper composition rules

- Use mostly continuous paper fields, generous but finite editorial spacing, fine ink rules, and selective `#F3F3F1` grouping.
- No blue-black card stack, gradient/noise field, decorative cyan treatment, glass effect, oversized KPI mosaic, or generic SaaS tile pattern.
- A subtle analytical grid is permitted **only behind a genuinely dense data workspace**. It must be lower contrast than all data marks and must never extend into the landing hero, global navigation, or ordinary editorial cards.
- Use black/deep-ink filled primary actions with white type; use restrained outlined/white secondary actions. Do not make gold a primary CTA color.
- For data work in Paper, use fine rules plus a consistent workspace boundary. Do not invent a different card treatment for every table/chart or allow dense modules to appear visually detached from the editorial field.

## 2.4 Paper accessibility baseline

- Baseline body pair `#1C1C1C` on `#FAFAFA` and secondary label `#6A6A6A` on `#FAFAFA` are the reference pairs; retain actual-size/weight contrast checks for every component.
- Normal explanatory text and interactive controls require **WCAG 2.2 AA, 4.5:1 minimum**.
- Large editorial display text requires **3:1 minimum**; validate thin Newsreader weights at actual rendered size.
- Essential graphical objects, selected tabs, controls, focus indicators, chart marks, matrix cells, and non-text boundaries require **3:1 minimum** where applicable.
- Fine rules organize; they cannot be the only cue for grouping, selection, focus, or actionability.

---

# 3. Dark Research system

## 3.1 Role and default behavior

**Dark Research** is a separately art-directed, low-fatigue analytical environment for intentional extended analysis. It is not a color inversion and must not reproduce the existing blue-black, cyan-led terminal aesthetic.

- Keep all Paper information architecture, typography roles, density presets, control positions, source paths, keyboard behavior, and series semantics.
- Use the same theme-selection precedence: explicit persisted selection wins; otherwise first visit is Paper. OS dark preference must not silently replace the approved Paper first visit.
- A theme change must update charts, legends, tables, tooltips, input states, focus rings, logo variant, error/loading/empty states, and TradingView container surroundings coherently—without resetting filters, scroll, unsaved scenario inputs, or selected positions.

## 3.2 Dark composition rules

- Start from a near-black, deep-ink canvas related to **`#0D0D0D`**, with intentionally authored charcoal planes, restrained elevation, deliberate rule contrast, and warm/off-white primary reading text.
- Use large contiguous ink planes with fewer, clearer boundaries—not a stack of blue-black cards.
- Avoid texture/noise, terminal grids outside genuine dense workspaces, neon accents, pervasive bright white fields, or glow effects.
- Use off-white for normal primary reading; reserve the brightest white for direct emphasis/focus, not every cell/card.
- Dark rules, muted labels, disabled-but-readable states, chart grids, input borders, selected tabs, and legend text must be separately chosen and verified against their real local surfaces.

## 3.3 Dark semantic-color requirements

- Do **not** reuse Paper risk/positive values mechanically: `#A83232` and `#2F4A3C` do not provide sufficient contrast on `#0D0D0D` for many text/data contexts.
- Author independent Dark equivalents for risk, positive, gold/reference, cyan/live-evidence, rule, focus, disabled, and chart values. Verify **4.5:1 for adjacent essential text** and **3:1 for essential chart strokes/UI boundaries** where applicable.
- Keep roles fixed: oxblood-family = risk/downside; green-family = favorable/confirmed; gold-family = archival/reference/selected analytical emphasis; cyan-family = live/evidence/infrastructure status. Do not change meaning by theme.
- Cyan must remain bounded and labelled. It is never a neon general accent, hero glow, arbitrary link color, default chart highlight, or decorative series.

## 3.4 Theme transition requirements

- **Quiet:** immediate switch; no crossfade, data redraw, value roll-up, or background wash.
- **Standard:** at most a short, non-spatial opacity/color transition for nonessential layers; never animate chart data, price values, focus rings, selected positions, panel geometry, or primary text.
- **Dynamic:** may gently transition nonessential surfaces, but the result must remain immediately readable and interruptible.
- Preserve focus on the invoking control and announce the new theme once to assistive technology. Avoid live-region chatter.
- Prevent flash of an incorrect theme before hydration/initial paint; supply a no-JavaScript/initial-render fallback that honors the approved Paper default.

---

# 4. Flagship landing and dashboard-header requirements

## 4.1 Flagship boundary

The approved proof surface is **one coherent landing plus dashboard-header system**. It must establish source-brand continuity and prove task completion before any full dashboard reskin. The landing may be composed and spacious; the monitor workspace remains dense, exact, and operational.

## 4.2 Landing: required first viewport

1. **Environment:** Editorial Paper on first visit.
2. **Masthead:** restrained official mark plus live editable primary lockup; compact Research control; subordinate theme and motion preferences; necessary account/newsletter/AI-search utilities. Do not let utilities overtake reading or dashboard entry.
3. **Exact H1:**
   > A trillion-dollar buildout is now searching for its economic clearing price.
4. **Deck:** one concise evidence-led line naming the monitored causal chain: AI infrastructure capex, financing/refinancing, power constraints, scenario outcomes, and the 50-name universe. Do not claim generic “real-time intelligence.”
5. **Evidence / freshness:** visible source state, as-of date/timestamp, methodology/version path, and a live-status treatment only where it is genuinely live/verified.
6. **Primary route:** one clear ink-first action—e.g., **Open AI Capex Monitor** or **Read the live monitor**—that reaches the overview/readout without forcing sign-in.
7. **Secondary route:** a restrained action such as **Read the current thesis**.
8. **Hero imagery:** optional restrained monochrome mark/seal or complete image lockup on editorial/social surfaces only. The H1 must remain readable before images/animation, especially on mobile. Do not use stock imagery, 3D data globes, decorative infrastructure art, gradients, or a campaign logo.

## 4.3 Landing: thesis-to-instrument sequence

Immediately after the hero:

- Add a thin-rule **Current Readout** with dated evidence, methodology/version, and explicit live/evidence status.
- Prefer a three-part evidence strip—buildout/capex, clearing-price/financing pressure, and power/infrastructure constraint—over a generic KPI wall.
- Each readout needs: measure, value, unit, as-of time, source, a one-sentence factual interpretation, and **View evidence**.
- Follow with one concise **The Monitor** section using research modules: **Thesis, Evidence, Assumptions, Readout, Appendix**. Functional actions retain conventional labels: **Open dashboard, View universe, Sources, Reset**.
- Feature only 2–3 evidence cards. Each contains a short declarative claim, source/date, a route to its relevant dashboard state/source panel, and one compact annotated artifact (chart/table excerpt). No generic iconography or glossy metric cards.
- Contextual links to sibling research may appear when they illuminate an assumption or module; do not scatter cross-promotion or reuse protected Long/Short titles.

## 4.4 Dashboard header: required composition

The header is a compact **research command layer**, not a second hero.

| Layer | Required contents | Constraints |
|---|---|---|
| Global utility band | Official small mark; editable lockup; compact Research menu; theme and motion/preferences; account/newsletter/AI-search/search utility as applicable | Target roughly 56–64px on desktop; stable height across themes/routes; no layout shift on live updates |
| Research context / local header | Current workspace/view (Monitor, Universe, Correlation, Scenarios, Portfolio, Workspace); page title/date range/task controls as applicable; live/as-of status; data version; Sources/Methodology route | Place workspace-specific controls below global chrome; use Newsreader only for a short proposition/context where useful |
| Persistent context bar | Active universe, last refresh/as-of, source coverage/readout, selected scenario, explicit evidence status | Approximately 32–40px when used; must earn its height through auditability |

**Desktop priority order:** compact identity → current workspace/view → search/universe access where applicable → explicit live/as-of/source status → preferences/profile utilities.  
**Mobile:** may use two deliberate rows or a sheet, but retain the mark, product identity, view selector/primary monitor navigation, status/freshness text, and accessible settings/menu trigger. Essential evidence/status cannot be hover-only or visual-icon-only.

## 4.5 Header behavior and content rules

- Use Plex Sans/Mono for tabs, filters, timestamps, badges, status, readouts, and actions. Newsreader is limited to a short context proposition or section title.
- State live status with text plus timestamp/source; never with a pulse/color alone.
- Put current data version and Sources/Methodology in immediate reach.
- The research thesis may be a compact eyebrow or expandable thesis readout, not large dashboard banner copy.
- Do not combine global navigation, page title, date range, and workspace controls into a single oversized header.

---

# 5. Logo and asset handling

## 5.1 Required replacement scope

Immediately replace the custom observatory SVG with the official Capital Misallocation mark sourced from:

`https://longshort.capitalmisallocation.com/logo.png`

Replacement applies to navigation, landing/hero/editorial surfaces, dashboard header, footer, favicon/app icon, browser/page metadata, social previews, on-screen export UI, and AI-search lock/upsell. Styling of downloaded PDF/CSV exports is outside this pass.

## 5.2 Asset-pipeline requirements

- Keep a pristine copy of the authorized 320×320 PNG as the interim master.
- Create one geometry-preserving, replaceable **`brand.mark`** asset slot/registry and named derivatives: transparent master treatment, ink-on-paper, paper/light-on-ink, favicon, and app-icon.
- Every placement refers to the asset token/slot, not a locally duplicated file. The owner’s future original source file must be swappable without layout redesign.
- Preserve geometry exactly. Do **not** redraw, crop, trace, stretch, skew, outline, add drop shadow, apply a gradient, glow, CSS filter, or animate/distort the mark.
- Use ink mark on Paper and a tested paper/light mark on Dark Research. Evaluate the mark against its actual local surface, not merely the page theme.
- Pair the mark with editable lockup type in live UI. A complete image lockup is permitted only for editorial hero/social moments.
- Test derivatives on light/dark fields at **16, 32, 48, and 64px** for haloing, square backgrounds, blur, aliasing, recognizability, and contrast. Do not use the raw light-background raster as a dark-surface substitute if it shows an artifact.
- Maintain clear space around the mark of at least one meaningful internal mark unit; do not place it on cyan, gold, chart noise, or busy data grids.

---

# 6. Typography, copy, and motion rules

## 6.1 Typography system

| Role | Typeface | Required uses | Prohibited drift |
|---|---|---|---|
| Editorial display | **Newsreader** | Hero thesis, thesis headlines, section propositions, pull claims, substantive editorial readouts | Tables, controls, chart labels, TradingView context, dense headers |
| Product/UI | **IBM Plex Sans** | Navigation, controls, body copy, annotations, source labels, validation/error text, explanatory UI | Competing Manrope system |
| Data/precision | **IBM Plex Mono** | Prices, dates, tickers, status, timestamps, formulae, tables, axes, calculation outputs, dense charts | Competing JetBrains Mono system |

- Retire Instrument Serif, Manrope, and JetBrains Mono as competing product-brand voices.
- Apply `tabular-nums` to all comparable/sortable values. Right-align numerical values and decimals; left-align names and sources; preserve fixed-width status/time columns where appropriate.
- Use controlled editorial reading measure and roughly 16–18px Plex Sans body text with 1.45–1.6 leading where sustained reading is expected.
- Tables may use 12–14px Sans/Mono with 1.2–1.35 leading when legible; interactive rows require approximately 44px minimum touch height where feasible.
- Selective all caps may remain for compact utility labels, dense column headers, status tags, and abbreviations when it improves scanability. Do not use it for body copy, research explanation, brand lockup, or editorial propositions.

## 6.2 Copy and labeling

- Use editorial language for framing: **Thesis, Evidence, Readout, Assumptions, Appendix**.
- Use plain conventional labels for high-frequency actions: **Search, Filter, Watchlist, Table, Chart, Export, Reset, Apply, Compare, Add position**.
- Avoid generic “real-time intelligence,” fintech-sales urgency, and unsupported superlatives.
- The AI-search boundary is a **research-access boundary**, not a sales interruption: state the restricted evidence/query capability, what remains accessible, and one clear action. No countdowns, cyan glow, ornamental gold, or ambiguous lock imagery.
- State observed vs. modeled content explicitly. Scenario controls and output must distinguish modelled results from observed evidence.

## 6.3 Motion settings and precedence

Expose a persistent, labelled, keyboard-operable preference surface:

- **Theme: Editorial Paper / Dark Research**
- **Motion: Quiet / Standard / Dynamic**

Persist theme and motion preferences separately across routes and return visits. **`prefers-reduced-motion: reduce` is a hard override** to Quiet behavior regardless of saved setting. Announce selections once without repeated live-region noise.

| Mode | Allowed behavior | Not allowed |
|---|---|---|
| Quiet | Instant/near-instant state feedback; static live indicators; static charts/values | Autonomous motion, loops, chart redraws, number roll-ups, shimmer, parallax, hover displacement |
| Standard (adaptive default) | Short 120–180ms opacity/color feedback; restrained user-initiated state transitions; timestamp updates | Autonomous loops, animated data values, spatial layout movement, data-delay effects |
| Dynamic | One-time, capped, interruptible staged hero/section entry; purposeful scenario before/after relation; progressive chart narration where useful; limited live-update emphasis | Repeated autoplay per view, looping logo/value animation, rapid flashing, 3D/parallax, animation as sole evidence/state |

- Motion is content behavior, not a theme effect.
- No mode may delay reading values, block control use, alter price content, or interfere with keyboard operation.
- A refresh may highlight a changed row briefly and update a labelled as-of timestamp; it may not create a perpetual urgency pulse.

---

# 7. Data-workspace exceptions and dense-tool rules

## 7.1 Governing principle

Density is a **source-brand feature and proof of the argument**, not clutter to round away. Preserve exact labels, exposed defaults/assumptions, source context, chart annotations, tabular alignment, compact controls, and data capacity. Editorial expression frames the work; it must not reduce scan speed.

## 7.2 Workspace treatment

- Paper: mostly open paper with fine `#1C1C1C` rules and soft-paper grouping.
- Dark: contiguous deep-ink planes with fewer, clearer boundaries and contrast-tested chart/table tokens.
- A subtle grid is permitted only inside genuinely dense analytical modules and stays lower contrast than data marks.
- Geometry, columns, controls, row rhythm, keyboard behavior, and density presets are identical in both themes.
- Do not use decorative glass, equal-height KPI cards, oversized empty dashboard cards, stock-terminal ornament, persistent noise, or promotional card containers.

## 7.3 Tables, charts, and matrix

| Surface | Required behavior |
|---|---|
| Tables | Sticky header and, where viable, sticky first identifier; textual sorting state; visible row focus; selectively configurable columns; source/detail access without hijacking row selection; numeric columns right-aligned with tabular figures |
| Charts | Title plus one factual annotation; visible named legend; source/as-of and unit adjacent; direct labels where useful; keyboard-accessible values/crosshair or equivalent; text/table equivalent for critical insight; optional Copy as PNG only where already appropriate |
| Series semantics | Fixed non-color identifiers (direct labels, line style, marker, pattern, and/or position) for primary, benchmark, assumption, forecast, and risk series. Theme palettes may adjust for contrast but cannot reverse identity. |
| Correlation matrix | Combine signed value with hue, pattern/label, and robust cell focus; keyboard navigation; visible/nonvisual summary. On narrow screens, provide a ranked/list or selected-name comparison rather than a microscopic matrix. |
| Scenario controls | Named assumptions; units beside fields; slider plus keyboard numeric input; default/current/reset states; explicit Apply/Compare when recalculation is nontrivial; copyable/shareable assumptions summary; modeled-vs-observed output labels |

Use semantic colors only when their meaning is actually present: dominant ink and neutral comparators for ordinary series; green/red for meaningful favorable/adverse states; gold for reference/threshold/selected analytical emphasis; cyan only for live, verified evidence, or infrastructure status. Never rely on red/green or color alone.

## 7.4 TradingView and vendor surfaces

- Treat TradingView as a clearly bounded external/research workspace with an active ticker/universe, interval/market status, product as-of information, source/status context, visible focus boundary, and accessible alternative data summary.
- Request the matching theme only where the vendor supports it. If not supported, contain it honestly in a labelled pane; do not over-style or replace native chart controls.
- The surrounding shell, contextual legend, status/source text, and adjacent controls follow the system. Preserve the embed’s native usability.

---

# 8. Ecosystem navigation

## 8.1 Global Research menu

Place **Research** in global navigation immediately after product identity and before account/conversion utilities. It is network navigation, not an app switcher, product-tab bar, generic “Resources” label, mega-menu, or conversion surface.

Its fixed destinations are exactly:

| Label | Required description |
|---|---|
| **Capital Misallocation** | Essays, notes, conversations, and archive |
| **Long/Short** | Interactive research on alpha, fees, and arithmetic |
| **Ergodicity** | Sequence-of-returns simulation |

- Use current authorized property names/routes; do not invent product names or reuse protected Long/Short titles.
- Keep the AI Capex Monitor’s active identity visible when Research is open.
- Clearly identify external/cross-subdomain navigation and new-tab behavior only when it actually occurs. Do not imply shared saved state, portfolio, scenario input, or AI-search state transfer unless it exists and is explained.
- Do not place sibling property CTAs in the hero primary action, dashboard toolbars, scenario actions, TradingView controls, or table actions.

## 8.2 Menu accessibility and mobile

- Implement Research as a real semantic button/disclosure or menu with correct relationships and accessible names.
- Support click/tap, Enter/Space activation, visible focus, Escape close, predictable focus return, and arrow-key behavior where a menu pattern is used.
- Do not require hover; outside-close behavior must not make keyboard navigation unreliable.
- On mobile, retain the same label, destinations, and purpose copy in an accessible in-flow navigation drawer or modal sheet. Use 44×44 CSS-pixel targets where feasible and do not let the disclosure hide essential monitor controls.

## 8.3 Footer and distributed entry points

- Repeat the same three links/descriptions in a quiet **Research** or **Capital Misallocation Research** footer block next to a small official seal/lockup.
- Use text-first hierarchy, restrained rules, and accessible focus; do not replace it with a logo carousel, promotional cards, or an undifferentiated link cloud.
- Apply the same identity, Research structure, type system, and preference model at visitor-facing product entry points: landing, dashboard, mobile, AI-search boundary, newsletter surface, email/web treatments where applicable, metadata/social copy, and browser chrome. Do not force dashboard-level density into favicons, social previews, or email.

---

# 9. Risks and anti-patterns

| Risk / anti-pattern | Required prevention |
|---|---|
| **Standalone-product dilution** | Keep Capital Misallocation primary in lockup, page title, social copy, and header; use the mark once at utility scale and a larger seal only in editorial moments. |
| **Terminal-to-pastiche transfer** | Remove identity-conflicting defaults—observatory mark, blue-black cards, grid/noise, decorative cyan, competing fonts—rather than layering paper/gold/serif cues over them. |
| **Blind light/dark inversion** | Author token values and chart palettes per theme; test equivalent tasks, actual local surfaces, muted metadata, focus, disabled, tables, and matrix cells. |
| **Dark = professional default** | New visitors start in Editorial Paper. Dark Research is a deliberate analysis environment, not an automatic OS-dark or dashboard-only substitute. |
| **Serif leakage / airy dashboard** | Limit Newsreader to editorial hierarchy. Preserve compact Plex/Mono table, scenario, position, chart, and TradingView workflows. |
| **Evidence-free contrarianism** | Pair every material assertion with source/date/version and methodology/assumptions path; explicitly label inference and model output. |
| **Accent drift** | Gold is archival/reference emphasis; oxblood is risk; green is favorable/confirmed; cyan is live/evidence/infrastructure. Never use them as broad decoration or sole state cues. |
| **Accessibility regression from refinement** | Test normal/secondary labels, fine rules used as controls, disabled-but-readable states, focus, selected tabs, legends, error states, cyan-on-dark, color vision, 200% zoom, text spacing, and keyboard-only operation. |
| **Preference/state failure** | Persist explicit theme/motion separately; Paper defaults without stored choice; reduced motion overrides; no theme flash; theme changes preserve filters, scroll, focus, and unsaved inputs. |
| **Logo-rendering failure** | Use a tested asset pipeline; test small derivatives on both fields; do not filter or misuse the light-background raster on dark fields. |
| **Research links become promotional** | Use a compact purpose-led menu and quiet footer block; keep network discovery secondary to active monitoring workflow. |
| **Mobile proportional shrinkage** | Reflow/prioritize dense tools intentionally; retain status and identities; offer selected-name/ranked matrix alternatives and labelled horizontal-scroll regions. |
| **Over-styled TradingView** | Style the containing research context, not the vendor’s native tool grammar; disclose its boundary and supply an accessible alternative summary. |
| **Scope creep** | Do not redesign the entire dashboard before the brand book and flagship review; do not style downloaded PDF/CSV exports in this pass. |

---

# 10. Ordered pre-implementation checklist

1. **Freeze the approved hierarchy and language.** Record Capital Misallocation as the parent, AI Capex Monitor as descriptor, the standard en-dash lockup, the exact approved hero sentence, and the restriction against protected Long/Short titles.
2. **Create the official-mark asset registry.** Ingest the authorized PNG as the pristine interim master; define the replaceable `brand.mark` slot and derive/test transparent, ink-on-paper, light-on-ink, favicon, and app-icon variants without altering geometry.
3. **Inventory and remove identity conflicts in scope.** Locate every custom observatory SVG, Instrument Serif, Manrope, JetBrains Mono, blue-black card, terminal-grid/noise, and decorative cyan use across visitor-facing surfaces; plan replacement through shared tokens/components.
4. **Write the semantic token matrix.** Define all required roles and explicit Paper/Dark values, state variants, permitted contexts, chart-series mappings, and contrast calculations. Prohibit literal one-off component colors.
5. **Formalize theme precedence and initial-render behavior.** Explicit saved theme wins; absent selection renders Editorial Paper; OS dark does not override first visit; provide reset-to-Paper; eliminate first-paint flashes; theme switch preserves operational state.
6. **Set the accessibility acceptance contract.** Require WCAG 2.2 AA for normal text and controls, 3:1 non-text/focus/chart boundaries where applicable, non-color state encodings, visible 2px+ focus, keyboard/touch equivalents, and labelled preference controls.
7. **Install the typography and numeric rules.** Load only Newsreader, IBM Plex Sans, and IBM Plex Mono by role; configure tabular numerals, numerical alignment, controlled editorial measure, dense table rules, and selective—not universal—all caps.
8. **Write the copy/provenance pattern.** Define Thesis → Evidence → Assumptions → Readout → Appendix components; require source, as-of, version/methodology paths; standardize observed/modelled/inference labels and conventional utility wording.
9. **Specify global preferences and motion behavior.** Implement Theme: Editorial Paper/Dark Research and Motion: Quiet/Standard/Dynamic as persistent, accessible preferences; make `prefers-reduced-motion` a hard Quiet override; document allowed motion per mode.
10. **Specify the exact Research-navigation contract.** Build the compact Research control immediately after identity with exactly the three approved destinations/descriptions; define keyboard, mobile, cross-property, and footer behavior before designing its visuals.
11. **Prototype the flagship landing in Editorial Paper.** Validate masthead, exact H1, concise causal-chain deck, dated Current Readout/evidence strip, single dashboard route, secondary thesis route, and 2–3 evidence-card pattern—without generic feature/KPI mosaics.
12. **Prototype the compact dashboard header.** Validate the mark/lockup, workspace context, live/as-of/source/data-version status, Sources/Methodology route, preferences, Research menu, and optional 32–40px context bar at stable desktop/mobile heights.
13. **Define dense-workspace recipes before visual rollout.** Document Paper/Dark variants for table, chart, legend, matrix, scenario controls, status chip, source row/panel, empty/loading/error states, and AI-search boundary; preserve data capacity and TradingView usability.
14. **Run the fixed flagship review set.** Test first-visit Paper; selected Dark; Quiet/Standard/Dynamic; OS reduced motion; 200% zoom; keyboard-only navigation; high-contrast and color-vision conditions; mobile Research menu; actual dense universe table; chart; correlation matrix; scenario panel; TradingView-wrapper state; and AI-search boundary.
15. **Approve on continuity and task completion.** The pass condition is source-brand continuity plus successful evidence discovery and analytical task completion—not visual novelty. Resolve all failures in tokens/components before extending page-by-page.
16. **Only then extend the system.** Roll out to wider dashboard surfaces, cards, charts/tables, portfolio/scenario tools, source panels, newsletter, email/web treatments, browser metadata, social previews, and exports UI. Keep downloaded PDF/CSV visual styling explicitly out of this phase.

---

## Flagship approval criteria

Approve the flagship only if a new visitor can: (1) recognize **Capital Misallocation** as the parent authority; (2) read the exact clearing-price thesis before any decorative treatment; (3) locate dated evidence and its source/methodology path; (4) enter the monitor without friction; (5) understand live and modeled states without color or motion alone; (6) switch environment/preferences without losing state; (7) navigate the research network without mistaking it for a dashboard tool; and (8) complete dense-data tasks with equal meaning and accessibility in Editorial Paper and Dark Research.
