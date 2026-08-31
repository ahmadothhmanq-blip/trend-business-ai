/**
 * Website Builder domain validation (Phase 1).
 * Pure functions only — no I/O, AI, HTML, or persistence.
 */

import type {
  Asset,
  Navigation,
  NavigationItem,
  OwnedRef,
  PublishTarget,
  Theme,
  WebsiteComponent,
  WebsitePage,
  WebsitePlan,
  WebsiteProject,
  WebsiteProjectState,
  WebsiteSection,
  WebsiteSeo,
} from "@/lib/ai-core/website-builder/domain/contracts";
import {
  PUBLISH_TARGET_PLATFORMS,
  PUBLISH_TARGET_STATUSES,
  WEBSITE_ASSET_KINDS,
  WEBSITE_ASSET_MIME_TYPES,
  WEBSITE_COMPONENT_TYPES,
  WEBSITE_NICHES,
  WEBSITE_PAGE_STATUSES,
  WEBSITE_PLAN_STATUSES,
  WEBSITE_PROJECT_STATES,
  WEBSITE_SECTION_TYPES,
} from "@/lib/ai-core/website-builder/domain/contracts";
import { WebsiteBuilderError } from "@/lib/ai-core/website-builder/domain/errors";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HEX_RE = /^#[0-9a-f]{6}$/i;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const LOCALE_RE = /^[a-z]{2}(?:-[A-Z]{2})?$/;
const PATH_RE = /^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*)?(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/;
const FONT_RE = /^[A-Za-z][A-Za-z0-9\- ]{1,60}$/;

export function isWebsiteUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export function assertWebsiteUuid(value: string, label = "id"): void {
  if (!isWebsiteUuid(value)) {
    throw new WebsiteBuilderError(`Invalid UUID for ${label}.`, "invalid_uuid");
  }
}

export function toOwnedRef(owner: { userId: string; id?: string; projectId?: string }): OwnedRef {
  const projectId = owner.projectId ?? owner.id;
  if (!projectId) {
    throw new WebsiteBuilderError("Owner project id is required.", "ownership");
  }
  return { userId: owner.userId, projectId };
}

export function assertOwnedBy(
  entity: OwnedRef,
  owner: { userId: string; id?: string; projectId?: string },
  label: string,
): void {
  const ownerRef = toOwnedRef(owner);
  if (entity.userId !== ownerRef.userId || entity.projectId !== ownerRef.projectId) {
    throw new WebsiteBuilderError(`${label} does not belong to this project owner.`, "ownership");
  }
}

export function isWebsiteProjectState(value: string): value is WebsiteProjectState {
  return (WEBSITE_PROJECT_STATES as readonly string[]).includes(value);
}

export function assertWebsiteProjectState(value: string): asserts value is WebsiteProjectState {
  if (!isWebsiteProjectState(value)) {
    throw new WebsiteBuilderError(`Invalid project state "${value}".`, "invalid_state");
  }
}

function assertNonEmpty(value: string, label: string, code: WebsiteBuilderError["code"]): void {
  if (!value.trim()) {
    throw new WebsiteBuilderError(`${label} is required.`, code);
  }
}

function assertIsoTimestamp(value: string, label: string, code: WebsiteBuilderError["code"]): void {
  if (!value || Number.isNaN(Date.parse(value))) {
    throw new WebsiteBuilderError(`${label} must be an ISO timestamp.`, code);
  }
}

export function assertValidSeo(seo: WebsiteSeo): void {
  const title = seo.title.trim();
  const description = seo.description.trim();
  if (title.length < 10 || title.length > 70) {
    throw new WebsiteBuilderError("SEO title must be 10–70 characters.", "invalid_seo");
  }
  if (description.length < 50 || description.length > 160) {
    throw new WebsiteBuilderError("SEO description must be 50–160 characters.", "invalid_seo");
  }
  if (!LOCALE_RE.test(seo.locale)) {
    throw new WebsiteBuilderError("SEO locale must look like en or en-US.", "invalid_seo");
  }
  if (seo.robots !== "index,follow" && seo.robots !== "noindex,nofollow") {
    throw new WebsiteBuilderError("SEO robots must be index,follow or noindex,nofollow.", "invalid_seo");
  }
  if (seo.canonicalUrl) {
    let parsed: URL;
    try {
      parsed = new URL(seo.canonicalUrl);
    } catch {
      throw new WebsiteBuilderError("SEO canonical URL is invalid.", "invalid_seo");
    }
    if (parsed.protocol !== "https:") {
      throw new WebsiteBuilderError("SEO canonical URL must use https.", "invalid_seo");
    }
  }
  if (seo.ogImageAssetId) assertWebsiteUuid(seo.ogImageAssetId, "seo.ogImageAssetId");
}

export function assertValidTheme(theme: Theme): void {
  assertWebsiteUuid(theme.id, "theme.id");
  assertWebsiteUuid(theme.projectId, "theme.projectId");
  assertWebsiteUuid(theme.userId, "theme.userId");
  assertNonEmpty(theme.name, "Theme name", "invalid_theme");
  for (const [key, value] of Object.entries(theme.colors)) {
    if (!HEX_RE.test(value)) {
      throw new WebsiteBuilderError(`Theme color ${key} must be #RRGGBB.`, "invalid_theme");
    }
  }
  if (theme.colors.background.toLowerCase() === theme.colors.foreground.toLowerCase()) {
    throw new WebsiteBuilderError("Theme background and foreground must differ.", "invalid_theme");
  }
  if (!FONT_RE.test(theme.fonts.sans) || !FONT_RE.test(theme.fonts.display)) {
    throw new WebsiteBuilderError("Theme fonts must be professional named families.", "invalid_theme");
  }
  if (!Number.isInteger(theme.radiusPx) || theme.radiusPx < 0 || theme.radiusPx > 24) {
    throw new WebsiteBuilderError("Theme radius must be an integer 0–24.", "invalid_theme");
  }
  assertIsoTimestamp(theme.createdAt, "theme.createdAt", "invalid_theme");
  assertIsoTimestamp(theme.updatedAt, "theme.updatedAt", "invalid_theme");
}

export function assertValidAsset(asset: Asset): void {
  assertWebsiteUuid(asset.id, "asset.id");
  assertWebsiteUuid(asset.projectId, "asset.projectId");
  assertWebsiteUuid(asset.userId, "asset.userId");
  if (!(WEBSITE_ASSET_KINDS as readonly string[]).includes(asset.kind)) {
    throw new WebsiteBuilderError("Unknown asset kind.", "invalid_asset");
  }
  if (!(WEBSITE_ASSET_MIME_TYPES as readonly string[]).includes(asset.mimeType)) {
    throw new WebsiteBuilderError("Asset MIME must be png, jpeg, or webp.", "invalid_asset");
  }
  if (!asset.storagePath.trim() || asset.storagePath.includes("..") || asset.storagePath.startsWith("/")) {
    throw new WebsiteBuilderError("Asset storage path is unsafe.", "invalid_asset");
  }
  if (asset.alt.trim().length < 3) {
    throw new WebsiteBuilderError("Asset alt text is required.", "invalid_asset");
  }
  if (asset.storagePath.toLowerCase().endsWith(".svg") || asset.mimeType.includes("svg")) {
    throw new WebsiteBuilderError("SVG assets are not allowed in this domain.", "invalid_asset");
  }
}

function assertNavItems(items: NavigationItem[], pageIds: Set<string>, seen: Set<string>): void {
  const orders = new Set<number>();
  for (const item of items) {
    assertWebsiteUuid(item.pageId, "navigation.pageId");
    if (!pageIds.has(item.pageId)) {
      throw new WebsiteBuilderError("Navigation item points at an unknown page.", "invalid_navigation");
    }
    if (seen.has(item.pageId)) {
      throw new WebsiteBuilderError("Navigation contains a duplicate page.", "invalid_navigation");
    }
    seen.add(item.pageId);
    if (!item.label.trim()) {
      throw new WebsiteBuilderError("Navigation label is required.", "invalid_navigation");
    }
    if (!Number.isInteger(item.order) || item.order < 0 || orders.has(item.order)) {
      throw new WebsiteBuilderError("Navigation order must be unique and >= 0.", "duplicate_order");
    }
    orders.add(item.order);
    assertNavItems(item.children, pageIds, seen);
  }
}

export function assertValidNavigation(navigation: Navigation, pages: WebsitePage[]): void {
  assertWebsiteUuid(navigation.id, "navigation.id");
  assertWebsiteUuid(navigation.projectId, "navigation.projectId");
  assertWebsiteUuid(navigation.userId, "navigation.userId");
  const owner = { userId: navigation.userId, projectId: navigation.projectId };
  for (const page of pages) {
    assertOwnedBy(page, owner, "Navigation page");
  }
  const pageIds = new Set(pages.map((page) => page.id));
  assertNavItems(navigation.items, pageIds, new Set());
}

export function assertValidPublishTarget(target: PublishTarget): void {
  assertWebsiteUuid(target.id, "publishTarget.id");
  assertWebsiteUuid(target.projectId, "publishTarget.projectId");
  assertWebsiteUuid(target.userId, "publishTarget.userId");
  if (!(PUBLISH_TARGET_PLATFORMS as readonly string[]).includes(target.platform)) {
    throw new WebsiteBuilderError("Publish platform must be web.", "invalid_publish_target");
  }
  if (!(PUBLISH_TARGET_STATUSES as readonly string[]).includes(target.status)) {
    throw new WebsiteBuilderError("Invalid publish target status.", "invalid_publish_target");
  }
  if (!SLUG_RE.test(target.slug) || target.slug.length < 2 || target.slug.length > 80) {
    throw new WebsiteBuilderError("Publish slug must be 2–80 lowercase kebab-case characters.", "invalid_publish_target");
  }
  if (target.publicPath !== `/w/site/${target.slug}`) {
    throw new WebsiteBuilderError("Publish publicPath must be /w/site/:slug.", "invalid_publish_target");
  }
}

export function assertValidProject(project: WebsiteProject): void {
  assertWebsiteUuid(project.id, "project.id");
  assertWebsiteUuid(project.userId, "project.userId");
  assertNonEmpty(project.name, "Project name", "invalid_project");
  if (project.name.trim().length < 3 || project.name.trim().length > 80) {
    throw new WebsiteBuilderError("Project name must be 3–80 characters.", "invalid_project");
  }
  if (!(WEBSITE_NICHES as readonly string[]).includes(project.niche)) {
    throw new WebsiteBuilderError("Project niche must be corporate, ecommerce, or saas.", "invalid_project");
  }
  if (!LOCALE_RE.test(project.language)) {
    throw new WebsiteBuilderError("Project language must look like en or ar.", "invalid_project");
  }
  assertWebsiteProjectState(project.domainState);
  if (project.activePlanId) assertWebsiteUuid(project.activePlanId, "project.activePlanId");
  if (project.themeId) assertWebsiteUuid(project.themeId, "project.themeId");
  assertIsoTimestamp(project.createdAt, "project.createdAt", "invalid_project");
  assertIsoTimestamp(project.updatedAt, "project.updatedAt", "invalid_project");
}

export function assertValidPlan(plan: WebsitePlan, project: WebsiteProject): void {
  assertWebsiteUuid(plan.id, "plan.id");
  assertOwnedBy(plan, project, "Plan");
  if (!Number.isInteger(plan.version) || plan.version < 1) {
    throw new WebsiteBuilderError("Plan version must be an integer >= 1.", "invalid_plan");
  }
  if (!(WEBSITE_PLAN_STATUSES as readonly string[]).includes(plan.status)) {
    throw new WebsiteBuilderError("Invalid plan status.", "invalid_plan");
  }
  if (plan.isActive && plan.status !== "active") {
    throw new WebsiteBuilderError("Active plan status must be active.", "invalid_plan");
  }
  if (!plan.isActive && plan.status === "active") {
    throw new WebsiteBuilderError("Inactive plan cannot have status active.", "invalid_plan");
  }
  if (plan.objective.trim().length < 8) {
    throw new WebsiteBuilderError("Plan objective must be at least 8 characters.", "invalid_plan");
  }
  for (const pageId of plan.pageIds) assertWebsiteUuid(pageId, "plan.pageIds");
  if (new Set(plan.pageIds).size !== plan.pageIds.length) {
    throw new WebsiteBuilderError("Plan pageIds must be unique.", "invalid_plan");
  }
}

export function assertValidPage(page: WebsitePage, project: WebsiteProject): void {
  assertWebsiteUuid(page.id, "page.id");
  assertOwnedBy(page, project, "Page");
  assertWebsiteUuid(page.planId, "page.planId");
  if (!SLUG_RE.test(page.slug) || page.slug.length > 80) {
    throw new WebsiteBuilderError("Page slug must be lowercase kebab-case.", "invalid_page");
  }
  if (page.title.trim().length < 2) {
    throw new WebsiteBuilderError("Page title is required.", "invalid_page");
  }
  if (!PATH_RE.test(page.path)) {
    throw new WebsiteBuilderError("Page path is invalid.", "invalid_page");
  }
  if (page.isHomepage && page.path !== "/") {
    throw new WebsiteBuilderError("Homepage path must be /.", "invalid_page");
  }
  if (page.isHomepage && page.parentPageId) {
    throw new WebsiteBuilderError("Homepage cannot have a parent page.", "invalid_page");
  }
  if (page.parentPageId) {
    assertWebsiteUuid(page.parentPageId, "page.parentPageId");
    if (page.parentPageId === page.id) {
      throw new WebsiteBuilderError("Page cannot be its own parent.", "hierarchy_cycle");
    }
  }
  if (!Number.isInteger(page.order) || page.order < 0) {
    throw new WebsiteBuilderError("Page order must be an integer >= 0.", "invalid_page");
  }
  if (!(WEBSITE_PAGE_STATUSES as readonly string[]).includes(page.status)) {
    throw new WebsiteBuilderError("Invalid page status.", "invalid_page");
  }
  for (const sectionId of page.sectionIds) assertWebsiteUuid(sectionId, "page.sectionIds");
  assertValidSeo(page.seo);
}

export function assertPageHierarchy(pages: WebsitePage[], project: WebsiteProject): void {
  const byId = new Map(pages.map((page) => [page.id, page]));
  if (byId.size !== pages.length) {
    throw new WebsiteBuilderError("Duplicate page ids.", "invalid_page");
  }
  const slugs = new Set<string>();
  const homepages = pages.filter((page) => page.isHomepage);
  if (homepages.length !== 1) {
    throw new WebsiteBuilderError("A project must have exactly one homepage.", "missing_homepage");
  }
  const siblingKey = (page: WebsitePage) => `${page.parentPageId ?? "root"}:${page.order}`;
  const siblingOrders = new Set<string>();
  for (const page of pages) {
    assertValidPage(page, project);
    if (slugs.has(page.slug)) {
      throw new WebsiteBuilderError("Page slugs must be unique within a project.", "duplicate_slug");
    }
    slugs.add(page.slug);
    if (siblingOrders.has(siblingKey(page))) {
      throw new WebsiteBuilderError("Sibling pages cannot share the same order.", "duplicate_order");
    }
    siblingOrders.add(siblingKey(page));
    let current = page;
    const seen = new Set<string>([current.id]);
    while (current.parentPageId) {
      const parent = byId.get(current.parentPageId);
      if (!parent) {
        throw new WebsiteBuilderError("Page parent is missing from the hierarchy.", "invalid_page");
      }
      assertOwnedBy(parent, project, "Parent page");
      if (seen.has(parent.id)) {
        throw new WebsiteBuilderError("Page hierarchy contains a cycle.", "hierarchy_cycle");
      }
      seen.add(parent.id);
      current = parent;
    }
  }
}

export function assertValidSection(section: WebsiteSection, page: WebsitePage): void {
  assertWebsiteUuid(section.id, "section.id");
  assertOwnedBy(section, page, "Section");
  if (section.pageId !== page.id) {
    throw new WebsiteBuilderError("Section does not belong to this page.", "ownership");
  }
  if (!(WEBSITE_SECTION_TYPES as readonly string[]).includes(section.type)) {
    throw new WebsiteBuilderError("Unknown section type.", "invalid_section");
  }
  if (!Number.isInteger(section.order) || section.order < 0) {
    throw new WebsiteBuilderError("Section order must be an integer >= 0.", "invalid_section");
  }
  for (const componentId of section.componentIds) {
    assertWebsiteUuid(componentId, "section.componentIds");
  }
  if (new Set(section.componentIds).size !== section.componentIds.length) {
    throw new WebsiteBuilderError("Section componentIds must be unique.", "invalid_section");
  }
}

export function assertValidComponent(component: WebsiteComponent, section: WebsiteSection): void {
  assertWebsiteUuid(component.id, "component.id");
  assertOwnedBy(component, section, "Component");
  if (component.sectionId !== section.id) {
    throw new WebsiteBuilderError("Component does not belong to this section.", "ownership");
  }
  if (!(WEBSITE_COMPONENT_TYPES as readonly string[]).includes(component.type)) {
    throw new WebsiteBuilderError("Unknown component type.", "invalid_component");
  }
  if (!Number.isInteger(component.order) || component.order < 0) {
    throw new WebsiteBuilderError("Component order must be an integer >= 0.", "invalid_component");
  }
  if (component.parentComponentId) {
    assertWebsiteUuid(component.parentComponentId, "component.parentComponentId");
    if (component.parentComponentId === component.id) {
      throw new WebsiteBuilderError("Component cannot be its own parent.", "hierarchy_cycle");
    }
  }
  for (const [key, value] of Object.entries(component.props)) {
    if (typeof key !== "string" || !key.trim()) {
      throw new WebsiteBuilderError("Component prop keys must be non-empty strings.", "invalid_component");
    }
    if (typeof value === "string" && /<\s*script/i.test(value)) {
      throw new WebsiteBuilderError("Component props cannot contain script markup.", "invalid_component");
    }
  }
}

export function assertComponentHierarchy(components: WebsiteComponent[], section: WebsiteSection): void {
  const byId = new Map(components.map((component) => [component.id, component]));
  if (byId.size !== components.length) {
    throw new WebsiteBuilderError("Duplicate component ids.", "invalid_component");
  }
  const siblingKey = (component: WebsiteComponent) => `${component.parentComponentId ?? "root"}:${component.order}`;
  const siblingOrders = new Set<string>();
  for (const component of components) {
    assertValidComponent(component, section);
    if (siblingOrders.has(siblingKey(component))) {
      throw new WebsiteBuilderError("Sibling components cannot share the same order.", "duplicate_order");
    }
    siblingOrders.add(siblingKey(component));
    let current = component;
    const seen = new Set<string>([current.id]);
    while (current.parentComponentId) {
      const parent = byId.get(current.parentComponentId);
      if (!parent) {
        throw new WebsiteBuilderError("Component parent is missing from the hierarchy.", "invalid_component");
      }
      if (parent.sectionId !== section.id) {
        throw new WebsiteBuilderError("Nested components must stay in the same section.", "invalid_component");
      }
      if (seen.has(parent.id)) {
        throw new WebsiteBuilderError("Component hierarchy contains a cycle.", "hierarchy_cycle");
      }
      seen.add(parent.id);
      current = parent;
    }
  }
}
