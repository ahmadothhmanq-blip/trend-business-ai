/**
 * Website Builder v1 — frozen production baseline.
 *
 * Bump WEBSITE_BUILDER_V1_VERSION when intentionally changing frozen surfaces.
 * Run `npm run qa:website-builder:update-golden` after approved visual changes.
 */

export const WEBSITE_BUILDER_V1_VERSION = "1.0.0" as const;
export const WEBSITE_BUILDER_V1_FROZEN_AT = "2026-08-05" as const;
export const WEBSITE_BUILDER_V1_MIN_MARKETPLACE_SCORE = 95;
export const WEBSITE_BUILDER_V1_MIN_VISUAL_OVERALL = 90;

/** Ten flagship V2 template packages — frozen at v1. */
export const FROZEN_FLAGSHIP_PACKAGE_IDS = [
  "saas-enterprise",
  "corporate-business",
  "restaurant-premium",
  "ecommerce-premium",
  "medical-premium",
  "real-estate-premium",
  "creative-agency-premium",
  "education-premium",
  "finance-premium",
  "hotel-resort-premium",
] as const;

export type FrozenFlagshipPackageId = (typeof FROZEN_FLAGSHIP_PACKAGE_IDS)[number];

/** Image Engine — centralized slot/profile pipeline (frozen at v1). */
export const FROZEN_IMAGE_ENGINE_MODULES = [
  "lib/ai-core/image-engine/engine.ts",
  "lib/ai-core/image-engine/inject.ts",
  "lib/ai-core/image-engine/profile-engine.ts",
  "lib/ai-core/image-engine/slot-validator.ts",
  "lib/ai-core/image-engine/slots.ts",
  "lib/ai-core/image-engine/optimize.ts",
  "lib/ai-core/image-engine/profiles/data.ts",
  "lib/ai-core/image-engine/profiles/index.ts",
  "lib/ai-core/image-engine/profiles/types.ts",
  "lib/website/image-management/validate-before-render.ts",
  "lib/website/image-management/service.ts",
  "lib/site-images.ts",
] as const;

/** Template Architecture V2 — router, preview, TBDP (frozen at v1). */
export const FROZEN_V2_ARCHITECTURE_MODULES = [
  "lib/website/template-v2/router/resolve-template-architecture.ts",
  "lib/website/template-v2/preview/v2-preview-document.ts",
  "lib/website/template-v2/preview/v2-preview-compiler.ts",
  "lib/website/template-v2/preview/v2-preview-input.ts",
  "lib/website/template-v2/generation/v2-generation-bridge.ts",
  "lib/website/template-v2/inject/inject-v2-pipeline.ts",
  "lib/website/build-static-preview.server.ts",
] as const;

/** Generation pipeline entry points (frozen at v1). */
export const FROZEN_GENERATION_PIPELINE_MODULES = [
  "lib/website/builder/apply-structure-template.ts",
  "lib/website/template-v2/apply/apply-v2-template.ts",
  "plugins/website/generate.ts",
  "plugins/website/file-generation-loop.ts",
  "lib/website/template-v2/generation/v2-generation-bridge.ts",
] as const;

/** Template registry and catalog (frozen at v1). */
export const FROZEN_REGISTRY_MODULES = [
  "lib/website/builder/template-package-index.ts",
  "lib/website/builder/resolve-builder-template-package-id.ts",
  "lib/website/builder/template-package-ti-mapping.ts",
  "lib/website/builder/validate-template-registry.test.ts",
  "scripts/sync-flagship-registry.mjs",
] as const;

/** Design token emission (frozen at v1). */
export const FROZEN_DESIGN_TOKEN_MODULES = [
  "lib/website/template-v2/tokens/emit-design-tokens.ts",
  "lib/website/template-v2/tokens/emit-site-images.ts",
] as const;

export const FROZEN_MODULE_PATHS = [
  ...FROZEN_IMAGE_ENGINE_MODULES,
  ...FROZEN_V2_ARCHITECTURE_MODULES,
  ...FROZEN_GENERATION_PIPELINE_MODULES,
  ...FROZEN_REGISTRY_MODULES,
  ...FROZEN_DESIGN_TOKEN_MODULES,
] as const;
