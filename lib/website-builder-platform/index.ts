/**
 * Website Builder Platform — unified architecture enforcing business/design separation.
 */

export {
  BUSINESS_LAYER_VERSION,
  type BusinessBrandPack,
  type BusinessContactPack,
  type BusinessLayerInput,
  type BusinessNavigationPack,
  type BusinessPageSpec,
  type BusinessPageType,
  type BusinessSeoPack,
  type WebsiteBusinessPack,
} from "@/lib/website-builder-platform/contracts/business-layer";

export {
  DESIGN_LAYER_VERSION,
  type DesignComponentRef,
  type DesignLayerInput,
  type DesignTheme,
  type WebsiteDesignPack,
} from "@/lib/website-builder-platform/contracts/design-layer";

export {
  TEMPLATE_LAYER_VERSION,
  type SectionPropsMap,
  type SectionRole,
  type TemplateComponentProps,
  type TemplateMarketplaceEntry,
  type TemplateRenderContext,
  type TemplateRenderMode,
} from "@/lib/website-builder-platform/contracts/template-layer";

export {
  PLATFORM_PAGE_TYPES,
  PLATFORM_SECTION_COMPONENTS,
  type PlatformPageType,
} from "@/lib/website-builder-platform/contracts/component-registry";

export {
  runBusinessEngine,
  type RunBusinessEngineParams,
} from "@/lib/website-builder-platform/engines/business-engine";

export {
  runDesignEngine,
  type RunDesignEngineParams,
} from "@/lib/website-builder-platform/engines/design-engine";

export {
  runWebsiteBuilderPipeline,
  switchWebsiteTemplate,
  type PipelineStage,
  type PipelineStageResult,
  type WebsiteBuilderPipelineInput,
  type WebsiteBuilderPipelineResult,
} from "@/lib/website-builder-platform/pipeline/orchestrator";

export {
  validateTemplatePurity,
  type TemplatePurityReport,
  type TemplatePurityViolation,
} from "@/lib/website-builder-platform/validation/template-purity";

export {
  validateIdentityPreservation,
  type IdentityField,
  type IdentityPreservationReport,
} from "@/lib/website-builder-platform/validation/identity-preservation";
