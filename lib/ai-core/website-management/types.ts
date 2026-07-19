/**
 * Website Management Platform — post-generation create / edit / manage / evolve.
 * Website Builder only.
 */

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
  navLinks: Array<{ href: string; label: string }>;
  footerLinks: Array<{ href: string; label: string }>;
  sitemapPaths: string[];
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
  kind: "page-block" | "post" | "announcement" | "media";
  title: string;
  body?: string;
  mediaUrl?: string;
  pagePath?: string;
  scheduledAt?: string | null;
  published: boolean;
  updatedAt: string;
  createdAt: string;
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
