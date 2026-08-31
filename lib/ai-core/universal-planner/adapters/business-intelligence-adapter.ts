import { buildSupportedServiceBlueprint } from "@/lib/ai-core/universal-planner/adapters/shared";
import type { UniversalPlannerAdapter } from "@/lib/ai-core/universal-planner/adapters/types";
import { UNIVERSAL_ADAPTER_VERSION } from "@/lib/ai-core/universal-planner/adapters/types";

const BI_ACTIONS = [
  "analyze_performance",
  "explain_kpi",
  "detect_trends",
  "detect_anomalies",
  "forecast_revenue",
  "generate_executive_report",
  "natural_language_query",
] as const;

export const businessIntelligenceAdapter: UniversalPlannerAdapter = {
  serviceId: "business-intelligence",
  adapterVersion: UNIVERSAL_ADAPTER_VERSION,
  build({ blueprint, requirements }) {
    return buildSupportedServiceBlueprint(
      "business-intelligence",
      blueprint,
      requirements,
      {
        assistantActions: BI_ACTIONS,
        analyticsGoals: blueprint.intent.goals,
        reportDepth: blueprint.industry.confidence >= 0.7 ? "executive" : "standard",
      },
    );
  },
};
