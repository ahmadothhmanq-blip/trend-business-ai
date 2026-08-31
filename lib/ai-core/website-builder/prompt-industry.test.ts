import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { detectIndustryFromPrompt } from "@/lib/ai-core/website-builder/prompt-industry";

describe("detectIndustryFromPrompt — gaming", () => {
  it("detects English gaming company prompts", () => {
    const match = detectIndustryFromPrompt(
      "Create a website for a gaming company",
    );
    assert.ok(match);
    assert.equal(match!.industryId, "gaming");
  });

  it("detects Arabic gaming company prompts", () => {
    const match = detectIndustryFromPrompt("انشئ موقع لشركة ألعاب");
    assert.ok(match);
    assert.equal(match!.industryId, "gaming");
  });

  it("does not classify gaming prompts as restaurant", () => {
    const match = detectIndustryFromPrompt(
      "Gaming lounge and esports bar with tournaments",
    );
    assert.ok(match);
    assert.equal(match!.industryId, "gaming");
  });
});
