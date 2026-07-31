import type {
  WB_TEMPLATE_CATEGORIES,
  WB_TEMPLATE_COMPONENT_CATEGORIES,
  WB_TEMPLATE_COMPONENT_ORDERING,
  WB_TEMPLATE_KNOWN_COMPONENT_TYPES,
  WB_TEMPLATE_LAYOUT_KINDS,
  WB_TEMPLATE_REGION_ALIGNMENT,
  WB_TEMPLATE_REGION_ROLES,
  WB_TEMPLATE_REGION_WIDTH,
  WB_TEMPLATE_UPDATE_CHANNELS,
} from "@/lib/website/template-engine/spec/constants";

export type WbTemplateCategory = (typeof WB_TEMPLATE_CATEGORIES)[number];
export type WbTemplateUpdateChannel = (typeof WB_TEMPLATE_UPDATE_CHANNELS)[number];
export type WbTemplateLayoutKind = (typeof WB_TEMPLATE_LAYOUT_KINDS)[number];
export type WbTemplateRegionRole = (typeof WB_TEMPLATE_REGION_ROLES)[number];
export type WbTemplateComponentOrdering = (typeof WB_TEMPLATE_COMPONENT_ORDERING)[number];
export type WbTemplateRegionWidth = (typeof WB_TEMPLATE_REGION_WIDTH)[number];
export type WbTemplateRegionAlignment = (typeof WB_TEMPLATE_REGION_ALIGNMENT)[number];
export type WbTemplateKnownComponentType =
  (typeof WB_TEMPLATE_KNOWN_COMPONENT_TYPES)[number];
export type WbTemplateComponentCategory =
  (typeof WB_TEMPLATE_COMPONENT_CATEGORIES)[number];

export type WbTemplateAuthor = {
  name: string;
  email?: string;
  url?: string;
  organization?: string;
};

export type WbTemplateMetadata = {
  category: WbTemplateCategory;
  tags: string[];
  author: WbTemplateAuthor;
  license?: string;
  homepage?: string;
  repository?: string;
  keywords?: string[];
};

export type WbTemplateMedia = {
  thumbnail: string;
  preview: string;
  gallery?: string[];
};

export type WbTemplateCompatibility = {
  engineVersion: string;
  specVersion: string;
  features?: string[];
};

export type WbTemplatePackageDependency = {
  id: string;
  version: string;
  optional?: boolean;
  source?: string;
};

export type WbTemplateDependencies = {
  packages?: WbTemplatePackageDependency[];
  componentLibraries?: WbTemplatePackageDependency[];
};

export type WbTemplateUpdateInfo = {
  channel?: WbTemplateUpdateChannel;
  releasedAt: string;
  changelog?: string;
  migrationGuide?: string;
  previousVersion?: string;
};

export type WbTemplateResponsiveBreakpoint = {
  name: string;
  minWidth: number;
};

export type WbTemplateResponsiveConfig = {
  breakpoints: WbTemplateResponsiveBreakpoint[];
  containerMaxWidth?: string;
  fluidTypography?: boolean;
};

export type WbTemplateFileRef = {
  file: string;
};

export type WbTemplateLayoutRef = {
  id: string;
  file: string;
  kind: WbTemplateLayoutKind;
  label?: string;
  description?: string;
};

export type WbTemplateRegionRef = {
  id: string;
  file: string;
  role: WbTemplateRegionRole;
  label?: string;
  description?: string;
};

export type WbTemplatePageRef = {
  id: string;
  title: string;
  path: string;
  layoutId: string;
  file: string;
  description?: string;
  optional?: boolean;
};

export type WbTemplateAssetsConfig = {
  index?: string;
  roots?: string[];
};

/** Root manifest.json — layout-driven, region-based package index. */
export type WbTemplatePackageManifest = {
  specVersion: string;
  id: string;
  version: string;
  name: string;
  description: string;
  metadata: WbTemplateMetadata;
  media: WbTemplateMedia;
  compatibility: WbTemplateCompatibility;
  dependencies?: WbTemplateDependencies;
  update: WbTemplateUpdateInfo;
  responsive: WbTemplateResponsiveConfig;
  canvas: WbTemplateFileRef;
  placementRules: WbTemplateFileRef;
  componentTypes?: WbTemplateFileRef;
  layouts: WbTemplateLayoutRef[];
  regions: WbTemplateRegionRef[];
  pages: WbTemplatePageRef[];
  assets?: WbTemplateAssetsConfig;
  entry: string;
};

export type WbTemplatePackageEntry = {
  defaultPageId: string;
  defaultLayoutId: string;
};

/** Global canvas architecture — grid, spacing, visual identity shell. */
export type WbTemplateCanvasDocument = {
  id: string;
  grid: {
    columns: number;
    gutter: string;
    margin: string;
    maxWidth?: string;
  };
  spacing: {
    unit: string;
    scale: string[];
  };
  visualIdentity: {
    colors: Record<string, string>;
    typography: {
      display: string;
      body: string;
      scale?: Record<string, string>;
    };
    radius: Record<string, string>;
    shadows?: Record<string, string>;
    borders?: Record<string, string>;
  };
};

