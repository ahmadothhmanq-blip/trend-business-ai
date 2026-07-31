import "server-only";

/**
 * Server-only Website Builder exports.
 * Import from this module in API routes and server utilities — never from Client Components.
 */
export {
  listInstalledTemplateCatalogItems,
  listWebsiteStructureTemplatesFromEngine,
  getWebsiteStructureTemplateFromEngine,
  getWebsiteStructureTemplateChoiceFromEngine,
} from "@/lib/website/builder/installed-template-catalog.server";

export {
  getActiveBuilderTemplateRuntimeModel,
  getActiveBuilderTemplateRuntimeMeta,
  setActiveBuilderTemplateRuntime,
  clearActiveBuilderTemplateRuntime,
  runBuilderTemplateRuntimeSession,
  runBuilderTemplateRuntimeSessionSync,
} from "@/lib/website/builder/builder-template-runtime-session.server";
