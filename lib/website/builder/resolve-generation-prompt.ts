export type WebsiteBuilderGenerationMode = "generate" | "continue" | "regenerate";

export type ResolveGenerationPromptInput = {
  mode: WebsiteBuilderGenerationMode;
  projectBrief: string;
  activeProjectDescription?: string | null;
  /** Resume incomplete generation — may use stored project description. */
  resume?: boolean;
  /**
   * Continue / improve / optimize / layer-improve paths (not new website).
   * May use stored project description when the user brief is empty.
   */
  iterationOnActiveProject?: boolean;
};

export type ResolveGenerationPromptResult =
  | { ok: true; prompt: string }
  | { ok: false; reason: "empty_brief" };

/**
 * Resolve the API prompt for Website Builder generation.
 * New website mode always requires the user's projectBrief — no template or fixture fallbacks.
 */
export function resolveGenerationPrompt(
  input: ResolveGenerationPromptInput,
): ResolveGenerationPromptResult {
  const trimmedBrief = input.projectBrief.trim();
  const storedDescription = input.activeProjectDescription?.trim() ?? "";

  if (input.mode === "generate") {
    if (!trimmedBrief) {
      return { ok: false, reason: "empty_brief" };
    }
    return { ok: true, prompt: trimmedBrief };
  }

  if (input.mode === "regenerate") {
    const prompt = trimmedBrief || storedDescription;
    if (!prompt) {
      return { ok: false, reason: "empty_brief" };
    }
    return { ok: true, prompt };
  }

  if (input.resume || input.iterationOnActiveProject) {
    const prompt = storedDescription || trimmedBrief;
    if (!prompt) {
      return { ok: false, reason: "empty_brief" };
    }
    return { ok: true, prompt };
  }

  const prompt = trimmedBrief || storedDescription;
  if (!prompt) {
    return { ok: false, reason: "empty_brief" };
  }
  return { ok: true, prompt };
}
