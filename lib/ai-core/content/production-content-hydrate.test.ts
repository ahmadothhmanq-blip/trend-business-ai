import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildProductionContentPack,
  hydrateProductionContentFromStrategy,
} from "@/lib/ai-core/content/production-content";
import type { WebsiteStrategy } from "@/lib/website/types/layers";

const strategy: WebsiteStrategy = {
  positioning: "AI ops",
  sitemap: ["/"],
  pages: [],
  sectionPlan: [
    {
      id: "features",
      page: "home",
      name: "Platform features",
      goal: "Show capabilities",
      contentNotes: "Unified workflows for modern teams",
    },
    {
      id: "pricing",
      page: "home",
      name: "Growth plan",
      goal: "Convert trials",
      contentNotes: "Includes onboarding and support",
    },
    {
      id: "faq",
      page: "home",
      name: "Launch timeline",
      goal: "Reduce hesitation",
      contentNotes: "Most teams launch within two weeks",
    },
  ],
  conversionFunnel: [],
  contentStructure: [],
  contentStrategy: {
    brandVoice: "confident",
    messagingPillars: [],
    proofPoints: ["99.9% uptime", "SOC 2 ready", "Fast onboarding"],
    objectionHandlers: ["How fast can we launch?"],
    seoTopics: [],
  },
  ctas: ["ابدأ الآن"],
  seoFocus: [],
};

describe("hydrateProductionContentFromStrategy", () => {
  it("fills localized Arabic section arrays from strategy and extras", () => {
    const base = buildProductionContentPack(
      {
        industryId: "saas",
        heroHeadline: "منصة أورا",
        heroSubheadline: "عمليات ذكية للفرق الحديثة",
        primaryCta: "ابدأ الآن",
        secondaryCta: "اعرف المزيد",
        serviceDescriptions: [],
        trustLine: "موثوق من الفرق العالمية",
        contentBlocks: [],
      },
      "أورا",
      "Arabic",
    );

    assert.equal(base.features.length, 0);

    const hydrated = hydrateProductionContentFromStrategy(base, {
      strategy,
      language: "Arabic",
      industryId: "saas",
      blocks: ["منصة أورا", "عمليات ذكية"],
      primaryCta: "ابدأ الآن",
      brandName: "أورا",
      profile: { industry: "saas" },
    });

    assert.ok(hydrated.features.length > 0);
    assert.ok(hydrated.pricing.length > 0);
    assert.ok(hydrated.faqs.length > 0);
    assert.ok(hydrated.showcaseBullets.length > 0);
    assert.ok(hydrated.navLinks.length > 0);
    assert.equal(hydrated.featuresTitle, "");
  });
});
