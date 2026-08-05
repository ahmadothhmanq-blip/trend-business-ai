/**
 * TBDP Phase 5 — Integration Layer
 *
 * Official bridge between Website Builder, Template Engine, and TBDP.
 * Additive only — V1/V2 templates and builder behavior remain unchanged.
 */

export {
  TBDP_INTEGRATION_PHASE,
  TBDP_INTEGRATION_VERSION,
  TBDP_PROJECT_SETTING_SECTOR_DNA_ID,
  TBDP_PROJECT_SETTING_DESIGN_CONTEXT_HASH,
  TBDP_PROJECT_SETTING_INTEGRATION_VERSION,
} from "@/lib/design-platform/integration/constants";

export * from "@/lib/design-platform/integration/core";
export * from "@/lib/design-platform/integration/industry-map";
export * from "@/lib/design-platform/integration/language-bridge";
export * from "@/lib/design-platform/integration/theme-resolver";
export { resolveDesignContext } from "@/lib/design-platform/integration/design-resolver";
export { resolveTemplateDesign } from "@/lib/design-platform/integration/template-resolver";
export * from "@/lib/design-platform/integration/bridges";
export {
  TbdpBuilderLifecycle,
  tbdpBuilderLifecycle,
  runTbdpLifecyclePhase,
} from "@/lib/design-platform/integration/lifecycle";
export type { TbdpLifecycleHandler } from "@/lib/design-platform/integration/lifecycle";
export * from "@/lib/design-platform/integration/schema";
export * from "@/lib/design-platform/integration/validation";
