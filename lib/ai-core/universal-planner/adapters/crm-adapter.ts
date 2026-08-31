import { buildSupportedServiceBlueprint } from "@/lib/ai-core/universal-planner/adapters/shared";
import type { UniversalPlannerAdapter } from "@/lib/ai-core/universal-planner/adapters/types";
import { UNIVERSAL_ADAPTER_VERSION } from "@/lib/ai-core/universal-planner/adapters/types";

const CRM_ACTIONS = [
  "analyze_customer",
  "score_lead",
  "suggest_next_action",
  "summarize_history",
  "generate_sales_email",
  "improve_deal_strategy",
] as const;

export const crmAdapter: UniversalPlannerAdapter = {
  serviceId: "crm",
  adapterVersion: UNIVERSAL_ADAPTER_VERSION,
  build({ blueprint, requirements }) {
    return buildSupportedServiceBlueprint("crm", blueprint, requirements, {
      assistantActions: CRM_ACTIONS,
      pipelineFocus: blueprint.intent.goals,
      entityHints: requirements.capabilities.database.entities ?? ["lead", "customer"],
    });
  },
};
