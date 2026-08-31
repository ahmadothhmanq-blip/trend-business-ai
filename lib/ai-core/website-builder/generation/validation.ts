/**
 * Website Generation Engine validation (Phase 3).
 * Enforces homepage, navigation, SEO, component trees, and no orphan pages.
 */

import type { Navigation, WebsitePage, WebsiteProject } from "@/lib/ai-core/website-builder/domain/contracts";
import { WebsiteBuilderError } from "@/lib/ai-core/website-builder/domain/errors";
import {
  assertComponentHierarchy,
  assertOwnedBy,
  assertPageHierarchy,
  assertValidNavigation,
  assertValidPlan,
  assertValidProject,
  assertValidSeo,
  assertValidTheme,
} from "@/lib/ai-core/website-builder/domain/validation";
import { assertDirectorWebsitePlan } from "@/lib/ai-core/website-builder/director/validation";
import type {
  WebsiteGeneratedStructure,
  WebsiteGenerationInput,
} from "@/lib/ai-core/website-builder/generation/contracts";
import { WebsiteGenerationError } from "@/lib/ai-core/website-builder/generation/errors";

function wrapDomainError(error: unknown, fallback: WebsiteGenerationError["code"]): never {
  if (error instanceof WebsiteGenerationError) throw error;
  if (error instanceof WebsiteBuilderError) {
    if (error.code === "missing_homepage") {
      throw new WebsiteGenerationError(error.message, "missing_homepage");
    }
    if (error.code === "invalid_seo") {
      throw new WebsiteGenerationError(error.message, "incomplete_seo");
    }
    if (error.code === "ownership") {
      throw new WebsiteGenerationError(error.message, "ownership");
    }
    throw new WebsiteGenerationError(error.message, "invalid_structure");
  }
  throw new WebsiteGenerationError(
    error instanceof Error ? error.message : "Website generation validation failed.",
    fallback,
  );
}

export function collectNavigationPageIds(navigation: Navigation): Set<string> {
  const ids = new Set<string>();
  const walk = (items: Navigation["items"]) => {
    for (const item of items) {
      ids.add(item.pageId);
      walk(item.children);
    }
  };
  walk(navigation.items);
  return ids;
}

export function assertWebsiteGenerationInput(input: WebsiteGenerationInput): void {
  try {
    assertValidProject(input.project);
  } catch (error) {
    wrapDomainError(error, "invalid_input");
  }

  if (!input.directorPlan || !Array.isArray(input.directorPlan.requiredPages) || input.directorPlan.requiredPages.length < 1) {
    throw new WebsiteGenerationError("Director plan has no pages to generate.", "empty_plan");
  }
  if (!Array.isArray(input.directorPlan.sitemap) || input.directorPlan.sitemap.length < 1) {
    throw new WebsiteGenerationError("Director plan has no pages to generate.", "empty_plan");
  }

  try {
    assertDirectorWebsitePlan(input.directorPlan);
  } catch (error) {
    wrapDomainError(error, "invalid_input");
  }

  if (input.directorPlan.projectId !== input.project.id || input.directorPlan.userId !== input.project.userId) {
    throw new WebsiteGenerationError("Director plan does not belong to this project.", "ownership");
  }
  if (input.project.domainState !== "planned" && input.project.domainState !== "generating") {
    throw new WebsiteGenerationError(
      "Website generation can only run while the project is planned or generating.",
      "invalid_state",
    );
  }
}

export function assertGeneratedWebsite(structure: WebsiteGeneratedStructure, project: WebsiteProject): void {
  try {
    assertValidProject(structure.project);
    assertValidPlan(structure.plan, project);
    assertPageHierarchy(structure.pages, project);
    assertValidTheme(structure.theme);
    assertValidSeo(structure.seo);
    assertValidNavigation(structure.navigation, structure.pages);

    if (structure.plan.pageIds.length !== structure.pages.length) {
      throw new WebsiteGenerationError("Plan pageIds must match generated pages.", "invalid_structure");
    }
    const pageIds = new Set(structure.pages.map((page) => page.id));
    for (const pageId of structure.plan.pageIds) {
      if (!pageIds.has(pageId)) {
        throw new WebsiteGenerationError("Plan references a missing page.", "orphan_page");
      }
    }

    const homepages = structure.pages.filter((page) => page.isHomepage);
    if (homepages.length !== 1) {
      throw new WebsiteGenerationError("Generated structure must have exactly one homepage.", "missing_homepage");
    }
    const homepage = homepages[0];
    if (structure.seo.title !== homepage.seo.title || structure.seo.description !== homepage.seo.description) {
      throw new WebsiteGenerationError("Site SEO must match the homepage SEO.", "incomplete_seo");
    }
    for (const page of structure.pages) {
      assertValidSeo(page.seo);
    }

    const navIds = collectNavigationPageIds(structure.navigation);
    for (const page of structure.pages) {
      if (!navIds.has(page.id)) {
        throw new WebsiteGenerationError(`Page "${page.slug}" is orphaned from navigation.`, "orphan_page");
      }
    }

    const sitemapSlugs = new Set(structure.pages.map((page) => page.slug));
    if (sitemapSlugs.size !== structure.pages.length) {
      throw new WebsiteGenerationError("Generated pages have duplicate slugs.", "invalid_structure");
    }

    const sectionsByPage = new Map<string, typeof structure.sections>();
    for (const section of structure.sections) {
      const page = structure.pages.find((item) => item.id === section.pageId);
      if (!page) throw new WebsiteGenerationError("Section points at a missing page.", "orphan_page");
      const list = sectionsByPage.get(page.id) ?? [];
      list.push(section);
      sectionsByPage.set(page.id, list);
    }
    for (const page of structure.pages) {
      const pageSections = sectionsByPage.get(page.id) ?? [];
      if (page.sectionIds.length !== pageSections.length) {
        throw new WebsiteGenerationError(`Page "${page.slug}" section list is incomplete.`, "invalid_structure");
      }
      if (pageSections.length < 1) {
        throw new WebsiteGenerationError(`Page "${page.slug}" has no sections.`, "invalid_structure");
      }
      const componentsBySection = new Map<string, typeof structure.components>();
      for (const component of structure.components.filter((item) => item.sectionId && pageSections.some((section) => section.id === item.sectionId))) {
        const list = componentsBySection.get(component.sectionId) ?? [];
        list.push(component);
        componentsBySection.set(component.sectionId, list);
      }
      for (const section of pageSections) {
        const tree = componentsBySection.get(section.id) ?? [];
        if (tree.length < 1) {
          throw new WebsiteGenerationError(`Section ${section.type} has no components.`, "invalid_structure");
        }
        assertComponentHierarchy(tree, section);
      }
    }

    assertOwnedBy(structure.theme, project, "Theme");
    assertOwnedBy(structure.navigation, project, "Navigation");
    if (structure.project.themeId !== structure.theme.id) {
      throw new WebsiteGenerationError("Project themeId must match the generated theme.", "invalid_structure");
    }
    if (structure.project.activePlanId !== structure.plan.id) {
      throw new WebsiteGenerationError("Project activePlanId must match the generated plan.", "invalid_structure");
    }
  } catch (error) {
    wrapDomainError(error, "invalid_structure");
  }
}

export function assertNoOrphanPages(pages: WebsitePage[], navigation: Navigation): void {
  const navIds = collectNavigationPageIds(navigation);
  for (const page of pages) {
    if (!navIds.has(page.id)) {
      throw new WebsiteGenerationError(`Page "${page.slug}" is orphaned from navigation.`, "orphan_page");
    }
  }
}
