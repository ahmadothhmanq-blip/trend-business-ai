"use client";

import * as React from "react";
import {
  THEME_COOKIE,
  THEME_COOKIE_MAX_AGE,
  THEME_VALUES,
  type ResolvedTheme,
  type ThemePreference,
  isThemePreference,
} from "@/lib/theme/theme";

type ThemeContextValue = {
  themes: ThemePreference[];
  theme: ThemePreference;
  setTheme: (theme: string) => void;
  resolvedTheme: ResolvedTheme;
  systemTheme: ResolvedTheme;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function readStoredTheme(storageKey: string, fallback: ThemePreference): ThemePreference {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (isThemePreference(stored)) return stored;
  } catch {
    // ignore
  }
  return fallback;
}

function persistTheme(storageKey: string, theme: ThemePreference) {
  try {
    window.localStorage.setItem(storageKey, theme);
  } catch {
    // ignore
  }
  try {
    document.cookie = `${storageKey}=${encodeURIComponent(theme)}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; samesite=lax`;
  } catch {
    // ignore
  }
}

function applyResolvedClass(resolved: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  root.style.colorScheme = resolved;
}

type ThemeProviderProps = {
  children: React.ReactNode;
  /** Kept for layout API compatibility; class strategy is always used. */
  attribute?: string | string[];
  defaultTheme?: ThemePreference;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  storageKey?: string;
  themes?: ThemePreference[];
};

/**
 * React 19 / Next.js 16 theme provider.
 * - No next-themes
 * - Never renders <script> or next/script
 * - SSR class comes from the theme cookie in app/layout.tsx
 * - Client updates apply classes only via DOM APIs after mount
 */
export function ThemeProvider({
  children,
  defaultTheme = "dark",
  enableSystem = true,
  disableTransitionOnChange = false,
  storageKey = THEME_COOKIE,
  themes = enableSystem ? THEME_VALUES : (["light", "dark"] as ThemePreference[]),
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<ThemePreference>(defaultTheme);
  const [systemTheme, setSystemTheme] = React.useState<ResolvedTheme>("dark");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const stored = readStoredTheme(storageKey, defaultTheme);
    setThemeState(stored);
    persistTheme(storageKey, stored);
    setSystemTheme(getSystemTheme());
    setMounted(true);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemTheme(getSystemTheme());
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [defaultTheme, storageKey]);

  const resolvedTheme: ResolvedTheme =
    theme === "system" ? systemTheme : theme === "light" || theme === "dark" ? theme : "dark";

  React.useEffect(() => {
    if (!mounted) return;

    const apply = () => applyResolvedClass(resolvedTheme);

    if (!disableTransitionOnChange) {
      apply();
      return;
    }

    const style = document.createElement("style");
    style.appendChild(
      document.createTextNode(
        "*,*::before,*::after{-webkit-transition:none!important;transition:none!important}",
      ),
    );
    document.head.appendChild(style);
    apply();
    void window.getComputedStyle(style).opacity;
    document.head.removeChild(style);
  }, [mounted, resolvedTheme, disableTransitionOnChange]);

  const setTheme = React.useCallback(
    (next: string) => {
      const preference = isThemePreference(next) ? next : defaultTheme;
      setThemeState(preference);
      persistTheme(storageKey, preference);
    },
    [defaultTheme, storageKey],
  );

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      themes,
      theme,
      setTheme,
      resolvedTheme,
      systemTheme,
    }),
    [themes, theme, setTheme, resolvedTheme, systemTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext);
  if (!context) {
    return {
      themes: THEME_VALUES,
      theme: "dark",
      setTheme: () => undefined,
      resolvedTheme: "dark",
      systemTheme: "dark",
    };
  }
  return context;
}
