import {
  WEBSITE_INDUSTRY_INTELLIGENCE,
  WEBSITE_INDUSTRY_IDS,
} from "@/lib/ai-core/industry-intelligence/profiles";
import type { IndustryId, IndustryProfile } from "@/lib/ai-core/templates/types";

/**
 * Industry Intelligence profiles — synced from Website Industry Intelligence.
 * Foundation for AI Template Engine + Website Builder verticals.
 */
export const INDUSTRY_PROFILES: Record<IndustryId, IndustryProfile> =
  Object.fromEntries(
    WEBSITE_INDUSTRY_IDS.map((id) => {
      const intel = WEBSITE_INDUSTRY_INTELLIGENCE[id];
      const profile: IndustryProfile = {
        id: intel.id,
        label: intel.label,
        description: intel.description,
        keywords: [...intel.keywords],
        layoutStyle: intel.layoutStyle,
        sections: [...intel.requiredSections],
        designPreset: intel.designPreset,
        requiredFeatures: [...intel.requiredFeatures],
        suggestedPages: [...intel.recommendedPages],
        contentTone: intel.contentStyle,
        industryPattern: intel.industryPattern,
        ctaTypes: [...intel.ctaTypes],
        designStyle: intel.designStyle,
        imageRequirements: [...intel.imageRequirements],
      };
      return [id, profile];
    }),
  ) as Record<IndustryId, IndustryProfile>;

export const INDUSTRY_IDS = Object.keys(INDUSTRY_PROFILES) as IndustryId[];

export function getIndustryProfile(id: IndustryId): IndustryProfile {
  return INDUSTRY_PROFILES[id];
}

export function listIndustryProfiles(): IndustryProfile[] {
  return INDUSTRY_IDS.map((id) => INDUSTRY_PROFILES[id]);
}

export function isIndustryId(value: string): value is IndustryId {
  return value in INDUSTRY_PROFILES;
}
