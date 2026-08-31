import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { detectSiteArchetypeFromText } from "@/lib/website/site-plan/detect-archetype";
import { deriveSitePlan } from "@/lib/website/site-plan/derive";
import { mergeStrategyWithSitePlan } from "@/lib/website/site-plan/structure-first";
import { resolveSiteImageStrategy } from "@/lib/website/site-plan/image-strategy";
import type { WebsiteStrategy } from "@/lib/website/types/layers";

describe("SitePlan", () => {
  it("detects real-estate from Arabic prompt", () => {
    assert.equal(
      detectSiteArchetypeFromText("اعملي موقع لشركة عقارات"),
      "real-estate",
    );
  });

  it("detects saas from English prompt", () => {
    assert.equal(
      detectSiteArchetypeFromText("B2B SaaS analytics platform"),
      "saas-b2b",
    );
  });

  it("detects electronics retail for mobile phone store", () => {
    assert.equal(
      detectSiteArchetypeFromText(
        "Mobile phone store with repair, trade-in, and installment plans in Riyadh",
      ),
      "electronics-retail",
    );
    assert.equal(
      detectSiteArchetypeFromText("متجر جوالات وصيانة موبايل"),
      "electronics-retail",
    );
  });

  it("detects fashion retail for dress boutique", () => {
    assert.equal(
      detectSiteArchetypeFromText("Dress boutique and women's fashion collection"),
      "fashion-retail",
    );
    assert.equal(
      detectSiteArchetypeFromText("بوتيك أزياء وفساتين سهرة"),
      "fashion-retail",
    );
  });

  it("derives plan from archetype with hash", () => {
    const plan = deriveSitePlan({
      input: { prompt: "real estate agency website", language: "English" },
    });
    assert.equal(plan.archetypeId, "real-estate");
    assert.ok(plan.planHash.length === 16);
    assert.ok(plan.pages.length >= 3);
    assert.ok(plan.capabilities.includes("maps"));
  });

  it("merges strategy sections when provided", () => {
    const strategy: WebsiteStrategy = {
      positioning: "Luxury agency",
      sitemap: ["/"],
      pages: [{ name: "Home", path: "/", purpose: "Main", keySections: ["hero"] }],
      sectionPlan: [
        {
          id: "custom-hero",
          page: "Home",
          name: "Hero",
          goal: "Convert",
          contentNotes: "Listings",
        },
      ],
      conversionFunnel: [],
      contentStructure: [],
      contentStrategy: {
        brandVoice: "",
        messagingPillars: [],
        proofPoints: [],
        objectionHandlers: [],
        seoTopics: [],
      },
      ctas: [],
      seoFocus: [],
    };

    const plan = deriveSitePlan({
      input: { prompt: "real estate" },
      strategy,
    });
    assert.equal(plan.derivedFrom, "strategy");
    assert.ok(plan.sections.some((s) => s.id === "custom-hero"));
  });

  it("resolves image strategy modes", () => {
    const noImages = resolveSiteImageStrategy("without-images");
    assert.equal(noImages.mode, "without-images");
  });

  it("merges SitePlan sections into strategy (structure-first)", () => {
    const plan = deriveSitePlan({
      input: { prompt: "real estate agency website", language: "English" },
    });
    const strategy: WebsiteStrategy = {
      positioning: "Agency",
      sitemap: ["/"],
      pages: [{ name: "Home", path: "/", purpose: "Main", keySections: ["hero"] }],
      sectionPlan: [],
      conversionFunnel: [],
      contentStructure: [],
      contentStrategy: {
        brandVoice: "",
        messagingPillars: [],
        proofPoints: [],
        objectionHandlers: [],
        seoTopics: [],
      },
      ctas: [],
      seoFocus: [],
    };
    const merged = mergeStrategyWithSitePlan(strategy, plan);
    assert.ok(merged.pages.length >= plan.pages.length);
    assert.ok(merged.sectionPlan.length >= plan.sections.length);
    assert.equal(merged.positioning, "Agency");
  });
});
