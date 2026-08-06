import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SAAS_FLAGSHIP_UI } from "@/lib/website/template-v2/flagship/themes";
import {
  SECTION_DEFAULT_VARIANTS,
  SECTION_VARIANT_COUNTS,
  SECTION_VARIANT_REGISTRY,
  getDefaultVariantId,
  getVariantDefinition,
  listSectionVariants,
  resolveSectionVariant,
  validateVariantRegistry,
  isValidSectionVariant,
} from "@/lib/website/template-v2/variants";
import type { SectionKind } from "@/lib/website/template-v2/variants/types";

const BASE = {
  ui: SAAS_FLAGSHIP_UI,
  componentId: "test-component",
};

describe("Section Variant Engine", () => {
  it("registers the required variant counts per section", () => {
    const validation = validateVariantRegistry();
    assert.equal(validation.valid, true, validation.errors.join("; "));
    assert.equal(SECTION_VARIANT_REGISTRY.length, 77);

    for (const [kind, count] of Object.entries(SECTION_VARIANT_COUNTS) as Array<
      [SectionKind, number]
    >) {
      assert.equal(listSectionVariants(kind).length, count);
    }
  });

  it("resolves defaults when variantId is omitted", () => {
    for (const kind of Object.keys(SECTION_VARIANT_COUNTS) as SectionKind[]) {
      const resolved = resolveSectionVariant(kind);
      assert.ok(resolved);
      assert.equal(resolved!.resolvedFrom, "default");
      assert.equal(resolved!.variantId, getDefaultVariantId(kind));
      assert.equal(resolved!.variantId, SECTION_DEFAULT_VARIANTS[kind]);
    }
  });

  it("rejects invalid variant IDs for a section kind", () => {
    assert.equal(resolveSectionVariant("hero", "tier-cards"), null);
    assert.equal(isValidSectionVariant("hero", "not-a-variant"), false);
    assert.equal(isValidSectionVariant("hero", "split-trust"), true);
  });

  it("accepts explicit valid variant IDs", () => {
    const resolved = resolveSectionVariant("features", "bento-mosaic");
    assert.ok(resolved);
    assert.equal(resolved!.resolvedFrom, "explicit");
    assert.equal(resolved!.definition.composition, "bento");
  });

  it("every variant has required metadata for future AI selection", () => {
    for (const variant of SECTION_VARIANT_REGISTRY) {
      assert.ok(variant.label.length > 0, `${variant.id} missing label`);
      assert.ok(variant.description.length > 0, `${variant.id} missing description`);
      assert.ok(variant.hierarchy.length > 0, `${variant.id} missing hierarchy`);
      assert.ok(variant.rhythm.length > 0, `${variant.id} missing rhythm`);
      assert.ok(variant.visualIdentity.length > 0, `${variant.id} missing visualIdentity`);
      assert.ok(variant.responsiveStrategy.length > 0, `${variant.id} missing responsiveStrategy`);
      assert.equal(getVariantDefinition(variant.sectionKind, variant.id)?.id, variant.id);
    }
  });

  it("variant definitions are unique per section kind", () => {
    const seen = new Set<string>();
    for (const variant of SECTION_VARIANT_REGISTRY) {
      const key = `${variant.sectionKind}:${variant.id}`;
      assert.equal(seen.has(key), false, `duplicate ${key}`);
      seen.add(key);
    }
  });

  it("exports base content shape for renderer smoke", () => {
    assert.ok(BASE.ui.container.includes("df-container"));
    assert.equal(SECTION_VARIANT_COUNTS.hero, 10);
    assert.equal(SECTION_VARIANT_COUNTS.footer, 5);
  });
});