export type WbTemplateRegionLayout = {
  width: WbTemplateRegionWidth;
  alignment: WbTemplateRegionAlignment;
  maxWidth?: string;
  padding?: string;
  minHeight?: string;
};

/** Rules governing which components may be placed inside a region. */
export type WbTemplateRegionPlacementRules = {
  allowedComponentTypes: string[];
  ordering: WbTemplateComponentOrdering;
  allowNesting: boolean;
  maxComponents: number;
  minComponents?: number;
  requiredTypes?: string[];
  mutuallyExclusive?: string[][];
  allowCustomComponents?: boolean;
};

export type WbTemplateRegionResponsiveRules = {
  collapseBelow?: string;
  stackOrder?: "normal" | "reverse";
  hideBelow?: string;
  fullWidthBelow?: string;
};

/** Region definition — structural slot with placement constraints (no content). */
export type WbTemplateRegionDocument = {
  id: string;
  role: WbTemplateRegionRole;
  label?: string;
  layout: WbTemplateRegionLayout;
  placement: WbTemplateRegionPlacementRules;
  responsive?: WbTemplateRegionResponsiveRules;
};

export type WbTemplateLayoutRules = {
  minHeight?: string;
  gap?: string;
  regionGap?: string;
};

/** Layout document — region composition and grid, not business sections. */
export type WbTemplateLayoutDocument = {
  id: string;
  kind: WbTemplateLayoutKind;
  label?: string;
  regionOrder: string[];
  rules?: WbTemplateLayoutRules;
  grid?: {
    templateAreas?: string;
    columns?: string;
    rows?: string;
  };
};

/** Page blueprint — declares active regions only; components are added later by AI/user. */
export type WbTemplatePageBlueprint = {
  id: string;
  title: string;
  path: string;
  layoutId: string;
  regions: string[];
};

export type WbTemplatePlacementConstraint = {
  id: string;
  description?: string;
  when: {
    region?: string;
    page?: string;
  };
  allow?: {
    componentTypes?: string[];
  };
  deny?: {
    componentTypes?: string[];
  };
};

/** Global and per-region component placement constraints. */
export type WbTemplatePlacementRulesDocument = {
  global: {
    maxComponentsPerPage?: number;
    allowDuplicateTypes?: boolean;
    defaultOrdering?: WbTemplateComponentOrdering;
  };
  regionOverrides?: Record<string, Partial<WbTemplateRegionPlacementRules>>;
  constraints?: WbTemplatePlacementConstraint[];
};

export type WbTemplateComponentTypeDefinition = {
  id: string;
  label?: string;
  category: WbTemplateComponentCategory;
  nestable?: boolean;
  description?: string;
};

export type WbTemplateComponentTypesDocument = {
  types: WbTemplateComponentTypeDefinition[];
};

export type WbTemplateAssetFile = {
  id: string;
  path: string;
  kind: "image" | "icon" | "font" | "video" | "document" | "other";
  mimeType?: string;
  description?: string;
};

export type WbTemplateAssetsManifest = {
  files: WbTemplateAssetFile[];
};

export type WbTemplateValidationIssue = {
  code: string;
  message: string;
  path?: string;
};

export type WbTemplatePackageValidationResult = {
  valid: boolean;
  packageId?: string;
  packageVersion?: string;
  issues: WbTemplateValidationIssue[];
};

/** Fully validated layout-driven template package. */
export type WbTemplateResolvedPackage = {
  manifest: WbTemplatePackageManifest;
  rootDir: string;
  packageDirName: string;
  entryPath: string;
  entry: WbTemplatePackageEntry;
  canvas: WbTemplateCanvasDocument;
  placementRules: WbTemplatePlacementRulesDocument;
  componentTypes?: WbTemplateComponentTypesDocument;
  layouts: Record<string, WbTemplateLayoutDocument>;
  regions: Record<string, WbTemplateRegionDocument>;
  pages: Record<string, WbTemplatePageBlueprint>;
  assets?: WbTemplateAssetsManifest;
  mediaPaths: {
    thumbnail: string;
    preview: string;
    gallery: string[];
  };
  loadedAt: string;
};

/** Resolved page canvas — regions + placement rules for a page blueprint. */
export type WbTemplatePageCanvasBlueprint = {
  pageId: string;
  layoutId: string;
  layoutKind: WbTemplateLayoutKind;
  regionOrder: string[];
  regions: Array<{
    id: string;
    role: WbTemplateRegionRole;
    label?: string;
    layout: WbTemplateRegionLayout;
    placement: WbTemplateRegionPlacementRules;
    responsive?: WbTemplateRegionResponsiveRules;
  }>;
  canvas: WbTemplateCanvasDocument;
  placementRules: WbTemplatePlacementRulesDocument;
};
