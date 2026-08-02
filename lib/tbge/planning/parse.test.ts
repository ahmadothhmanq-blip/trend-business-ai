import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createTestPlanDraft, createTestPlanDraftJson } from "@/lib/tbge/planning/fixtures/plan-draft";
import { parsePlanDraftFromLlm } from "@/lib/tbge/planning/parse";

describe("parsePlanDraftFromLlm", () => {
  it("parses raw JSON", () => {
    const result = parsePlanDraftFromLlm(createTestPlanDraftJson());
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.draft.business.name, "Nova Games Studio");
    }
  });

  it("parses fenced JSON", () => {
    const result = parsePlanDraftFromLlm(
      "```json\n" + createTestPlanDraftJson() + "\n```",
    );
    assert.equal(result.ok, true);
  });

  it("rejects invalid JSON", () => {
    const result = parsePlanDraftFromLlm("not-json");
    assert.equal(result.ok, false);
  });

  it("rejects incomplete draft", () => {
    const result = parsePlanDraftFromLlm(JSON.stringify({ business: { name: "X" } }));
    assert.equal(result.ok, false);
  });
});
