import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createCapabilityService,
  refreshCapabilities,
} from "@/lib/website/builder/capabilities/service";

describe("WebsiteCapabilityService", () => {
  it("exposes capability API methods", () => {
    const { service } = refreshCapabilities(
      {
        projectKind: "website",
        title: "Demo",
        description: "Demo site",
        pages: ["home"],
        sections: ["hero", "pricing", "faq"],
        components: ["pricing-table", "faq-accordion"],
        colorPalette: [],
        typography: [],
        content: [],
        seo: ["sitemap"],
        roadmap: [],
        files: [{ path: "app/sitemap.ts", content: "", language: "ts" }],
        strategy: {
          positioning: "Demo",
          sitemap: ["/"],
          pages: [],
          sectionPlan: [
            {
              id: "pricing",
              page: "home",
              name: "Pricing",
              goal: "Convert",
              contentNotes: "Plans",
            },
          ],
          conversionFunnel: [],
          contentStructure: [],
          contentStrategy: {
            brandVoice: "clear",
            messagingPillars: [],
            proofPoints: [],
            objectionHandlers: [],
            seoTopics: [],
          },
          ctas: [],
          seoFocus: ["pricing"],
        },
        settings: {
          websiteBlueprintV2: {
            sectionOrder: ["hero", "pricing", "faq", "footer"],
          },
        },
      },
      { force: true, seedFeatures: ["pricing", "faq"] },
    );

    assert.ok(service.hasCapability("pricing"));
    assert.ok(service.getCapability("pricing"));
    assert.ok(service.getActiveCapabilities().includes("pricing"));
    assert.ok(service.getCapabilityMetadata("pricing")?.label);
  });

  it("refreshes capabilities without direct manifest reads", () => {
    const project = {
      projectKind: "website" as const,
      title: "Refresh",
      description: "",
      pages: [],
      sections: [],
      colorPalette: [],
      typography: [],
      components: [],
      content: [],
      seo: [],
      roadmap: [],
      files: [],
    };
    const first = refreshCapabilities(project, {
      seedFeatures: ["blog"],
      force: true,
    });
    const second = createCapabilityService(first.project);
    assert.ok(second.hasCapability("blog"));
  });
});
