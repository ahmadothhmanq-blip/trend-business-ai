import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateAndRepairProjectImages } from "@/lib/website/image-management/validate-before-render";
import { buildDefaultSiteImagesSource } from "@/lib/website/template-v2/tokens/emit-site-images";

describe("Image management — validate before render", () => {
  it("keeps blank restaurant-premium site images without stock backfill", () => {
    const files = [
      {
        path: "lib/site-images.ts",
        content: buildDefaultSiteImagesSource("restaurant-premium"),
        language: "typescript",
      },
    ];
    const result = validateAndRepairProjectImages(files, {
      industry: "restaurant",
      templatePackageId: "restaurant-premium",
    });
    assert.ok(result.passed);
    assert.equal(result.uniqueUrlCount, 0);
    assert.equal(result.repairs, 0);
    assert.ok(result.rulesReport.detected.industryId === "restaurant");
    assert.ok(!result.files[0]!.content.includes("images.unsplash.com"));
    assert.equal(result.files[0]!.content, files[0]!.content);
  });

  it("maps SITE_IMAGES role metadata to semantic slots during validation", () => {
    const files = [
      {
        path: "lib/site-images.ts",
        content: `export const HERO_IMAGE = "https://cdn.example/hero.jpg";
export const PRODUCT_IMAGE = "";
export const SERVICE_IMAGE = "";
export const BACKGROUND_IMAGE = "";
export const ABOUT_IMAGE = "";
export const SECTION_IMAGES = [] as const;
export const FEATURE_IMAGES = [] as const;
export const TEAM_IMAGES = [] as const;
export const GALLERY_IMAGES = [] as const;
export const TESTIMONIAL_IMAGES = [] as const;
export const SITE_IMAGES = [
  {
    "id": "hero-1",
    "role": "hero",
    "name": "Hero",
    "alt": "Hero",
    "url": "https://cdn.example/hero.jpg",
    "status": "generated"
  },
  {
    "id": "brand-1",
    "role": "brand",
    "name": "Brand",
    "alt": "Brand",
    "url": "https://cdn.example/brand.jpg",
    "status": "generated"
  }
];`,
        language: "typescript",
      },
    ];
    const result = validateAndRepairProjectImages(files, { industry: "saas" });
    assert.ok(result.passed);
    assert.ok(result.uniqueUrlCount >= 1);
  });
});
