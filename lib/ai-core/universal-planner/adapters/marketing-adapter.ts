import { buildSupportedServiceBlueprint } from "@/lib/ai-core/universal-planner/adapters/shared";
import type { UniversalPlannerAdapter } from "@/lib/ai-core/universal-planner/adapters/types";
import { UNIVERSAL_ADAPTER_VERSION } from "@/lib/ai-core/universal-planner/adapters/types";

export const marketingAdapter: UniversalPlannerAdapter = {
  serviceId: "marketing",
  adapterVersion: UNIVERSAL_ADAPTER_VERSION,
  build({ blueprint, requirements }) {
    return buildSupportedServiceBlueprint("marketing", blueprint, requirements, {
      campaignGoals: blueprint.intent.goals,
      channelMix: requirements.capabilities.integrations,
      generationTypes: ["campaign", "persona"],
      campaignsRoute: "/api/marketing/campaigns",
    });
  },
};
