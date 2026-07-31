/**
 * Website Builder Template Engine — runtime types.
 * Package specification types live in `spec/types.ts`.
 */

import type {
  WbTemplateLayoutKind,
  WbTemplatePackageManifest,
  WbTemplatePageCanvasBlueprint,
  WbTemplateRegionPlacementRules,
  WbTemplateResolvedPackage,
} from "@/lib/website/template-engine/spec/types";

export type { WbTemplateLayoutKind };

export type WbTemplateId = string;

export type WbTemplateResponsiveSpec = {
  breakpoints: Record<string, number>;
  containerMaxWidth?: string;
};

/** Alias for the validated package manifest. */
export type WbTemplateManifest = WbTemplatePackageManifest;

/** Fully validated and resolved installable template package. */
export type WbTemplatePackage = WbTemplateResolvedPackage;

export type WbTemplateRegistryEntry = {
  id: WbTemplateId;
  manifest: WbTemplatePackageManifest;
  package: WbTemplatePackage;
};

export type WbTemplateListItem = {
  id: WbTemplateId;
  version: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  thumbnail: string;
  preview: string;
  layout: WbTemplateLayoutKind;
  regionCount: number;
  pageCount: number;
};

export type WbTemplateRenderContext = {
  pageId?: string;
  locale?: string;
  rtl?: boolean;
  brandName?: string;
};

export type WbTemplateRenderResult = {
  bodyHtml: string;
  styleCss: string;
  meta: {
    templateId: WbTemplateId;
    version: string;
    pageId: string;
    layout: WbTemplateLayoutKind;
    regionIds: string[];
  };
};

export type WbTemplatePreviewDocument = {
  html: string;
  templateId: WbTemplateId;
  version: string;
  pageId: string;
};

export type WbTemplateEngineStatus = {
  engineVersion: string;
  templatesRoot: string;
  installedCount: number;
  initialized: boolean;
  lastLoadedAt: string | null;
};

export type WbTemplateLoadReport = {
  discovered: number;
  registered: number;
  skipped: number;
  errors: WbTemplateLoadError[];
};

export type WbTemplateLoadError = {
  directory: string;
  message: string;
  issues?: Array<{ code: string; message: string; path?: string }>;
};

export type {
  WbTemplatePageCanvasBlueprint,
  WbTemplateRegionPlacementRules,
};
