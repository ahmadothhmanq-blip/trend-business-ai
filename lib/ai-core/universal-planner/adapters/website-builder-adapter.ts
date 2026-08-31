import { buildSupportedServiceBlueprint } from "@/lib/ai-core/universal-planner/adapters/shared";
import type { UniversalPlannerAdapter } from "@/lib/ai-core/universal-planner/adapters/types";
import { UNIVERSAL_ADAPTER_VERSION } from "@/lib/ai-core/universal-planner/adapters/types";

export const websiteBuilderAdapter: UniversalPlannerAdapter = {
  serviceId: "website-builder",
  adapterVersion: UNIVERSAL_ADAPTER_VERSION,
  build({ blueprint, requirements }) {
    return buildSupportedServiceBlueprint(
      "website-builder",
      blueprint,
      requirements,
      {
        requiresDatabase: requirements.capabilities.database.required,
        sections: blueprint.intent.requestedOutputs,
        domainHints: requirements.domainHints,
        seoFocus: blueprint.intent.goals.some((goal) => /seo|search/i.test(goal)),
      },
    );
  },
};
