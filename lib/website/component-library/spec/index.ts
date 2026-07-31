export {
  WB_COMPONENT_LIBRARY_SPEC_VERSION,
  WB_COMPONENT_RENDERER_CONTRACT_VERSION,
  WB_COMPONENT_MANIFEST_FILENAME,
  WB_COMPONENTS_RELATIVE_PATH,
  WB_COMPONENT_PACKAGE_DIRS,
  WB_COMPONENT_CATEGORIES,
  WB_COMPONENT_CAPABILITIES,
  WB_COMPONENT_SLOT_KINDS,
  WB_COMPONENT_VARIANT_STYLES,
  WB_COMPONENT_RESPONSIVE_MODES,
  WB_COMPONENT_EDITABLE_KINDS,
  WB_COMPONENT_RENDERER_OUTPUTS,
} from "@/lib/website/component-library/constants";

export {
  wbComponentManifestSchema,
  wbComponentPropsSchemaDocumentSchema,
  wbComponentSlotsDocumentSchema,
  wbComponentVariantsDocumentSchema,
  wbComponentResponsiveDocumentSchema,
  wbComponentEditablePropertiesDocumentSchema,
  wbComponentValidationDocumentSchema,
  wbComponentRendererContractDocumentSchema,
  wbComponentCompositionDocumentSchema,
  wbComponentConstraintsDocumentSchema,
  parseWbComponentManifest,
  safeParseWbComponentManifest,
} from "@/lib/website/component-library/spec/schema";
export type { WbComponentManifestInput } from "@/lib/website/component-library/spec/schema";

export {
  validateWbComponentPackage,
  loadValidatedWbComponentPackage,
  resolveWbComponentsRoot,
  manifestFileName,
} from "@/lib/website/component-library/spec/validate-component";
export type { ValidateWbComponentPackageOptions } from "@/lib/website/component-library/spec/validate-component";
