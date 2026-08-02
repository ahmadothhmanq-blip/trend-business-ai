/**
 * Shared Website Builder contract types — no runtime dependencies on builder catalogs.
 * AI Core and platform layers import from here to avoid circular imports with
 * `lib/website/builder/*` data modules.
 */

export type WebsiteThemePresetId =
  | "luxury"
  | "modern"
  | "minimal"
  | "corporate"
  | "creative"
  | "technology"
  | "editorial"
  | "bold";

export const WEBSITE_THEME_PRESET_IDS: readonly WebsiteThemePresetId[] = [
  "luxury",
  "modern",
  "minimal",
  "corporate",
  "creative",
  "technology",
  "editorial",
  "bold",
] as const;

export function isWebsiteThemePresetId(
  value: string,
): value is WebsiteThemePresetId {
  return (WEBSITE_THEME_PRESET_IDS as readonly string[]).includes(value);
}
