/**
 * Static single-step command recipes for App Copilot.
 */

import type {
  AppCapabilityMatch,
  AppCopilotExecutionPlan,
} from "@/lib/ai-core/app-copilot/types";

export function composeAppPlan(match: AppCapabilityMatch): AppCopilotExecutionPlan {
  switch (match.uri) {
    case "app.assistant.continue":
      return {
        capability: match.uri,
        tier: "ai-continue",
        executor: "ai-continue",
      };
    case "app.advisory.compound":
    case "app.advisory.unknown":
      return {
        capability: match.uri,
        tier: "advisory",
        executor: "advisory",
      };
    default:
      return {
        capability: match.uri,
        tier: "local",
        executor: "local",
      };
  }
}
