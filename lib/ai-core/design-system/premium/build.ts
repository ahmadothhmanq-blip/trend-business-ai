import { resolveLayoutIntelligence } from "@/lib/ai-core/design-system/premium/layout-intelligence";
import {
  buildPremiumStylePackage,
  PREMIUM_STYLE_IDS,
  premiumStyleToEnginePreset,
} from "@/lib/ai-core/design-system/premium/styles";
import type {
  BuildPremiumDesignInput,
  PremiumDesignSystem,
  PremiumStyleId,
} from "@/lib/ai-core/design-system/premium/types";
import type { CoreDesignSystem } from "@/lib/ai-core/layers/types";
import { normalizeDesignPreset } from "@/lib/ai-core/design-system/presets";

export function normalizePremiumStyleId(value: unknown): PremiumStyleId {
  const v = String(value ?? "")
    .toLowerCase()
    .trim();

  if (
    v === "luxury" ||
    v === "modern" ||
    v === "minimal" ||
    v === "corporate" ||
    v === "futuristic" ||
    v === "creative" ||
    v === "technology" ||
    v === "saas" ||
    v === "premium-brand"
  ) {
    return v;
  }

  if (/premium.?brand|flagship|heritage|iconic/.test(v)) return "premium-brand";
  if (/saas|subscription|product.?led|plg|b2b.?platform/.test(v)) return "saas";
  if (/technology|futur|tech|cyber|neon|ai\b|startup|software/.test(v)) {
    return "technology";
  }
  if (/luxury|gold|editorial|travel premium/.test(v)) return "luxury";
  if (/corporate|enterprise|trust|professional|healthcare/.test(v)) {
    return "corporate";
  }
  if (/minimal|clean|sparse|light/.test(v)) return "minimal";
  if (/creative|agency|studio|bold|playful|expressive/.test(v)) {
    return "creative";
  }
  if (/modern|product/.test(v)) return "modern";

  // Map legacy engine preset names
  const engine = normalizeDesignPreset(v);
  if (engine === "tech") return "technology";
  if (engine === "premium-brand") return "premium-brand";
  if (
    engine === "luxury" ||
    engine === "modern" ||
    engine === "minimal" ||
    engine === "corporate" ||
    engine === "creative"
  ) {
    return engine;
  }
  return "modern";
}

/**
 * Industry + brand signals → complete premium visual identity.
 */
export function buildPremiumDesignSystem(
  input: BuildPremiumDesignInput,
): PremiumDesignSystem {
  const styleId = normalizePremiumStyleId(
    input.preferredStyle ||
      input.designStyle ||
      input.brandTone ||
      input.industryLabel,
  );

  const pack = buildPremiumStylePackage(styleId, {
    primary: input.seedPrimary,
    secondary: input.seedSecondary,
    accent: input.seedAccent,
  });

  const layout = resolveLayoutIntelligence({
    styleId,
    industryId: input.industryId,
    designStyle: input.designStyle,
    layoutStyle: input.layoutStyle,
    layoutVariationId: input.layoutVariationId,
    heroTreatment: input.heroTreatment,
    sectionLayout: input.sectionLayout,
  });

  const industryLabel = input.industryLabel || input.industryId || "Brand";

  return {
    ...pack,
    layout,
    brandSummary: `${industryLabel} × ${pack.label}: ${layout.heroStyle} hero, ${layout.sectionLayout} sections, ${pack.typography.displayFont}/${pack.typography.bodyFont}, ${pack.colors.harmonyNotes}.`,
  };
}

/**
 * Apply premium package onto an existing CoreDesignSystem (keeps prior fields).
 */
export function applyPremiumDesignToCore(
  core: CoreDesignSystem,
  premium: PremiumDesignSystem,
): CoreDesignSystem {
  return {
    ...core,
    style: premium.label,
    stylePreset: premium.enginePreset,
    colors: {
      primary: premium.colors.primary,
      secondary: premium.colors.secondary,
      accent: premium.colors.accent,
      neutral: premium.colors.neutral,
      surface: premium.colors.surface,
      background: premium.colors.background,
      foreground: premium.colors.foreground,
    },
    typography: {
      headingFont: premium.typography.headingFont,
      bodyFont: premium.typography.bodyFont,
      scale: [
        premium.typography.scale.display,
        premium.typography.scale.h1,
        premium.typography.scale.h2,
        premium.typography.scale.body,
      ],
      notes: premium.typography.notes,
    },
    layoutStyle: premium.layout.sectionLayout || core.layoutStyle,
    layoutRules: Array.from(
      new Set([
        ...premium.layout.rules,
        ...premium.responsive.rules,
        ...(core.layoutRules ?? []),
      ]),
    ).slice(0, 16),
    uiPatterns: Array.from(
      new Set([
        premium.layout.heroStyle,
        premium.layout.cardStyle,
        premium.layout.navigationStyle,
        premium.layout.footerStyle,
        ...(core.uiPatterns ?? []),
      ]),
    ).slice(0, 16),
    borderRadius: premium.radius.default,
    shadowStyle: premium.shadows.notes,
    spacingScale: Object.values(premium.spacing.scale),
    spacingSystem: {
      unit: premium.spacing.unit,
      scale: Object.values(premium.spacing.scale),
      sectionGap: premium.spacing.sectionY,
      containerMax: premium.spacing.containerMax,
      notes: premium.spacing.notes,
    },
    uiStyle: {
      density: premium.layout.density,
      corners:
        premium.radius.default === "0"
          ? "sharp"
          : premium.radius.full === premium.radius.default
            ? "pill"
            : "soft",
      elevation: premium.shadows.glow !== "none" ? "elevated" : "soft",
      contrast: "high",
      notes: premium.brandSummary,
    },
    componentStyle: {
      buttons: premium.layout.ctaStyle,
      cards: premium.layout.cardStyle,
      inputs: "premium-focus-ring",
      navigation: premium.layout.navigationStyle,
      palette: core.componentPalette?.length
        ? core.componentPalette
        : core.componentStyle?.palette ?? [],
    },
    animationStyle: {
      motion: premium.animation.motion,
      easing: premium.animation.easing,
      duration: premium.animation.duration,
      entrances: premium.animation.entrances,
      notes: premium.animation.notes,
    },
    premium,
  };
}

export function listPremiumStyles(): Array<{
  id: PremiumStyleId;
  label: string;
  enginePreset: string;
}> {
  return PREMIUM_STYLE_IDS.map((id) => ({
    id,
    label: buildPremiumStylePackage(id).label,
    enginePreset: premiumStyleToEnginePreset(id),
  }));
}
