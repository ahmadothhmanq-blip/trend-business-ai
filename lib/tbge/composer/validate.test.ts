import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createComponentComposer } from "@/lib/tbge/composer/runtime";
import { validateSiteComposition } from "@/lib/tbge/composer/validate";
import { createComposerTestSpec } from "@/lib/tbge/spec/fixtures/composer-spec";

describe("validateSiteComposition", () => {
  it("accepts valid composition", () => {
    const spec = createComposerTestSpec();
    const { composition } = createComponentComposer().compose(spec);
    const result = validateSiteComposition(spec, composition);
    assert.equal(result.valid, true);
  });

  it("rejects specId mismatch", () => {
    const spec = createComposerTestSpec();
    const { composition } = createComponentComposer().compose(spec);
    const result = validateSiteComposition(spec, {
      ...composition,
      specId: "wrong",
    });
    assert.equal(result.valid, false);
  });
});
