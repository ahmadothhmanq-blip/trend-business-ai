import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { applyStructureTemplateToProject } from "@/lib/website/builder/apply-structure-template";
import { buildStaticPreviewHtml } from "@/lib/website/build-static-preview.server";
import {
  captureStructureSnapshot,
} from "@/lib/website/template-v2/validation/structure-purity";
import {
  isV2ComposedHomePage,
  shouldUseV2PreviewDocument,
} from "@/lib/website/template-v2/preview/v2-preview-input";
import { previewHtmlShowsRawComponentNames } from "@/lib/website/template-v2/preview/repair-structure-first-preview";
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
    components: [
      "SiteHeader",
      "HeroFullBleed",
      "MenuHighlights",
      "SiteFooter",
    ],
    content: ["Seasonal tasting menu", "Reserve your table tonight."],
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
        content:
          "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n:root { --color-primary: #1A1410; }\n",
        language: "css",
      },
      {
        path: "lib/site-images.ts",
        content: "export const HERO_IMAGE = null;",
        language: "typescript",
      },
    ],
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
      requiredSections: ["hero", "menu"],
    },
    strategy: restaurantStrategy,
    settings: {},
  };
}

function previewInputFromProject(
  project: GeneratedWebsiteProject,
  language = "English",
) {
  const settings = (project.settings ?? {}) as Record<string, unknown>;
  return {
    title: project.title,
    description: project.description,
    pages: project.pages,
    sections: project.sections,
    colorPalette: project.colorPalette,
    typography: project.typography,
    content: project.content,
    components: project.components,
    files: project.files,
    templateIntelligenceId:
      (settings.templateIntelligenceId as string | undefined) ?? null,
    templateArchitectureVersion: settings.templateArchitectureVersion as
      | "v1"
      | "v2"
      | undefined,
    templatePackageId: settings.templatePackageId as string | undefined,
    settings,
    language,
  };
}

describe("structure-first preview guard", () => {
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

  it("routes structure-first V2 projects through V2 preview after home compose", async () => {
    const before = captureStructureSnapshot(restaurantProject());
    const applied = await applyStructureTemplateToProject({
      project: restaurantProject(),
      templatePackageId: "saas-enterprise",
      language: "English",
    });

    const input = {
      ...previewInputFromProject(applied.project),
      strategy: applied.project.strategy,
      businessProfile: applied.project.businessProfile,
    };
    assert.equal(shouldUseV2PreviewDocument(input), true);

    const html = buildStaticPreviewHtml(input);
    assert.ok(html.includes('data-v2-render="v2-files-6"'));
    assert.ok(!previewHtmlShowsRawComponentNames(html));

    const globals = applied.project.files?.find((f) => f.path === "app/globals.css");
    assert.ok(globals?.content.includes("Template Architecture V2"));

    const after = captureStructureSnapshot(applied.project);
    assert.deepEqual(after.pages, before.pages);
    assert.deepEqual(after.sectionPlan, before.sectionPlan);
    assert.deepEqual(after.sitemap, before.sitemap);
  });

  it("routes V2-composed app/page.tsx through V2 preview", async () => {
    const applied = await applyStructureTemplateToProject({
      project: restaurantProject(),
      templatePackageId: "saas-enterprise",
      language: "English",
    });

    const v2ComposedPage = `export default function Page() {
  return (
    <div data-v2-package="saas-enterprise" data-v2-layout="region-grid">
      <main>V2 composed shell</main>
    </div>
  );
}`;

    const projectWithV2Page: GeneratedWebsiteProject = {
      ...applied.project,
      files: (applied.project.files ?? []).map((file) =>
        file.path === "app/page.tsx"
          ? { ...file, content: v2ComposedPage }
          : file,
      ),
    };

    const input = previewInputFromProject(projectWithV2Page);
    assert.equal(isV2ComposedHomePage(input), true);
    assert.equal(shouldUseV2PreviewDocument(input), true);

    const html = buildStaticPreviewHtml(input);
    assert.ok(html.includes('data-v2-render="v2-files-6"'));
    assert.ok(html.includes('data-v2-package="saas-enterprise"'));
  });
});

describe("legacy preview routing (WB_STRUCTURE_FIRST=0)", () => {
  const previousFlag = process.env.WB_STRUCTURE_FIRST;

  before(() => {
    delete process.env.WB_STRUCTURE_FIRST;
  });

  after(() => {
    if (previousFlag === undefined) {
      delete process.env.WB_STRUCTURE_FIRST;
    } else {
      process.env.WB_STRUCTURE_FIRST = previousFlag;
    }
  });

  it("keeps V2 preview for stamped v2 projects without structure-first guard", async () => {
    const applied = await applyStructureTemplateToProject({
      project: {
        projectKind: "website",
        title: "Nexus",
        description: "SaaS platform",
        pages: ["home"],
        sections: [],
        colorPalette: [],
        typography: [],
        components: [],
        content: ["Scale revenue."],
        seo: [],
        roadmap: [],
        files: [
          {
            path: "app/page.tsx",
            content: "export default function Page(){return <main/>}",
            language: "tsx",
          },
          {
            path: "app/globals.css",
            content: "@tailwind base;",
            language: "css",
          },
        ],
        settings: {},
      },
      templatePackageId: "saas-enterprise",
      language: "English",
    });

    const input = previewInputFromProject(applied.project);
    assert.equal(shouldUseV2PreviewDocument(input), true);

    const html = buildStaticPreviewHtml(input);
    assert.ok(html.includes('data-v2-render="v2-files-6"'));
    assert.ok(html.includes('data-v2-component="saas-enterprise-hero"'));
  });
});
