import { useEffect, useRef, useState } from "react";
import { Check, MonitorCog, Moon, RotateCcw, SunMedium, Volume2 } from "lucide-react";
import { type MotionPreference, type Theme, useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

const themes: { value: Theme; label: string; icon: typeof SunMedium }[] = [
  { value: "paper", label: "Editorial Paper", icon: SunMedium },
  { value: "dark", label: "Dark Research", icon: Moon },
];

const motions: { value: MotionPreference; label: string }[] = [
  { value: "quiet", label: "Quiet" },
  { value: "standard", label: "Standard" },
  { value: "dynamic", label: "Dynamic" },
];

export function BrandPreferences({ className }: { className?: string }) {
  const { theme, setTheme, resetTheme, motion, setMotion } = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
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
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="brand-preferences"
        onClick={() => setOpen(value => !value)}
        className="brand-icon-button"
      >
        <MonitorCog className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">Appearance and motion preferences</span>
      </button>

      {open && (
        <section id="brand-preferences" role="dialog" aria-label="Appearance and motion preferences" className="brand-preferences-panel">
          <div className="brand-preferences-panel__section">
            <p className="brand-preferences-panel__label">Environment</p>
            <div className="grid gap-1">
              {themes.map(({ value, label, icon: Icon }) => {
                const selected = theme === value;
                return (
                  <button key={value} type="button" onClick={() => setTheme(value)} className={cn("brand-choice", selected && "is-selected")} aria-pressed={selected}>
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{label}</span>
                    {selected && <Check className="ml-auto h-3.5 w-3.5" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="brand-preferences-panel__section">
            <p className="brand-preferences-panel__label">Motion</p>
            <div className="grid grid-cols-3 gap-1" role="group" aria-label="Motion preference">
              {motions.map(({ value, label }) => {
                const selected = motion === value;
                return <button key={value} type="button" onClick={() => setMotion(value)} className={cn("brand-motion-choice", selected && "is-selected")} aria-pressed={selected}>{label}</button>;
              })}
            </div>
            <p className="mt-2 text-[10px] leading-4 text-muted-foreground">Reduced-motion settings always override this preference.</p>
          </div>
          <button type="button" onClick={resetTheme} className="brand-reset-button"><RotateCcw className="h-3 w-3" aria-hidden="true" /> Reset to Editorial Paper</button>
        </section>
      )}
    </div>
  );
}
