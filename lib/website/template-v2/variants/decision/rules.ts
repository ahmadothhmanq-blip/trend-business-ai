import {
  getVariantDecisionProfile,
  goalAffinity,
  industryAffinity,
  styleAffinity,
} from "@/lib/website/template-v2/variants/decision/profiles";
import type {
  VariantDecisionContext,
  VariantDecisionProfile,
  VariantScoreBreakdown,
} from "@/lib/website/template-v2/variants/decision/types";
import { DECISION_WEIGHTS, normalizeIndustry } from "@/lib/website/template-v2/variants/decision/weights";
import type { SectionKind } from "@/lib/website/template-v2/variants/types";

function audienceScore(profile: VariantDecisionProfile, audience?: string): number {
  if (!audience) return 0.5;
  const map: Record<string, number> = {
    b2b: profile.traits.b2b,
    b2c: profile.traits.b2c,
    enterprise: profile.traits.enterprise,
    luxury: profile.traits.luxury,
    startup: profile.traits.startup,
    consumer: profile.traits.b2c,
  };
  return map[audience] ?? 0.5;
}

function personalityScore(profile: VariantDecisionProfile, personality?: string): number {
  if (!personality) return 0.5;
  const map: Record<string, number> = {
    professional: profile.traits.b2b * 0.6 + profile.traits.enterprise * 0.4,
    bold: profile.traits.visualWeight,
    warm: profile.traits.b2c * 0.7 + (1 - profile.traits.density) * 0.3,
    luxury: profile.traits.luxury,
    playful: profile.traits.b2c * 0.6 + profile.traits.startup * 0.4,
    minimal: 1 - profile.traits.visualWeight,
    technical: profile.traits.product * 0.6 + profile.traits.b2b * 0.4,
  };
  return map[personality] ?? 0.5;
}

function businessSizeScore(profile: VariantDecisionProfile, size?: string): number {
  if (!size) return 0.5;
  const map: Record<string, number> = {
    solo: profile.traits.startup,
    small: profile.traits.startup * 0.6 + profile.traits.b2c * 0.4,
    medium: profile.traits.b2b * 0.5 + profile.traits.b2c * 0.5,
    enterprise: profile.traits.enterprise,
  };
  return map[size] ?? 0.5;
}

function densityScore(profile: VariantDecisionProfile, density?: string): number {
  if (!density) return 0.5;
  const target = density === "sparse" ? 0.2 : density === "dense" ? 0.85 : 0.5;
  return 1 - Math.abs(profile.traits.density - target);
}

function imageScore(profile: VariantDecisionProfile, availability?: string): number {
  if (!availability) return 0.5;
  const need = profile.traits.imageIntensity;
  const map: Record<string, number> = { none: 0, limited: 1, moderate: 2, rich: 3 };
  const have = map[availability] ?? 2;
  if (need === 0) return have === 0 ? 1 : 0.7;
  if (have >= need) return 1;
  if (have === need - 1) return 0.55;
  return 0.2;
}

function businessModelScore(profile: VariantDecisionProfile, model?: string): number {
  if (!model) return 0.5;
  if (model === "product") return profile.traits.product;
  if (model === "service") return profile.traits.service;
  return (profile.traits.product + profile.traits.service) / 2;
}

function premiumScore(profile: VariantDecisionProfile, level?: string): number {
  if (!level) return 0.5;
  const target = level === "luxury" ? 0.9 : level === "premium" ? 0.7 : 0.45;
  return 1 - Math.abs(profile.traits.premiumFit - target);
}

function deviceScore(profile: VariantDecisionProfile, device?: string): number {
  if (!device) return 0.5;
  if (device === "mobile-first") return profile.traits.mobileFirst;
  if (device === "desktop-first") return 1 - profile.traits.mobileFirst;
  return 0.5 + (profile.traits.mobileFirst - 0.5) * 0.5;
}

