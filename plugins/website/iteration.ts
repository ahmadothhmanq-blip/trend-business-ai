import type { SupabaseMaybeSingleQueryClient } from "@/lib/api/supabase-query";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { WebsiteGenerationInput } from "@/plugins/website/types";

/** Build the effective user brief for analyze/plan, including regenerate/continue context. */
export function buildWebsiteIterationPrompt(input: WebsiteGenerationInput): string {
  const mode = input.mode ?? "generate";
  let prompt = input.prompt;

  if (
    (mode === "continue" || input.continueInstruction) &&
    (input.previousFiles?.length || input.previousTitle)
  ) {
    const priorPaths = (input.previousFiles ?? [])
      .map((file) => file.path)
      .slice(0, 40)
      .join(", ");

    prompt = [
      "Continue and improve an existing Next.js source project (ZIP product).",
      input.continueInstruction
        ? `Continue instruction: ${input.continueInstruction}`
        : "Extend with missing pages/components while keeping the existing architecture.",
      "",
      `Previous title: ${input.previousTitle ?? "(untitled)"}`,
      `Previous description: ${input.previousDescription ?? ""}`,
      priorPaths ? `Previous file paths: ${priorPaths}` : "",
      "",
      "Original brief:",
      input.prompt,
    ]
      .filter(Boolean)
      .join("\n");
  } else if (
    (mode === "regenerate" || mode === "retry") &&
    (input.previousTitle || input.previousFiles?.length)
  ) {
    prompt = [
      input.prompt,
      "",
      "Regenerate with a fresh approach while preserving the brief intent.",
      input.previousTitle ? `Previous title: ${input.previousTitle}` : "",
      input.previousFiles?.length
        ? `Previous file count: ${input.previousFiles.length}. Prefer a cleaner MVP under the 18-file limit.`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  return prompt;
}

export function extractWebsiteFilesFromBlueprint(
  blueprint: unknown,
): GeneratedProjectFile[] {
  if (!blueprint || typeof blueprint !== "object") return [];
  const files = (blueprint as { files?: unknown }).files;
  if (!Array.isArray(files)) return [];

  return files.filter(
    (file): file is GeneratedProjectFile =>
      !!file &&
      typeof file === "object" &&
      typeof (file as GeneratedProjectFile).path === "string" &&
      typeof (file as GeneratedProjectFile).content === "string" &&
      (file as GeneratedProjectFile).path.trim().length > 0,
  );
}

type ParentContext = {
  previousFiles?: GeneratedProjectFile[];
  previousTitle?: string;
  previousDescription?: string;
};

/** Load prior website generation for regenerate / continue modes. */
export async function loadWebsiteParentContext(
  supabase: SupabaseMaybeSingleQueryClient,
  userId: string,
  parentGenerationId?: string,
): Promise<ParentContext> {
  if (!parentGenerationId) return {};

  try {
    const { data } = await supabase
      .from("website_generations")
      .select("*")
      .eq("id", parentGenerationId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!data || typeof data !== "object") return {};

    const row = data as {
      project_name?: string;
      business_description?: string;
      blueprint?: unknown;
    };

    return {
      previousFiles: extractWebsiteFilesFromBlueprint(row.blueprint),
      previousTitle: row.project_name,
      previousDescription: row.business_description,
    };
  } catch {
    return {};
  }
}
