/**
 * Shared fixtures for Website Builder domain tests (Phase 1).
 * Not part of the public domain API.
 */

import type {
  PublishTarget,
  Theme,
  WebsitePage,
  WebsiteProject,
  WebsiteProjectState,
  WebsiteSeo,
} from "@/lib/ai-core/website-builder/domain/contracts";
import { createWebsiteProject } from "@/lib/ai-core/website-builder/domain/create";

export const USER_ID = "11111111-1111-4111-8111-111111111111";
export const PROJECT_ID = "22222222-2222-4222-8222-222222222222";
export const PLAN_ID = "33333333-3333-4333-8333-333333333333";
export const PAGE_ID = "44444444-4444-4444-8444-444444444444";
export const CHILD_PAGE_ID = "55555555-5555-4555-8555-555555555555";
export const SECTION_ID = "66666666-6666-4666-8666-666666666666";
export const COMPONENT_ID = "77777777-7777-4777-8777-777777777777";
export const CHILD_COMPONENT_ID = "88888888-8888-4888-8888-888888888888";
export const THEME_ID = "99999999-9999-4999-8999-999999999999";
export const ASSET_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
export const NAV_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
export const PUBLISH_ID = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
export const OTHER_USER_ID = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";

export const VALID_SEO: WebsiteSeo = {
  title: "Aether Labs Corporate Site",
  description:
    "Professional website architecture for enterprise teams that need speed, SEO, and a trustworthy digital presence.",
  canonicalUrl: "https://aether.example/",
  ogTitle: "Aether Labs",
  ogDescription: "Enterprise-grade digital presence.",
  ogImageAssetId: null,
  robots: "index,follow",
  locale: "en",
};

export function makeProject(over: Partial<WebsiteProject> = {}): WebsiteProject {
  return {
    ...createWebsiteProject({
      id: PROJECT_ID,
      userId: USER_ID,
      name: "Aether Labs",
      niche: "corporate",
      language: "en",
    }),
    ...over,
  };
}

export function projectIn(state: WebsiteProjectState): WebsiteProject {
  return makeProject({ domainState: state });
}

export function makeTheme(over: Partial<Theme> = {}): Theme {
  const createdAt = "2026-08-18T10:00:00.000Z";
  return {
    id: THEME_ID,
    projectId: PROJECT_ID,
    userId: USER_ID,
    name: "Corporate Precision",
    colors: {
      background: "#0B1220",
      foreground: "#F8FAFC",
      accent: "#2563EB",
      muted: "#94A3B8",
    },
    fonts: { sans: "Inter", display: "Sora" },
    radiusPx: 8,
    createdAt,
    updatedAt: createdAt,
    ...over,
  };
}

export function makePublishTarget(over: Partial<PublishTarget> = {}): PublishTarget {
  const createdAt = "2026-08-18T10:00:00.000Z";
  return {
    id: PUBLISH_ID,
    projectId: PROJECT_ID,
    userId: USER_ID,
    platform: "web",
    slug: "aether-labs",
    publicPath: "/w/site/aether-labs",
    status: "draft",
    createdAt,
    updatedAt: createdAt,
    ...over,
  };
}

export function makeHomepage(over: Partial<WebsitePage> = {}): WebsitePage {
  return {
    id: PAGE_ID,
    projectId: PROJECT_ID,
    userId: USER_ID,
    planId: PLAN_ID,
    slug: "home",
    title: "Home",
    path: "/",
    isHomepage: true,
    parentPageId: null,
    order: 0,
    sectionIds: [],
    seo: VALID_SEO,
    status: "draft",
    ...over,
  };
}

export function publishContext() {
  return {
    homepage: makeHomepage(),
    theme: makeTheme(),
    seo: VALID_SEO,
    publishTarget: makePublishTarget(),
  };
}
