/**
 * Advanced AI Design Intelligence — art-director decisions before generation.
 * Analyzes industry, audience, brand position, and business goal, then selects
 * the best design system + layout (agency quality, not generic templates).
 */

import type {
  CoreBusinessProfile,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";
import type { DesignIntelligenceBrief } from "@/lib/ai-core/design-intelligence/types";
import { selectWebsiteLayout } from "@/lib/ai-core/design-intelligence/layout-selection";
import type { PremiumStyleId } from "@/lib/ai-core/design-system/premium/types";
import type { DesignPresetId } from "@/lib/ai-core/design-system/types";

function engineForStyle(style: PremiumStyleId): DesignPresetId {
  if (style === "technology" || style === "futuristic" || style === "saas") {
    return "tech";
  }
  if (style === "premium-brand") return "premium-brand";
  if (
    style === "luxury" ||
    style === "modern" ||
    style === "minimal" ||
    style === "corporate" ||
    style === "creative"
  ) {
    return style;
  }
  return "modern";
}

function preferStyleFromSignals(params: {
  theme?: string | null;
  designStyle?: string | null;
  tone?: string | null;
  positioning?: string | null;
  audience?: string | null;
  businessGoals?: string[] | null;
}): PremiumStyleId | null {
  const hay = [
    params.theme,
    params.designStyle,
    params.tone,
    params.positioning,
    params.audience,
    ...(params.businessGoals ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (!hay) return null;
  if (/premium brand|flagship|heritage|iconic|prestige brand/.test(hay)) {
    return "premium-brand";
  }
  if (/saas|subscription|product.?led|plg/.test(hay)) return "saas";
  if (/luxury|editorial|gold|exclusive|resort|dining|showroom/.test(hay)) {
    return "luxury";
  }
  if (/tech|futur|neon|ai\b|cyber|hardware/.test(hay)) return "technology";
  if (/minimal|clean|sparse|quiet/.test(hay)) return "minimal";
  if (/corporate|enterprise|trust|professional|medical|financ|bank/.test(hay)) {
    return "corporate";
  }
  if (/creative|agency|studio|bold|playful/.test(hay)) return "creative";
  if (/modern|product|startup/.test(hay)) return "modern";
  return null;
}

/**
 * Act as UI/UX art director: pick layout variation, design system, motion, imagery, sections.
 */
export function analyzeDesignIntelligence(params: {
  profile?: CoreBusinessProfile | null;
  strategy?: CoreProductStrategy | null;
  industryId?: string | null;
  theme?: string | null;
  designStyle?: string | null;
  preferredStyle?: string | null;
}): DesignIntelligenceBrief {
  const audience =
    params.profile?.targetAudience?.trim() ||
    "discerning customers who expect clarity and polish";
  const brandPosition =
    params.strategy?.positioning?.trim() ||
    params.profile?.offer?.trim() ||
    "a premium brand experience";
  const businessGoals = params.profile?.businessGoals ?? null;

  const layout = selectWebsiteLayout({
    profile: params.profile,
    strategy: params.strategy,
    industryId: params.industryId,
    theme: params.theme,
    designStyle: params.designStyle,
    preferredStyle: params.preferredStyle,
    audience,
    brandPosition,
    businessGoals,
  });

  const signalStyle = preferStyleFromSignals({
    theme: params.preferredStyle || params.theme,
    designStyle: params.designStyle,
    tone: params.profile?.tone,
    positioning: brandPosition,
    audience,
    businessGoals,
  });

  // Industry layout owns the default; brand/audience signals refine within family.
  const premiumStyleId = signalStyle || layout.premiumStyleId;
  const enginePreset = engineForStyle(premiumStyleId);

  const artDirectionNotes = [
    "Design as a top global UI/UX agency — unique composition, never a generic template",
    `Pre-generation analysis: industry=${layout.industryKey} · audience · brand position · business goal`,
    `Layout variation: ${layout.layoutVariationId}`,
    `Hero: ${layout.heroTreatment} · Composition: ${layout.compositionMode} · Sections: ${layout.sectionLayout}`,
    `Cards: ${layout.cardStyle} (prefer borderless/editorial over repetitive grids) · Nav: ${layout.navigationStyle}`,
    "One hero idea, one primary CTA, generous whitespace, decisive typography hierarchy",
    "Prefer storytelling bands, case studies, trust strips, timelines — not endless card grids",
    "Photography must feel intentional and industry-true",
    "Motion: 2–4 purposeful entrances + smooth transitions, never decorative noise",
    "Mobile-first: stack with clear tap targets and readable type scale",
    layout.reason,
  ];

  const colorDirection =
    premiumStyleId === "luxury" || premiumStyleId === "premium-brand"
      ? "High-contrast brand palette with restrained accent moments"
      : premiumStyleId === "saas"
        ? "Bright product surfaces with confident indigo/violet CTA contrast"
        : premiumStyleId === "technology" || premiumStyleId === "futuristic"
          ? "Dark technical surfaces with precise luminous accents"
          : premiumStyleId === "minimal"
            ? "Near-monochrome with a single decisive accent"
            : premiumStyleId === "corporate"
              ? "Trust-forward blues/neutrals with crisp CTA contrast"
              : "Harmonized brand colors with clear primary CTA contrast";

  const typographyDirection =
    premiumStyleId === "luxury" || premiumStyleId === "premium-brand"
      ? "Expressive display serif or premium sans + refined body with clear H1→body steps"
      : premiumStyleId === "saas" || premiumStyleId === "technology"
        ? "Geometric product display + highly readable body"
        : premiumStyleId === "creative"
          ? "Characterful display with disciplined body copy"
          : "Clean premium sans with confident scale steps";

  const spacingDirection =
    layout.compositionMode === "story" || layout.compositionMode === "editorial"
      ? "Airy flagship rhythm — large section breathing, tight internal stacks"
      : layout.layoutVariationId === "premium-saas" ||
          layout.layoutVariationId === "dashboard" ||
          layout.layoutVariationId === "interactive-hero"
        ? "Product-marketing density — breathable but information-rich"
        : "Airy section rhythm on desktop; tightened but breathable on mobile";

  return {
    premiumStyleId,
    enginePreset,
    industryKey: layout.industryKey,
    layoutStyle: layout.layoutStyle,
    layoutVariationId: layout.layoutVariationId,
    heroTreatment: layout.heroTreatment,
    sectionLayout: layout.sectionLayout,
    cardStyle: layout.cardStyle,
    navigationStyle: layout.navigationStyle,
    visualStyle: `${premiumStyleId} · ${layout.layoutVariationId} · ${layout.compositionMode} identity for ${layout.industryKey}`,
    colorDirection,
    typographyDirection,
    spacingDirection,
    animationDirection: layout.animationStyle,
    imageStyle: layout.imageStyle,
    componentStyle: `${layout.cardStyle} surfaces · ${layout.navigationStyle} navigation · storytelling-first components · polished CTAs`,
    sectionStructure: layout.sectionStructure,
    artDirectionNotes,
    audienceInsight: audience,
    positioningInsight: brandPosition,
    allowedHeroVariants: layout.allowedHeroVariants,
    allowedSectionLayouts: layout.allowedSectionLayouts,
    confidence: signalStyle ? 0.92 : 0.86,
    reason: signalStyle
      ? `${layout.reason}; brand/audience signals refined style to ${premiumStyleId}`
      : layout.reason,
  };
}
