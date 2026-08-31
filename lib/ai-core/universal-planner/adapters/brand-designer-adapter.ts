import { buildSupportedServiceBlueprint } from "@/lib/ai-core/universal-planner/adapters/shared";
import type { UniversalPlannerAdapter } from "@/lib/ai-core/universal-planner/adapters/types";
import { UNIVERSAL_ADAPTER_VERSION } from "@/lib/ai-core/universal-planner/adapters/types";

export const brandDesignerAdapter: UniversalPlannerAdapter = {
  serviceId: "brand-designer",
  adapterVersion: UNIVERSAL_ADAPTER_VERSION,
  build({ blueprint, requirements }) {
    return buildSupportedServiceBlueprint("brand-designer", blueprint, requirements, {
      brandingRequired: requirements.capabilities.assets.branding ?? true,
      deliverables: [
        "positioning",
        "color-system",
        "typography",
        "voice-guidelines",
        "launch-assets",
      ],
      industryProfile: blueprint.industry.routingProfile,
    });
  },
};
