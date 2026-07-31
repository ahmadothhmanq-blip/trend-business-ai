import type {
  WB_COMPONENT_CAPABILITIES,
  WB_COMPONENT_CATEGORIES,
  WB_COMPONENT_EDITABLE_KINDS,
  WB_COMPONENT_RENDERER_OUTPUTS,
  WB_COMPONENT_RESPONSIVE_MODES,
  WB_COMPONENT_SLOT_KINDS,
  WB_COMPONENT_VARIANT_STYLES,
} from "@/lib/website/component-library/constants";

export type WbComponentCategory = (typeof WB_COMPONENT_CATEGORIES)[number];
export type WbComponentCapability = (typeof WB_COMPONENT_CAPABILITIES)[number];
export type WbComponentSlotKind = (typeof WB_COMPONENT_SLOT_KINDS)[number];
export type WbComponentVariantStyle = (typeof WB_COMPONENT_VARIANT_STYLES)[number];
export type WbComponentResponsiveMode = (typeof WB_COMPONENT_RESPONSIVE_MODES)[number];
export type WbComponentEditableKind = (typeof WB_COMPONENT_EDITABLE_KINDS)[number];
export type WbComponentRendererOutput = (typeof WB_COMPONENT_RENDERER_OUTPUTS)[number];

export type WbComponentId = string;

export type WbComponentFileRef = {
  file: string;
};

/** Root manifest for an installable component package. */
export type WbComponentManifest = {
  specVersion: string;
  id: WbComponentId;
  name: string;
  category: WbComponentCategory;
  capability: WbComponentCapability;
  version: string;
  description: string;
  composable: boolean;
  primitive: boolean;
  propsSchema: WbComponentFileRef;
  slots: WbComponentFileRef;
  variants: WbComponentFileRef;
  responsive: WbComponentFileRef;
  editableProperties: WbComponentFileRef;
  validation: WbComponentFileRef;
  renderer: WbComponentRendererRef;
  composition?: WbComponentFileRef;
  constraints?: WbComponentFileRef;
  compatibility: {
    libraryVersion: string;
    rendererContract: string;
  };
  tags?: string[];
};

export type WbComponentRendererRef = {
  contract: string;
  file: string;
};

/** JSON-schema-like prop field definition. */
export type WbComponentPropField = {
  type: "string" | "number" | "boolean" | "object" | "array";
  description?: string;
  default?: unknown;
  enum?: unknown[];
  items?: WbComponentPropField;
  properties?: Record<string, WbComponentPropField>;
  required?: string[];
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
};

export type WbComponentPropsSchemaDocument = {
  id: WbComponentId;
  version: string;
  properties: Record<string, WbComponentPropField>;
  required?: string[];
  additionalProperties?: boolean;
};

/** Slot definition — what a composable component can contain. */
export type WbComponentSlotDefinition = {
  id: string;
  label?: string;
  kind: WbComponentSlotKind;
  accepts: WbComponentCapability[];
  acceptsComponents?: WbComponentId[];
  optional?: boolean;
  minItems?: number;
  maxItems?: number;
  ordering?: "vertical" | "horizontal" | "grid" | "free";
  allowNesting?: boolean;
};

export type WbComponentSlotsDocument = {
  id: WbComponentId;
  slots: WbComponentSlotDefinition[];
};

export type WbComponentVariantDefinition = {
  id: string;
  label?: string;
  style?: WbComponentVariantStyle;
  description?: string;
  propOverrides?: Record<string, unknown>;
  className?: string;
  default?: boolean;
};

export type WbComponentVariantsDocument = {
  id: WbComponentId;
  variants: WbComponentVariantDefinition[];
};

export type WbComponentResponsiveRule = {
  breakpoint: string;
  mode: WbComponentResponsiveMode;
  target?: "component" | "slot";
  slotId?: string;
  value?: string | number | boolean;
};

