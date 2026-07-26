/**
 * Cost tier estimation for Website Copilot commands (Phase 3).
 */

import {
  COPILOT_COST_LABELS,
  type CopilotCostHint,
} from "@/lib/ai-core/copilot-kernel";
import type {
  CapabilityMatch,
  CopilotExecutionPlan,
} from "@/lib/ai-core/website-copilot/types";
import { capabilityRequiresAi } from "@/lib/ai-core/website-copilot/router";

export type { CopilotCostHint };

export function estimateCopilotCost(
  match: CapabilityMatch,
  plan: CopilotExecutionPlan,
): CopilotCostHint {
  const requiresAi =
    plan.tier === "ai-continue" && capabilityRequiresAi(plan.capability);
  const costTier = requiresAi ? "ai-standard" : "free";
  const creditCost = requiresAi ? 1 : 0;

  return {
    costTier,
    creditCost,
    capability: match.uri,
    label: COPILOT_COST_LABELS[costTier],
  };
}
