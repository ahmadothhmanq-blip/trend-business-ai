import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createTestGenerationSpec } from "@/lib/tbge/spec/fixtures/test-spec";
import { isSpecLocked } from "@/lib/tbge/spec/lock";
import { validateGenerationSpec } from "@/lib/tbge/spec/validator";
import { createSpecDelta, requiresFullReplan } from "@/lib/tbge/spec/versioning";

describe("GenerationSpec validator", () => {
  it("accepts a valid fixture spec", () => {
    const spec = createTestGenerationSpec();
    const result = validateGenerationSpec(spec);
    assert.equal(result.valid, true);
    assert.equal(isSpecLocked(spec), true);
  });

  it("rejects missing business name", () => {
    const spec = createTestGenerationSpec({
      business: {
        ...createTestGenerationSpec().business,
        name: "",
      },
    });
    const result = validateGenerationSpec(spec);
    assert.equal(result.valid, false);
    if (!result.valid) {
      assert.ok(result.errors.some((e) => e.includes("business.name")));
    }
  });

  it("rejects empty fileGraph paths", () => {
    const spec = createTestGenerationSpec({
      fileGraph: [
        {
          path: "",
          generator: "scaffold-static",
          deps: [],
          wave: "static-scaffold",
          priority: 0,
        },
      ],
    });
    const result = validateGenerationSpec(spec);
    assert.equal(result.valid, false);
  });
});

describe("SpecDelta", () => {
  it("detects full replan instruction tags", () => {
    const base = createTestGenerationSpec();
    const delta = createSpecDelta(base, {
      instructionTags: ["[strategy]"],
    });
    assert.equal(requiresFullReplan(delta), true);
  });
});