export type WbComponentResponsiveDocument = {
  id: WbComponentId;
  rules: WbComponentResponsiveRule[];
};

export type WbComponentEditableProperty = {
  path: string;
  label: string;
  kind: WbComponentEditableKind;
  description?: string;
  group?: string;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
};

export type WbComponentEditablePropertiesDocument = {
  id: WbComponentId;
  properties: WbComponentEditableProperty[];
};

export type WbComponentValidationRule = {
  id: string;
  path?: string;
  rule: "required" | "minLength" | "maxLength" | "pattern" | "min" | "max" | "custom";
  value?: string | number | boolean;
  message: string;
};

export type WbComponentValidationDocument = {
  id: WbComponentId;
  rules: WbComponentValidationRule[];
};

/** Renderer contract — output shape agreement, not a connected renderer. */
export type WbComponentRendererContractDocument = {
  contractVersion: string;
  componentId: WbComponentId;
  output: WbComponentRendererOutput;
  rootElement: string;
  requiredAttributes: string[];
  slotRendering: "named-regions" | "child-tree";
  aria?: Record<string, string>;
  notes?: string;
};

/** Composition tree — how primitives assemble into composites. */
export type WbComponentCompositionNode = {
  slotId: string;
  componentId?: WbComponentId;
  capability?: WbComponentCapability;
  variantId?: string;
  children?: WbComponentCompositionNode[];
};

export type WbComponentCompositionDocument = {
  id: WbComponentId;
  description?: string;
  /** Example composition — documentation/default, not hardcoded runtime content. */
  example?: WbComponentCompositionNode[];
  allowedChildCapabilities?: WbComponentCapability[];
  allowedChildComponents?: WbComponentId[];
};

export type WbComponentConstraintRule = {
  id: string;
  description?: string;
  when: {
    variantId?: string;
    slotId?: string;
  };
  require?: {
    slots?: string[];
    props?: string[];
  };
  forbid?: {
    capabilities?: WbComponentCapability[];
    componentIds?: WbComponentId[];
  };
};

export type WbComponentConstraintsDocument = {
  id: WbComponentId;
  rules: WbComponentConstraintRule[];
};

export type WbComponentRegistryEntry = {
  id: WbComponentId;
  manifest: WbComponentManifest;
  package: WbComponentResolvedPackage;
};

export type WbComponentListItem = {
  id: WbComponentId;
  name: string;
  category: WbComponentCategory;
  capability: WbComponentCapability;
  version: string;
  description: string;
  composable: boolean;
  primitive: boolean;
  tags: string[];
};

export type WbComponentResolvedPackage = {
  manifest: WbComponentManifest;
  rootDir: string;
  packageDirName: string;
  propsSchema: WbComponentPropsSchemaDocument;
  slots: WbComponentSlotsDocument;
  variants: WbComponentVariantsDocument;
  responsive: WbComponentResponsiveDocument;
  editableProperties: WbComponentEditablePropertiesDocument;
  validation: WbComponentValidationDocument;
  renderer: WbComponentRendererContractDocument;
  composition?: WbComponentCompositionDocument;
  constraints?: WbComponentConstraintsDocument;
  loadedAt: string;
};

export type WbComponentValidationIssue = {
  code: string;
  message: string;
  path?: string;
};

export type WbComponentPackageValidationResult = {
  valid: boolean;
  componentId?: WbComponentId;
  componentVersion?: string;
  issues: WbComponentValidationIssue[];
};

export type WbComponentCompositionValidationResult = {
  valid: boolean;
  issues: WbComponentValidationIssue[];
};

export type WbComponentLibraryStatus = {
  libraryVersion: string;
  componentsRoot: string;
  installedCount: number;
  lastLoadedAt: string | null;
};

export type WbComponentLoadReport = {
  discovered: number;
  registered: number;
  skipped: number;
  errors: Array<{
    directory: string;
    message: string;
    issues?: WbComponentValidationIssue[];
  }>;
};
