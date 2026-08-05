/**
 * Template Architecture V2 — P0 foundation + P1 runtime.
 */

export {
  WB_TEMPLATE_ARCHITECTURE_VERSION_SETTING,
  WB_TEMPLATE_COMPOSER_ID_SETTING,
  WB_TEMPLATE_PRESENTATION_HASH_SETTING,
  WB_TEMPLATE_V2_ARCHITECTURE_VERSIONS,
  WB_TEMPLATE_V2_DEFAULT_COMPOSER,
  WB_TEMPLATE_V2_SDK_VERSION,
  WB_TEMPLATE_V2_SPEC_VERSION,
} from "@/lib/website/template-v2/constants";
export type { TemplateArchitectureVersion } from "@/lib/website/template-v2/constants";

export * from "@/lib/website/template-v2/contracts";
export * from "@/lib/website/template-v2/compatibility";
export * from "@/lib/website/template-v2/loader";
export * from "@/lib/website/template-v2/router";
export * from "@/lib/website/template-v2/sdk";
export * from "@/lib/website/template-v2/validation";
export { applyTemplateV2ToProject } from "@/lib/website/template-v2/apply/apply-v2-template";
export { composeRegionGridPage } from "@/lib/website/template-v2/composer/region-grid-composer";
export { injectV2TemplatePipeline } from "@/lib/website/template-v2/inject/inject-v2-pipeline";
export * from "@/lib/website/template-v2/generation/v2-generation-bridge";
export * from "@/lib/website/template-v2/tbdp";
