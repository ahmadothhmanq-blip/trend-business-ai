/**
 * Direct file patch on saved website generations (Pro IDE).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { WebsiteGeneration } from "@/types/database";
import { commitBlueprintRevision } from "@/lib/website/platform/commit";
import {
  loadWebsiteGenerationForUser,
  toWebsiteProject,
} from "@/lib/website/platform/load-generation";

export type PatchWebsiteFileRequest = {
  path: string;
  content: string;
};

export type PatchWebsiteFileResult =
  | {
      ok: true;
      project: GeneratedWebsiteProject;
      generation: WebsiteGeneration;
      revision: number;
    }
  | { ok: false; code: "NOT_FOUND" | "VALIDATION"; error: string };

function filePatchInput(
  generation: WebsiteGeneration,
  project: GeneratedWebsiteProject,
  filePath: string,
) {
  return {
    prompt:
      generation.business_description ||
      project.description ||
      "Pro workspace file save",
    language: generation.language || project.language || "English",
    theme:
      `${generation.design_style || ""} ${generation.color_style || ""}`.trim() ||
      "premium",
    features: generation.features || [],
    productId: "website-builder",
    projectId: generation.project_id || undefined,
    mode: "continue" as const,
    parentGenerationId: generation.id,
    continueInstruction: `[pro-workspace] Saved file: ${filePath}`,
  };
}

export async function patchWebsiteFile(params: {
  supabase: SupabaseClient;
  userId: string;
  generationId: string;
  request: PatchWebsiteFileRequest;
}): Promise<PatchWebsiteFileResult> {
  const filePath = params.request.path.trim();
  const content = params.request.content;

  if (!filePath) {
    return { ok: false, code: "VALIDATION", error: "File path is required." };
  }
  if (filePath.includes("..") || filePath.startsWith("/")) {
    return { ok: false, code: "VALIDATION", error: "Invalid file path." };
  }

  const generation = await loadWebsiteGenerationForUser(
    params.supabase,
    params.userId,
    params.generationId,
  );
  if (!generation) {
    return { ok: false, code: "NOT_FOUND", error: "Website not found." };
  }

  const project = toWebsiteProject(generation);
  const files = project.files ?? [];
  const index = files.findIndex((f) => f.path === filePath);
  if (index < 0) {
    return { ok: false, code: "NOT_FOUND", error: `File not found: ${filePath}` };
  }

  const nextProject: GeneratedWebsiteProject = {
    ...project,
    files: files.map((f, i) => (i === index ? { ...f, content } : f)),
  };

  const committed = await commitBlueprintRevision({
    supabase: params.supabase,
    userId: params.userId,
    generationId: params.generationId,
    project: nextProject,
    projectKind:
      generation.website_type === "web_application"
        ? "web_application"
        : "website",
    input: filePatchInput(generation, project, filePath),
    commit: {
      operation: "website.pro.files",
      mutationMeta: { filePath },
    },
  });

  if (!committed.ok) {
    return {
      ok: false,
      code: "VALIDATION",
      error: committed.error ?? "Failed to save file.",
    };
  }

  return {
    ok: true,
    project: committed.project,
    generation: committed.generation,
    revision: committed.revision,
  };
}
