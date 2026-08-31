import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertStructurePreserved,
  captureStructureSnapshot,
  StructurePurityViolationError,
} from "@/lib/website/template-v2/validation/structure-purity";
import type { WebsiteStrategy } from "@/lib/website/types/layers";

const strategy: WebsiteStrategy = {
  positioning: "Restaurant",
  sitemap: ["/", "/menu"],
  pages: [
    {
      name: "Home",
      path: "/",
      purpose: "Welcome",
      keySections: ["hero"],
      primaryCta: "Book",
    },
    {
      name: "Menu",
      path: "/menu",
      purpose: "Menu",
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
  ctas: ["Book"],
  seoFocus: [],
};

describe("structure-purity", () => {
  it("detects page drift", () => {
    const before = captureStructureSnapshot({
      projectKind: "website",
      title: "Test",
      description: "Test",
      pages: ["Home", "Menu"],
      sections: [],
      colorPalette: [],
      typography: [],
      components: [],
      content: [],
      seo: [],
      roadmap: [],
      files: [],
      strategy,
    });
    const after = captureStructureSnapshot({
      projectKind: "website",
      title: "Test",
      description: "Test",
      pages: ["Home", "Menu", "Pricing"],
      sections: [],
      colorPalette: [],
      typography: [],
      components: [],
      content: [],
      seo: [],
      roadmap: [],
      files: [],
      strategy,
    });

    assert.throws(
      () => assertStructurePreserved(before, after),
      StructurePurityViolationError,
    );
  });

  it("passes when structure is unchanged", () => {
    const project = {
      projectKind: "website" as const,
      title: "Test",
      description: "Test",
      pages: ["Home", "Menu"],
      sections: ["Home: hero"],
      colorPalette: [],
      typography: [],
      components: [],
      content: [],
      seo: [],
      roadmap: [],
      files: [],
      strategy,
    };
    const before = captureStructureSnapshot(project, ["pricing"]);
    const after = captureStructureSnapshot(project, ["pricing"]);
    assert.doesNotThrow(() => assertStructurePreserved(before, after));
  });
});
