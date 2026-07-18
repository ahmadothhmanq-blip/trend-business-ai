/**
 * AI Core Engine — Phase 5: unified registry + /api/ai-core/runs.
 *
 * Layer pipeline: Idea → Strategy → Design → Assets → Generation → Quality → Finalize
 * Runtime: existing AIGenerationEngine + ProviderManager (re-exported).
 */

import "@/lib/ai-core/adapters/website-builder";
import "@/lib/ai-core/adapters/webapp-builder";
import "@/lib/ai-core/adapters/landing-page-builder";
import "@/lib/ai-core/adapters/brand-designer";
import "@/lib/ai-core/adapters/content-studio";
import "@/lib/ai-core/adapters/video-studio";
import "@/lib/ai-core/adapters/marketing-ai";

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

export {
  BRAND_DESIGNER_PRODUCT_ID,
  createBrandDesignerAdapter,
  brandInputToBrief,
} from "@/lib/ai-core/adapters/brand-designer";

export {
  CONTENT_STUDIO_PRODUCT_ID,
  createContentStudioAdapter,
  contentInputToBrief,
} from "@/lib/ai-core/adapters/content-studio";

export {
  VIDEO_STUDIO_PRODUCT_ID,
  createVideoStudioAdapter,
  videoInputToBrief,
} from "@/lib/ai-core/adapters/video-studio";

export {
  MARKETING_AI_PRODUCT_ID,
  createMarketingAiAdapter,
  marketingInputToBrief,
} from "@/lib/ai-core/adapters/marketing-ai";

export {
  AI_CORE_PRODUCTS,
  resolveAiCoreProduct,
  listAiCoreProducts,
  isAiCoreProductId,
  createAdapterForProduct,
  type AiCoreProductId,
  type AiCoreProductDefinition,
} from "@/lib/ai-core/products";

export {
  buildCoreBrief,
  type AiCoreRunRequestBody,
} from "@/lib/ai-core/brief-builder";

export {
  executeAiCoreRun,
  continueAiCoreRun,
  getAiCoreRun,
  type AiCoreRunExecuteResult,
} from "@/lib/ai-core/runs/service";

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
