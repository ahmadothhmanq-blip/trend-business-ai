/**
 * Advisory executor — suggestions only, no blueprint mutation.
 */

import { suggestWebsiteImprovements } from "@/lib/ai-core/website-editor";
import { readBlueprintRevisionFromGeneration } from "@/lib/website/platform/revision";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { WebsiteGeneration } from "@/types/database";
import {
  COPILOT_MVP_EXAMPLES,
  COPILOT_PHASE2_EXAMPLES,
  type CopilotCommandSuccess,
} from "@/lib/ai-core/website-copilot/types";

export function executeAdvisoryCopilotCommand(params: {
  generation: WebsiteGeneration;
  project: GeneratedWebsiteProject;
  capability: string;
  summary: string;
  includeExamples?: boolean;
  includePhase2Examples?: boolean;
}): CopilotCommandSuccess {
  const report = suggestWebsiteImprovements({
    files: params.project.files ?? [],
    project: params.project,
  });

  const examples = params.includeExamples
    ? [
        ...COPILOT_MVP_EXAMPLES,
        ...(params.includePhase2Examples ? COPILOT_PHASE2_EXAMPLES : []),
      ]
    : undefined;

  return {
    ok: true,
    capability: params.capability,
    tier: "advisory",
    mutated: false,
    revision: readBlueprintRevisionFromGeneration(params.generation),
    aiRunId: null,
    fromIdempotency: false,
    summary: params.summary,
    suggestions: report.suggestions,
    examples,
    previewVersion: params.generation.updated_at,
  };
}
