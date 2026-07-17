export const THEME_COOKIE = "theme";
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_VALUES: ThemePreference[] = ["light", "dark", "system"];

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

/** Resolve the class applied to <html> during SSR (system → dark fallback). */
export function resolveServerThemeClass(
  stored: string | undefined,
  fallback: ResolvedTheme = "dark",
): ResolvedTheme {
  if (stored === "light" || stored === "dark") return stored;
  return fallback;
}
