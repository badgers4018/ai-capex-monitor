import { useTheme } from "@/contexts/ThemeContext";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
  label?: string;
  variant?: "auto" | "ink" | "paper";
  decorative?: boolean;
  priority?: boolean;
}

/** Official Capital Misallocation mark. The image paths are replaceable in one registry. */
export function BrandMark({
  className,
  label = "Capital Misallocation",
  variant = "auto",
  decorative = false,
  priority = false,
}: BrandMarkProps) {
  const { theme } = useTheme();
  const tone = variant === "auto" ? (theme === "dark" ? "paper" : "ink") : variant;
  const src = tone === "paper" ? BRAND.assets.paperMark : BRAND.assets.inkMark;

  return (
    <img
      src={src}
      alt={decorative ? "" : label}
      aria-hidden={decorative || undefined}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cn("brand-mark shrink-0 object-contain", className)}
    />
  );
}

interface BrandImageLockupProps {
  className?: string;
  variant?: "auto" | "ink" | "paper";
  priority?: boolean;
}

/** Use the official image lockup on editorial/hero surfaces; utility chrome uses BrandLockup. */
export function BrandImageLockup({ className, variant = "auto", priority = false }: BrandImageLockupProps) {
  const { theme } = useTheme();
  const tone = variant === "auto" ? (theme === "dark" ? "paper" : "ink") : variant;
  return (
    <img
      src={tone === "paper" ? BRAND.assets.paperLockup : BRAND.assets.inkLockup}
      alt={BRAND.lockup}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cn("h-auto w-full object-contain", className)}
    />
  );
}

interface BrandEditorialMastheadProps {
  className?: string;
  priority?: boolean;
}

/** Prominent live-type lockup for editorial hero surfaces. */
export function BrandEditorialMasthead({ className, priority = false }: BrandEditorialMastheadProps) {
  return (
    <div className={cn("brand-editorial-masthead", className)}>
      <BrandMark className="brand-editorial-masthead__mark" decorative priority={priority} />
      <div className="brand-editorial-masthead__type">
        <span className="brand-editorial-masthead__parent">{BRAND.name}</span>
        <span className="brand-editorial-masthead__product">{BRAND.product}</span>
        <span className="brand-editorial-masthead__descriptor">Independent research instrument</span>
      </div>
    </div>
  );
}

interface BrandLockupProps {
  className?: string;
  markClassName?: string;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  compact?: boolean;
  priority?: boolean;
}

export function BrandLockup({
  className,
  markClassName,
  href,
  onClick,
  compact = false,
  priority = false,
}: BrandLockupProps) {
  const content = (
    <>
      <BrandMark className={cn("h-9 w-9", markClassName)} decorative priority={priority} />
      <span className="min-w-0 leading-none">
        <span className="brand-lockup__parent">{BRAND.name}</span>
        {!compact && <span className="brand-lockup__product">{BRAND.product}</span>}
      </span>
    </>
  );

  const sharedClassName = cn("brand-lockup", className);
  return href ? (
    <a href={href} onClick={onClick} className={sharedClassName} aria-label={BRAND.lockup}>
      {content}
    </a>
  ) : (
    <div className={sharedClassName} aria-label={BRAND.lockup}>
      {content}
    </div>
  );
}

interface SectionHeadingProps {
  index?: string;
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  index,
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <header className={cn("observatory-section-heading", align === "center" && "text-center mx-auto", className)}>
      <div className={cn("flex items-center gap-3 mb-3", align === "center" && "justify-center")}>
        {index && <span className="observatory-index">{index}</span>}
        <span className="observatory-kicker">{eyebrow}</span>
        <span className="h-px flex-1 max-w-24 bg-border/70" aria-hidden="true" />
      </div>
      <h2 className="observatory-title">{title}</h2>
      {description && <p className={cn("observatory-description", align === "center" && "mx-auto")}>{description}</p>}
    </header>
  );
}
