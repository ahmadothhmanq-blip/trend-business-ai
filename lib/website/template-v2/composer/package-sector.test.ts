import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isHospitalityPackage,
  isTechRoutingIndustry,
  resolveStructureTemplatePackageForIndustry,
  resolveTechBlueprintPackageId,
} from "@/lib/website/template-v2/composer/package-sector";

describe("package-sector routing", () => {
  it("maps gaming and technology industries to saas-enterprise", () => {
    assert.equal(resolveStructureTemplatePackageForIndustry("gaming"), "saas-enterprise");
    assert.equal(resolveStructureTemplatePackageForIndustry("technology"), "saas-enterprise");
    assert.equal(resolveStructureTemplatePackageForIndustry("esports"), "saas-enterprise");
  });

  it("never routes tech industries to hospitality flagships", () => {
    for (const industry of ["gaming", "technology", "tech", "saas", "game-studio"]) {
      const pkg = resolveStructureTemplatePackageForIndustry(industry);
      assert.equal(isHospitalityPackage(pkg), false, industry);
      assert.equal(pkg, "saas-enterprise");
    }
  });

  it("keeps restaurant industry on hospitality flagship", () => {
    assert.equal(
      resolveStructureTemplatePackageForIndustry("restaurant"),
      "restaurant-premium",
    );
    assert.equal(isHospitalityPackage("restaurant-premium"), true);
    assert.equal(isHospitalityPackage("saas-enterprise"), false);
  });

  it("detects tech routing industries", () => {
    assert.equal(isTechRoutingIndustry("gaming"), true);
    assert.equal(isTechRoutingIndustry("video-games"), true);
    assert.equal(isTechRoutingIndustry("restaurant"), false);
  });

  it("exposes dedicated tech blueprint id", () => {
    assert.equal(resolveTechBlueprintPackageId(), "saas-enterprise");
  });
});
