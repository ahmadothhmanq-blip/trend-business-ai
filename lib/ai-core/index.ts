/**
 * AI Core Engine — Phase 2: Website + Web App + Landing Page on LayerRunner.
 *
 * Layer pipeline: Idea → Strategy → Design → Assets → Generation → Quality → Finalize
 * Runtime: existing AIGenerationEngine + ProviderManager (re-exported).
 */

import "@/lib/ai-core/adapters/website-builder";
import "@/lib/ai-core/adapters/webapp-builder";
import "@/lib/ai-core/adapters/landing-page-builder";

export {
  WEBSITE_BUILDER_PRODUCT_ID,
  createWebsiteBuilderAdapter,
  websiteInputToBrief,
  priorArtifactsFromWebsiteInput,
} from "@/lib/ai-core/adapters/website-builder";

export {
  WEBAPP_BUILDER_PRODUCT_ID,
  createWebappBuilderAdapter,
  webappInputToBrief,
} from "@/lib/ai-core/adapters/webapp-builder";

export {
  LANDING_PAGE_BUILDER_PRODUCT_ID,
  createLandingPageBuilderAdapter,
  landingPageInputToBrief,
} from "@/lib/ai-core/adapters/landing-page-builder";

export type {
  ProductEngineAdapter,
  LayerRunnerInput,
  LayerRunnerResult,
} from "@/lib/ai-core/adapter";

export {
  LayerRunner,
  layerRunner,
  type LayerRunnerOptions,
} from "@/lib/ai-core/layers/runner";

export type {
  CoreAssetItem,
  CoreAssetManifest,
  CoreAssetRole,
  CoreAssetStatus,
  CoreBrief,
  CoreBusinessProfile,
  CoreContentStrategy,
  CoreDesignColorTokens,
  CoreDesignStylePreset,
  CoreDesignSystem,
  CoreDesignTypography,
  CoreLayerArtifacts,
  CoreLayerFlags,
  CoreLayerName,
  CoreProductStrategy,
  CoreProgressEvent,
  CoreQualityDimension,
  CoreQualityDimensionName,
  CoreQualityReport,
  CoreRunMode,
  CoreRunStatus,
  CoreStrategyPage,
  CoreStrategySection,
} from "@/lib/ai-core/layers/types";

export {
  coreAssetManifestSchema,
  coreBusinessProfileSchema,
  coreDesignSystemSchema,
  coreProductStrategySchema,
  coreQualityReportSchema,
} from "@/lib/ai-core/layers/schemas";

export {
  registerProductEngineAdapter,
  getProductEngineAdapter,
  listProductEngineAdapters,
  clearProductEngineAdaptersForTests,
} from "@/lib/ai-core/registry";

export {
  AIGenerationEngine,
  aiGenerationEngine,
  providerManager,
  getAIProvider,
  resolveAvailableProvider,
  isProviderConfigured,
  generateJsonWithValidation,
  generateWithValidation,
  createProgressTracker,
  createUsageTracker,
  emptyTokenUsage,
  type AIPlugin,
  type EngineRunOptions,
  type AIProvider,
  type AIProviderName,
  type ExportResult,
  type GeneratedProjectFile,
  type GenerationContext,
  type TokenUsage,
  type ValidationResult,
} from "@/lib/ai-core/runtime";
