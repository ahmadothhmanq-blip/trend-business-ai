/**
 * Website Generation Engine (Phase 3).
 * Maps DirectorWebsitePlan → domain structure. No HTML, React, CSS, DB, or publish.
 */

import { createHash, randomUUID } from "node:crypto";
import type {
  Navigation,
  NavigationItem,
  Theme,
  WebsiteComponent,
  WebsiteComponentType,
  WebsitePage,
  WebsitePlan,
  WebsiteProject,
  WebsiteSection,
  WebsiteSectionType,
  WebsiteSeo,
} from "@/lib/ai-core/website-builder/domain/contracts";
import { createWebsiteComponent, createWebsitePage, createWebsiteSection } from "@/lib/ai-core/website-builder/domain/create";
import { transition } from "@/lib/ai-core/website-builder/domain/state-machine";
import type { DirectorNavItem, DirectorPlannedPage, DirectorWebsitePlan } from "@/lib/ai-core/website-builder/director/contracts";
import type {
  StandardWebsiteSection,
  WebsiteGeneratedStructure,
  WebsiteGenerationContext,
  WebsiteGenerationInput,
  WebsiteGenerationResult,
  WebsiteGenerationStore,
  WebsiteStructureBuilder,
} from "@/lib/ai-core/website-builder/generation/contracts";
import { DIRECTOR_TO_DOMAIN_SECTION, STANDARD_WEBSITE_SECTIONS } from "@/lib/ai-core/website-builder/generation/contracts";
import { WebsiteGenerationError } from "@/lib/ai-core/website-builder/generation/errors";
import { assertGeneratedWebsite, assertWebsiteGenerationInput } from "@/lib/ai-core/website-builder/generation/validation";

const MAX_ATTEMPTS = 2;

export function createMemoryWebsiteGenerationStore(): WebsiteGenerationStore {
  const structures = new Map<string, WebsiteGeneratedStructure>();
  return {
    get: (key) => structures.get(key),
    set: (key, structure) => {
      structures.set(key, structure);
    },
  };
}

export function websiteGenerationIdempotencyKey(input: WebsiteGenerationInput): string {
  const payload = JSON.stringify({
    projectId: input.project.id,
    userId: input.project.userId,
    directorPlanId: input.directorPlan.id,
    version: input.directorPlan.version,
    promptHash: input.directorPlan.promptHash,
  });
  return createHash("sha256").update(payload).digest("hex");
}

function clip(text: string, min: number, max: number, fallback: string): string {
  const source = text.trim() || fallback.trim();
  if (source.length > max) return source.slice(0, max).trim();
  if (source.length >= min) return source;
  const padded = `${source} — ${fallback}`.trim();
  if (padded.length > max) return padded.slice(0, max).trim();
  if (padded.length >= min) return padded;
  return fallback.slice(0, max);
}

function pageSeo(plan: DirectorWebsitePlan, page: DirectorPlannedPage): WebsiteSeo {
  const title = clip(`${page.name} | ${plan.seoStrategy.titleTemplate}`, 10, 70, plan.seoStrategy.titleTemplate);
  const description = clip(page.purpose, 50, 160, plan.seoStrategy.metaDescriptionTemplate);
  return {
    title,
    description,
    canonicalUrl: null,
    ogTitle: title,
    ogDescription: description,
    ogImageAssetId: null,
    robots: "index,follow",
    locale: plan.seoStrategy.locale,
  };
}

function mapNavItems(items: DirectorNavItem[], slugToId: Map<string, string>): NavigationItem[] {
  return items.map((item) => {
    const pageId = slugToId.get(item.pageSlug);
    if (!pageId) {
      throw new WebsiteGenerationError(`Navigation references unknown page "${item.pageSlug}".`, "orphan_page");
    }
    return {
      pageId,
      label: item.label,
      order: item.order,
      children: mapNavItems(item.children, slugToId),
    };
  });
}

