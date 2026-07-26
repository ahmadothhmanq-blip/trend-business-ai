/**
 * Copilot runtime kernel — response meta helpers (Phase 4).
 */

import type { CopilotCostHint, CopilotRoutingMeta } from "@/lib/ai-core/copilot-kernel/types";

export function attachCostHint<T extends Record<string, unknown>>(
  success: T,
  costHint: CopilotCostHint,
): T & { costHint: CopilotCostHint } {
  return { ...success, costHint };
}

export function attachRoutingMeta<T extends Record<string, unknown>>(
  success: T,
  routing?: CopilotRoutingMeta,
): T & CopilotRoutingMeta {
  if (!routing) return success;
  return {
    ...success,
    classifierUsed: routing.classifierUsed,
    splitCommands: routing.splitCommands,
    executedCommandIndex: routing.executedCommandIndex,
    executedCommandCount: routing.executedCommandCount,
  };
}
