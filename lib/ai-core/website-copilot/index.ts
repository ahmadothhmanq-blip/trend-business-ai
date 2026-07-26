/**
 * Website Copilot — public exports.
 */

export type {
  CopilotCapabilityUri,
  CopilotCommandRequest,
  CopilotCommandResult,
  CopilotCommandSuccess,
  CopilotCostHint,
  CopilotCostTier,
  CopilotExecutorTier,
  CopilotExecutorKind,
  CopilotSelectionContext,
  CapabilityMatch,
  CopilotExecutionPlan,
  CopilotManageResultPayload,
  CopilotSeoResultPayload,
} from "@/lib/ai-core/website-copilot/types";

export {
  COPILOT_MVP_EXAMPLES,
  COPILOT_PHASE2_EXAMPLES,
  COPILOT_UNDO_MAX_DEPTH,
} from "@/lib/ai-core/website-copilot/types";
export { routeCommand, capabilityRequiresAi } from "@/lib/ai-core/website-copilot/router";
export { composePlan } from "@/lib/ai-core/website-copilot/composer";
export { estimateCopilotCost } from "@/lib/ai-core/website-copilot/cost-tier";
export { classifyCompoundCommand } from "@/lib/ai-core/website-copilot/classifier";
export { resolveCopilotRoute } from "@/lib/ai-core/website-copilot/resolve-route";
export { runCopilotCommand } from "@/lib/ai-core/website-copilot/processor";
export { runCopilotCommandStream } from "@/lib/ai-core/website-copilot/stream";
export { restoreCopilotSnapshot } from "@/lib/ai-core/website-copilot/undo";
export {
  enrichCommandWithSelection,
  formatSelectionBadge,
} from "@/lib/ai-core/website-copilot/selection-context";
export { syncBlueprintMaterializedView } from "@/lib/ai-core/website-copilot/sync-blueprint";
export {
  attachCostHint,
  attachRoutingMeta,
  runCopilotStreamLoop,
} from "@/lib/ai-core/copilot-kernel";
