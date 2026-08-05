import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateAndRepairProjectImages } from "@/lib/website/image-management/validate-before-render";
import { buildDefaultSiteImagesSource } from "@/lib/website/template-v2/tokens/emit-site-images";

describe("Image management — validate before render", () => {
  it("repairs and validates restaurant-premium site images", () => {
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
    assert.ok(result.uniqueUrlCount >= 8);
    assert.ok(result.rulesReport.detected.industryId === "restaurant");
    assert.ok(result.rulesReport.selected.length > 0);
  });
});
