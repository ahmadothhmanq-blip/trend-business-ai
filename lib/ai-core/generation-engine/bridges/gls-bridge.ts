import { resolveGlsLanguageContext } from "@/lib/language-platform";
import type { Tbge2PlanningPlan } from "@/lib/ai-core/generation-engine/core/types";

/**
 * Bridge to GLS — enrich planning with language context.
 * Does not modify lib/language-platform.
 */
export function enrichPlanWithGls(plan: Tbge2PlanningPlan) {
  const gls = resolveGlsLanguageContext({
    websiteLanguage: plan.business.language,
    generationLanguage: plan.business.language,
  });
  return {
    ...plan,
    language: {
      website: gls.website,
      generation: gls.generation,
      typography: gls.typography,
      direction: gls.direction,
      ai: gls.ai,
    },
  };
}
