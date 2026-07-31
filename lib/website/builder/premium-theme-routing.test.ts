import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { STRUCTURE_TEMPLATE_INTELLIGENCE_MAP } from "@/lib/website/builder/template-package-ti-mapping";
import { PREMIUM_STRUCTURE_TEMPLATE_TI_IDS } from "@/lib/website/builder/industry-theme-architectures";
import { getThemePageArchitecture } from "@/lib/website/builder/theme-architecture";

describe("premium theme routing", () => {
  it("maps every structure template TI to a Theme* architecture", () => {
    const tiIds = Object.values(STRUCTURE_TEMPLATE_INTELLIGENCE_MAP);
    assert.equal(tiIds.length, 30);
    assert.equal(new Set(tiIds).size, 30);

    for (const tiId of tiIds) {
      const arch = getThemePageArchitecture(tiId);
      assert.ok(arch, `missing theme architecture for ${tiId}`);
      assert.ok(arch!.components.length > 0, `empty components for ${tiId}`);
      assert.ok(arch!.themeId, `missing themeId for ${tiId}`);
    }
  });

  it("covers all premium structure template TI ids", () => {
    const mapped = new Set(Object.values(STRUCTURE_TEMPLATE_INTELLIGENCE_MAP));
    for (const tiId of PREMIUM_STRUCTURE_TEMPLATE_TI_IDS) {
      assert.ok(mapped.has(tiId), `structure map missing ${tiId}`);
    }
  });
});
