import { buildSupportedServiceBlueprint } from "@/lib/ai-core/universal-planner/adapters/shared";
import type { UniversalPlannerAdapter } from "@/lib/ai-core/universal-planner/adapters/types";
import { UNIVERSAL_ADAPTER_VERSION } from "@/lib/ai-core/universal-planner/adapters/types";

export const contentStudioAdapter: UniversalPlannerAdapter = {
  serviceId: "content-studio",
  adapterVersion: UNIVERSAL_ADAPTER_VERSION,
  build({ blueprint, requirements }) {
    return buildSupportedServiceBlueprint("content-studio", blueprint, requirements, {
      editorialGoals: blueprint.intent.goals,
      contentFormats: blueprint.intent.requestedOutputs,
      toneProfile: blueprint.industry.routingProfile,
      brandVoiceIntegration: requirements.capabilities.assets.branding ?? false,
    });
  },
};
