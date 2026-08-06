import type { BlueprintTypographyProfile } from "@/lib/website/template-v2/blueprint/types";
import type { ResolvedBlueprintContext } from "@/lib/website/template-v2/blueprint/defaults";

type TypographyPreset = Omit<BlueprintTypographyProfile, "presetId"> & { id: string };

const TYPOGRAPHY_PRESETS: Record<string, TypographyPreset> = {
  "executive-serif": {
    id: "executive-serif",
    display: "Cormorant Garamond",
    body: "Inter",
    scale: "expressive",
    rtlDisplay: "Amiri",
    rtlBody: "Noto Sans Arabic",
    headingWeight: 600,
    bodyWeight: 400,
    letterSpacing: "normal",
  },
  "modern-sans": {
    id: "modern-sans",
    display: "Inter",
    body: "Inter",
    scale: "balanced",
    rtlDisplay: "Noto Sans Arabic",
    rtlBody: "Noto Sans Arabic",
    headingWeight: 600,
    bodyWeight: 400,
    letterSpacing: "tight",
  },
  "editorial-luxury": {
    id: "editorial-luxury",
    display: "Playfair Display",
    body: "Source Sans 3",
    scale: "expressive",
    rtlDisplay: "Amiri",
    rtlBody: "Noto Sans Arabic",
    headingWeight: 500,
    bodyWeight: 400,
    letterSpacing: "wide",
  },
  "technical-mono": {
    id: "technical-mono",
    display: "IBM Plex Sans",
    body: "IBM Plex Sans",
    scale: "compact",
    rtlDisplay: "Noto Sans Arabic",
    rtlBody: "Noto Sans Arabic",
    headingWeight: 600,
    bodyWeight: 400,
    letterSpacing: "tight",
  },
  "warm-humanist": {
    id: "warm-humanist",
    display: "Fraunces",
    body: "Nunito Sans",
    scale: "balanced",
    rtlDisplay: "Amiri",
    rtlBody: "Noto Sans Arabic",
    headingWeight: 600,
    bodyWeight: 400,
    letterSpacing: "normal",
  },
  "minimal-geometric": {
    id: "minimal-geometric",
    display: "DM Sans",
    body: "DM Sans",
    scale: "compact",
    rtlDisplay: "Noto Sans Arabic",
    rtlBody: "Noto Sans Arabic",
    headingWeight: 500,
    bodyWeight: 400,
    letterSpacing: "tight",
  },
};

function selectTypographyKey(ctx: ResolvedBlueprintContext): string {
  if (ctx.visualStyle === "minimal" || ctx.brandPersonality === "minimal") {
    return "minimal-geometric";
  }
  if (ctx.visualStyle === "luxury" || ctx.brandPersonality === "luxury") {
    return "editorial-luxury";
  }
  if (ctx.visualStyle === "editorial") return "editorial-luxury";
  if (ctx.brandPersonality === "technical" || ctx.websiteGoal === "saas") {
    return "technical-mono";
  }
  if (ctx.brandPersonality === "warm") return "warm-humanist";
  if (ctx.premiumLevel === "luxury") return "executive-serif";
  if (ctx.targetAudience === "enterprise" || ctx.industry === "finance") {
    return "executive-serif";
  }
  return "modern-sans";
}

export function resolveTypographyProfile(
  ctx: ResolvedBlueprintContext,
): BlueprintTypographyProfile {
  const key = selectTypographyKey(ctx);
  const preset = TYPOGRAPHY_PRESETS[key] ?? TYPOGRAPHY_PRESETS["modern-sans"]!;

  const scale =
    ctx.contentDensity === "dense"
      ? "compact"
      : ctx.contentDensity === "sparse"
        ? "expressive"
        : preset.scale;

  return {
    presetId: preset.id,
    display: preset.display,
    body: preset.body,
    scale,
    rtlDisplay: preset.rtlDisplay,
    rtlBody: preset.rtlBody,
    headingWeight: preset.headingWeight,
    bodyWeight: preset.bodyWeight,
    letterSpacing: preset.letterSpacing,
  };
}

export const BLUEPRINT_TYPOGRAPHY_PRESETS = TYPOGRAPHY_PRESETS;
