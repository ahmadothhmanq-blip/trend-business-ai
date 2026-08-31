import { buildSupportedServiceBlueprint } from "@/lib/ai-core/universal-planner/adapters/shared";
import type { UniversalPlannerAdapter } from "@/lib/ai-core/universal-planner/adapters/types";
import { UNIVERSAL_ADAPTER_VERSION } from "@/lib/ai-core/universal-planner/adapters/types";

export const landingPageAdapter: UniversalPlannerAdapter = {
  serviceId: "landing-page-builder",
  adapterVersion: UNIVERSAL_ADAPTER_VERSION,
  build({ blueprint, requirements }) {
    return buildSupportedServiceBlueprint(
      "landing-page-builder",
      blueprint,
      requirements,
      {
        conversionGoals: blueprint.intent.goals,
        assetNeeds: requirements.capabilities.assets,
        campaignFocus: blueprint.intent.summary,
      },
    );
  },
};
