import type { SupabaseClient } from "@supabase/supabase-js";

export type IterationMode = "generate" | "regenerate" | "continue" | "retry" | string;

/**
 * Build a prompt that applies regenerate / continue / retry against prior output.
 * Continue expects a natural-language edit instruction.
 */
export function buildIterationPrompt(args: {
  mode?: IterationMode;
  /** Original or current brief (for continue: prior brief). */
  prompt: string;
  continueInstruction?: string;
  previousContext?: string;
}): string {
  const mode = args.mode ?? "generate";
  const previous = args.previousContext?.trim();

  if (mode === "continue" || (args.continueInstruction && previous)) {
    const instruction =
      args.continueInstruction?.trim() ||
      args.prompt.trim() ||
      "Improve quality, clarity, and completeness while preserving intent.";

    return [
      "Apply the user's natural-language edit to the previous generation.",
      `Edit instruction: ${instruction}`,
      "",
      "Previous generation context:",
      previous || "(no prior context loaded)",
      "",
      "Original brief:",
      args.prompt,
      "",
      "Return a complete updated product that incorporates the edit.",
      "Preserve what still fits; change what the instruction requires.",
      "Do not leave TODO/placeholder content.",
    ].join("\n");
  }

  if ((mode === "regenerate" || mode === "retry") && previous) {
    return [
      args.prompt,
      "",
      "Previous generation (reference only — produce a fresh improved version):",
      previous,
      "",
      "Regenerate with a fresh approach while preserving the brief intent.",
    ].join("\n");
  }

  if (mode === "regenerate" || mode === "retry") {
    return `${args.prompt}\n\nRegenerate with a fresh approach while preserving the brief intent.`;
  }

  // Content-studio style edit modes
  if (
    previous &&
    ["rewrite", "expand", "shorten", "translate", "summarize", "update"].includes(mode)
  ) {
    return [
      `Mode: ${mode}`,
      args.continueInstruction
        ? `Instruction: ${args.continueInstruction}`
        : `Instruction: ${args.prompt}`,
      "",
      "Previous generation context:",
      previous,
      "",
      "Original brief:",
      args.prompt,
      "",
      "Return a complete updated deliverable.",
    ].join("\n");
  }

  return args.prompt;
}

export function summarizeGenerationContext(args: {
  title?: string | null;
  description?: string | null;
  prompt?: string | null;
  blueprint?: unknown;
  maxChars?: number;
}): string {
  const maxChars = args.maxChars ?? 14000;
  const parts: string[] = [];

  if (args.title) parts.push(`Title: ${args.title}`);
  if (args.description) parts.push(`Description: ${args.description}`);
  if (args.prompt) parts.push(`Prior prompt: ${args.prompt}`);

  const blueprint = args.blueprint;
  if (blueprint && typeof blueprint === "object") {
    const obj = blueprint as Record<string, unknown>;
    const files = obj.files;

    if (Array.isArray(files) && files.length > 0) {
      parts.push(`Files (${files.length}):`);
      for (const entry of files.slice(0, 36)) {
        if (!entry || typeof entry !== "object") continue;
        const file = entry as { path?: unknown; content?: unknown };
        const path = typeof file.path === "string" ? file.path : "file";
        const content =
          typeof file.content === "string" ? file.content.slice(0, 900) : "";
        parts.push(`--- ${path} ---\n${content}`);
      }
    } else {
      try {
        parts.push(`Blueprint:\n${JSON.stringify(blueprint).slice(0, maxChars)}`);
      } catch {
        // ignore circular/unserializable blueprints
      }
    }
  }

  const text = parts.join("\n\n");
  return text.length > maxChars ? `${text.slice(0, maxChars)}\n…[truncated]` : text;
}

export async function loadParentGenerationRow(
  supabase: SupabaseClient,
  table: string,
  userId: string,
  parentId: string,
): Promise<Record<string, unknown> | null> {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("id", parentId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return data as Record<string, unknown>;
}

export async function resolveIteratedPrompt(args: {
  supabase: SupabaseClient;
  table: string;
  userId: string;
  mode?: IterationMode;
  prompt: string;
  continueInstruction?: string;
  parentGenerationId?: string;
  titleField?: string;
}): Promise<
  | { ok: true; prompt: string; parent: Record<string, unknown> | null }
  | { ok: false; error: string; status: number }
> {
  const mode = args.mode ?? "generate";
  const needsParent =
    Boolean(args.parentGenerationId) &&
    mode !== "generate" &&
    mode !== undefined;

  if (!needsParent || !args.parentGenerationId) {
    return {
      ok: true,
      prompt: buildIterationPrompt({
        mode,
        prompt: args.prompt,
        continueInstruction: args.continueInstruction,
      }),
      parent: null,
    };
  }

  const parent = await loadParentGenerationRow(
    args.supabase,
    args.table,
    args.userId,
    args.parentGenerationId,
  );

  if (!parent) {
    return { ok: false, error: "Parent generation not found.", status: 404 };
  }

  const titleField = args.titleField ?? "name";
  const previousContext = summarizeGenerationContext({
    title:
      (typeof parent[titleField] === "string" && parent[titleField]) ||
      (typeof parent.page_name === "string" && parent.page_name) ||
      (typeof parent.app_name === "string" && parent.app_name) ||
      (typeof parent.logo_name === "string" && parent.logo_name) ||
      (typeof parent.image_name === "string" && parent.image_name) ||
      (typeof parent.video_name === "string" && parent.video_name) ||
      (typeof parent.content_name === "string" && parent.content_name) ||
      (typeof parent.brand_name === "string" && parent.brand_name) ||
      (typeof parent.report_name === "string" && parent.report_name) ||
      null,
    description:
      typeof parent.description === "string" ? parent.description : null,
    prompt: typeof parent.prompt === "string" ? parent.prompt : null,
    blueprint: parent.blueprint,
  });

  const originalBrief =
    mode === "continue" && typeof parent.prompt === "string" && parent.prompt
      ? parent.prompt
      : args.prompt;

  const continueInstruction =
    mode === "continue"
      ? args.continueInstruction?.trim() || args.prompt
      : args.continueInstruction;

  return {
    ok: true,
    parent,
    prompt: buildIterationPrompt({
      mode,
      prompt: originalBrief,
      continueInstruction,
      previousContext,
    }),
  };
}
