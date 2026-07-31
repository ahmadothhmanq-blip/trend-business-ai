import type { CoreBrief } from "@/lib/ai-core/layers/types";
import type { ArchitectureValidationCorrection } from "@/lib/ai-core/architecture-validation/types";
import { getWebsiteStructureTemplate } from "@/lib/website/builder/structure-templates";

export const ARCHITECTURE_REPLAN_ATTEMPT_KEY = "architectureReplanAttempt";
export const ARCHITECTURE_CORRECTIONS_KEY = "architectureValidationCorrections";

/**
 * Apply validator-recommended corrections onto brief metadata before re-routing.
 */
export function applyArchitectureCorrectionsToBrief(
  brief: CoreBrief,
  corrections: ArchitectureValidationCorrection[],
): CoreBrief {
  const meta: Record<string, unknown> = { ...(brief.metadata ?? {}) };
  const attempt =
    (typeof meta[ARCHITECTURE_REPLAN_ATTEMPT_KEY] === "number"
      ? meta[ARCHITECTURE_REPLAN_ATTEMPT_KEY]
      : 0) + 1;

  meta[ARCHITECTURE_REPLAN_ATTEMPT_KEY] = attempt;
  meta[ARCHITECTURE_CORRECTIONS_KEY] = corrections;

  for (const correction of corrections) {
    switch (correction.field) {
      case "structureTemplateId": {
        meta.websiteStructureTemplateId = correction.recommendedValue;
        const structure = getWebsiteStructureTemplate(correction.recommendedValue);
        if (structure) {
          meta.templateIntelligenceId = structure.templateIntelligenceId;
        }
        break;
      }
      case "layoutTemplateIntelligenceId":
        meta.templateIntelligenceId = correction.recommendedValue;
        break;
      case "visualThemePresetId":
        meta.websiteThemeId = correction.recommendedValue;
        break;
      case "premiumTemplateId":
        meta.premiumTemplateId = correction.recommendedValue;
        break;
      case "routingIndustryId":
        if (meta.businessIntelligence && typeof meta.businessIntelligence === "object") {
          const bi = {
            ...(meta.businessIntelligence as Record<string, unknown>),
          };
          const profile = bi.profile as Record<string, unknown> | undefined;
          if (profile) {
            bi.profile = {
              ...profile,
              routingIndustryId: correction.recommendedValue,
            };
          }
          meta.businessIntelligence = bi;
        }
        break;
      default:
        break;
    }
  }

  // Clear unified route so re-router runs fresh.
  delete meta.unifiedTemplateRoute;

  return { ...brief, metadata: meta };
}