type ComponentSpec = {
  type: WebsiteComponentType;
  props: Record<string, string | number | boolean | null>;
  children?: ComponentSpec[];
};

function sectionRecipe(
  type: WebsiteSectionType,
  page: DirectorPlannedPage,
  plan: DirectorWebsitePlan,
  purpose: string,
): ComponentSpec[] {
  const heading = page.name;
  const lede = purpose;
  const cta = plan.strategy.conversionFocus;
  const recipes: Record<StandardWebsiteSection, ComponentSpec[]> = {
    hero: [
      { type: "heading", props: { role: "title", text: heading } },
      { type: "text", props: { role: "lede", text: lede } },
      { type: "button", props: { role: "primary-cta", text: cta } },
      { type: "image", props: { role: "hero-visual", alt: `${heading} visual` } },
    ],
    features: [
      { type: "heading", props: { role: "title", text: heading } },
      {
        type: "group",
        props: { role: "feature-grid" },
        children: [0, 1, 2].map((index) => ({
          type: "card" as const,
          props: { role: "feature", text: `${lede} (${index + 1})` },
        })),
      },
    ],
    services: [
      { type: "heading", props: { role: "title", text: heading } },
      {
        type: "group",
        props: { role: "service-list" },
        children: [0, 1, 2].map((index) => ({
          type: "card" as const,
          props: { role: "service", text: `${lede} (${index + 1})` },
        })),
      },
    ],
    about: [
      { type: "heading", props: { role: "title", text: heading } },
      { type: "text", props: { role: "body", text: plan.brandSummary } },
      { type: "image", props: { role: "about-visual", alt: `${heading} studio visual` } },
    ],
    testimonials: [
      { type: "heading", props: { role: "title", text: heading } },
      { type: "quote", props: { role: "testimonial", text: lede } },
      { type: "quote", props: { role: "testimonial", text: plan.business.uniqueValue } },
    ],
    pricing: [
      { type: "heading", props: { role: "title", text: heading } },
      {
        type: "group",
        props: { role: "pricing-tiers" },
        children: ["Launch", "Growth", "Enterprise"].map((tier) => ({
          type: "card" as const,
          props: { role: "tier", text: tier },
        })),
      },
    ],
    faq: [
      { type: "heading", props: { role: "title", text: heading } },
      { type: "list", props: { role: "faq", text: lede } },
    ],
    contact: [
      { type: "heading", props: { role: "title", text: heading } },
      { type: "text", props: { role: "lede", text: lede } },
      {
        type: "form",
        props: {
          role: "intake",
          kind: plan.forms[0]?.kind ?? "contact",
          fields: (plan.forms[0]?.fields ?? ["name", "email", "message"]).join(","),
        },
      },
    ],
    cta: [
      { type: "heading", props: { role: "title", text: heading } },
      { type: "text", props: { role: "lede", text: cta } },
      { type: "button", props: { role: "primary-cta", text: cta } },
    ],
    gallery: [
      { type: "heading", props: { role: "title", text: heading } },
      { type: "image", props: { role: "gallery-item", alt: `${heading} still 1` } },
      { type: "image", props: { role: "gallery-item", alt: `${heading} still 2` } },
    ],
    team: [
      { type: "heading", props: { role: "title", text: heading } },
      {
        type: "group",
        props: { role: "team-grid" },
        children: [0, 1].map((index) => ({
          type: "card" as const,
          props: { role: "person", text: `Leadership profile ${index + 1}` },
        })),
      },
    ],
    blog: [
      { type: "heading", props: { role: "title", text: heading } },
      { type: "list", props: { role: "article-index", text: lede } },
      { type: "link", props: { role: "all-articles", text: "View articles" } },
    ],
    footer: [
      { type: "text", props: { role: "copyright", text: plan.brandSummary } },
      { type: "link", props: { role: "home", text: "Home" } },
      { type: "divider", props: { role: "rule" } },
    ],
  };
  if ((STANDARD_WEBSITE_SECTIONS as readonly string[]).includes(type)) {
    return recipes[type as StandardWebsiteSection];
  }
  return recipes.about;
}

