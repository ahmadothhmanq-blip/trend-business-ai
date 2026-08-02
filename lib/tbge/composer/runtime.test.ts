import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createComponentComposer } from "@/lib/tbge/composer/runtime";
import { createComposerTestSpec } from "@/lib/tbge/spec/fixtures/composer-spec";
import { createTestGenerationSpec } from "@/lib/tbge/spec/fixtures/test-spec";

describe("Component Composer runtime", () => {
  const composer = createComponentComposer();

  it("composes a full site from locked GenerationSpec", () => {
    const spec = createComposerTestSpec();
    const result = composer.compose(spec);

    assert.equal(result.composition.specId, spec.specId);
    assert.equal(result.composition.pages.length, 2);
    assert.ok(result.composition.pages[0]?.sections.length >= 3);
    assert.equal(result.composition.industryPattern.id, "gaming");
    assert.ok(result.composition.theme.cssVariables["--color-primary"]);
    assert.equal(result.stats.pagesComposed, 2);
    assert.ok(result.stats.sectionsComposed >= 5);
  });

  it("is deterministic for the same spec", () => {
    const spec = createComposerTestSpec();
    const a = composer.compose(spec);
    const b = composer.compose(spec);
    assert.deepEqual(a.composition, b.composition);
  });

  it("rejects unlocked spec", () => {
    const spec = createTestGenerationSpec({
      provenance: { lockedAt: "", promptHash: "" },
    });
    assert.throws(() => composer.compose(spec), /locked/);
  });

  it("uses business industry pattern when not gaming", () => {
    const spec = createComposerTestSpec({
      business: {
        ...createComposerTestSpec().business,
        industry: "Corporate Services",
        industryId: "business",
      },
    });
    const result = composer.compose(spec);
    assert.equal(result.composition.industryPattern.id, "business");
  });
});
