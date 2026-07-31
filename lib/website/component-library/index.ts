/**
 * Website Builder Component Library
 *
 * Composable, capability-oriented component system for website templates.
 * Independent from Theme System, Template Engine UI, AI, and legacy marketplaces.
 */

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
  WB_COMPONENT_CATEGORY_DEFINITIONS,
  getComponentCategoryDefinition,
  listComponentCategories,
} from "@/lib/website/component-library/categories";
export type { WbComponentCategoryDefinition } from "@/lib/website/component-library/categories";

export {
  WB_COMPONENT_CAPABILITY_DEFINITIONS,
  getComponentCapabilityDefinition,
  listComponentCapabilities,
  isPrimitiveCapability,
  isComposableCapability,
} from "@/lib/website/component-library/capabilities";
export type { WbComponentCapabilityDefinition } from "@/lib/website/component-library/capabilities";

export {
  wbComponentManifestSchema,
  parseWbComponentManifest,
  safeParseWbComponentManifest,
  validateWbComponentPackage,
  loadValidatedWbComponentPackage,
  resolveWbComponentsRoot,
  manifestFileName,
} from "@/lib/website/component-library/spec";
export type {
  WbComponentManifestInput,
  ValidateWbComponentPackageOptions,
} from "@/lib/website/component-library/spec";

export {
  validateComponentComposition,
  validateComposableManifestConsistency,
} from "@/lib/website/component-library/composition";

export { validateComponentConstraints } from "@/lib/website/component-library/constraints";

export {
  buildAbstractRenderTree,
  assertRendererContract,
  assertResolvedRendererContract,
  describeRendererContract,
} from "@/lib/website/component-library/contracts/renderer";
export type {
  WbComponentRenderTreeNode,
  WbComponentRenderContractContext,
} from "@/lib/website/component-library/contracts/renderer";

export {
  WbComponentRegistry,
  getWbComponentRegistry,
  resetWbComponentRegistry,
} from "@/lib/website/component-library/registry";

export {
  loadWbComponentPackages,
  loadWbComponentPackageById,
  getWbComponentLibraryStatus,
} from "@/lib/website/component-library/loader";
export type { WbComponentLoaderOptions } from "@/lib/website/component-library/loader";

export type {
  WbComponentId,
  WbComponentCategory,
  WbComponentCapability,
  WbComponentSlotKind,
  WbComponentVariantStyle,
  WbComponentResponsiveMode,
  WbComponentEditableKind,
  WbComponentRendererOutput,
  WbComponentManifest,
  WbComponentFileRef,
  WbComponentRendererRef,
  WbComponentPropField,
  WbComponentPropsSchemaDocument,
  WbComponentSlotDefinition,
  WbComponentSlotsDocument,
  WbComponentVariantDefinition,
  WbComponentVariantsDocument,
  WbComponentResponsiveRule,
  WbComponentResponsiveDocument,
  WbComponentEditableProperty,
  WbComponentEditablePropertiesDocument,
  WbComponentValidationRule,
  WbComponentValidationDocument,
  WbComponentRendererContractDocument,
  WbComponentCompositionNode,
  WbComponentCompositionDocument,
  WbComponentConstraintRule,
  WbComponentConstraintsDocument,
  WbComponentRegistryEntry,
  WbComponentListItem,
  WbComponentResolvedPackage,
  WbComponentValidationIssue,
  WbComponentPackageValidationResult,
  WbComponentCompositionValidationResult,
  WbComponentLibraryStatus,
  WbComponentLoadReport,
} from "@/lib/website/component-library/types";
