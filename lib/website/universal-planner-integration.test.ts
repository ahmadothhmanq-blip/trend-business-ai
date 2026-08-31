import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveWebsitePlannerIntegration } from "@/lib/website/universal-planner-integration";
import type { WebsiteGenerationInput } from "@/lib/website/types";

function buildInput(prompt: string): WebsiteGenerationInput {
  return {
    prompt,
    projectType: "Business Website",
    projectKind: "website",
    language: "English",
    theme: "professional",
    features: ["seo", "contact-form"],
  };
}

describe("website universal planner integration", () => {
  it("stays disabled when feature flags are off", async () => {
    delete process.env.UNIVERSAL_PLANNER_ENABLED;
    delete process.env.UNIVERSAL_PLANNER_WEBSITE_ENABLED;

    const result = await resolveWebsitePlannerIntegration({
      input: buildInput("Create a consulting website with services and contact page."),
    });

    assert.equal(result.enabled, false);
    assert.equal(result.inputPatch, undefined);
  });

  it("runs planner and validates website adapter blueprint when flags are on", async () => {
    process.env.UNIVERSAL_PLANNER_ENABLED = "1";
    process.env.UNIVERSAL_PLANNER_WEBSITE_ENABLED = "1";

    const result = await resolveWebsitePlannerIntegration({
      input: buildInput(
        "Create a professional restaurant website with menu, booking, and SEO pages.",
      ),
    });

    assert.equal(result.enabled, true);
    assert.ok(result.blueprint);
    assert.ok(result.websiteServicePlan);
    assert.equal(result.websiteServicePlan?.serviceId, "website-builder");
    assert.equal(result.websiteServicePlan?.supported, true);
    assert.equal(result.inputPatch?.universalPlannerEnabled, true);
    assert.equal(
      result.inputPatch?.universalPlannerWebsitePlan?.serviceId,
      "website-builder",
    );
  });
});
