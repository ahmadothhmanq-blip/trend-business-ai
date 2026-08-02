import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createTestPlanDraft } from "@/lib/tbge/planning/fixtures/plan-draft";
import { validatePlanDraft } from "@/lib/tbge/planning/validate";

describe("validatePlanDraft", () => {
  it("accepts a valid fixture draft", () => {
    const result = validatePlanDraft(createTestPlanDraft());
    assert.equal(result.valid, true);
  });

  it("rejects missing business name", () => {
    const draft = createTestPlanDraft({
      business: { ...createTestPlanDraft().business, name: "" },
    });
    const result = validatePlanDraft(draft);
    assert.equal(result.valid, false);
    if (!result.valid) {
      assert.ok(result.errors.some((e) => e.includes("business.name")));
    }
  });

  it("rejects invalid page paths", () => {
    const draft = createTestPlanDraft({
      structure: {
        ...createTestPlanDraft().structure,
        pages: [
          {
            name: "Bad",
            path: "no-leading-slash",
            purpose: "test",
            sections: ["Hero"],
          },
        ],
      },
    });
    const result = validatePlanDraft(draft);
    assert.equal(result.valid, false);
  });

  it("rejects invalid hex colors", () => {
    const draft = createTestPlanDraft({
      design: {
        ...createTestPlanDraft().design,
        tokens: {
          ...createTestPlanDraft().design.tokens,
          primary: "red",
        },
      },
    });
    const result = validatePlanDraft(draft);
    assert.equal(result.valid, false);
  });
});
