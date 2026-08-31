import { buildSupportedServiceBlueprint } from "@/lib/ai-core/universal-planner/adapters/shared";
import type { UniversalPlannerAdapter } from "@/lib/ai-core/universal-planner/adapters/types";
import { UNIVERSAL_ADAPTER_VERSION } from "@/lib/ai-core/universal-planner/adapters/types";

export const logoDesignerAdapter: UniversalPlannerAdapter = {
  serviceId: "logo-designer",
  adapterVersion: UNIVERSAL_ADAPTER_VERSION,
  build({ blueprint, requirements }) {
    return buildSupportedServiceBlueprint("logo-designer", blueprint, requirements, {
      brandingRequired: requirements.capabilities.assets.branding ?? true,
      deliverables: ["logo-directions", "mark-concepts", "wordmark-options", "usage-rules"],
      styleHints: requirements.domainHints,
    });
  },
};
