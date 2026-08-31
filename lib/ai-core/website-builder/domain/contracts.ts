/**
 * Website Builder domain contracts (Phase 1).
 * Source of truth for later persistence/API. No AI, HTML, React, or publish runtime.
 */

export const WEBSITE_PROJECT_STATES = [
  "draft",
  "planning",
  "planned",
  "generating",
  "editing",
  "ready",
  "published",
  "archived",
  "failed",
] as const;

export type WebsiteProjectState = (typeof WEBSITE_PROJECT_STATES)[number];

export const WEBSITE_NICHES = ["corporate", "ecommerce", "saas"] as const;
export type WebsiteNiche = (typeof WEBSITE_NICHES)[number];

export const WEBSITE_PLAN_STATUSES = ["active", "inactive", "archived"] as const;
export type WebsitePlanStatus = (typeof WEBSITE_PLAN_STATUSES)[number];

export const WEBSITE_PAGE_STATUSES = ["draft", "planned", "ready", "archived"] as const;
export type WebsitePageStatus = (typeof WEBSITE_PAGE_STATUSES)[number];

export const WEBSITE_SECTION_TYPES = [
  "hero",
  "features",
  "services",
  "about",
  "testimonials",
  "pricing",
  "faq",
  "contact",
  "cta",
  "gallery",
  "team",
  "blog",
  "stats",
  "logos",
  "content",
  "footer",
] as const;
export type WebsiteSectionType = (typeof WEBSITE_SECTION_TYPES)[number];

export const WEBSITE_COMPONENT_TYPES = [
  "heading",
  "text",
  "button",
  "image",
  "list",
  "card",
  "form",
  "metric",
  "quote",
  "link",
  "divider",
  "group",
] as const;
export type WebsiteComponentType = (typeof WEBSITE_COMPONENT_TYPES)[number];

export const WEBSITE_ASSET_KINDS = ["image", "logo", "icon", "og"] as const;
export type WebsiteAssetKind = (typeof WEBSITE_ASSET_KINDS)[number];

export const WEBSITE_ASSET_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
export type WebsiteAssetMimeType = (typeof WEBSITE_ASSET_MIME_TYPES)[number];

export const PUBLISH_TARGET_PLATFORMS = ["web"] as const;
export type PublishTargetPlatform = (typeof PUBLISH_TARGET_PLATFORMS)[number];

export const PUBLISH_TARGET_STATUSES = [
  "draft",
  "publishing",
  "published",
  "unpublished",
  "failed",
] as const;
export type PublishTargetStatus = (typeof PUBLISH_TARGET_STATUSES)[number];

export type WebsiteSeo = {
  title: string;
  description: string;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageAssetId: string | null;
  robots: "index,follow" | "noindex,nofollow";
  locale: string;
};

export type ThemeColors = {
  background: string;
  foreground: string;
  accent: string;
  muted: string;
};

export type ThemeFonts = {
  sans: string;
  display: string;
};

export type Theme = {
  id: string;
  projectId: string;
  userId: string;
  name: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  radiusPx: number;
  createdAt: string;
  updatedAt: string;
};

export type Asset = {
  id: string;
  projectId: string;
  userId: string;
  kind: WebsiteAssetKind;
  mimeType: WebsiteAssetMimeType;
  storagePath: string;
  alt: string;
  createdAt: string;
};

export type NavigationItem = {
  pageId: string;
  label: string;
  order: number;
  children: NavigationItem[];
};

export type Navigation = {
  id: string;
  projectId: string;
  userId: string;
  items: NavigationItem[];
  createdAt: string;
  updatedAt: string;
};

export type PublishTarget = {
  id: string;
  projectId: string;
  userId: string;
  platform: PublishTargetPlatform;
  slug: string;
  publicPath: string;
  status: PublishTargetStatus;
  createdAt: string;
  updatedAt: string;
};

export type WebsiteComponent = {
  id: string;
  projectId: string;
  userId: string;
  sectionId: string;
  parentComponentId: string | null;
  type: WebsiteComponentType;
  order: number;
  props: Record<string, string | number | boolean | null>;
};

export type WebsiteSection = {
  id: string;
  projectId: string;
  userId: string;
  pageId: string;
  type: WebsiteSectionType;
  order: number;
  componentIds: string[];
};

export type WebsitePage = {
  id: string;
  projectId: string;
  userId: string;
  planId: string;
  slug: string;
  title: string;
  path: string;
  isHomepage: boolean;
  parentPageId: string | null;
  order: number;
  sectionIds: string[];
  seo: WebsiteSeo;
  status: WebsitePageStatus;
};

export type WebsitePlan = {
  id: string;
  projectId: string;
  userId: string;
  version: number;
  isActive: boolean;
  status: WebsitePlanStatus;
  objective: string;
  pageIds: string[];
  createdAt: string;
};

export type WebsiteProject = {
  id: string;
  userId: string;
  name: string;
  niche: WebsiteNiche;
  language: string;
  domainState: WebsiteProjectState;
  activePlanId: string | null;
  themeId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OwnedRef = {
  userId: string;
  projectId: string;
};

export type TransitionContext = {
  homepage?: WebsitePage | null;
  theme?: Theme | null;
  seo?: WebsiteSeo | null;
  publishTarget?: PublishTarget | null;
};
