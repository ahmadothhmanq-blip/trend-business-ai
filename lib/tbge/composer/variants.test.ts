import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveComponentVariant, resolveSectionComponentType } from "@/lib/tbge/composer/variants";
import { createComposerTestSpec } from "@/lib/tbge/spec/fixtures/composer-spec";

describe("component variants", () => {
  it("maps section names to component types", () => {
    assert.equal(resolveSectionComponentType("Hero"), "hero");
    assert.equal(resolveSectionComponentType("Games"), "feature-grid");
    assert.equal(resolveSectionComponentType("Story"), "content-block");
  });

  it("resolves variant from profile and index", () => {
    const spec = createComposerTestSpec();
    const variant = resolveComponentVariant({
      spec,
      sectionName: "Hero",
      sectionIndex: 0,
    });
    assert.equal(variant.componentType, "hero");
    assert.equal(variant.emphasis, "primary");
    assert.equal(variant.density, "comfortable");
  });
});
