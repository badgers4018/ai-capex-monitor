import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Theme = "paper" | "dark";
export type MotionPreference = "quiet" | "standard" | "dynamic";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  resetTheme: () => void;
  motion: MotionPreference;
  setMotion: (motion: MotionPreference) => void;
  switchable: boolean;
}

const THEME_STORAGE_KEY = "capital-misallocation.theme";
const MOTION_STORAGE_KEY = "capital-misallocation.motion";
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function readTheme(defaultTheme: Theme): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "dark" || stored === "paper" ? stored : defaultTheme;
  } catch {
    return defaultTheme;
  }
}

function readMotion(): MotionPreference {
  try {
    const stored = localStorage.getItem(MOTION_STORAGE_KEY);
    return stored === "quiet" || stored === "dynamic" || stored === "standard" ? stored : "standard";
  } catch {
    return "standard";
  }
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  switchable?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "paper",
  switchable = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => (switchable ? readTheme(defaultTheme) : defaultTheme));
  const [motion, setMotion] = useState<MotionPreference>(() => readMotion());

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.dataset.theme = theme;
    if (switchable) localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme, switchable]);

  useEffect(() => {
    document.documentElement.dataset.motion = motion;
    localStorage.setItem(MOTION_STORAGE_KEY, motion);
  }, [motion]);

  const value = useMemo<ThemeContextType>(() => ({
    theme,
    setTheme,
    toggleTheme: () => setTheme(current => (current === "paper" ? "dark" : "paper")),
    resetTheme: () => setTheme("paper"),
    motion,
    setMotion,
    switchable,
  }), [theme, motion, switchable]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
