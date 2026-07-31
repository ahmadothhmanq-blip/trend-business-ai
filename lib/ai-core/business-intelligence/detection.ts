import { getWebsiteIndustryIntelligence } from "@/lib/ai-core/industry-intelligence/profiles";
import type { IndustryDetectionResult } from "@/lib/ai-core/industry-intelligence/types";
import { WEBSITE_INDUSTRY_IDS } from "@/lib/ai-core/industry-intelligence/profiles";
import type { BusinessIntelligenceResult } from "@/lib/ai-core/business-intelligence/types";
import { resolveRoutingIndustryId } from "@/lib/ai-core/business-intelligence/types";
import type { IndustryId } from "@/lib/ai-core/templates/types";
import { isIndustryId } from "@/lib/ai-core/templates/industries";

/**
 * Convert AI Business Intelligence into the industry detection shape
 * consumed by template, design, and asset engines.
 */
export function detectionFromBusinessIntelligence(
  result: BusinessIntelligenceResult,
): IndustryDetectionResult {
  const { profile } = result;
  const routingId = resolveRoutingIndustryId(profile, WEBSITE_INDUSTRY_IDS);
  const baseId: IndustryId = isIndustryId(String(routingId))
    ? (routingId as IndustryId)
    : "business";
  const baseProfile = getWebsiteIndustryIntelligence(baseId);

  const mergedProfile = {
    ...baseProfile,
    id: baseId,
    label: profile.industry,
    description: `${profile.industry} — ${profile.subcategory}. ${profile.reason}`,
    requiredSections:
      profile.recommendedSections.length >= 3
        ? profile.recommendedSections
        : baseProfile.requiredSections,
    ctaTypes: [profile.primaryCta, profile.secondaryCta].filter(
      (c): c is string => Boolean(c?.trim()),
    ),
    contentStyle: profile.tone,
    designStyle: profile.visualStyle.join(", ") || baseProfile.designStyle,
    imageRequirements:
      profile.photographyStyle.length > 0
        ? profile.photographyStyle
        : baseProfile.imageRequirements,
    keywords: [
      profile.industry,
      profile.subcategory,
      ...profile.photographyStyle.slice(0, 6),
    ].map((k) => k.toLowerCase()),
  };

  return {
    industryId: baseId,
    confidence: profile.confidence,
    reason: profile.reason,
    source: result.source === "locked" ? "explicit" : "analysis",
    profile: mergedProfile,
  };
}
