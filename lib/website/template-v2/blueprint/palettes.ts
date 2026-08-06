import type { BlueprintColorPalette } from "@/lib/website/template-v2/blueprint/types";
import type { ResolvedBlueprintContext } from "@/lib/website/template-v2/blueprint/defaults";

type PalettePreset = Omit<BlueprintColorPalette, "presetId"> & { id: string };

const PALETTE_PRESETS: Record<string, PalettePreset> = {
  "corporate-premium": {
    id: "corporate-premium",
    colors: {
      primary: "#080E18",
      secondary: "#152238",
      accent: "#C4A574",
      background: "#F7F6F3",
      foreground: "#080E18",
      muted: "rgba(8,14,24,0.58)",
      surface: "#FFFFFF",
      signal: "#C4A574",
    },
    contrast: "standard",
    mode: "light",
  },
  "modern-startup": {
    id: "modern-startup",
    colors: {
      primary: "#0F172A",
      secondary: "#1E293B",
      accent: "#6366F1",
      background: "#FFFFFF",
      foreground: "#0F172A",
      muted: "rgba(15,23,42,0.55)",
      surface: "#F8FAFC",
      signal: "#6366F1",
    },
    contrast: "standard",
    mode: "light",
  },
  "luxury-editorial": {
    id: "luxury-editorial",
    colors: {
      primary: "#1A1410",
      secondary: "#2C241C",
      accent: "#B8956A",
      background: "#FAF8F5",
      foreground: "#1A1410",
      muted: "rgba(26,20,16,0.52)",
      surface: "#FFFFFF",
      signal: "#B8956A",
    },
    contrast: "high",
    mode: "light",
  },
  "minimal-mono": {
    id: "minimal-mono",
    colors: {
      primary: "#111111",
      secondary: "#333333",
      accent: "#111111",
      background: "#FFFFFF",
      foreground: "#111111",
      muted: "rgba(17,17,17,0.5)",
      surface: "#FAFAFA",
      signal: "#111111",
    },
    contrast: "high",
    mode: "light",
  },
  "bold-creative": {
    id: "bold-creative",
    colors: {
      primary: "#0D0D0D",
      secondary: "#1F1F1F",
      accent: "#FF4D4D",
      background: "#F5F5F0",
      foreground: "#0D0D0D",
      muted: "rgba(13,13,13,0.55)",
      surface: "#FFFFFF",
      signal: "#FF4D4D",
    },
    contrast: "standard",
    mode: "mixed",
  },
  "cinematic-dark": {
    id: "cinematic-dark",
    colors: {
      primary: "#E8E4DF",
      secondary: "#A8A29E",
      accent: "#D4A574",
      background: "#0C0A09",
      foreground: "#FAFAF9",
      muted: "rgba(232,228,223,0.55)",
      surface: "#1C1917",
      signal: "#D4A574",
    },
    contrast: "high",
    mode: "dark",
  },
  "warm-service": {
    id: "warm-service",
    colors: {
      primary: "#1C1917",
      secondary: "#44403C",
      accent: "#EA580C",
      background: "#FFFBF5",
      foreground: "#1C1917",
      muted: "rgba(28,25,23,0.55)",
      surface: "#FFFFFF",
      signal: "#EA580C",
    },
    contrast: "standard",
    mode: "light",
  },
  "trust-clinical": {
    id: "trust-clinical",
    colors: {
      primary: "#0C4A6E",
      secondary: "#155E75",
      accent: "#0891B2",
      background: "#F0F9FF",
      foreground: "#0C4A6E",
      muted: "rgba(12,74,110,0.55)",
      surface: "#FFFFFF",
      signal: "#0891B2",
    },
    contrast: "standard",
    mode: "light",
  },
};

const INDUSTRY_PALETTE: Record<string, string> = {
  finance: "corporate-premium",
  medical: "trust-clinical",
  "hotel-resort": "luxury-editorial",
  "real-estate": "luxury-editorial",
  "creative-agency": "bold-creative",
  saas: "modern-startup",
  restaurant: "warm-service",
  corporate: "corporate-premium",
  ecommerce: "modern-startup",
};

function selectPaletteKey(ctx: ResolvedBlueprintContext): string {
  if (ctx.visualStyle === "minimal") return "minimal-mono";
  if (ctx.visualStyle === "cinematic") return "cinematic-dark";
  if (ctx.visualStyle === "luxury" || ctx.premiumLevel === "luxury") {
    return "luxury-editorial";
  }
  if (ctx.visualStyle === "bold" || ctx.brandPersonality === "bold") {
    return "bold-creative";
  }
  if (ctx.brandPersonality === "warm") return "warm-service";
  if (ctx.websiteGoal === "saas" || ctx.targetAudience === "startup") {
    return "modern-startup";
  }
  if (INDUSTRY_PALETTE[ctx.industry]) {
    return INDUSTRY_PALETTE[ctx.industry]!;
  }
  return ctx.premiumLevel === "standard" ? "modern-startup" : "corporate-premium";
}

export function resolveColorPalette(
  ctx: ResolvedBlueprintContext,
): BlueprintColorPalette {
  const key = selectPaletteKey(ctx);
  const preset = PALETTE_PRESETS[key] ?? PALETTE_PRESETS["corporate-premium"]!;
  return {
    presetId: preset.id,
    colors: { ...preset.colors },
    contrast:
      ctx.accessibilityLevel === "strict" ? "high" : preset.contrast,
    mode: preset.mode,
  };
}

export const BLUEPRINT_PALETTE_PRESETS = PALETTE_PRESETS;
