export type {
  ImageDesignModel,
  ImageRasterAsset,
  BrandKitContext,
  DesignTemplateDefinition,
  DesignProjectRecord,
  DesignAssetRecord,
  DesignGenerationRecord,
  ImageAssetFormat,
  ImageGenerationStatus,
} from "@/lib/ai-core/image-design-platform/types";

export {
  ImageDesignEngine,
  imageDesignEngine,
  type ImageEngineResult,
  type ImageEngineOptions,
} from "@/lib/ai-core/image-design-platform/engine";

export {
  outputToModel,
  modelToBlueprint,
  blueprintToModel,
  enrichInputWithBrand,
  brandTokensToContext,
} from "@/lib/ai-core/image-design-platform/model";

export {
  generateRasterImage,
  listAvailableProviders,
  isRasterGenerationAvailable,
  mapAspectRatio,
  mapStylePreset,
} from "@/lib/ai-core/image-design-platform/providers";

export { generateRasterAssets } from "@/lib/ai-core/image-design-platform/pipeline";

export {
  applyQualityToModel,
  validateImageModel,
  validateImageOutput,
} from "@/lib/ai-core/image-design-platform/quality";

export {
  applyBrandIdentityTokens,
  buildBrandPromptSuffix,
} from "@/lib/ai-core/image-design-platform/brand";

export {
  DESIGN_STUDIO_TEMPLATES,
  listDesignTemplates,
  getDesignTemplate,
  recommendDesignTemplates,
} from "@/lib/ai-core/image-design-platform/templates";

export {
  saveDesignAssets,
  saveDesignGeneration,
  ensureDesignProject,
} from "@/lib/ai-core/image-design-platform/assets";

export {
  uploadDesignAsset,
  deleteDesignAsset,
  DESIGN_STUDIO_BUCKET,
} from "@/lib/ai-core/image-design-platform/storage";

export {
  buildExportManifest,
  assetToBuffer,
  type ExportFormat,
} from "@/lib/ai-core/image-design-platform/export";

export {
  buildImageDesignHealthReport,
  type ImageDesignHealthReport,
} from "@/lib/ai-core/image-design-platform/health";

export { createId } from "@/lib/ai-core/image-design-platform/ids";
