/**
 * App Copilot — public exports (Phase 4).
 */

export type {
  AppCopilotCapabilityUri,
  AppCopilotCommandRequest,
  AppCopilotCommandResult,
  AppCopilotCommandSuccess,
  AppCopilotSelectionContext,
  AppCapabilityMatch,
  AppCopilotExecutionPlan,
} from "@/lib/ai-core/app-copilot/types";

export {
  APP_COPILOT_MVP_EXAMPLES,
  APP_COPILOT_UNDO_MAX_DEPTH,
} from "@/lib/ai-core/app-copilot/types";

export { routeAppCommand, appCapabilityRequiresAi } from "@/lib/ai-core/app-copilot/router";
export { composeAppPlan } from "@/lib/ai-core/app-copilot/composer";
export { estimateAppCopilotCost } from "@/lib/ai-core/app-copilot/cost-tier";
export { classifyAppCompoundCommand } from "@/lib/ai-core/app-copilot/classifier";
export { resolveAppCopilotRoute } from "@/lib/ai-core/app-copilot/resolve-route";
export { runAppCopilotCommand } from "@/lib/ai-core/app-copilot/processor";
export { runAppCopilotCommandStream } from "@/lib/ai-core/app-copilot/stream";
export { restoreAppCopilotSnapshot } from "@/lib/ai-core/app-copilot/undo";
export { enrichAppCommandWithSelection } from "@/lib/ai-core/app-copilot/selection-context";
