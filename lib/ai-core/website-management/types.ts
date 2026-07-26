/**
 * Website Management Platform — post-generation create / edit / manage / evolve.
 * Website Builder only.
 */

import type { CmsAppKind } from "@/lib/website/cms-kinds";

export type NavLink = {
  href: string;
  label: string;
  children?: NavLink[];
};

export type ManagedPageDef = {
  path: string;
  route: string;
  label: string;
  purpose: string;
  sections: string[];
};

export type SiteStructurePlan = {
  industryId: string;
  businessType: string;
  pages: ManagedPageDef[];
  navLinks: NavLink[];
  footerLinks: NavLink[];
  sitemapPaths: string[];
};

export type CmsSeoJson = {
  title?: string;
  description?: string;
  keywords?: string[];
};

export type LinkValidationIssue = {
  id: string;
  severity: "error" | "warning";
  href: string;
  sourceFile: string;
  message: string;
};

export type LinkValidationReport = {
  ok: boolean;
  checked: number;
  issues: LinkValidationIssue[];
  coverage: {
    navLinked: number;
    pagesPresent: number;
    missingRoutes: string[];
  };
};

export type CatalogItemType =
  | "menu-item"
  | "vehicle"
  | "property"
  | "product"
  | "service"
  | "offer";

export type CatalogItem = {
  id: string;
  type: CatalogItemType;
  title: string;
  description?: string;
  price?: string;
  category?: string;
  imageUrl?: string;
  specs?: Record<string, string>;
  status?: "draft" | "published" | "archived";
  updatedAt: string;
};

export type CmsEntry = {
  id: string;
  kind: CmsAppKind;
  title: string;
  body?: string;
  mediaUrl?: string;
  pagePath?: string;
  slug?: string;
  categories?: string[];
  tags?: string[];
  seoJson?: CmsSeoJson;
  scheduledAt?: string | null;
  published: boolean;
  updatedAt: string;
  createdAt: string;
};

export type WebsiteMediaAsset = {
  id: string;
  generationId: string;
  folder: string;
  filename: string;
  url: string;
  mime: string;
  size: number;
  alt?: string;
  createdAt: string;
  updatedAt: string;
};

export type BrandManagementState = {
  businessName: string;
  logoUrl?: string | null;
  primary?: string;
  secondary?: string;
  accent?: string;
  displayFont?: string;
  bodyFont?: string;
  brandIdentityId?: string | null;
};

export type PrePublishQualityReport = {
  ready: boolean;
  score: number;
  checks: Array<{
    id: string;
    label: string;
    passed: boolean;
    severity: "blocker" | "warning" | "info";
    detail: string;
  }>;
  linkReport: LinkValidationReport;
  summary: string;
};

export type WebsiteAssistantResult = {
  understood: string;
  actions: string[];
  applied: boolean;
  notes: string[];
  command?: string;
};
