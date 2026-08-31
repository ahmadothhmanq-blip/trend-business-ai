import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { injectProfessionalComponents } from "@/lib/ai-core/components";
import { resolveStructureFirstHomeComponents } from "@/lib/website/template-v2/integration/strategy-home-components";
import type { WebsiteStrategy } from "@/lib/website/types/layers";

const realEstateStrategy: WebsiteStrategy = {
  positioning: "Luxury listings",
  sitemap: ["/"],
  pages: [
    {
      name: "Home",
      path: "/",
      purpose: "Sell properties",
      keySections: ["hero", "listings", "locations"],
      primaryCta: "View listings",
    },
  ],
  sectionPlan: [
    {
      id: "home-hero",
      page: "Home",
      name: "hero",
      goal: "Search-led discovery",
      contentNotes: "",
    },
    {
      id: "home-listings",
      page: "Home",
      name: "listings",
      goal: "Featured listings",
      contentNotes: "",
    },
    {
      id: "home-locations",
      page: "Home",
      name: "locations",
      goal: "Neighborhoods",
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
  ctas: ["View listings"],
  seoFocus: [],
};

describe("strategy-home-components", () => {
  it("maps real-estate strategy sections to professional components", () => {
    const order = resolveStructureFirstHomeComponents({
      strategy: realEstateStrategy,
      industryId: "real-estate",
    });
    assert.deepEqual(order, [
      "SiteHeader",
      "HeroProperty",
      "PropertyListings",
      "LocationSections",
      "SiteFooter",
    ]);
  });

  it("composes Arabic home pages when forceDesignRebuild is set", () => {
    const homeComponentOrder = resolveStructureFirstHomeComponents({
      strategy: realEstateStrategy,
      industryId: "real-estate",
    });
    const files = injectProfessionalComponents({
      files: [
        {
          path: "app/page.tsx",
          content: "export default function Page(){return null;}",
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
      homeComponentOrder: homeComponentOrder.map(String),
      brandName: "شركة أفق العقارية",
      pageTitle: "شركة أفق العقارية",
      pageDescription: "عقارات فاخرة",
      heroHeadline: "عقارات فاخرة",
      heroSubheadline: "اكتشف أفضل العقارات",
      primaryCta: "عرض العقارات",
      composePage: true,
      language: "Arabic",
      forceDesignRebuild: true,
    });
    const page = files.find((file) => file.path === "app/page.tsx")?.content ?? "";
    assert.ok(page.includes("<HeroProperty"));
    assert.ok(page.includes("<PropertyListings"));
    assert.ok(!page.includes("return null"));
  });
});
