import { buildSupportedServiceBlueprint } from "@/lib/ai-core/universal-planner/adapters/shared";
import type { UniversalPlannerAdapter } from "@/lib/ai-core/universal-planner/adapters/types";
import { UNIVERSAL_ADAPTER_VERSION } from "@/lib/ai-core/universal-planner/adapters/types";

export const appBuilderAdapter: UniversalPlannerAdapter = {
  serviceId: "app-builder",
  adapterVersion: UNIVERSAL_ADAPTER_VERSION,
  build({ blueprint, requirements }) {
    return buildSupportedServiceBlueprint("app-builder", blueprint, requirements, {
      auth: requirements.capabilities.auth,
      database: requirements.capabilities.database,
      targetEntities: requirements.capabilities.database.entities ?? [],
      constraints: blueprint.intent.constraints,
    });
  },
};