function accessibilityScore(profile: VariantDecisionProfile, level?: string): number {
  if (!level) return profile.traits.accessibility;
  const target = level === "strict" ? 0.95 : level === "enhanced" ? 0.8 : 0.65;
  return profile.traits.accessibility >= target
    ? 1
    : Math.max(0, 1 - (target - profile.traits.accessibility) * 2);
}

function rtlScore(profile: VariantDecisionProfile, direction?: string): number {
  if (direction !== "rtl") return 0.5;
  return profile.traits.rtlFriendly;
}

function breakdownEntry(
  factor: string,
  weight: number,
  rawScore: number,
  note?: string,
): VariantScoreBreakdown {
  return {
    factor,
    weight,
    rawScore: Math.round(rawScore * 1000) / 1000,
    weightedScore: Math.round(rawScore * weight * 1000) / 1000,
    note,
  };
}

/**
 * Score a single variant against the decision context (0–100 scale).
 */
export function scoreVariant(
  sectionKind: SectionKind,
  variantId: string,
  context: VariantDecisionContext,
): { totalScore: number; breakdown: VariantScoreBreakdown[] } | null {
  const profile = getVariantDecisionProfile(sectionKind, variantId);
  if (!profile) return null;

  const industry = normalizeIndustry(context.industry);
  const factors: VariantScoreBreakdown[] = [
    breakdownEntry("websiteGoal", DECISION_WEIGHTS.websiteGoal!, goalAffinity(profile, context.websiteGoal), context.websiteGoal),
    breakdownEntry("targetAudience", DECISION_WEIGHTS.targetAudience!, audienceScore(profile, context.targetAudience), context.targetAudience),
    breakdownEntry("industry", DECISION_WEIGHTS.industry!, industryAffinity(profile, industry), industry),
    breakdownEntry("imageAvailability", DECISION_WEIGHTS.imageAvailability!, imageScore(profile, context.imageAvailability), context.imageAvailability),
    breakdownEntry("visualStyle", DECISION_WEIGHTS.visualStyle!, styleAffinity(profile, context.visualStyle), context.visualStyle),
    breakdownEntry("brandPersonality", DECISION_WEIGHTS.brandPersonality!, personalityScore(profile, context.brandPersonality), context.brandPersonality),
    breakdownEntry("businessModel", DECISION_WEIGHTS.businessModel!, businessModelScore(profile, context.businessModel), context.businessModel),
    breakdownEntry("premiumLevel", DECISION_WEIGHTS.premiumLevel!, premiumScore(profile, context.premiumLevel), context.premiumLevel),
    breakdownEntry("accessibilityLevel", DECISION_WEIGHTS.accessibilityLevel!, accessibilityScore(profile, context.accessibilityLevel), context.accessibilityLevel),
    breakdownEntry("languageDirection", DECISION_WEIGHTS.languageDirection!, rtlScore(profile, context.languageDirection), context.languageDirection),
    breakdownEntry("businessSize", DECISION_WEIGHTS.businessSize!, businessSizeScore(profile, context.businessSize), context.businessSize),
    breakdownEntry("contentDensity", DECISION_WEIGHTS.contentDensity!, densityScore(profile, context.contentDensity), context.contentDensity),
    breakdownEntry("devicePriority", DECISION_WEIGHTS.devicePriority!, deviceScore(profile, context.devicePriority), context.devicePriority),
  ];

  const totalScore = Math.round(
    factors.reduce((sum, f) => sum + f.weightedScore, 0) * 100,
  );

  return { totalScore, breakdown: factors };
}

export function topScoringFactors(
  breakdown: VariantScoreBreakdown[],
  limit = 3,
): string[] {
  return [...breakdown]
    .sort((a, b) => b.weightedScore - a.weightedScore)
    .slice(0, limit)
    .map((f) => `${f.factor} (${Math.round(f.rawScore * 100)}%)`);
}
