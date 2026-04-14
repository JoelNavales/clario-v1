import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getFromStorage, setToStorage } from "../utils/localStorage";

export type ThemeValue = "indigo" | "blue" | "green" | "pink" | "slate";

interface ThemeColors {
  primary: string;
  "primary-dim": string;
  "primary-container": string;
  "primary-fixed": string;
  "primary-fixed-dim": string;
  "on-primary": string;
  "on-primary-container": string;
  "on-primary-fixed": string;
  "on-primary-fixed-variant": string;
  "inverse-primary": string;
  "surface-tint": string;
}

const THEME_PALETTES: Record<ThemeValue, ThemeColors> = {
  indigo: {
    primary: "#494bd6",
    "primary-dim": "#3c3dca",
    "primary-container": "#e1e0ff",
    "primary-fixed": "#e1e0ff",
    "primary-fixed-dim": "#d1d0ff",
    "on-primary": "#faf6ff",
    "on-primary-container": "#3b3cc9",
    "on-primary-fixed": "#2622b7",
    "on-primary-fixed-variant": "#4647d3",
    "inverse-primary": "#8083ff",
    "surface-tint": "#494bd6",
  },
  blue: {
    primary: "#1d4ed8",
    "primary-dim": "#1e40af",
    "primary-container": "#dbeafe",
    "primary-fixed": "#dbeafe",
    "primary-fixed-dim": "#bfdbfe",
    "on-primary": "#ffffff",
    "on-primary-container": "#1e3a8a",
    "on-primary-fixed": "#172554",
    "on-primary-fixed-variant": "#1d4ed8",
    "inverse-primary": "#60a5fa",
    "surface-tint": "#1d4ed8",
  },
  green: {
    primary: "#15803d",
    "primary-dim": "#166534",
    "primary-container": "#dcfce7",
    "primary-fixed": "#dcfce7",
    "primary-fixed-dim": "#bbf7d0",
    "on-primary": "#ffffff",
    "on-primary-container": "#14532d",
    "on-primary-fixed": "#052e16",
    "on-primary-fixed-variant": "#15803d",
    "inverse-primary": "#4ade80",
    "surface-tint": "#15803d",
  },
  pink: {
    primary: "#db2777",
    "primary-dim": "#be185d",
    "primary-container": "#fce7f3",
    "primary-fixed": "#fce7f3",
    "primary-fixed-dim": "#fbcfe8",
    "on-primary": "#ffffff",
    "on-primary-container": "#9d174d",
    "on-primary-fixed": "#500724",
    "on-primary-fixed-variant": "#db2777",
    "inverse-primary": "#f472b6",
    "surface-tint": "#db2777",
  },
  slate: {
    primary: "#334155",
    "primary-dim": "#1e293b",
    "primary-container": "#e2e8f0",
    "primary-fixed": "#e2e8f0",
    "primary-fixed-dim": "#cbd5e1",
    "on-primary": "#ffffff",
    "on-primary-container": "#0f172a",
    "on-primary-fixed": "#0f172a",
    "on-primary-fixed-variant": "#334155",
    "inverse-primary": "#94a3b8",
    "surface-tint": "#334155",
  },
};

function applyThemeToDom(theme: ThemeValue) {
  const palette = THEME_PALETTES[theme];
  const root = document.documentElement;
  for (const [key, value] of Object.entries(palette)) {
    root.style.setProperty(`--color-${key}`, value);
  }
}

interface ThemeContextValue {
  theme: ThemeValue;
  setTheme: (theme: ThemeValue) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "indigo",
  setTheme: () => undefined,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeValue>(() =>
    getFromStorage<ThemeValue>("clario_theme", "indigo")
  );

  // Apply on mount and whenever theme changes
  useEffect(() => {
    applyThemeToDom(theme);
  }, [theme]);

  function setTheme(newTheme: ThemeValue) {
    setThemeState(newTheme);
    setToStorage("clario_theme", newTheme);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
