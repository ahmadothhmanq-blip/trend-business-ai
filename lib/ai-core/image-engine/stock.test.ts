import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  normalizePremiumStockUrl,
  resolvePremiumStockUrl,
} from "@/lib/ai-core/image-engine/stock";

const REMOVED_ELECTRONICS_IDS = [
  "photo-1512941937669-90a1da58e9c9",
  "photo-1580910051074-3eb6948865f6",
  "photo-1523206488230-f1aba96dfc4b",
  "photo-1565849902269-9b043d824327",
  "photo-1592899677977-9c10ca58863d",
];

describe("normalizePremiumStockUrl", () => {
  for (const removedId of REMOVED_ELECTRONICS_IDS) {
    it(`remaps removed ${removedId}`, () => {
      const broken = `https://images.unsplash.com/${removedId}?w=1920`;
      const fixed = normalizePremiumStockUrl(broken);
      assert.notEqual(fixed, broken);
      assert.doesNotMatch(fixed, new RegExp(removedId));
    });
  }
});

describe("resolvePremiumStockUrl electronics-retail", () => {
  const roles = ["hero", "product", "service", "section", "gallery", "background"];

  for (const role of roles) {
    it(`does not return known-removed photos for ${role}`, () => {
      const url = resolvePremiumStockUrl({
        industry: "electronics-retail",
        routingIndustryId: "electronics-retail",
        role,
        seed: `${role}-audit`,
      });
      for (const removedId of REMOVED_ELECTRONICS_IDS) {
        assert.doesNotMatch(url, new RegExp(removedId));
      }
    });
  }
});
