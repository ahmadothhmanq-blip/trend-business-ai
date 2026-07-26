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
