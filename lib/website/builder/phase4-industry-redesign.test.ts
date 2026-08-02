import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { STRUCTURE_TEMPLATE_INTELLIGENCE_MAP } from "@/lib/website/builder/template-package-ti-mapping";
import {
  INDUSTRY_HOME_COMPOSITION_TI_IDS,
  industryHomeLayoutSignature,
} from "@/lib/website/builder/industry-home-compositions";
import { getIndustryInnerPageRecipe } from "@/lib/website/builder/industry-inner-page-recipes";
import { INDUSTRY_PREVIEW_PROFILE_IDS } from "@/lib/website/builder/industry-preview-profiles-data";
import { getThemePageArchitecture } from "@/lib/website/builder/theme-architecture";

describe("phase 4 industry redesign", () => {
  it("defines home compositions for installed structure templates", () => {
    const tiIds = Object.values(STRUCTURE_TEMPLATE_INTELLIGENCE_MAP);
    assert.equal(tiIds.length, 2);

    for (const tiId of tiIds) {
      assert.ok(
        INDUSTRY_HOME_COMPOSITION_TI_IDS.includes(tiId as never),
        `missing home composition for ${tiId}`,
      );
      const sig = industryHomeLayoutSignature(tiId);
      assert.ok(sig, `empty layout signature for ${tiId}`);
    }
  });

  it("defines preview profiles for installed structure templates", () => {
    const tiIds = Object.values(STRUCTURE_TEMPLATE_INTELLIGENCE_MAP);
    for (const tiId of tiIds) {
      assert.ok(
        INDUSTRY_PREVIEW_PROFILE_IDS.includes(tiId),
        `missing preview profile for ${tiId}`,
      );
    }
  });

  it("resolves inner page recipes with theme components", () => {
    for (const tiId of Object.values(STRUCTURE_TEMPLATE_INTELLIGENCE_MAP)) {
      const arch = getThemePageArchitecture(tiId);
      assert.ok(arch, `missing arch for ${tiId}`);

      for (const page of ["about", "services", "contact", "pricing"]) {
        const recipe = getIndustryInnerPageRecipe(tiId, page, page);
        assert.ok(recipe, `missing recipe for ${tiId}/${page}`);
        assert.ok(recipe!.headline.length > 0);
        assert.ok(recipe!.componentIds.length > 0);
      }
    }
  });
});
