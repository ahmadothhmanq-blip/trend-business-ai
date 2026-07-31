/**
 * Website Builder Template Engine — client-safe exports.
 *
 * Types, constants, and schema helpers only. No filesystem or Node built-ins.
 * Server runtime APIs live in `index.server.ts`.
 */

export {
  WB_TEMPLATE_ENGINE_VERSION,
  WB_TEMPLATES_DIR_SEGMENT,
  WB_TEMPLATES_RELATIVE_PATH,
} from "@/lib/website/template-engine/constants";

export {
  wbTemplateManifestSchema,
  parseWbTemplateManifest,
  safeParseWbTemplateManifest,
  manifestFileName,
} from "@/lib/website/template-engine/manifest";
export type { WbTemplateManifestInput } from "@/lib/website/template-engine/manifest";

export * from "@/lib/website/template-engine/spec";

export type {
  WbTemplateId,
  WbTemplateLayoutKind,
  WbTemplateResponsiveSpec,
  WbTemplateManifest,
  WbTemplatePackage,
  WbTemplateRegistryEntry,
  WbTemplateListItem,
  WbTemplateRenderContext,
  WbTemplateRenderResult,
  WbTemplatePreviewDocument,
  WbTemplateEngineStatus,
  WbTemplateLoadReport,
  WbTemplateLoadError,
} from "@/lib/website/template-engine/types";
