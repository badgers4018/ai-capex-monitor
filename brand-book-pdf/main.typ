// Capital Misallocation — AI Capex Monitor
// Standalone brand book PDF entry.

#import "@preview/cmarker:0.1.10"
#import "@preview/mitex:0.2.7": mitex
#import "@preview/glossarium:0.5.10": make-glossary, register-glossary, print-glossary
#import "report-theme.typ": report-theme

#let source = "source-body.md"
#let paper = rgb("#FAFAFA")
#let soft_paper = rgb("#F3F3F1")
#let ink = rgb("#1C1C1C")
#let deep_ink = rgb("#0D0D0D")
#let muted = rgb("#6A6A6A")
#let gold = rgb("#8A7418")
#let rule = rgb("#C9C7C0")

#let glossary_entries = (
  (
    key: "thesis",
    short: [Thesis],
    description: [The central proposition being tested by the monitor.],
  ),
  (
    key: "evidence",
    short: [Evidence],
    description: [Observed information with an attributable source and as-of date.],
  ),
  (
    key: "assumptions",
    short: [Assumptions],
    description: [Named model inputs, definitions, defaults, or methodology choices.],
  ),
  (
    key: "readout",
    short: [Readout],
    description: [A concise analytical output with a value, interpretation, and limitation.],
  ),
  (
    key: "editorial-paper",
    short: [Editorial Paper],
    description: [The first-visit, paper-field environment for thesis and evidence.],
  ),
  (
    key: "dark-research",
    short: [Dark Research],
    description: [The deep-ink environment for extended analytical work.],
  ),
  (
    key: "live-state",
    short: [Live state],
    description: [A timestamped live, verified-evidence, or infrastructure-status condition.],
  ),
  (
    key: "source-coverage",
    short: [Source coverage],
    description: [The visible route to sources, dates, versions, and methodology.],
  ),
)

#show: make-glossary
#register-glossary(glossary_entries)

#show: report-theme.with(
  title: "Capital Misallocation — AI Capex Monitor",
  author: "Brand Book · Version 1.0",
  first-line-indent: none,
  running-header: false,
)

#set text(font: "IBM Plex Sans", size: 10pt, fill: ink)
#set par(justify: false, leading: 1.45em, spacing: 0.62em)
#set page(
  paper: "a4",
  margin: (top: 2.35cm, bottom: 2.1cm, x: 2.2cm),
  fill: paper,
  footer: context {
    set text(font: "IBM Plex Mono", size: 7pt, fill: muted)
    grid(
      columns: (1fr, auto),
      align: (left, right),
      [CAPITAL MISALLOCATION · AI CAPEX MONITOR],
      [BRAND BOOK · #counter(page).display("1")],
    )
  },
)

#show heading: set text(font: "IBM Plex Sans", fill: gold)
#show heading.where(level: 1): set text(font: "Newsreader 16pt", size: 25pt, weight: 600, fill: ink)
#show heading.where(level: 2): set text(font: "IBM Plex Sans", size: 15pt, weight: 600, fill: ink)
#show heading.where(level: 3): set text(font: "IBM Plex Sans", size: 10.5pt, weight: 600, fill: gold)
#show strong: set text(weight: 600)
#show emph: set text(style: "italic")
#show link: set text(fill: gold)

// Full-width, fine-rule tables with no vertical clutter.
#show table: it => {
  if it.columns.len() > 0 and it.columns.all(column => column == auto) {
    table(
      columns: (1fr,) * it.columns.len(),
      align: it.align,
      stroke: none,
      inset: (x: 8pt, y: 6pt),
      fill: (_, y) => if y == 0 { soft_paper } else if y > 0 and calc.even(y) { rgb("#F7F6F2") } else { none },
      table.hline(stroke: 0.75pt + ink),
      ..it.children.filter(
        child => child.func() != table.hline and child.func() != table.vline,
      ),
      table.hline(stroke: 0.75pt + ink),
    )
  } else {
    it
  }
}
#show table.cell.where(y: 0): set text(weight: 600, fill: deep_ink)

// Cover.
#align(center)[
  #v(1.2cm)
  #image("capital-misallocation-mark.png", width: 2.2cm)
  #v(0.7cm)
  #text(font: "IBM Plex Sans", size: 8pt, weight: 600, fill: gold, tracking: 1.7pt)[CAPITAL MISALLOCATION]
  #v(0.35cm)
  #text(font: "Newsreader 16pt", size: 31pt, weight: 600, fill: deep_ink)[AI Capex Monitor]
  #v(0.22cm)
  #text(font: "IBM Plex Sans", size: 13pt, fill: ink)[Brand Book]
  #v(0.65cm)
  #line(length: 8.3cm, stroke: 0.8pt + ink)
  #v(0.65cm)
  #block(width: 8.5cm)[
    #set text(font: "Newsreader 16pt", size: 17pt, weight: 500, fill: ink)
    A trillion-dollar buildout is now searching for its economic clearing price.
  ]
  #v(0.7cm)
  #text(font: "IBM Plex Sans", size: 9.2pt, fill: muted)[Thesis-led analytical product system · Version 1.0]
  #v(2.1cm)
  #text(font: "IBM Plex Mono", size: 7.2pt, fill: gold)[EDITORIAL PAPER · DARK RESEARCH · QUIET / STANDARD / DYNAMIC]
]

#pagebreak()

#cmarker.render(read(source), math: mitex)

#pagebreak()
#heading(level: 1)[System glossary]
#text(font: "IBM Plex Sans", size: 10pt, fill: muted)[A shared vocabulary keeps analytical claims, controls, and source treatment precise throughout the product.]
#v(0.8em)
#print-glossary(glossary_entries, show-all: true, disable-back-references: true)
