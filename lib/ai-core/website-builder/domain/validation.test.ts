import assert from "node:assert/strict";
import { test } from "node:test";
import type { Asset, Navigation, WebsiteComponent, WebsitePage } from "@/lib/ai-core/website-builder/domain/contracts";
import { WebsiteBuilderError } from "@/lib/ai-core/website-builder/domain/errors";
import {
  ASSET_ID,
  CHILD_COMPONENT_ID,
  CHILD_PAGE_ID,
  COMPONENT_ID,
  NAV_ID,
  OTHER_USER_ID,
  PAGE_ID,
  PLAN_ID,
  PROJECT_ID,
  SECTION_ID,
  USER_ID,
  VALID_SEO,
  makeHomepage,
  makeProject,
  makePublishTarget,
  makeTheme,
} from "@/lib/ai-core/website-builder/domain/test-fixtures";
import {
  assertComponentHierarchy,
  assertOwnedBy,
  assertPageHierarchy,
  assertValidAsset,
  assertValidNavigation,
  assertValidPublishTarget,
  assertValidSeo,
  assertValidTheme,
  assertWebsiteUuid,
  isWebsiteUuid,
} from "@/lib/ai-core/website-builder/domain/validation";

function expectCode(fn: () => void, code: WebsiteBuilderError["code"]): void {
  assert.throws(fn, (error: unknown) => error instanceof WebsiteBuilderError && error.code === code);
}

test("UUID validation accepts v4 and rejects garbage", () => {
  assert.equal(isWebsiteUuid(PROJECT_ID), true);
  assert.equal(isWebsiteUuid("not-a-uuid"), false);
  assert.equal(isWebsiteUuid("22222222-2222-2222-2222-222222222222"), false);
  expectCode(() => assertWebsiteUuid("bad", "id"), "invalid_uuid");
});

test("ownership fails when user or project differs", () => {
  const owner = { userId: USER_ID, projectId: PROJECT_ID };
  expectCode(() => assertOwnedBy({ userId: OTHER_USER_ID, projectId: PROJECT_ID }, owner, "Page"), "ownership");
  expectCode(
    () => assertOwnedBy({ userId: USER_ID, projectId: CHILD_PAGE_ID }, owner, "Page"),
    "ownership",
  );
});

test("page hierarchy requires exactly one homepage and forbids cycles", () => {
  const project = makeProject();
  const home = makeHomepage();
  const about: WebsitePage = {
    ...home,
    id: CHILD_PAGE_ID,
    slug: "about",
    title: "About",
    path: "/about",
    isHomepage: false,
    parentPageId: PAGE_ID,
    order: 1,
  };
  assertPageHierarchy([home, about], project);

  expectCode(() => assertPageHierarchy([home, { ...home, id: CHILD_PAGE_ID, slug: "about" }], project), "missing_homepage");
  expectCode(() => assertPageHierarchy([], project), "missing_homepage");

  const cyclic: WebsitePage = { ...about, parentPageId: CHILD_PAGE_ID };
  expectCode(() => assertPageHierarchy([home, cyclic], project), "hierarchy_cycle");

  const duplicateSlug: WebsitePage = { ...about, slug: "home" };
  expectCode(() => assertPageHierarchy([home, duplicateSlug], project), "duplicate_slug");

  const duplicateOrder: WebsitePage = { ...about, order: 0, parentPageId: null };
  expectCode(() => assertPageHierarchy([home, duplicateOrder], project), "duplicate_order");
});

