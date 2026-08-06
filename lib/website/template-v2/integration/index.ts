export {
  WB_WEBSITE_BLUEPRINT_SETTING,
  WB_DESIGN_DIRECTOR_REPORT_SETTING,
  WB_PRODUCTION_INTEGRATION_VERSION_SETTING,
  PRODUCTION_INTEGRATION_VERSION,
  isProductionBlueprintEnabled,
} from "@/lib/website/template-v2/integration/constants";

export {
  PACKAGE_BLUEPRINT_DEFAULTS,
  resolveBlueprintInputFromGeneration,
  type ResolveBlueprintInputParams,
} from "@/lib/website/template-v2/integration/blueprint-input";

export {
  resolveBlueprintRegionPlan,
  getVariantForComponent,
  type BlueprintRegionPlan,
} from "@/lib/website/template-v2/integration/section-component-map";

export {
  applyBlueprintToBundle,
  buildBlueprintDesignCss,
} from "@/lib/website/template-v2/integration/apply-blueprint-design";

export {
  runProductionDesignPipeline,
  resolveProductionBlueprint,
  readPersistedBlueprint,
  type ProductionPipelineResult,
  type ProductionPipelineParams,
  type ResolveProductionBlueprintParams,
} from "@/lib/website/template-v2/integration/production-pipeline";
