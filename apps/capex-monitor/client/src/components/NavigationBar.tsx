import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, Home, Menu, X } from "lucide-react";
import { BrandLockup } from "@/components/BrandMark";
import { BrandPreferences } from "@/components/BrandPreferences";
import { ResearchMenu } from "@/components/ResearchMenu";

type NavItem = { label: string; href: string };
type NavCategory = { label: string; items: NavItem[] };

/** Permit Intelligence module (separate local Postgres-backed service, mounted at /permits). */
export const PERMIT_INTELLIGENCE_ITEMS: NavItem[] = [
  { label: "Projects", href: "/permits/#projects" },
  { label: "Permits & Plans", href: "/permits/#permits" },
  { label: "Companies", href: "/permits/#companies" },
  { label: "Changes", href: "/permits/#changes" },
  { label: "Sources & Coverage", href: "/permits/#sources" },
  { label: "Review Queue (reviewers)", href: "/permits/#review" },
];
export const isSectionHref = (href: string) => href.startsWith("#");

const navCategories: NavCategory[] = [
  { label: "Overview", items: [{ label: "Current readout", href: "#overview" }, { label: "Watchlist", href: "#watchlist" }, { label: "Capital chain", href: "#flowchart" }, { label: "Capacity", href: "#timeline" }] },
  { label: "Evidence", items: [{ label: "Ledger", href: "#data" }, { label: "Market", href: "#market" }, { label: "Fundamentals", href: "#fundamentals" }, { label: "50-name universe", href: "#universe" }, { label: "Charts", href: "#tradingview" }, { label: "Changelog", href: "#changelog" }] },
  { label: "Risk", items: [{ label: "Sensitivity", href: "#sensitivity" }, { label: "Risk radar", href: "#risk-radar" }, { label: "Circular financing", href: "#circular-risk" }, { label: "Debt wall", href: "#debt-wall" }] },
  { label: "Scenarios", items: [{ label: "Framework", href: "#strategy" }, { label: "Scenario model", href: "#scenarios" }, { label: "Stress test", href: "#scenario-calc" }, { label: "Deep dive", href: "#scenario-deep-dive" }] },
  { label: "Tools", items: [{ label: "Position builder", href: "#position-builder" }, { label: "Compare", href: "#compare" }, { label: "Export", href: "#export" }, { label: "Sources", href: "#sources" }] },
  { label: "Permit Intelligence", items: PERMIT_INTELLIGENCE_ITEMS },
];

const allNavItems = navCategories.flatMap(category => category.items);

export function NavigationBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("#overview");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) setActiveSection(`#${entry.target.id}`); });
    }, { rootMargin: "-20% 0px -70% 0px" });
    allNavItems.filter(item => isSectionHref(item.href)).forEach(item => { const element = document.querySelector(item.href); if (element) observer.observe(element); });
    return () => observer.disconnect();
  }, []);

  const handleNavClick = useCallback((event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!isSectionHref(href)) { setMobileOpen(false); return; } // module route: let the browser navigate
    event.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      const position = target.getBoundingClientRect().top + window.scrollY - 82;
      window.scrollTo({ top: position, behavior: "smooth" });
      setActiveSection(href);
    }
    setMobileOpen(false);
    setOpenDropdown(null);
  }, []);

  const openOnEnter = (label: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setOpenDropdown(label);
  };
  const closeOnLeave = () => { dropdownTimeout.current = setTimeout(() => setOpenDropdown(null), 150); };
  const activeCategory = navCategories.find(category => category.items.some(item => item.href === activeSection))?.label;

  return (
    <nav className={`fixed inset-x-0 top-0 z-[150] border-b transition-[background-color,border-color,box-shadow] duration-150 ${scrolled ? "border-border bg-background/98 shadow-[0_2px_16px_rgb(28_28_28_/_0.06)]" : "border-transparent bg-background/92"}`} aria-label="AI Capex Monitor navigation">
      <div className="container flex h-16 items-center justify-between gap-3">
        <BrandLockup href="#overview" onClick={event => handleNavClick(event, "#overview")} markClassName="h-8 w-8" />
        <div className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 xl:flex">
          <ResearchMenu className="mr-3" />
          {navCategories.map(category => {
            const open = openDropdown === category.label;
            const selected = activeCategory === category.label;
            return <div key={category.label} className="relative" onMouseEnter={() => openOnEnter(category.label)} onMouseLeave={closeOnLeave}>
              <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpenDropdown(value => value === category.label ? null : category.label)} onKeyDown={event => { if (event.key === "Escape") setOpenDropdown(null); if (event.key === "ArrowDown") { event.preventDefault(); setOpenDropdown(category.label); } }} className={`flex min-h-10 items-center gap-1 px-2.5 text-xs font-medium transition-colors duration-150 ${selected ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {category.label}<ChevronDown className={`h-3.5 w-3.5 transition-transform duration-150 ${open ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
              {open && <div role="menu" aria-label={`${category.label} monitor navigation`} className="absolute left-0 top-full z-[220] min-w-[13.5rem] border border-[var(--rule-strong)] bg-popover p-1 shadow-[var(--shadow-lg)]">
                {category.items.map(item => <a key={item.href} href={item.href} role="menuitem" onClick={event => handleNavClick(event, item.href)} className={`flex min-h-10 items-center px-3 text-sm transition-colors duration-100 ${activeSection === item.href ? "bg-accent font-medium text-foreground" : "text-[var(--ink-soft)] hover:bg-accent hover:text-foreground"}`}>{item.label}</a>)}
              </div>}
            </div>;
          })}
        </div>
        <div className="flex items-center gap-1.5">
          <a href="/" className="hidden min-h-10 items-center gap-1.5 px-2.5 text-xs text-muted-foreground transition-colors duration-150 hover:text-foreground sm:inline-flex"><Home className="h-3.5 w-3.5" aria-hidden="true" /> Thesis</a>
          <BrandPreferences />
          <button type="button" className="brand-icon-button xl:hidden" onClick={() => setMobileOpen(value => !value)} aria-expanded={mobileOpen} aria-controls="mobile-monitor-navigation" aria-label={mobileOpen ? "Close monitor navigation" : "Open monitor navigation"}>{mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}</button>
        </div>
      </div>

      {mobileOpen && <div id="mobile-monitor-navigation" className="max-h-[calc(100svh-4rem)] overflow-y-auto border-t border-border bg-background">
        <div className="container grid gap-5 py-5">
          <ResearchMenu mobile />
          {navCategories.map(category => <section key={category.label}><p className="observatory-kicker mb-2">{category.label}</p><div className="grid gap-x-4 gap-y-1 sm:grid-cols-2">{category.items.map(item => <a key={item.href} href={item.href} onClick={event => handleNavClick(event, item.href)} className={`min-h-11 border-b border-border py-2 text-sm ${activeSection === item.href ? "font-medium text-foreground" : "text-muted-foreground"}`}>{item.label}</a>)}</div></section>)}
          <a href="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-foreground"><Home className="h-4 w-4" aria-hidden="true" /> Return to the thesis</a>
        </div>
      </div>}
    </nav>
  );
}
