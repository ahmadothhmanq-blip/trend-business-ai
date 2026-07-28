export {
  buildWebsiteGenerationKey,
  detectIndustryFromPrompt,
  detectLanguageFromPrompt,
  isArabicPrompt,
  resolveWebsiteOutputLanguage,
} from "@/lib/ai-core/website-builder/prompt-industry";

export {
  inferProjectTypeFromPrompt,
  inferWebsiteOnboardingDefaults,
  resolveWebsiteOnboardingInput,
} from "@/lib/ai-core/website-builder/onboarding-inference";

export {
  buildGenerationRepairInstruction,
  validateWebsiteGeneration,
} from "@/lib/ai-core/website-builder/generation-validation";

export {
  buildWebsiteLanguageDirective,
  isRtlWebsiteLanguage,
  requiresArabicWebsiteCopy,
} from "@/lib/ai-core/website-builder/language-directive";

export { websiteGenerateJson } from "@/lib/ai-core/website-builder/llm-calls";
export {
  countArabicCharacters,
  extractUserFacingCopyFromSource,
  isCopyBearingWebsiteFile,
  isUserFacingWebsiteFile,
  normalizeWebsiteCopyText,
  validateWebsiteLlmOutputLanguage,
} from "@/lib/ai-core/website-builder/llm-language";

export { summarizeStrategyForFilePrompt } from "@/lib/ai-core/website-builder/strategy-prompt-context";
