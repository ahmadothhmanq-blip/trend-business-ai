import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { applyStructureTemplateToProject } from "@/lib/website/builder/apply-structure-template";
import { createCapabilityService } from "@/lib/website/builder/capabilities/service";
import {
  captureStructureSnapshot,
} from "@/lib/website/template-v2/validation/structure-purity";
import {
  finalizeV2StructureAfterGeneration,
} from "@/lib/website/template-v2/generation/v2-generation-bridge";
import { V2_MOTION_PATH } from "@/lib/website/template-v2/motion/emit-motion";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { WebsiteStrategy } from "@/lib/website/types/layers";

const GENERATED_PAGE_MARKER =
  'data-structure-first-generated="restaurant-hero-menu-cta"';

const restaurantStrategy: WebsiteStrategy = {
  positioning: "Fine dining",
  sitemap: ["/", "/menu"],
  pages: [
    {
      name: "Home",
      path: "/",
      purpose: "Welcome guests",
      keySections: ["hero", "menu"],
      primaryCta: "Book a table",
    },
    {
      name: "Menu",
      path: "/menu",
      purpose: "Show dishes",
      keySections: ["menu"],
      primaryCta: "Reserve",
    },
  ],
  sectionPlan: [
    {
      id: "home-hero",
      page: "Home",
      name: "hero",
      goal: "Welcome",
      contentNotes: "",
    },
    {
      id: "home-menu",
      page: "Home",
      name: "menu",
      goal: "Show dishes",
      contentNotes: "",
    },
    {
      id: "home-cta",
      page: "Home",
      name: "cta",
      goal: "Book",
      contentNotes: "",
    },
  ],
  conversionFunnel: [],
  contentStructure: [],
  contentStrategy: {
    brandVoice: "warm",
    messagingPillars: [],
    proofPoints: [],
    objectionHandlers: [],
    seoTopics: [],
  },
  ctas: ["Book a table"],
  seoFocus: [],
};

function restaurantProject(): GeneratedWebsiteProject {
  return {
    projectKind: "website",
    title: "Bistro Lumière",
    description: "Seasonal tasting menu",
    pages: ["Home", "Menu"],
    sections: restaurantStrategy.sectionPlan.map(
      (section) => `${section.page}: ${section.name}`,
    ),
    colorPalette: [],
    typography: [],
    content: ["Seasonal tasting menu"],
    seo: [],
    roadmap: [],
    files: [
      {
        path: "app/page.tsx",
        content: `export default function GeneratedHome() {
  return <main ${GENERATED_PAGE_MARKER}>Restaurant hero, menu, cta</main>;
}`,
        language: "tsx",
      },
      {
        path: "app/globals.css",
        content: "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n",
        language: "css",
      },
      {
        path: "lib/site-images.ts",
        content: "export const HERO_IMAGE = null;",
        language: "typescript",
      },
    ],
    components: ["restaurant-hero", "restaurant-menu", "restaurant-cta"],
    businessProfile: {
      projectName: "Bistro Lumière",
      industry: "restaurant",
      targetAudience: "Diners",
      businessGoals: ["Fill tables"],
      offer: "Fine dining",
      tone: "warm",
      geography: "Local",
      competitors: [],
      kpis: [],
      summary: "Restaurant",
      requiredSections: ["hero", "menu", "cta"],
    },
    strategy: restaurantStrategy,
    settings: {},
  };
}

describe("structure-first template skin", () => {
  const previousFlag = process.env.WB_STRUCTURE_FIRST;

  before(() => {
    process.env.WB_STRUCTURE_FIRST = "1";
  });

  after(() => {
    if (previousFlag === undefined) {
      delete process.env.WB_STRUCTURE_FIRST;
    } else {
      process.env.WB_STRUCTURE_FIRST = previousFlag;
    }
  });

  it("does not add SaaS manifest routes when a SaaS skin is applied", async () => {
    const before = captureStructureSnapshot(
      restaurantProject(),
      createCapabilityService(restaurantProject()).getActiveCapabilities(),
    );
    const result = await applyStructureTemplateToProject({
      project: restaurantProject(),
      templatePackageId: "saas-enterprise",
      language: "English",
    });

    const routeFiles =
      result.project.files
        ?.filter((file) => /^app\/.+\/page\.tsx$/.test(file.path))
        .map((file) => file.path) ?? [];

    assert.ok(!routeFiles.includes("app/platform/page.tsx"));
    assert.ok(!routeFiles.includes("app/pricing/page.tsx"));
    assert.ok(!routeFiles.includes("app/customers/page.tsx"));
    assert.deepEqual(result.project.pages, ["Home", "Menu"]);
    assert.equal(result.project.strategy?.pages.length, 2);
    assert.equal(result.project.strategy?.sitemap.join(","), "/,/menu");
    assert.equal(result.project.components?.join(","), "restaurant-hero,restaurant-menu,restaurant-cta");

    const homePage = result.project.files?.find((f) => f.path === "app/page.tsx");
    assert.ok(homePage?.content.includes(GENERATED_PAGE_MARKER));
    assert.ok(!homePage?.content.includes('data-v2-package="saas-enterprise"'));

    const globals = result.project.files?.find((f) => f.path === "app/globals.css");
    assert.ok(globals?.content.includes("Template Architecture V2"));
    assert.ok(globals?.content.includes("--color-primary"));

    const motion = result.project.files?.find((f) => f.path === V2_MOTION_PATH);
    assert.ok(motion?.content.length);

    const after = captureStructureSnapshot(
      result.project,
      createCapabilityService(result.project, result.project.files).getActiveCapabilities(),
    );
    assert.deepEqual(after.pages, before.pages);
    assert.deepEqual(after.sitemap, before.sitemap);
    assert.deepEqual(after.sectionPlan, before.sectionPlan);
    assert.deepEqual(after.capabilityIds, before.capabilityIds);
  });

  it("finalizeV2StructureAfterGeneration preserves generated app/page.tsx", async () => {
    const project = restaurantProject();
    const finalized = await finalizeV2StructureAfterGeneration(
      project,
      {
        websiteStructureTemplateId: "saas-enterprise",
        language: "English",
      },
    );

    const homePage = finalized.files?.find((f) => f.path === "app/page.tsx");
    assert.ok(homePage?.content.includes(GENERATED_PAGE_MARKER));
    assert.ok(!homePage?.content.includes("composeRegionGridPage"));
    assert.deepEqual(finalized.pages, ["Home", "Menu"]);
    assert.equal(
      (finalized.settings as Record<string, unknown>).templatePackageId,
      "saas-enterprise",
    );
  });
});
