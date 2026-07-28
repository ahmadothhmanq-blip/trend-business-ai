/**
 * Website Copilot Phase 2 — restore prior blueprint snapshot (in-memory undo).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import { commitBlueprintRevision } from "@/lib/website/platform/commit";
import { loadWebsiteGenerationForUser } from "@/lib/website/platform/load-generation";
import { readBlueprintRevisionFromGeneration } from "@/lib/website/platform/revision";
import type { CopilotCommandSuccess } from "@/lib/ai-core/website-copilot/types";

export async function restoreCopilotSnapshot(params: {
  supabase: SupabaseClient;
  userId: string;
  generationId: string;
  project: GeneratedWebsiteProject;
  expectedRevision?: number;
}): Promise<
  | CopilotCommandSuccess
  | { ok: false; code: "NOT_FOUND" | "CONFLICT" | "VALIDATION" | "SERVER"; error: string }
> {
  const generation = await loadWebsiteGenerationForUser(
    params.supabase,
    params.userId,
    params.generationId,
  );
  if (!generation) {
    return { ok: false, code: "NOT_FOUND", error: "Generation not found." };
  }

  if (!params.project.files?.length) {
    return {
      ok: false,
      code: "VALIDATION",
      error: "Undo snapshot has no files.",
    };
  }

  const committed = await commitBlueprintRevision({
    supabase: params.supabase,
    userId: params.userId,
    generationId: params.generationId,
    project: params.project,
    projectKind: params.project.projectKind ?? "website",
    input: {
      prompt: generation.business_description || "Copilot undo",
      language: generation.language || "English",
      theme: "modern",
      features: [],
      productId: "website-builder",
      projectId: generation.project_id ?? undefined,
      mode: "continue",
      parentGenerationId: params.generationId,
      continueInstruction: "Restore previous blueprint snapshot (Copilot undo).",
    },
    commit: {
      operation: "website.copilot.command",
      expectedRevision: params.expectedRevision,
      mutationMeta: { capability: "website.copilot.undo", tier: "local" },
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
    capability: "website.copilot.undo",
    tier: "local",
    mutated: true,
    revision: readBlueprintRevisionFromGeneration(committed.generation),
    aiRunId: committed.aiRunId,
    fromIdempotency: false,
    summary: "Restored previous website state.",
    project: committed.project,
    generation: committed.generation,
    previewVersion: committed.generation.updated_at,
  };
}
