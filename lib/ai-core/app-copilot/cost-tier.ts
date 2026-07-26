/**
 * Cost tier estimation for App Copilot commands (Phase 4).
 */

import {
  COPILOT_COST_LABELS,
  type CopilotCostHint,
} from "@/lib/ai-core/copilot-kernel";
import type {
  AppCapabilityMatch,
  AppCopilotExecutionPlan,
} from "@/lib/ai-core/app-copilot/types";
import { appCapabilityRequiresAi } from "@/lib/ai-core/app-copilot/router";

export function estimateAppCopilotCost(
  match: AppCapabilityMatch,
  plan: AppCopilotExecutionPlan,
): CopilotCostHint {
  const requiresAi =
    plan.tier === "ai-continue" && appCapabilityRequiresAi(plan.capability);
  const costTier = requiresAi ? "ai-standard" : "free";
  const creditCost = requiresAi ? 1 : 0;

  return {
    costTier,
    creditCost,
    capability: match.uri,
    label: COPILOT_COST_LABELS[costTier],
  };
}
