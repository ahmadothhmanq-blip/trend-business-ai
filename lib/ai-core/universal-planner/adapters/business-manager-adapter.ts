import { buildSupportedServiceBlueprint } from "@/lib/ai-core/universal-planner/adapters/shared";
import type { UniversalPlannerAdapter } from "@/lib/ai-core/universal-planner/adapters/types";
import { UNIVERSAL_ADAPTER_VERSION } from "@/lib/ai-core/universal-planner/adapters/types";

const BUSINESS_MANAGER_ACTIONS = [
  "analyze",
  "improve",
  "summarize",
  "recommend",
] as const;

export const businessManagerAdapter: UniversalPlannerAdapter = {
  serviceId: "business-manager",
  adapterVersion: UNIVERSAL_ADAPTER_VERSION,
  build({ blueprint, requirements }) {
    return buildSupportedServiceBlueprint("business-manager", blueprint, requirements, {
      assistantActions: BUSINESS_MANAGER_ACTIONS,
      organizationsRoute: "/api/business-manager/organizations",
      projectsRoute: "/api/business-manager/projects",
      workspaceGoals: blueprint.intent.goals,
    });
  },
};
