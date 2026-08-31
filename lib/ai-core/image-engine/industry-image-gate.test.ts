import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isForbiddenStockUrlForIndustry,
  resolvePremiumStockUrl,
} from "@/lib/ai-core/image-engine/stock";

describe("industry image gate", () => {
  it("blocks automotive hero photo on law industry", () => {
    const carUrl =
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=2400&q=90";
    assert.equal(isForbiddenStockUrlForIndustry(carUrl, "law"), true);
  });

  it("allows law pack photo on law industry", () => {
    const lawUrl =
      "https://images.unsplash.com/photo-1589829545856-d10d557cf57f?auto=format&fit=crop&w=2400&q=90";
    assert.equal(isForbiddenStockUrlForIndustry(lawUrl, "law"), false);
  });

  it("resolvePremiumStockUrl returns law hero from law pack", () => {
    const url = resolvePremiumStockUrl({
      industry: "law",
      routingIndustryId: "law",
      role: "hero",
      seed: "law-hero-gate",
    });
    assert.equal(isForbiddenStockUrlForIndustry(url, "law"), false);
    assert.doesNotMatch(url, /photo-1492144534655/);
  });
});
