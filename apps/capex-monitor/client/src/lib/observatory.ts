export type ObservatoryTone = "gold" | "cyan" | "risk" | "silver";

export const observatoryToneValue: Record<ObservatoryTone, string> = {
  gold: "var(--signal-gold)",
  cyan: "var(--signal-cyan)",
  risk: "var(--signal-risk)",
  silver: "var(--signal-silver)",
};

/** Keeps high-level data surfaces on a restrained, semantic palette. */
export function categoryTone(category: string): ObservatoryTone {
  const label = category.toLowerCase();
  if (label.includes("power") || label.includes("oracle") || label.includes("neocloud")) return "risk";
  if (label.includes("data center") || label.includes("semiconductor")) return "gold";
  if (label.includes("geopolitical")) return "silver";
  return "cyan";
}

export function categoryToneValue(category: string): string {
  return observatoryToneValue[categoryTone(category)];
}
