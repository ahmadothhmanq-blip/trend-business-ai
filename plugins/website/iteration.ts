import type { SupabaseMaybeSingleQueryClient } from "@/lib/api/supabase-query";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import type {
  WebsiteGenerationInput,
  WebsiteProjectBlueprint,
} from "@/plugins/website/types";

/** True for natural-language improve / continue iteration (not first-time generate). */
export function isWebsiteImproveMode(
  input: Pick<WebsiteGenerationInput, "mode" | "continueInstruction">,
): boolean {
  return (
    input.mode === "continue" ||
    Boolean(input.continueInstruction?.trim())
  );
}

/**
 * Coerce AI blueprint list fields into string[] before improve processing.
 * Models sometimes return a string, object map, or mixed array instead of string[].
 */
export function normalizeWebsiteStringList(value: unknown): string[] {
  if (value == null) return [];

  if (Array.isArray(value)) {
    const out: string[] = [];
    for (const item of value) {
      if (typeof item === "string") {
        const trimmed = item.trim();
        if (trimmed) out.push(trimmed);
        continue;
      }
      if (item && typeof item === "object") {
        const record = item as { text?: unknown; content?: unknown; value?: unknown };
        const nested = record.text ?? record.content ?? record.value;
        if (typeof nested === "string" && nested.trim()) {
          out.push(nested.trim());
        }
      }
    }
    return out;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    const lines = trimmed
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
    return lines.length > 0 ? lines : [trimmed];
  }

  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).flatMap((entry) =>
      typeof entry === "string" && entry.trim() ? [entry.trim()] : [],
    );
  }

  return [];
}

/** Normalize blueprint arrays used by the improve/continue iteration path. */
export function normalizeWebsiteBlueprint(
  blueprint: WebsiteProjectBlueprint,
): WebsiteProjectBlueprint {
  return {
    ...blueprint,
    title: typeof blueprint.title === "string" ? blueprint.title : String(blueprint.title ?? ""),
    description:
      typeof blueprint.description === "string"
        ? blueprint.description
        : String(blueprint.description ?? ""),
    pages: normalizeWebsiteStringList(blueprint.pages),
    sections: normalizeWebsiteStringList(blueprint.sections),
    colorPalette: normalizeWebsiteStringList(blueprint.colorPalette),
    typography: normalizeWebsiteStringList(blueprint.typography),
    components: normalizeWebsiteStringList(blueprint.components),
    content: normalizeWebsiteStringList(blueprint.content),
    seo: normalizeWebsiteStringList(blueprint.seo),
    roadmap: normalizeWebsiteStringList(blueprint.roadmap),
  };
}

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
