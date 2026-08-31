import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  mapSectionNameToKind,
  resolveSectionOrderFromStrategy,
} from "@/lib/website/template-v2/integration/strategy-section-order";
import type { WebsiteStrategy } from "@/lib/website/types/layers";

const restaurantStrategy: WebsiteStrategy = {
  positioning: "Fine dining",
  sitemap: ["/", "/menu"],
  pages: [
    {
      name: "Home",
      path: "/",
      purpose: "Welcome guests",
      keySections: ["hero", "menu", "reservations"],
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

describe("strategy-section-order", () => {
  it("maps common section names to kinds", () => {
    assert.equal(mapSectionNameToKind("Pricing Plans"), "pricing");
    assert.equal(mapSectionNameToKind("Our Menu"), "services");
    assert.equal(mapSectionNameToKind("hero"), "hero");
  });

  it("derives section order from strategy without pricing for restaurants", () => {
    const order = resolveSectionOrderFromStrategy(restaurantStrategy);
    assert.ok(order.includes("hero"));
    assert.ok(order.includes("services"));
    assert.equal(order.includes("pricing"), false);
  });
});
