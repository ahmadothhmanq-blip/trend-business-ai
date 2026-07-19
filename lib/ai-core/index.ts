/**
 * AI Core Engine — Phase 8+: SEO + Performance + Auto Quality + Conversion.
 *
 * Pipeline: Template → Idea → Strategy → Design System → Assets → Generation
 *           → Quality Check → SEO → Performance → Finalize
 *           (Conversion + SEO/Performance quality reports before publish)
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
  WEBSITE_INDUSTRY_INTELLIGENCE,
  PRIMARY_WEBSITE_INDUSTRIES,
  getWebsiteIndustryIntelligence,
  listWebsiteIndustryIntelligence,
  listPrimaryWebsiteIndustryIntelligence,
  detectWebsiteIndustry,
  applyIndustryIntelligenceToBrief,
  getIndustryDetectionFromBrief,
  type WebsiteIndustryIntelligence,
  type IndustryDetectionResult,
} from "@/lib/ai-core/industry-intelligence";

export {
  selectPremiumTemplate,
  applyPremiumTemplateToBrief,
  configurePremiumTemplate,
  PREMIUM_TEMPLATE_CATALOG,
  listPremiumTemplates,
  getPremiumTemplate,
  isPremiumTemplateId,
  premiumTemplateForIndustry,
  type PremiumTemplateId,
  type PremiumTemplateDefinition,
  type ConfiguredPremiumTemplate,
  type PremiumContentStrategy,
} from "@/lib/ai-core/premium-templates";

export {
  MARKETPLACE_CATEGORIES,
  MARKETPLACE_TEMPLATES,
  MARKETPLACE_STYLE_VARIATIONS,
  listMarketplaceTemplates,
  getMarketplaceTemplate,
  recommendMarketplaceTemplates,
  resolveMarketplaceSelection,
  buildMarketplacePreviewHtml,
  marketplaceStyleLabel,
  type MarketplaceTemplate,
  type MarketplaceCategory,
  type MarketplaceRecommendResult,
  type MarketplaceStyleVariation,
} from "@/lib/ai-core/template-marketplace";

export {
  renderWebsiteDesign,
  INDUSTRY_DESIGN_PRESETS,
  getIndustryDesignPreset,
  DESIGN_RENDERER_COMPONENTS,
  type DesignRenderPlan,
  type DesignRendererResult,
  type DesignRendererComponentId,
} from "@/lib/ai-core/design-renderer";

export {
  DESIGN_PRESETS,
  DESIGN_PRESET_IDS,
  getDesignPreset,
  listDesignPresets,
  normalizeDesignPreset,
  buildAiDesignSystemFromStrategy,
  generateDesignSystem,
  persistGeneratedDesign,
  aiDesignSystemToCore,
  mergeCoreDesignWithAiDecisions,
  buildPremiumDesignSystem,
  applyPremiumDesignToCore,
  listPremiumStyles,
  type AiDesignSystem,
  type DesignPresetId,
  type DesignColorPalette,
  type DesignTypographySystem,
  type DesignSpacingSystem,
  type DesignUiStyle,
  type DesignComponentStyle,
  type DesignAnimationStyle,
  type PremiumDesignSystem,
  type PremiumStyleId,
  type BuildAiDesignSystemInput,
  type GenerateDesignSystemInput,
  type GenerateDesignSystemResult,
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
  runAiImageEngine,
  planWebsiteImages,
  buildImageIntelligence,
  buildImageArtDirection,
  buildArtDirectionMap,
  injectAiImagesIntoProject,
  ensureRequiredPhotoAssets,
  hasPublishableHeroImage,
  preferAiImages,
  resolveImageEngineStyle,
  resolvePremiumStockUrl,
  isPremiumStockUrl,
  validateAssetManifest,
  assertPublishableAssets,
  prepareVideoAssets,
  buildSiteVideoModule,
  type ImagePurpose,
  type ImageAssetMetadata,
  type ImageEnginePlanItem,
  type ImageIntelligenceContext,
  type ImageArtDirection,
  type AssetQualityReport,
  type AssetQualityIssue,
  type VideoAssetPackage,
  type VideoAssetBrief,
} from "@/lib/ai-core/image-engine";

export {
  selectProfessionalComponents,
  injectProfessionalComponents,
  hasProfessionalScaffold,
  composeHomePage,
  resolveWebsiteGoal,
  PROFESSIONAL_COMPONENT_CATALOG,
  getCatalogEntry,
  type SectionKind,
  type HeroVariant,
  type NavVariant,
  type WebsiteGoal,
  type ProfessionalComponentDefinition,
  type ComponentSelectionContext,
  type ComponentSelectionResult,
} from "@/lib/ai-core/components";

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
  runWebsiteOptimizer,
  shouldApplyOptimizerFixes,
  runHeuristicWebsiteAudit,
  computeWebsiteQualityScore,
  type WebsiteQualityScore,
  type WebsiteAuditResult,
  type WebsiteOptimizationReport,
  type RunWebsiteOptimizerResult,
  type RunWebsiteOptimizerParams,
} from "@/lib/ai-core/optimizer";

export {
  runConversionOptimization,
  mergeConversionIntoOptimizerReport,
  conversionPublishChecklist,
  detectConversionGoal,
  getIndustryConversionRules,
  analyzeConversion,
  type ConversionGoal,
  type ConversionOptimizationReport,
  type ConversionRecommendation,
  type IndustryConversionRule,
} from "@/lib/ai-core/conversion";

export {
  trackAnalyticsEvent,
  buildWebsiteAnalyticsSummary,
  ensureSeededAnalytics,
  type WebsiteAnalyticsSummary,
  type WebsiteAnalyticsEvent,
  type TrackAnalyticsInput,
} from "@/lib/ai-core/analytics";

export {
  createExperiment,
  listExperiments,
  listExperimentResults,
  evaluateExperimentResults,
  assignVariant,
  type WebsiteExperiment,
  type ExperimentResults,
  type CreateExperimentInput,
} from "@/lib/ai-core/ab-testing";

export {
  runConversionOptimizer,
  type ConversionOptimizerReport,
  type ConversionInsight,
  type RunConversionOptimizerParams,
} from "@/lib/ai-core/conversion-optimizer";

export {
  runSeoAnalysis,
  type SeoAnalysisReport,
  type SeoIssue,
  type RunSeoAnalysisParams,
} from "@/lib/ai-core/seo-analysis";

export {
  runSeoOptimizer,
  applySeoPackageFix,
  getSeoFix,
  type SeoOptimizerResult,
  type SeoFix,
  type SeoGeneratedAssets,
} from "@/lib/ai-core/seo-optimizer";

export {
  runSeoAgent,
  syncKeywordTracking,
  getKeywordTracking,
  type SeoAgentReport,
  type AiSearchOptimization,
  type KeywordTrackingPoint,
  type RunSeoAgentParams,
} from "@/lib/ai-core/seo-agent";

export {
  buildPublishingSummary,
  runPublishingAction,
  getPublicationForGeneration,
  mapLifecycleStatus,
  type PublishingSummary,
  type PublishingLifecycleStatus,
  type PublishEngineAction,
} from "@/lib/ai-core/publishing";

export {
  validateCustomHostname,
  addCustomDomain,
  verifyWebsiteDomain,
  resolveHostToSlug,
  buildSubdomainUrl,
  type WebsiteDomain,
  type DnsRecordInstruction,
} from "@/lib/ai-core/domains";

export {
  buildDeploymentDashboard,
  recordDeploymentEvent,
  listDeploymentHistory,
  type DeploymentDashboard,
  type DeploymentHistoryEvent,
} from "@/lib/ai-core/deployment";

export {
  runSeoPerformanceEngine,
  mergeSeoPerformanceIntoOptimizerReport,
  seoPerformancePublishChecklist,
  analyzeSeoPerformance,
  buildKeywordPlan,
  analyzeHeadingStructure,
  type SeoPerformanceReport,
  type SeoPerformanceRecommendation,
  type KeywordPlan,
  type SeoPerformanceScores,
} from "@/lib/ai-core/seo-performance";

export {
  buildIndustryCopyPack,
  enrichStrategyWithIndustryCopy,
  industryContentForPreview,
  type IndustryCopyPack,
} from "@/lib/ai-core/content";

export {
  runBrandIdentityIntelligence,
  analyzeBrandIdentity,
  analyzeBrandStrategy,
  selectBrandPreset,
  getBrandPreset,
  listBrandPresets,
  normalizeBrandPresetId,
  brandIdentityPlanSeeds,
  applyBrandIdentityToDesignSystem,
  applyBrandIdentityToDesignPlan,
  buildLogoDirection,
  BRAND_PRESET_IDS,
  type BrandIdentityBrief,
  type BrandPresetId,
  type BrandStrategyBrief,
  type BrandLogoDirection,
  type BrandColorSystem,
  type BrandTypographySystem,
} from "@/lib/ai-core/brand-identity";

export {
  runDesignIntelligence,
  analyzeDesignIntelligence,
  selectWebsiteLayout,
  resolveLayoutIndustryKey,
  type DesignIntelligenceBrief,
  type LayoutVariationId,
  type LayoutSelectionResult,
} from "@/lib/ai-core/design-intelligence";

export {
  runDesignPlanningPhase,
  runDesignPlanningPhaseWithBrand,
  assertDesignPlanApproved,
  buildVisualDesignPlan,
  applyDesignPlanToStrategy,
  applyDesignPlanToDesignSystem,
  designPlanSectionLabels,
  designPlanRequiredImageRoles,
} from "@/lib/ai-core/design-plan";

export type {
  VisualDesignPlan,
  DesignPlanSection,
  DesignPlanImageRequirement,
  DesignPlanColorSystem,
  DesignPlanTypographySystem,
  DesignPlanStatus,
  RunDesignPlanningPhaseParams,
  DesignPlanningPhaseResult,
} from "@/lib/ai-core/design-plan";

export {
  runDesignCritic,
  mergeDesignCriticIntoOptimizerReport,
  analyzeDesignCritic,
  type DesignCriticReport,
  type DesignCriticFinding,
} from "@/lib/ai-core/design-critic";

export {
  runWebsiteEditor,
  suggestWebsiteImprovements,
  understandWebsite,
  parseWebsiteEditCommand,
  buildWebsiteImprovementSuggestions,
  type WebsiteEditResult,
  type WebsiteEditAction,
  type WebsiteUnderstanding,
  type WebsiteImprovementSuggestion,
  type WebsiteEditorSuggestionsReport,
} from "@/lib/ai-core/website-editor";

export {
  buildVisualDocument,
  createVisualHistory,
  documentToSaveActions,
  insertNode,
  insertMarketplaceComponent,
  moveNode,
  duplicateNode,
  deleteNode,
  VISUAL_EDITOR_CAPABILITIES,
  type VisualDocument,
  type VisualNode,
  type VisualViewport,
  type VisualEditorCapability,
} from "@/lib/ai-core/visual-editor";

export {
  COMPONENT_MARKETPLACE_CATEGORIES,
  COMPONENT_INDUSTRY_PACKS,
  COMPONENT_MARKETPLACE_CATALOG,
  COMPONENT_STYLE_VARIANTS,
  listMarketplaceComponents,
  getMarketplaceComponent,
  listComponentsByIndustry,
  buildComponentPreviewHtml,
  type MarketplaceComponent,
  type ComponentMarketplaceCategory,
  type ComponentIndustryPack,
} from "@/lib/ai-core/component-marketplace";

export {
  buildAutoQualityReport,
  finalizeQualityForPublish,
  type CoreAutoQualityReport,
  type CorePublishReadiness,
  type BuildAutoQualityReportInput,
} from "@/lib/ai-core/quality";

export {
  runFinalWebsiteQualityIntelligence,
  buildFinalWebsiteQualityReport,
  runWebsiteQualityAuditor,
  runFinalSeoReview,
  computeFinalWebsiteScores,
  isFinalPublishReady,
  buildFinalImprovementActions,
  finalActionsToOptimizeThemes,
  finalActionsToEditorActions,
  finalQualityPublishChecklist,
  type FinalWebsiteQualityReport,
  type FinalWebsiteScores,
  type FinalImprovementAction,
  type FinalQualityFinding,
  type FinalQualityPublishChecklist,
} from "@/lib/ai-core/final-quality";

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