function addComponents(
  specs: ComponentSpec[],
  section: WebsiteSection,
  createId: () => string,
  parentId: string | null,
): WebsiteComponent[] {
  const created: WebsiteComponent[] = [];
  specs.forEach((spec, order) => {
    const component = createWebsiteComponent({
      id: createId(),
      section,
      type: spec.type,
      order,
      parentComponentId: parentId,
      props: spec.props,
    });
    created.push(component);
    if (spec.children?.length) {
      created.push(...addComponents(spec.children, section, createId, component.id));
    }
  });
  return created;
}

function plannedSections(page: DirectorPlannedPage): Array<{ type: WebsiteSectionType; purpose: string }> {
  const mapped = page.sections.map((section) => ({
    type: DIRECTOR_TO_DOMAIN_SECTION[section.type],
    purpose: section.purpose,
  }));
  if (!mapped.some((section) => section.type === "footer")) {
    mapped.push({ type: "footer", purpose: "Persistent utility footer for trust and orientation." });
  }
  return mapped;
}

export function buildWebsiteDomainStructure(context: WebsiteGenerationContext): WebsiteGeneratedStructure {
  const { directorPlan, createId, now } = context;
  let project = context.project;
  const createdAt = now();

  const theme: Theme = {
    id: createId(),
    projectId: project.id,
    userId: project.userId,
    name: directorPlan.suggestedTheme.name,
    colors: directorPlan.suggestedTheme.colors,
    fonts: directorPlan.suggestedTheme.fonts,
    radiusPx: directorPlan.suggestedTheme.radiusPx,
    createdAt,
    updatedAt: createdAt,
  };

  const plan: WebsitePlan = {
    id: directorPlan.id,
    projectId: project.id,
    userId: project.userId,
    version: directorPlan.version,
    isActive: true,
    status: "active",
    objective: directorPlan.goals[0] ?? directorPlan.brandSummary,
    pageIds: [],
    createdAt: directorPlan.createdAt,
  };

  const slugToId = new Map<string, string>();
  for (const page of directorPlan.requiredPages) {
    slugToId.set(page.slug, createId());
  }

  const sitemapBySlug = new Map(directorPlan.sitemap.map((node) => [node.slug, node]));
  const pages: WebsitePage[] = directorPlan.requiredPages.map((planned, order) => {
    const node = sitemapBySlug.get(planned.slug);
    if (!node) {
      throw new WebsiteGenerationError(`Page "${planned.slug}" is missing from the sitemap.`, "orphan_page");
    }
    const parentSlug = planned.isHomepage ? null : node.parentSlug;
    const parentPageId = parentSlug ? slugToId.get(parentSlug) ?? null : null;
    if (parentSlug && !parentPageId) {
      throw new WebsiteGenerationError(`Page "${planned.slug}" has an unknown parent.`, "orphan_page");
    }
    return createWebsitePage({
      id: slugToId.get(planned.slug)!,
      project,
      plan,
      slug: planned.slug,
      title: planned.name,
      path: planned.isHomepage ? "/" : node.path,
      isHomepage: planned.isHomepage,
      parentPageId,
      order,
      seo: pageSeo(directorPlan, planned),
    });
  });

  const pagesBySlug = new Map(pages.map((page) => [page.slug, page]));
  const sections: WebsiteSection[] = [];
  const components: WebsiteComponent[] = [];

  for (const planned of directorPlan.requiredPages) {
    const page = pagesBySlug.get(planned.slug)!;
    const specs = plannedSections(planned);
    const pageSections: WebsiteSection[] = [];
    specs.forEach((spec, order) => {
      let section = createWebsiteSection({
        id: createId(),
        page,
        type: spec.type,
        order,
      });
      const tree = addComponents(sectionRecipe(spec.type, planned, directorPlan, spec.purpose), section, createId, null);
      section = { ...section, componentIds: tree.map((component) => component.id) };
      pageSections.push(section);
      sections.push(section);
      components.push(...tree);
    });
    const index = pages.findIndex((item) => item.id === page.id);
    pages[index] = { ...page, sectionIds: pageSections.map((section) => section.id), status: "planned" };
  }

  plan.pageIds = pages.map((page) => page.id);

  const navigation: Navigation = {
    id: createId(),
    projectId: project.id,
    userId: project.userId,
    items: mapNavItems(directorPlan.navigation, slugToId),
    createdAt,
    updatedAt: createdAt,
  };

  const homepage = pages.find((page) => page.isHomepage);
  if (!homepage) {
    throw new WebsiteGenerationError("Generated structure is missing a homepage.", "missing_homepage");
  }

  project = {
    ...project,
    activePlanId: plan.id,
    themeId: theme.id,
    updatedAt: createdAt,
  };

  const structure: WebsiteGeneratedStructure = {
    plan,
    pages,
    sections,
    components,
    navigation,
    theme,
    seo: homepage.seo,
    project,
  };
  assertGeneratedWebsite(structure, project);
  return structure;
}

