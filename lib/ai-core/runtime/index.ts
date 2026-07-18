/**
 * AI Core Runtime — re-exports the existing shared AI stack.
 * Products should gradually import from `@/lib/ai-core` instead of deep `@/lib/ai/*` paths.
 */

export {
  AIGenerationEngine,
  aiGenerationEngine,
  type AIPlugin,
  type EngineRunOptions,
} from "@/lib/ai/engine";

export { providerManager } from "@/lib/ai/provider-manager";

export {
  getAIProvider,
  resolveAvailableProvider,
  isProviderConfigured,
} from "@/lib/ai/adapters";

export {
  generateJsonWithValidation,
  generateWithValidation,
} from "@/lib/ai/generator";

export { createProgressTracker } from "@/lib/ai/progress";
export { createUsageTracker, emptyTokenUsage } from "@/lib/ai/usage";

export type {
  AIProvider,
  AIProviderName,
  ExportResult,
  GeneratedProjectFile,
  GenerationContext,
  TokenUsage,
  ValidationResult,
} from "@/lib/ai/types";
