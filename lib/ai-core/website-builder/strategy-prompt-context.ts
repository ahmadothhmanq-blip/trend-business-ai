import { resolveContentLanguage } from "@/lib/ai-core/content/content-language";

/**
 * Wrap strategy JSON for file-generation prompts.
 * For Arabic, marks upstream English planning labels as structure-only.
 */
export function summarizeStrategyForFilePrompt(
  strategy: unknown,
  language: string,
): string {
  const payload = JSON.stringify(strategy);
  if (resolveContentLanguage(language) !== "ar") {
    return `Strategy: ${payload}`;
  }

  return `Strategy STRUCTURE ONLY — do NOT copy English labels into the UI.
Every user-visible string you write in this file must be in Modern Standard Arabic.
If any Strategy page name, section name, CTA, or content field below is English, translate it naturally to Arabic in your output.

Strategy JSON:
${payload}`;
}
