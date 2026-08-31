import type { AIProvider } from "@/lib/ai/types";
import { generateJsonWithValidation } from "@/lib/ai/generator";
import {
  buildWebsiteLanguageDirective,
} from "@/lib/ai-core/website-builder/language-directive.server";
import {
  languageMismatchRepairHint,
  validateWebsiteLlmOutputLanguage,
  type WebsiteLlmStage,
} from "@/lib/ai-core/website-builder/llm-language";
import { resolveContentLanguage } from "@/lib/ai-core/content/content-language";

export type WebsiteLlmCallInput = {
  language: string;
  prompt?: string;
};

/**
 * Website Builder JSON LLM call with audit logging + output-language validation.
 */
export async function websiteGenerateJson<T>(options: {
  stage: WebsiteLlmStage;
  input: WebsiteLlmCallInput;
  provider: AIProvider;
  prompt: string;
  schema: object;
  maxAttempts?: number;
  filePath?: string;
  validate: (result: T) => { valid: boolean; reason?: string };
}): Promise<T> {
  const websiteLanguage = options.input.language;
  const directiveIncluded = options.prompt.includes("CRITICAL");

  return generateJsonWithValidation<T>({
    provider: options.provider,
    prompt: options.prompt,
    schema: options.schema,
    maxAttempts: options.maxAttempts,
    audit: {
      stage: options.stage,
      websiteLanguage,
      filePath: options.filePath,
      languageDirectiveIncluded: directiveIncluded,
    },
    validate: (result) => {
      const structural = options.validate(result);
      if (!structural.valid) return structural;

      const language = validateWebsiteLlmOutputLanguage({
        stage: options.stage,
        websiteLanguage,
        result,
        filePath: options.filePath,
      });
      if (!language.valid) {
        return {
          valid: false,
          reason: languageMismatchRepairHint(
            websiteLanguage,
            language.reason ?? "Output language mismatch.",
          ),
        };
      }

      return { valid: true };
    },
    transformRetryPrompt: (basePrompt, validationReason) => {
      const languageBlock = buildWebsiteLanguageDirective({
        language: websiteLanguage,
        prompt: options.input.prompt,
      });
      const arabicReinforce =
        resolveContentLanguage(websiteLanguage) === "ar"
          ? "\nRETRY: Previous output was not fully Arabic. Regenerate with Modern Standard Arabic for EVERY visible string."
          : "";
      return `${basePrompt}\n\nPrevious attempt failed validation: ${validationReason}\n${languageBlock}${arabicReinforce}`;
    },
  });
}
