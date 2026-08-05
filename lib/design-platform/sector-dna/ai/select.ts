import type {
  TbdpAiSelectionRequest,
  TbdpAiSelectionResult,
  TbdpExperienceProfileId,
} from "@/lib/design-platform/sector-dna/core/types";
import { getExperienceProfile } from "@/lib/design-platform/sector-dna/experience-profiles";
import { getSectorDna } from "@/lib/design-platform/sector-dna/sectors";
import { validateAiSelectionRequest } from "@/lib/design-platform/sector-dna/validation";

const GOAL_PROFILE_BIAS: Record<
  NonNullable<TbdpAiSelectionRequest["goal"]>,
  TbdpExperienceProfileId
> = {
  conversion: "corporate",
  trust: "executive",
  engagement: "playful",
  information: "minimal",
};

function resolveTypographyProfile(
  request: TbdpAiSelectionRequest,
  available: TbdpAiSelectionResult["selections"]["typographyProfile"][],
): string {
  if (request.direction === "rtl") {
    const rtl = available.find((p) => p.includes("rtl") || p.includes("arabic"));
    if (rtl) return rtl;
  }
  return available[0] ?? "latin-ltr";
}

function resolveExperienceProfileId(
  sectorProfiles: TbdpExperienceProfileId[],
  goal?: TbdpAiSelectionRequest["goal"],
): TbdpExperienceProfileId {
  if (goal && sectorProfiles.includes(GOAL_PROFILE_BIAS[goal])) {
    return GOAL_PROFILE_BIAS[goal];
  }
  return sectorProfiles[0];
}

/**
 * AI-driven design selection — resolves layouts, components, motion, and flow
 * from sector DNA metadata without manual intervention.
 */
export function selectSectorDesign(request: TbdpAiSelectionRequest): TbdpAiSelectionResult {
  const parsed = validateAiSelectionRequest(request);
  if (!parsed.success) {
    throw new Error(`Invalid AI selection request: ${parsed.error.message}`);
  }

  const sector = getSectorDna(request.sectorId);
  if (!sector) {
    throw new Error(`Unknown sector: ${request.sectorId}`);
  }

  const experienceProfileId = resolveExperienceProfileId(
    sector.experienceProfiles,
    request.goal,
  );
  const experienceProfile = getExperienceProfile(experienceProfileId);
  if (!experienceProfile) {
    throw new Error(`Missing experience profile: ${experienceProfileId}`);
  }

  const typographyProfile = resolveTypographyProfile(
    request,
    sector.ai.typographyProfiles,
  );

  return {
    sector,
    experienceProfile,
    selections: {
      layoutId: sector.ai.layoutIds[0],
      heroComponent: sector.ai.heroComponents[0],
      navComponent: sector.ai.navComponents[0],
      ctaComponent: sector.ai.ctaComponents[0],
      motionPresets: sector.ai.motionPresets,
      typographyProfile,
      spacingBehavior: sector.ai.spacingScale,
      pageFlow: sector.ai.pageFlow,
      primaryButton: sector.ai.primaryButtonVariant,
      cardComponent: sector.ai.cardComponents[0],
    },
    metadata: sector.ai,
  };
}
