/**
 * Website Builder Template Engine — server-only exports.
 *
 * Import from this module in API routes, loaders, and server utilities.
 * Never import from Client Components.
 */

export * from "@/lib/website/template-engine/index";

export { resolveWbTemplatesRoot } from "@/lib/website/template-engine/constants.server";

export {
  validateWbTemplatePackage,
  loadValidatedWbTemplatePackage,
} from "@/lib/website/template-engine/spec/server";
export type { ValidateWbTemplatePackageOptions } from "@/lib/website/template-engine/spec/server";

export {
  WbTemplateRegistry,
  getWbTemplateRegistry,
  resetWbTemplateRegistry,
} from "@/lib/website/template-engine/registry";

export {
  loadWbTemplatePackages,
  loadWbTemplatePackageById,
} from "@/lib/website/template-engine/loader";
export type { WbTemplateLoaderOptions } from "@/lib/website/template-engine/loader";

export {
  renderWbTemplate,
  buildWbTemplateRenderStyles,
} from "@/lib/website/template-engine/renderer";

export {
  buildWbTemplatePreviewDocument,
  buildWbTemplateEmptyPreviewDocument,
} from "@/lib/website/template-engine/preview";

export {
  WbTemplateEngine,
  createWbTemplateEngine,
  getWbTemplateEngine,
  initializeWbTemplateEngine,
} from "@/lib/website/template-engine/engine";
export type { WbTemplateEngineOptions } from "@/lib/website/template-engine/engine";
