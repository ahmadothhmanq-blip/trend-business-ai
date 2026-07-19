/**
 * Brand Identity System — colors, typography, spacing, UI style, image direction.
 */

import type { BrandPresetPackage } from "@/lib/ai-core/brand-identity/presets";
import type {
  BrandColorSystem,
  BrandSpacingRules,
  BrandTypographySystem,
  BrandUiStyle,
} from "@/lib/ai-core/brand-identity/types";
import type { BrandStrategyBrief } from "@/lib/ai-core/brand-identity/types";

/** Slightly shift a hex for deterministic uniqueness per brand name. */
function nudgeHex(hex: string, amount: number): string {
  const raw = hex.replace("#", "");
  if (raw.length !== 6) return hex;
  const n = parseInt(raw, 16);
  if (Number.isNaN(n)) return hex;
  const r = Math.min(255, Math.max(0, ((n >> 16) & 255) + amount));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 255) + Math.floor(amount / 2)));
  const b = Math.min(255, Math.max(0, (n & 255) - Math.floor(amount / 3)));
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

function brandSeed(name: string): number {
  let h = 0;
  const s = name.toLowerCase();
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return (h % 21) - 10; // -10..10
}

export function buildBrandColorSystem(
  preset: BrandPresetPackage,
  brandName: string,
): BrandColorSystem {
  const nudge = brandSeed(brandName);
  const primary = nudgeHex(preset.colors.primary, nudge);
  const secondary = nudgeHex(preset.colors.secondary, Math.floor(nudge / 2));
  const accent = nudgeHex(preset.colors.accent, -nudge);

  return {
    primary,
    secondary,
    accent,
    neutral: preset.colors.neutral,
    surface: preset.colors.surface,
    background: preset.colors.background,
    foreground: preset.colors.foreground,
    onPrimary: preset.colors.onPrimary,
    direction: preset.colors.direction,
    roles: [
      {
        name: "Primary",
        hex: primary,
        role: "primary",
        usage: "Primary CTAs, key links, brand anchors",
      },
      {
        name: "Secondary",
        hex: secondary,
        role: "secondary",
        usage: "Supporting surfaces, secondary actions, charts",
      },
      {
        name: "Accent",
        hex: accent,
        role: "accent",
        usage: "Highlights, badges, intentional emphasis only",
      },
      {
        name: "Neutral",
        hex: preset.colors.neutral,
        role: "neutral",
        usage: "Muted text, borders, meta labels",
      },
      {
        name: "Surface",
        hex: preset.colors.surface,
        role: "surface",
        usage: "Cards, panels, section bands",
      },
      {
        name: "Background",
        hex: preset.colors.background,
        role: "background",
        usage: "Page canvas",
      },
      {
        name: "Foreground",
        hex: preset.colors.foreground,
        role: "foreground",
        usage: "Primary text and icons",
      },
    ],
  };
}

export function buildBrandTypography(
  preset: BrandPresetPackage,
): BrandTypographySystem {
  return { ...preset.typography };
}

export function buildBrandSpacing(preset: BrandPresetPackage): BrandSpacingRules {
  return { ...preset.spacing };
}

export function buildBrandUiStyle(
  preset: BrandPresetPackage,
  strategy: BrandStrategyBrief,
): BrandUiStyle {
  return {
    ...preset.uiStyle,
    notes: `${preset.uiStyle.notes} · Personality: ${strategy.brandPersonality}`,
  };
}

export function buildImageDirection(
  preset: BrandPresetPackage,
  strategy: BrandStrategyBrief,
): string {
  return `${preset.imageDirection}; industry=${strategy.industry}; audience=${strategy.targetAudience.split(/[,.]/)[0]?.trim()}`;
}

export function buildAnimationDirection(preset: BrandPresetPackage): string {
  return preset.animationDirection;
}

export function buildComponentStyle(preset: BrandPresetPackage): string {
  return preset.componentStyle;
}
