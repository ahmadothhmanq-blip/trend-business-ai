import { buildSupportedServiceBlueprint } from "@/lib/ai-core/universal-planner/adapters/shared";
import type { UniversalPlannerAdapter } from "@/lib/ai-core/universal-planner/adapters/types";
import { UNIVERSAL_ADAPTER_VERSION } from "@/lib/ai-core/universal-planner/adapters/types";

export const imageGeneratorAdapter: UniversalPlannerAdapter = {
  serviceId: "image-generator",
  adapterVersion: UNIVERSAL_ADAPTER_VERSION,
  build({ blueprint, requirements }) {
    return buildSupportedServiceBlueprint("image-generator", blueprint, requirements, {
      imageRequired: requirements.capabilities.assets.images ?? true,
      visualGoals: blueprint.intent.requestedOutputs,
      campaignContext: blueprint.intent.summary,
    });
  },
};
