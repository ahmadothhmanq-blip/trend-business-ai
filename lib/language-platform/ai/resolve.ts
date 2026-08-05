import { isEnglishWebsiteLanguage, usesLlmLocalizedWebsiteCopy } from "@/lib/i18n/website-output-locale";
import type { GlsAiLanguageResolution } from "@/lib/language-platform/core/types";

export type GlsAiLanguageResolverInput = {
  generationLanguage?: string | null;
  websiteLanguage?: string | null;
  templateLanguage?: string | null;
  contentLanguage?: string | null;
  promptLanguage?: string | null;
};

/**
 * AI Language Resolver — controls prompt, output, content, website, and template language.
 * DeepSeek and all AI providers output structured content; GLS controls language boundaries.
 */
export function resolveAiLanguage(input: GlsAiLanguageResolverInput = {}): GlsAiLanguageResolution {
  const websiteLanguage = input.websiteLanguage ?? input.generationLanguage ?? "English";
  const generationLanguage = input.generationLanguage ?? websiteLanguage;
  const templateLanguage = input.templateLanguage ?? websiteLanguage;
  const contentLanguage = input.contentLanguage ?? websiteLanguage;
  const promptLanguage = input.promptLanguage ?? generationLanguage;
  const usesLlmLocalization = usesLlmLocalizedWebsiteCopy(websiteLanguage);

  return {
    promptLanguage,
    outputLanguage: generationLanguage,
    contentLanguage,
    websiteLanguage,
    templateLanguage,
    structuredOutputOnly: true,
    usesLlmLocalization,
  };
}

export function buildAiLanguageDirective(language: string): string {
  if (isEnglishWebsiteLanguage(language)) {
    return "Write all visible UI copy in English.";
  }
  return `Write ALL visible UI copy, headings, buttons, labels, and navigation in ${language}. Do not use English for user-facing text.`;
}
