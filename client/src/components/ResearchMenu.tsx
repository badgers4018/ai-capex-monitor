import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function ResearchMenu({ className, mobile = false }: { className?: string; mobile?: boolean }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open || mobile) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open, mobile]);

  const links = BRAND.research.map((item) => (
    <a key={item.label} href={item.href} target="_blank" rel="noreferrer" className="research-menu__link">
      <span><span className="research-menu__name">{item.label}</span><span className="research-menu__description">{item.description}</span></span>
      <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
    </a>
  ));

  if (mobile) return <div className={cn("research-menu-mobile", className)}><p className="research-menu-mobile__label">Research</p>{links}</div>;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button ref={buttonRef} type="button" onClick={() => setOpen(value => !value)} aria-haspopup="menu" aria-expanded={open} className="research-menu__trigger">
        Research <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-150", open && "rotate-180")} aria-hidden="true" />
      </button>
      {open && <div role="menu" aria-label="Capital Misallocation research" className="research-menu__panel">{links}</div>}
    </div>
  );
}
