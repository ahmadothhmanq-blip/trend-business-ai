import { buildSupportedServiceBlueprint } from "@/lib/ai-core/universal-planner/adapters/shared";
import type { UniversalPlannerAdapter } from "@/lib/ai-core/universal-planner/adapters/types";
import { UNIVERSAL_ADAPTER_VERSION } from "@/lib/ai-core/universal-planner/adapters/types";

const ERP_ACTIONS = [
  "analyze_financial_data",
  "generate_reports",
  "forecast_revenue",
  "predict_inventory",
  "recommend_actions",
  "summarize_performance",
] as const;

export const erpAdapter: UniversalPlannerAdapter = {
  serviceId: "erp",
  adapterVersion: UNIVERSAL_ADAPTER_VERSION,
  build({ blueprint, requirements }) {
    return buildSupportedServiceBlueprint("erp", blueprint, requirements, {
      assistantActions: ERP_ACTIONS,
      operationsFocus: blueprint.intent.goals,
      entityHints: requirements.capabilities.database.entities ?? ["inventory", "order"],
    });
  },
};
