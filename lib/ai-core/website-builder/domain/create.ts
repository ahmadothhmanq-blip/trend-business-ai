/**
 * Pure constructors for Website Builder aggregates (Phase 1).
 * No AI, HTML, persistence, or IDs from external systems.
 */

import type {
  WebsiteComponent,
  WebsiteComponentType,
  WebsiteNiche,
  WebsitePage,
  WebsitePlan,
  WebsiteProject,
  WebsiteSection,
  WebsiteSectionType,
  WebsiteSeo,
} from "@/lib/ai-core/website-builder/domain/contracts";
import { WebsiteBuilderError } from "@/lib/ai-core/website-builder/domain/errors";
import {
  assertValidComponent,
  assertValidPage,
  assertValidPlan,
  assertValidProject,
  assertValidSection,
  assertWebsiteUuid,
} from "@/lib/ai-core/website-builder/domain/validation";

function nowIso(): string {
  return new Date().toISOString();
}

export type CreateWebsiteProjectInput = {
  id: string;
  userId: string;
  name: string;
  niche: WebsiteNiche;
  language: string;
};

export function createWebsiteProject(input: CreateWebsiteProjectInput): WebsiteProject {
  const createdAt = nowIso();
  const project: WebsiteProject = {
    id: input.id,
    userId: input.userId,
    name: input.name.trim(),
    niche: input.niche,
    language: input.language,
    domainState: "draft",
    activePlanId: null,
    themeId: null,
    createdAt,
    updatedAt: createdAt,
  };
  assertValidProject(project);
  return project;
}

export type CreateWebsitePlanInput = {
  id: string;
  project: WebsiteProject;
  version: number;
  objective: string;
};

export function createWebsitePlan(input: CreateWebsitePlanInput): WebsitePlan {
  if (input.project.domainState !== "draft" && input.project.domainState !== "planning") {
    throw new WebsiteBuilderError(
      "Plans can only be created while the project is draft or planning.",
      "invalid_plan",
    );
  }
  const plan: WebsitePlan = {
    id: input.id,
    projectId: input.project.id,
    userId: input.project.userId,
    version: input.version,
    isActive: true,
    status: "active",
    objective: input.objective.trim(),
    pageIds: [],
    createdAt: nowIso(),
  };
  assertValidPlan(plan, input.project);
  return plan;
}

export type CreateWebsitePageInput = {
  id: string;
  project: WebsiteProject;
  plan: WebsitePlan;
  slug: string;
  title: string;
  path: string;
  isHomepage: boolean;
  parentPageId?: string | null;
  order: number;
  seo: WebsiteSeo;
};

export function createWebsitePage(input: CreateWebsitePageInput): WebsitePage {
  if (input.plan.projectId !== input.project.id || input.plan.userId !== input.project.userId) {
    throw new WebsiteBuilderError("Plan does not belong to this project.", "ownership");
  }
  const page: WebsitePage = {
    id: input.id,
    projectId: input.project.id,
    userId: input.project.userId,
    planId: input.plan.id,
    slug: input.slug,
    title: input.title.trim(),
    path: input.path,
    isHomepage: input.isHomepage,
    parentPageId: input.parentPageId ?? null,
    order: input.order,
    sectionIds: [],
    seo: input.seo,
    status: "draft",
  };
  assertValidPage(page, input.project);
  return page;
}

export type CreateWebsiteSectionInput = {
  id: string;
  page: WebsitePage;
  type: WebsiteSectionType;
  order: number;
};

export function createWebsiteSection(input: CreateWebsiteSectionInput): WebsiteSection {
  const section: WebsiteSection = {
    id: input.id,
    projectId: input.page.projectId,
    userId: input.page.userId,
    pageId: input.page.id,
    type: input.type,
    order: input.order,
    componentIds: [],
  };
  assertValidSection(section, input.page);
  return section;
}

export type CreateWebsiteComponentInput = {
  id: string;
  section: WebsiteSection;
  type: WebsiteComponentType;
  order: number;
  parentComponentId?: string | null;
  props?: Record<string, string | number | boolean | null>;
};

export function createWebsiteComponent(input: CreateWebsiteComponentInput): WebsiteComponent {
  const component: WebsiteComponent = {
    id: input.id,
    projectId: input.section.projectId,
    userId: input.section.userId,
    sectionId: input.section.id,
    parentComponentId: input.parentComponentId ?? null,
    type: input.type,
    order: input.order,
    props: input.props ?? {},
  };
  assertValidComponent(component, input.section);
  return component;
}

export function attachPlanToProject(project: WebsiteProject, plan: WebsitePlan): WebsiteProject {
  assertWebsiteUuid(plan.id, "plan.id");
  if (plan.projectId !== project.id || plan.userId !== project.userId) {
    throw new WebsiteBuilderError("Plan does not belong to this project.", "ownership");
  }
  return {
    ...project,
    activePlanId: plan.id,
    updatedAt: nowIso(),
  };
}
