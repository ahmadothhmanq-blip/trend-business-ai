/**
 * Advisory executor — suggestions only, no blueprint mutation.
 */

import { suggestWebsiteImprovements } from "@/lib/ai-core/website-editor";
import { getWebsitePlatformPort } from "@/lib/website/platform/port";
import type { GeneratedWebsiteProject } from "@/lib/website/types";
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
  const port = getWebsitePlatformPort();
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
    revision: port.readBlueprintRevision(params.generation),
    aiRunId: null,
    fromIdempotency: false,
    summary: params.summary,
    suggestions: report.suggestions,
    examples,
    previewVersion: params.generation.updated_at,
  };
}
