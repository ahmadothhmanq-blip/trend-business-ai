import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { detectWebsiteIndustrySync } from "@/lib/ai-core/industry-intelligence/detect";

describe("detectWebsiteIndustrySync", () => {
  it("detects restaurant from prompt text", () => {
    const result = detectWebsiteIndustrySync({
      prompt: "Modern restaurant and cafe with chef tasting menu",
    });
    assert.equal(result.industryId, "restaurant");
  });

  it("detects law firm from prompt text", () => {
    const result = detectWebsiteIndustrySync({
      prompt: "Attorney office for litigation and legal services",
    });
    assert.equal(result.industryId, "law");
  });

  it("detects gaming studio from prompt text", () => {
    const result = detectWebsiteIndustrySync({
      prompt: "Indie game studio building multiplayer video games",
    });
    assert.equal(result.industryId, "gaming");
  });

  it("detects law firm from Arabic prompt text", () => {
    const result = detectWebsiteIndustrySync({
      prompt: "موقع لمكتب محاماة متخصص في القضايا التجارية والاستشارات القانونية",
    });
    assert.equal(result.industryId, "law");
  });
});
