import { WB_TEMPLATE_MANIFEST_FILENAME } from "@/lib/website/template-engine/spec/constants";

/**
 * @deprecated Use `@/lib/website/template-engine/spec` for package manifest parsing.
 */
export {
  wbTemplatePackageManifestSchema as wbTemplateManifestSchema,
  parseWbTemplatePackageManifest as parseWbTemplateManifest,
  safeParseWbTemplatePackageManifest as safeParseWbTemplateManifest,
} from "@/lib/website/template-engine/spec/schema";

export { WB_TEMPLATE_MANIFEST_FILENAME };

export function manifestFileName(): string {
  return WB_TEMPLATE_MANIFEST_FILENAME;
}

export type { WbTemplatePackageManifestInput as WbTemplateManifestInput } from "@/lib/website/template-engine/spec/schema";
