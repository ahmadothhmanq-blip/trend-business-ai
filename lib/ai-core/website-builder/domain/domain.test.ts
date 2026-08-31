import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CHILD_COMPONENT_ID,
  CHILD_PAGE_ID,
  COMPONENT_ID,
  PAGE_ID,
  PLAN_ID,
  PROJECT_ID,
  SECTION_ID,
  USER_ID,
  VALID_SEO,
  makeProject,
} from "@/lib/ai-core/website-builder/domain/test-fixtures";
import {
  attachPlanToProject,
  createWebsiteComponent,
  createWebsitePage,
  createWebsitePlan,
  createWebsiteProject,
  createWebsiteSection,
} from "@/lib/ai-core/website-builder/domain/create";
import { WebsiteBuilderError } from "@/lib/ai-core/website-builder/domain/errors";

test("createWebsiteProject starts in draft with no plan or theme", () => {
  const project = createWebsiteProject({
    id: PROJECT_ID,
    userId: USER_ID,
    name: "  Aether Labs  ",
    niche: "saas",
    language: "en",
  });
  assert.equal(project.domainState, "draft");
  assert.equal(project.name, "Aether Labs");
  assert.equal(project.activePlanId, null);
  assert.equal(project.themeId, null);
  assert.equal(project.niche, "saas");
});

test("createWebsitePlan is owned by the project and starts empty", () => {
  const project = makeProject();
  const plan = createWebsitePlan({
    id: PLAN_ID,
    project,
    version: 1,
    objective: "Launch a trustworthy corporate site",
  });
  assert.equal(plan.projectId, project.id);
  assert.equal(plan.userId, project.userId);
  assert.equal(plan.isActive, true);
  assert.deepEqual(plan.pageIds, []);
  const linked = attachPlanToProject(project, plan);
  assert.equal(linked.activePlanId, plan.id);
});

test("createWebsitePage inherits project ownership and plan id", () => {
  const project = makeProject();
  const plan = createWebsitePlan({
    id: PLAN_ID,
    project,
    version: 1,
    objective: "Launch a trustworthy corporate site",
  });
  const page = createWebsitePage({
    id: PAGE_ID,
    project,
    plan,
    slug: "home",
    title: "Home",
    path: "/",
    isHomepage: true,
    order: 0,
    seo: VALID_SEO,
  });
  assert.equal(page.projectId, PROJECT_ID);
  assert.equal(page.userId, USER_ID);
  assert.equal(page.planId, PLAN_ID);
  assert.equal(page.isHomepage, true);
  assert.equal(page.status, "draft");
});

test("createWebsiteSection belongs to its page", () => {
  const project = makeProject();
  const plan = createWebsitePlan({
    id: PLAN_ID,
    project,
    version: 1,
    objective: "Launch a trustworthy corporate site",
  });
  const page = createWebsitePage({
    id: PAGE_ID,
    project,
    plan,
    slug: "home",
    title: "Home",
    path: "/",
    isHomepage: true,
    order: 0,
    seo: VALID_SEO,
  });
  const section = createWebsiteSection({
    id: SECTION_ID,
    page,
    type: "hero",
    order: 0,
  });
  assert.equal(section.pageId, page.id);
  assert.equal(section.projectId, project.id);
  assert.deepEqual(section.componentIds, []);
});

test("createWebsiteComponent belongs to its section", () => {
  const project = makeProject();
  const plan = createWebsitePlan({
    id: PLAN_ID,
    project,
    version: 1,
    objective: "Launch a trustworthy corporate site",
  });
  const page = createWebsitePage({
    id: PAGE_ID,
    project,
    plan,
    slug: "home",
    title: "Home",
    path: "/",
    isHomepage: true,
    order: 0,
    seo: VALID_SEO,
  });
  const section = createWebsiteSection({
    id: SECTION_ID,
    page,
    type: "hero",
    order: 0,
  });
  const heading = createWebsiteComponent({
    id: COMPONENT_ID,
    section,
    type: "heading",
    order: 0,
    props: { text: "Precision infrastructure" },
  });
  const groupChild = createWebsiteComponent({
    id: CHILD_COMPONENT_ID,
    section,
    type: "text",
    order: 0,
    parentComponentId: heading.id,
    props: { text: "Built for operators." },
  });
  assert.equal(heading.sectionId, section.id);
  assert.equal(groupChild.parentComponentId, heading.id);
});

test("createWebsitePage rejects a plan from another project", () => {
  const project = makeProject();
  const other = makeProject({ id: CHILD_PAGE_ID, userId: USER_ID });
  const foreignPlan = createWebsitePlan({
    id: PLAN_ID,
    project: other,
    version: 1,
    objective: "Launch a trustworthy corporate site",
  });
  assert.throws(
    () =>
      createWebsitePage({
        id: PAGE_ID,
        project,
        plan: foreignPlan,
        slug: "home",
        title: "Home",
        path: "/",
        isHomepage: true,
        order: 0,
        seo: VALID_SEO,
      }),
    (error: unknown) => error instanceof WebsiteBuilderError && error.code === "ownership",
  );
});

test("createWebsitePlan is rejected outside draft/planning", () => {
  const project = makeProject({ domainState: "ready" });
  assert.throws(
    () =>
      createWebsitePlan({
        id: PLAN_ID,
        project,
        version: 1,
        objective: "Launch a trustworthy corporate site",
      }),
    (error: unknown) => error instanceof WebsiteBuilderError && error.code === "invalid_plan",
  );
});