const defaultBuilder: WebsiteStructureBuilder = { build: buildWebsiteDomainStructure };

export type RunWebsiteGenerationParams = {
  input: WebsiteGenerationInput;
  builder?: WebsiteStructureBuilder;
  store?: WebsiteGenerationStore;
  createId?: () => string;
  now?: () => string;
};

function failedResult(error: WebsiteGenerationError, attempts: number): WebsiteGenerationResult {
  return {
    status: "failed",
    structure: null,
    reused: false,
    attempts,
    errorCode: error.code,
    errorMessage: error.message,
  };
}

function toGenerationError(error: unknown, fallback: WebsiteGenerationError["code"]): WebsiteGenerationError {
  if (error instanceof WebsiteGenerationError) return error;
  return new WebsiteGenerationError(
    error instanceof Error ? error.message : "Website generation failed.",
    fallback,
  );
}

function withGeneratingState(project: WebsiteProject): WebsiteProject {
  if (project.domainState === "planned") return transition(project, "generating");
  return project;
}

function withEditingState(project: WebsiteProject): WebsiteProject {
  if (project.domainState === "generating") return transition(project, "editing");
  return project;
}

export async function runWebsiteGeneration(params: RunWebsiteGenerationParams): Promise<WebsiteGenerationResult> {
  try {
    assertWebsiteGenerationInput(params.input);
  } catch (error) {
    return failedResult(toGenerationError(error, "invalid_input"), 0);
  }

  const key = websiteGenerationIdempotencyKey(params.input);
  const existing = params.store?.get(key);
  if (existing) {
    return { status: "reused", structure: existing, reused: true, attempts: 0 };
  }

  const builder = params.builder ?? defaultBuilder;
  const createId = params.createId ?? randomUUID;
  const now = params.now ?? (() => new Date().toISOString());
  let attempts = 0;
  let lastError: WebsiteGenerationError | null = null;

  while (attempts < MAX_ATTEMPTS) {
    attempts += 1;
    try {
      const generatingProject = withGeneratingState(params.input.project);
      const structure = builder.build({
        project: generatingProject,
        directorPlan: params.input.directorPlan,
        createId,
        now,
      });
      const completed: WebsiteGeneratedStructure = {
        ...structure,
        project: withEditingState(structure.project),
      };
      assertGeneratedWebsite(completed, completed.project);
      params.store?.set(key, completed);
      return { status: "ready", structure: completed, reused: false, attempts };
    } catch (error) {
      lastError = toGenerationError(error, attempts === 1 ? "generation_failed" : "invalid_structure");
    }
  }

  return failedResult(lastError ?? new WebsiteGenerationError("Website generation failed.", "generation_failed"), attempts);
}
