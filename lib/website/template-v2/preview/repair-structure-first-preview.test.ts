import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { buildStaticPreviewHtml } from "@/lib/website/build-static-preview.server";
import { applyStructureTemplateToProject } from "@/lib/website/builder/apply-structure-template";
import {
  homePageListsRawComponentNames,
  previewHtmlShowsRawComponentNames,
  repairStructureFirstPreviewFiles,
} from "@/lib/website/template-v2/preview/repair-structure-first-preview";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { WebsiteStrategy } from "@/lib/website/types/layers";

const realEstateStrategy: WebsiteStrategy = {
  positioning: "عقارات فاخرة",
  sitemap: ["/"],
  pages: [
    {
      name: "الرئيسية",
      path: "/",
      purpose: "landing",
      keySections: ["hero", "listings", "locations"],
      primaryCta: "عرض العقارات",
    },
  ],
  sectionPlan: [
    {
      id: "home-hero",
      page: "الرئيسية",
      name: "hero",
      goal: "Search",
      contentNotes: "",
    },
    {
      id: "home-listings",
      page: "الرئيسية",
      name: "listings",
      goal: "Listings",
      contentNotes: "",
    },
    {
      id: "home-locations",
      page: "الرئيسية",
      name: "locations",
      goal: "Locations",
      contentNotes: "",
    },
  ],
  conversionFunnel: [],
  contentStructure: [],
  contentStrategy: {
    brandVoice: "corporate",
    messagingPillars: [],
    proofPoints: [],
    objectionHandlers: [],
    seoTopics: [],
  },
  ctas: ["عرض العقارات"],
  seoFocus: [],
};

function arabicRealEstateProject(): GeneratedWebsiteProject {
  return {
    projectKind: "website",
    title: "شركة أفق العقارية",
    description: "عقارات فاخرة",
    pages: ["الرئيسية"],
    sections: realEstateStrategy.sectionPlan.map(
      (section) => `${section.page}: ${section.name}`,
    ),
    colorPalette: [],
    typography: [],
    components: [
      "SiteHeader",
      "HeroProperty",
      "PropertyListings",
      "LocationSections",
      "ContactSection",
      "SiteFooter",
    ],
    content: ["عقارات فاخرة"],
    seo: [],
    roadmap: [],
    files: [
      {
        path: "app/page.tsx",
        content: `export default function Page() {
  return (
    <main>
      SiteHeader
      HeroProperty
      PropertyListings
      LocationSections
      ContactSection
      SiteFooter
    </main>
  );
}`,
        language: "tsx",
      },
      {
        path: "app/globals.css",
        content:
          "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n",
        language: "css",
      },
      {
        path: "lib/site-images.ts",
        content: "export const HERO_IMAGE = null;",
        language: "typescript",
      },
    ],
    businessProfile: {
      projectName: "شركة أفق العقارية",
      industry: "real-estate",
      targetAudience: "Buyers",
      businessGoals: ["Leads"],
      offer: "Real estate",
      tone: "corporate",
      geography: "Regional",
      competitors: [],
      kpis: [],
      summary: "Real estate",
      requiredSections: ["hero", "listings"],
    },
    strategy: realEstateStrategy,
    settings: {},
  };
}

describe("repair-structure-first-preview", () => {
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

  it("detects raw component names in app/page.tsx", () => {
    const page = arabicRealEstateProject().files?.[0]?.content ?? "";
    assert.equal(homePageListsRawComponentNames(page), true);
  });

  it("repairs Arabic structure-first preview through V2 renderer", async () => {
    const applied = await applyStructureTemplateToProject({
      project: arabicRealEstateProject(),
      templatePackageId: "real-estate-prestige",
      language: "Arabic",
    });

    const input = {
      title: applied.project.title,
      description: applied.project.description,
      pages: applied.project.pages,
      sections: applied.project.sections,
      colorPalette: applied.project.colorPalette,
      typography: applied.project.typography,
      content: applied.project.content,
      components: applied.project.components,
      files: applied.project.files,
      templateArchitectureVersion: "v2" as const,
      templatePackageId: "real-estate-prestige",
      settings: applied.project.settings as Record<string, unknown>,
      language: "Arabic",
      industryId: "real-estate",
      strategy: applied.project.strategy,
      businessProfile: applied.project.businessProfile,
    };

    const repaired = repairStructureFirstPreviewFiles(input);
    const page = repaired.find((file) => file.path === "app/page.tsx")?.content ?? "";
    assert.ok(page.includes("<HeroProperty"));
    assert.equal(homePageListsRawComponentNames(page), false);

    const html = buildStaticPreviewHtml({ ...input, files: repaired });
    assert.ok(html.includes('data-v2-render="v2-files-6"'));
    assert.equal(previewHtmlShowsRawComponentNames(html), false);
  });
});
