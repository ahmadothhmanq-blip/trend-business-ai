/**
 * App Copilot — restore prior model snapshot (in-memory undo).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { StructuredAppModel } from "@/lib/ai-core/app-design-platform/types";
import { commitAppBlueprintRevision } from "@/lib/webapp/platform/commit";
import { loadWebappGenerationForUser } from "@/lib/webapp/platform/load-generation";
import { readBlueprintRevisionFromGeneration } from "@/lib/webapp/platform/revision";
import type { AppCopilotCommandSuccess } from "@/lib/ai-core/app-copilot/types";
import type { WebAppBlueprint } from "@/types/webapp";

export async function restoreAppCopilotSnapshot(params: {
  supabase: SupabaseClient;
  userId: string;
  generationId: string;
  model: StructuredAppModel;
  files?: GeneratedProjectFile[];
  blueprint?: WebAppBlueprint;
  expectedRevision?: number;
}): Promise<
  | AppCopilotCommandSuccess
  | { ok: false; code: "NOT_FOUND" | "CONFLICT" | "VALIDATION" | "SERVER"; error: string }
> {
  const generation = await loadWebappGenerationForUser(
    params.supabase,
    params.userId,
    params.generationId,
  );
  if (!generation) {
    return { ok: false, code: "NOT_FOUND", error: "Generation not found." };
  }

  const files = params.files ?? generation.blueprint?.files ?? [];
  const blueprint = params.blueprint ?? generation.blueprint ?? {
    title: params.model.settings.appName,
    description: generation.description,
    appType: generation.app_type,
    framework: "next",
    pages: [],
    files,
    settings: {},
    prompt: generation.prompt,
    generatedAt: generation.created_at,
  };

  const committed = await commitAppBlueprintRevision({
    supabase: params.supabase,
    userId: params.userId,
    generationId: params.generationId,
    payload: {
      model: params.model,
      files,
      blueprint: blueprint as WebAppBlueprint,
    },
    input: {
      prompt: generation.prompt,
      appType: generation.app_type,
      language: generation.language,
      designStyle: generation.design_style,
      colorStyle: generation.color_style,
      features: generation.features,
      productId: "webapp-builder",
      projectId: generation.project_id ?? undefined,
      mode: generation.mode,
    },
    commit: {
      operation: "webapp.copilot.command",
      expectedRevision: params.expectedRevision,
      mutationMeta: { capability: "app.copilot.undo", tier: "local" },
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
    capability: "app.copilot.undo",
    tier: "local",
    mutated: true,
    revision: readBlueprintRevisionFromGeneration(committed.generation),
    aiRunId: committed.aiRunId,
    fromIdempotency: false,
    summary: "Restored previous app state.",
    model: committed.model,
    generation: committed.generation,
    files: committed.files,
    previewVersion: committed.generation.updated_at,
  };
}
