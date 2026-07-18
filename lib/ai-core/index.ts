/**
 * AI Core Engine — Phase 8: SEO + Performance + Auto Quality.
 *
 * Pipeline: Template → Idea → Strategy → Design System → Assets → Generation
 *           → Quality Check → SEO → Performance → Finalize (Ready to Publish)
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

export {
  INDUSTRY_PROFILES,
  INDUSTRY_IDS,
  getIndustryProfile,
  listIndustryProfiles,
  isIndustryId,
  selectIndustryTemplate,
  enrichBriefWithIndustryTemplate,
  getTemplateSelectionFromBrief,
  type IndustryId,
  type IndustryProfile,
  type LayoutStyle,
  type TemplateDesignPreset,
  type TemplateSelection,
} from "@/lib/ai-core/templates";

export {
  DESIGN_PRESETS,
  DESIGN_PRESET_IDS,
  getDesignPreset,
  normalizeDesignPreset,
  buildAiDesignSystemFromStrategy,
  aiDesignSystemToCore,
  mergeCoreDesignWithAiDecisions,
  type AiDesignSystem,
  type DesignPresetId,
  type DesignColorPalette,
  type DesignTypographySystem,
  type DesignSpacingSystem,
  type DesignUiStyle,
  type DesignComponentStyle,
  type DesignAnimationStyle,
  type BuildAiDesignSystemInput,
} from "@/lib/ai-core/design-system";

export {
  planCoreAssets,
  generateCoreAssets,
  generateRealisticImage,
  isImageProviderConfigured,
  coreAssetManifestSummary,
  type AssetKind,
  type CoreAssetPlanItem,
  type GenerateCoreAssetsParams,
} from "@/lib/ai-core/assets";

export {
  buildSeoPackageFromStrategy,
  seoPackageToSerializable,
  checkSeoReadiness,
  withSeoReadiness,
  injectSeoArtifacts,
  type CoreSeoPackage,
  type CoreSeoMetadata,
  type CoreOpenGraphData,
  type CoreStructuredDataItem,
  type CoreSitemapEntry,
  type CoreSeoReadiness,
  type BuildSeoPackageInput,
} from "@/lib/ai-core/seo";

export {
  runPerformanceChecks,
  type CorePerformanceReport,
  type CorePerformanceCheck,
  type CorePerformanceCheckName,
  type RunPerformanceChecksInput,
} from "@/lib/ai-core/performance";

export {
  buildAutoQualityReport,
  finalizeQualityForPublish,
  type CoreAutoQualityReport,
  type CorePublishReadiness,
  type BuildAutoQualityReportInput,
} from "@/lib/ai-core/quality";

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
  CoreDesignAnimationStyle,
  CoreDesignColorTokens,
  CoreDesignComponentStyle,
  CoreDesignSpacingSystem,
  CoreDesignStylePreset,
  CoreDesignSystem,
  CoreDesignUiStyle,
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
  corePerformanceReportSchema,
  coreProductStrategySchema,
  coreQualityReportSchema,
  coreSeoPackageSchema,
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
