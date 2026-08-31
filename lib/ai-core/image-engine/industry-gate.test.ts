import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  passesIndustryImageGate,
  sanitizePromptForIndustryGate,
} from "@/lib/ai-core/image-engine/industry-gate";

describe("Industry Image Gate", () => {
  it("blocks car imagery for mobile-app archetype", () => {
    const result = passesIndustryImageGate({
      prompt: "Luxury car on highway hero image",
      archetypeOrIndustry: "mobile-app-landing",
    });
    assert.equal(result.passed, false);
  });

  it("allows app UI for mobile-app archetype", () => {
    const result = passesIndustryImageGate({
      prompt: "Phone mockup showing app dashboard",
      archetypeOrIndustry: "mobile-app-landing",
    });
    assert.equal(result.passed, true);
  });

  it("sanitizes blocked tokens from prompt", () => {
    const cleaned = sanitizePromptForIndustryGate({
      prompt: "car dealership hero",
      archetypeOrIndustry: "mobile-app-landing",
    });
    assert.ok(!cleaned.toLowerCase().includes("car"));
  });
});
