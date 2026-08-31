import assert from "node:assert/strict";
import { normalizePremiumStockUrl } from "@/lib/ai-core/image-engine/stock";
import {
  parseSiteImagesModule,
  siteImagePool,
} from "@/lib/website/site-images-parser";

const SAMPLE = `/**
 * Advanced AI Assets Engine — generated site imagery.
 */
export const HERO_IMAGE = "https://images.unsplash.com/photo-1542744173-8e7e53415bb5?auto=format&fit=crop&w=1600&q=82";
export const PRODUCT_IMAGE = "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1600&q=82";
export const SERVICE_IMAGE = "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1600&q=82";
export const BACKGROUND_IMAGE = null;
export const BRAND_IMAGE = "https://images.unsplash.com/photo-1542744173-8e7e53415bb5?auto=format&fit=crop&w=1600&q=82";
export const SECTION_IMAGES = ["https://images.unsplash.com/photo-1542744173-05336fcc7ad4?auto=format&fit=crop&w=1600&q=82","https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1600&q=82"] as const;
export const GALLERY_IMAGES = ["https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1600&q=82"] as const;
export const TESTIMONIAL_IMAGES = ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=82"] as const;
`;

const parsed = parseSiteImagesModule(SAMPLE);
assert.ok(parsed, "parses site-images module");
assert.ok(
  parsed!.HERO_IMAGE?.includes("photo-1497366811353"),
  "remediates removed hero photo",
);
assert.equal(parsed!.GALLERY_IMAGES.length, 1);
assert.equal(parsed!.SECTION_IMAGES.length, 2);
assert.ok(siteImagePool(parsed!).length >= 4, "builds image pool");

assert.ok(
  normalizePremiumStockUrl(
    "https://images.unsplash.com/photo-1551434678-e076c223a6922?auto=format&fit=crop&w=1600&q=82",
  ).includes("photo-1551434678-e076c223a692"),
  "fixes typo stock ids",
);

console.log("site-images-parser: ok");
