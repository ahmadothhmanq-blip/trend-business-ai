export type {
  BrandIdentityModel,
  BrandStrategyModel,
  BrandPositioningModel,
  BrandVoiceModel,
  BrandLogoDirectionModel,
  BrandLogoConcept,
  BrandLogoVariant,
  BrandKitTokens,
  BrandTemplateDefinition,
  BrandAssistantResult,
  BrandKitRecord,
  BrandAssetRecord,
  BrandApplyTarget,
  BrandApplyPayload,
} from "@/lib/ai-core/brand-studio/types";

export {
  brandOutputToModel,
  modelToBlueprint,
  blueprintToModel,
  mergeModel,
  buildKitTokens,
} from "@/lib/ai-core/brand-studio/model";

export {
  BrandIdentityEngine,
  brandIdentityEngine,
  type BrandEngineResult,
  type BrandEngineOptions,
} from "@/lib/ai-core/brand-studio/engine";

export {
  validateBrandOutput,
  validateBrandModel,
  applyQualityToModel,
  type BrandQualityReport,
} from "@/lib/ai-core/brand-studio/quality";

export {
  generateBrandLogos,
  buildLogoVariants,
} from "@/lib/ai-core/brand-studio/logos";

export {
  BRAND_STUDIO_TEMPLATES,
  listBrandTemplates,
  getBrandTemplate,
  recommendTemplates,
} from "@/lib/ai-core/brand-studio/templates";

export { runBrandAssistant } from "@/lib/ai-core/brand-studio/assistant";

export {
  buildBrandApplyPayload,
  applyBrandKit,
  toWebsiteBuilderTokens,
  toAppBuilderTokens,
  toVideoStudioTokens,
} from "@/lib/ai-core/brand-studio/apply";

export {
  saveBrandKit,
  saveBrandAssets,
  uploadBrandAssetToStorage,
  syncGenerationBlueprint,
} from "@/lib/ai-core/brand-studio/kit";

export {
  buildBrandGuidelinesMarkdown,
  buildExportManifest,
  buildBrandGuidelinesHtml,
} from "@/lib/ai-core/brand-studio/export";

export {
  buildBrandStudioHealthReport,
  type BrandStudioHealthReport,
} from "@/lib/ai-core/brand-studio/health";

export {
  resolveRegenerationDeliverables,
  sectionsForDeliverables,
} from "@/lib/ai-core/brand-studio/regeneration";

export { createId, createShareToken } from "@/lib/ai-core/brand-studio/ids";
