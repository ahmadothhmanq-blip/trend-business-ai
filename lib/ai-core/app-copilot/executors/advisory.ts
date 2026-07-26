/**
 * Advisory executor — suggestions only, no blueprint mutation.
 */

import type { StructuredAppModel } from "@/lib/ai-core/app-design-platform/types";
import type { WebAppGeneration } from "@/types/webapp";
import {
  APP_COPILOT_MVP_EXAMPLES,
  type AppCopilotCommandSuccess,
} from "@/lib/ai-core/app-copilot/types";
import { readBlueprintRevisionFromGeneration } from "@/lib/webapp/platform/revision";

export function executeAdvisoryAppCopilotCommand(params: {
  generation: WebAppGeneration;
  model: StructuredAppModel;
  capability: string;
  summary: string;
  includeExamples?: boolean;
}): AppCopilotCommandSuccess {
  const examples = params.includeExamples ? [...APP_COPILOT_MVP_EXAMPLES] : undefined;

  return {
    ok: true,
    capability: params.capability,
    tier: "advisory",
    mutated: false,
    revision: readBlueprintRevisionFromGeneration(params.generation),
    aiRunId: null,
    fromIdempotency: false,
    summary: params.summary,
    model: params.model,
    generation: params.generation,
    examples,
    previewVersion: params.generation.updated_at,
  };
}
