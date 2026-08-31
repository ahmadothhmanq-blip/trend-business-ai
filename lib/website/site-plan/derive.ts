import type { BuilderWorkspaceStructure } from "@/lib/website/builder/types";
import {
  getSiteArchetypeDefinition,
  suggestCapabilitiesForArchetype,
} from "@/lib/website/site-plan/archetypes";
import { detectSiteArchetypeFromText } from "@/lib/website/site-plan/detect-archetype";
import { computeSitePlanHash } from "@/lib/website/site-plan/hash";
import {
  DEFAULT_SITE_IMAGE_STRATEGY,
  resolveSiteImageStrategy,
  type SiteImageStrategy,
} from "@/lib/website/site-plan/image-strategy";
import {
  SITE_PLAN_SPEC_VERSION,
  type SiteArchetypeId,
  type SitePlan,
  type SitePlanInput,
  type SitePlanPage,
  type SitePlanSection,
} from "@/lib/website/site-plan/types";
import type { WebsiteStrategy } from "@/lib/website/types/layers";

export type DeriveSitePlanParams = {
  input?: SitePlanInput;
  strategy?: WebsiteStrategy | null;
  workspace?: BuilderWorkspaceStructure | null;
};

function pagesFromArchetype(archetypeId: SiteArchetypeId): SitePlanPage[] {
  const def = getSiteArchetypeDefinition(archetypeId);
  return def.defaultPages.map((page) => ({
    name: page.name,
    path: page.path,
    purpose: page.purpose,
    sectionIds: def.defaultSections
      .filter((s) => s.pagePath === page.path)
      .map((s) => s.id),
  }));
}

function sectionsFromStrategy(strategy: WebsiteStrategy): SitePlanSection[] {
  return strategy.sectionPlan.map((s) => ({
    id: s.id,
    pagePath: s.page.startsWith("/") ? s.page : `/${s.page}`,
    name: s.name,
    goal: s.goal,
    contentNotes: s.contentNotes,
  }));
}

function pagesFromStrategy(strategy: WebsiteStrategy): SitePlanPage[] {
  return strategy.pages.map((page) => ({
    name: page.name,
    path: page.path,
    purpose: page.purpose,
    sectionIds: strategy.sectionPlan
      .filter((s) => s.page === page.name || s.page === page.path)
      .map((s) => s.id),
  }));
}

function sectionsFromWorkspace(
  workspace: BuilderWorkspaceStructure,
): SitePlanSection[] {
  return workspace.sections.map((s) => ({
    id: s.id,
    pagePath: workspace.selectedPageRoute || "/",
    name: s.label,
    goal: s.kind,
  }));
}

function mergeCapabilities(
  archetypeId: SiteArchetypeId,
  extra: string[] = [],
): SitePlan["capabilities"] {
  const base = new Set(suggestCapabilitiesForArchetype(archetypeId));
  for (const id of extra) {
    if (id) base.add(id as SitePlan["capabilities"][number]);
  }
  return [...base];
}

/**
 * Build a canonical SitePlan from archetype, AI strategy, and/or workspace view.
 */
export function deriveSitePlan(params: DeriveSitePlanParams): SitePlan {
  const prompt = params.input?.prompt ?? "";
  const archetypeId =
    params.input?.archetypeId ??
    detectSiteArchetypeFromText(
      [prompt, params.input?.industry, params.strategy?.positioning]
        .filter(Boolean)
        .join(" "),
    );

  const imageStrategy: SiteImageStrategy = resolveSiteImageStrategy(
    params.input?.imageStrategy ?? DEFAULT_SITE_IMAGE_STRATEGY,
  );

  let pages: SitePlanPage[];
  let sections: SitePlanSection[];
  let derivedFrom: SitePlan["derivedFrom"] = "archetype";

  if (params.strategy?.sectionPlan?.length) {
    sections = sectionsFromStrategy(params.strategy);
    pages =
      params.strategy.pages?.length > 0
        ? pagesFromStrategy(params.strategy)
        : pagesFromArchetype(archetypeId);
    derivedFrom = params.workspace?.sections?.length ? "merged" : "strategy";
  } else if (params.workspace?.sections?.length) {
    sections = sectionsFromWorkspace(params.workspace);
    pages = pagesFromArchetype(archetypeId);
    derivedFrom = "workspace";
  } else {
    const def = getSiteArchetypeDefinition(archetypeId);
    sections = def.defaultSections.map((s) => ({ ...s }));
    pages = pagesFromArchetype(archetypeId);
    derivedFrom = "archetype";
  }

  const capabilities = mergeCapabilities(archetypeId);

  const base = {
    specVersion: SITE_PLAN_SPEC_VERSION,
    archetypeId,
    industry: params.input?.industry,
    language: params.input?.language,
    pages,
    sections,
    capabilities,
    imageStrategy,
    derivedFrom,
  };

  const planHash = computeSitePlanHash(base);

  return {
    ...base,
    planHash,
    createdAt: new Date().toISOString(),
  };
}

export function attachSitePlanToProject<T extends { sitePlan?: SitePlan }>(
  project: T,
  plan: SitePlan,
): T & { sitePlan: SitePlan } {
  return { ...project, sitePlan: plan };
}
