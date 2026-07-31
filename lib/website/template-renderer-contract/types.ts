import type { WbTemplateRendererIssue } from "@/lib/website/template-renderer-contract/errors";

/**
 * Structural input accepted by a Template Renderer implementation.
 * The package MUST already be validated by the Template Engine loader.
 */
export type WbTemplateRendererPackageInput = {
  manifest: {
    specVersion: string;
    id: string;
    version: string;
    name: string;
    description: string;
    metadata: WbTemplateRuntimeMetadata;
    media: WbTemplateRuntimeMediaRefs;
    compatibility: {
      engineVersion: string;
      specVersion: string;
      features?: string[];
    };
    responsive: WbTemplateRuntimeResponsiveConfig;
  };
  entry: {
    defaultPageId: string;
    defaultLayoutId: string;
  };
  canvas: WbTemplateRuntimeCanvas;
  placementRules: WbTemplateRuntimePlacementRules;
  componentTypes?: WbTemplateRuntimeComponentTypes;
  layouts: Record<string, WbTemplateRuntimeLayout>;
  regions: Record<string, WbTemplateRuntimeRegion>;
  pages: Record<string, WbTemplateRuntimePageDefinition>;
  mediaPaths: {
    thumbnail: string;
    preview: string;
    gallery: string[];
  };
  loadedAt: string;
  rootDir?: string;
  packageDirName?: string;
};

/** Optional structural scope — not editor state. */
export type WbTemplateRendererScope = {
  pageId?: string;
  layoutId?: string;
};

export type WbTemplateRendererInput = {
  /** Validated Template Package produced by the Template Engine. */
  package: WbTemplateRendererPackageInput;
  /** Contract version the caller expects the renderer to produce. */
  contractVersion?: string;
  /** Optional structural focus for page- or layout-scoped normalization. */
  scope?: WbTemplateRendererScope;
};

export type WbTemplateRendererMeta = {
  contractVersion: string;
  templateId: string;
  templateVersion: string;
  packageSpecVersion: string;
  normalizedAt: string;
  scope?: WbTemplateRendererScope;
};

export type WbTemplateRendererOutput = {
  /** Normalized runtime Template Model — no HTML, CSS, or components. */
  model: WbTemplateRuntimeModel;
  meta: WbTemplateRendererMeta;
};

export type WbTemplateRendererResult =
  | { ok: true; value: WbTemplateRendererOutput }
  | { ok: false; error: WbTemplateRendererFailure };

export type WbTemplateRendererFailure = {
  code: string;
  message: string;
  issues: WbTemplateRendererIssue[];
};

/**
 * Renderer function signature.
 * Implementations transform a validated package into a runtime model.
 */
export type WbTemplateRenderer = (
  input: WbTemplateRendererInput,
) => WbTemplateRendererResult | Promise<WbTemplateRendererResult>;

/** Catalog metadata required by the Website Builder template picker. */
export type WbTemplateRuntimeMetadata = {
  category: string;
  tags: string[];
  author: {
    name: string;
    email?: string;
    url?: string;
    organization?: string;
  };
  license?: string;
  homepage?: string;
  repository?: string;
  keywords?: string[];
};

export type WbTemplateRuntimeMediaRefs = {
  thumbnail: string;
  preview: string;
  gallery?: string[];
};

export type WbTemplateRuntimeResponsiveConfig = {
  breakpoints: Array<{ name: string; minWidth: number }>;
  containerMaxWidth?: string;
  fluidTypography?: boolean;
};

export type WbTemplateRuntimeCanvas = {
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

export type WbTemplateRuntimeLayout = {
  id: string;
  kind: "single-column" | "sidebar-left" | "sidebar-right" | "full-bleed";
  label?: string;
  description?: string;
  regionOrder: string[];
  rules?: {
    minHeight?: string;
    gap?: string;
    regionGap?: string;
  };
  grid?: {
    templateAreas?: string;
    columns?: string;
    rows?: string;
  };
};

export type WbTemplateRuntimeRegionPlacement = {
  allowedComponentTypes: string[];
  ordering: "vertical" | "horizontal" | "grid" | "free";
  allowNesting: boolean;
  maxComponents: number;
  minComponents?: number;
  requiredTypes?: string[];
  mutuallyExclusive?: string[][];
  allowCustomComponents?: boolean;
};

export type WbTemplateRuntimeRegion = {
  id: string;
  role: "header" | "main" | "sidebar" | "footer" | "overlay" | "utility";
  label?: string;
  description?: string;
  layout: {
    width: "full" | "contained" | "narrow" | "wide";
    alignment: "start" | "center" | "end" | "stretch";
    maxWidth?: string;
    padding?: string;
    minHeight?: string;
  };
  placement: WbTemplateRuntimeRegionPlacement;
  responsive?: {
    collapseBelow?: string;
    stackOrder?: "normal" | "reverse";
    hideBelow?: string;
    fullWidthBelow?: string;
  };
};

export type WbTemplateRuntimePageDefinition = {
  id: string;
  title: string;
  path: string;
  layoutId: string;
  regionIds: string[];
  description?: string;
  optional?: boolean;
};

export type WbTemplateRuntimePlacementConstraint = {
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

export type WbTemplateRuntimePlacementRules = {
  global: {
    maxComponentsPerPage?: number;
    allowDuplicateTypes?: boolean;
    defaultOrdering?: "vertical" | "horizontal" | "grid" | "free";
  };
  regionOverrides?: Record<string, Partial<WbTemplateRuntimeRegionPlacement>>;
  constraints?: WbTemplateRuntimePlacementConstraint[];
};

export type WbTemplateRuntimeComponentType = {
  id: string;
  label?: string;
  category: string;
  nestable?: boolean;
  description?: string;
};

export type WbTemplateRuntimeComponentTypes = {
  types: WbTemplateRuntimeComponentType[];
};

/**
 * Normalized runtime Template Model.
 * Contains only structural information the Website Builder needs.
 */
export type WbTemplateRuntimeModel = {
  contractVersion: string;
  template: {
    id: string;
    version: string;
    name: string;
    description: string;
    specVersion: string;
  };
  metadata: WbTemplateRuntimeMetadata;
  entry: {
    defaultPageId: string;
    defaultLayoutId: string;
  };
  responsive: WbTemplateRuntimeResponsiveConfig;
  canvas: WbTemplateRuntimeCanvas;
  layouts: Record<string, WbTemplateRuntimeLayout>;
  regions: Record<string, WbTemplateRuntimeRegion>;
  pages: Record<string, WbTemplateRuntimePageDefinition>;
  placementRules: WbTemplateRuntimePlacementRules;
  componentTypes?: WbTemplateRuntimeComponentTypes;
  media: {
    thumbnail: string;
    preview: string;
    gallery: string[];
  };
};
