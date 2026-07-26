/**
 * AI-continue executor — broader app mutations via assistant agent + LLM plan.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { runAppAssistantAgent } from "@/lib/ai-core/app-design-platform/assistant-agent";
import { commitAppBlueprintRevision } from "@/lib/webapp/platform/commit";
import type { AppCopilotCapabilityUri } from "@/lib/ai-core/app-copilot/types";
import type { StructuredAppModel } from "@/lib/ai-core/app-design-platform/types";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { WebAppBlueprint, WebAppGeneration } from "@/types/webapp";

export async function executeAiContinueAppCopilotCommand(params: {
  supabase: SupabaseClient;
  userId: string;
  generationId: string;
  command: string;
  capability: AppCopilotCapabilityUri;
  model: StructuredAppModel;
  files: GeneratedProjectFile[];
  blueprint: WebAppBlueprint;
  generation: WebAppGeneration;
  expectedRevision?: number;
}): Promise<
  | {
      ok: true;
      generation: WebAppGeneration;
      model: StructuredAppModel;
      files: GeneratedProjectFile[];
      blueprint: WebAppBlueprint;
      summary: string;
      assistantResult: Awaited<ReturnType<typeof runAppAssistantAgent>>;
      aiRunId: string | null;
      revision: number;
    }
  | { ok: false; code: "NOT_FOUND" | "CONFLICT" | "VALIDATION" | "SERVER" | "PROVIDER_UNAVAILABLE"; error: string }
> {
  const assistantResult = await runAppAssistantAgent({
    message: params.command,
    model: params.model,
    files: params.files,
    syncFiles: true,
  });

  if (!assistantResult.applied || !assistantResult.model) {
    return {
      ok: false,
      code: "PROVIDER_UNAVAILABLE",
      error:
        assistantResult.notes[0] ||
        "AI could not apply that command. Try a more specific instruction.",
    };
  }

  const committed = await commitAppBlueprintRevision({
    supabase: params.supabase,
    userId: params.userId,
    generationId: params.generationId,
    payload: {
      model: assistantResult.model,
      files: assistantResult.files ?? params.files,
      blueprint: params.blueprint,
    },
    input: {
      prompt: params.generation.prompt,
      appType: params.generation.app_type,
      language: params.generation.language,
      designStyle: params.generation.design_style,
      colorStyle: params.generation.color_style,
      features: params.generation.features,
      productId: "webapp-builder",
      projectId: params.generation.project_id ?? undefined,
      mode: params.generation.mode,
    },
    commit: {
      operation: "webapp.copilot.command",
      expectedRevision: params.expectedRevision,
      mutationMeta: { capability: params.capability, tier: "ai-continue" },
    },
  });

  if (!committed.ok) {
    return {
      ok: false,
      code: committed.code === "CONFLICT" ? "CONFLICT" : "SERVER",
      error: committed.error,
    };
  }

  return {
    ok: true,
    generation: committed.generation,
    model: committed.model,
    files: committed.files,
    blueprint: committed.blueprint,
    summary: assistantResult.actions.join(" · ") || "AI applied app changes.",
    assistantResult,
    aiRunId: committed.aiRunId,
    revision: committed.revision,
  };
}