test("component hierarchy stays in-section and forbids cycles", () => {
  const section = {
    id: SECTION_ID,
    projectId: PROJECT_ID,
    userId: USER_ID,
    pageId: PAGE_ID,
    type: "hero" as const,
    order: 0,
    componentIds: [COMPONENT_ID, CHILD_COMPONENT_ID],
  };
  const heading: WebsiteComponent = {
    id: COMPONENT_ID,
    projectId: PROJECT_ID,
    userId: USER_ID,
    sectionId: SECTION_ID,
    parentComponentId: null,
    type: "heading",
    order: 0,
    props: { text: "Precision" },
  };
  const body: WebsiteComponent = {
    id: CHILD_COMPONENT_ID,
    projectId: PROJECT_ID,
    userId: USER_ID,
    sectionId: SECTION_ID,
    parentComponentId: COMPONENT_ID,
    type: "text",
    order: 0,
    props: { text: "Built for operators." },
  };
  assertComponentHierarchy([heading, body], section);

  expectCode(
    () => assertComponentHierarchy([{ ...body, parentComponentId: CHILD_COMPONENT_ID }, heading], section),
    "hierarchy_cycle",
  );
  expectCode(
    () =>
      assertComponentHierarchy(
        [heading, { ...body, order: 0, parentComponentId: null }],
        section,
      ),
    "duplicate_order",
  );
  expectCode(
    () =>
      assertComponentHierarchy(
        [heading, { ...body, sectionId: PAGE_ID }],
        section,
      ),
    "ownership",
  );
});

test("SEO validation failures", () => {
  expectCode(() => assertValidSeo({ ...VALID_SEO, title: "Short" }), "invalid_seo");
  expectCode(() => assertValidSeo({ ...VALID_SEO, description: "Too short." }), "invalid_seo");
  expectCode(() => assertValidSeo({ ...VALID_SEO, locale: "english" }), "invalid_seo");
  expectCode(() => assertValidSeo({ ...VALID_SEO, canonicalUrl: "http://insecure.example/" }), "invalid_seo");
  expectCode(() => assertValidSeo({ ...VALID_SEO, ogImageAssetId: "not-uuid" }), "invalid_uuid");
});

test("theme validation failures", () => {
  const theme = makeTheme();
  assertValidTheme(theme);
  expectCode(() => assertValidTheme({ ...theme, colors: { ...theme.colors, background: "blue" } }), "invalid_theme");
  expectCode(
    () => assertValidTheme({ ...theme, colors: { ...theme.colors, foreground: theme.colors.background } }),
    "invalid_theme",
  );
  expectCode(() => assertValidTheme({ ...theme, radiusPx: 99 }), "invalid_theme");
  expectCode(() => assertValidTheme({ ...theme, fonts: { sans: "", display: "Sora" } }), "invalid_theme");
});

test("asset validation rejects SVG and unsafe paths", () => {
  const asset: Asset = {
    id: ASSET_ID,
    projectId: PROJECT_ID,
    userId: USER_ID,
    kind: "image",
    mimeType: "image/png",
    storagePath: "projects/aether/hero.png",
    alt: "Hero dashboard",
    createdAt: "2026-08-18T10:00:00.000Z",
  };
  assertValidAsset(asset);
  expectCode(() => assertValidAsset({ ...asset, mimeType: "image/svg+xml" as Asset["mimeType"] }), "invalid_asset");
  expectCode(() => assertValidAsset({ ...asset, storagePath: "../secret.png" }), "invalid_asset");
  expectCode(() => assertValidAsset({ ...asset, alt: "x" }), "invalid_asset");
});

test("navigation must point at owned pages", () => {
  const home = makeHomepage();
  const nav: Navigation = {
    id: NAV_ID,
    projectId: PROJECT_ID,
    userId: USER_ID,
    items: [{ pageId: PAGE_ID, label: "Home", order: 0, children: [] }],
    createdAt: "2026-08-18T10:00:00.000Z",
    updatedAt: "2026-08-18T10:00:00.000Z",
  };
  assertValidNavigation(nav, [home]);
  expectCode(() => assertValidNavigation(nav, [{ ...home, userId: OTHER_USER_ID }]), "ownership");
  expectCode(
    () =>
      assertValidNavigation(
        { ...nav, items: [{ ...nav.items[0], pageId: PLAN_ID }] },
        [home],
      ),
    "invalid_navigation",
  );
});

test("publish target path must match slug", () => {
  const target = makePublishTarget();
  assertValidPublishTarget(target);
  expectCode(() => assertValidPublishTarget({ ...target, publicPath: "/public/aether-labs" }), "invalid_publish_target");
  expectCode(() => assertValidPublishTarget({ ...target, slug: "Aether" }), "invalid_publish_target");
});
