import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { websiteBuilderTbgeAdapter } from "@/lib/tbge/adapters/website-adapter";
import { buildGenerationSpecFromDraft } from "@/lib/tbge/planning/build-spec";
import { createTestPlanDraft } from "@/lib/tbge/planning/fixtures/plan-draft";
import { resolveFileGraphForAdapter } from "@/lib/tbge/planning/file-graph";
import { lockSpec } from "@/lib/tbge/spec/lock";
import { validateGenerationSpec } from "@/lib/tbge/spec/validator";

describe("deterministic spec build", () => {
  it("resolves file graph from adapter template", () => {
    const graph = resolveFileGraphForAdapter(websiteBuilderTbgeAdapter);
    assert.ok(graph.length > 0);
    assert.ok(graph.every((node) => node.path && node.generator));
  });

  it("builds a GenerationSpec draft without LLM", () => {
    const spec = buildGenerationSpecFromDraft({
      draft: createTestPlanDraft(),
      adapter: websiteBuilderTbgeAdapter,
      productId: "website-builder",
      profile: "professional",
      mode: "generate",
      prompt: "Create a website for a gaming company",
      plannerModel: "mock-planner",
    });

    const locked = lockSpec(websiteBuilderTbgeAdapter.extendSpec(spec), "Create a website for a gaming company");
    const validation = validateGenerationSpec(locked.spec);
    assert.equal(validation.valid, true);
    assert.equal(locked.spec.productId, "website-builder");
    assert.ok(locked.spec.fileGraph.length > 0);
    assert.equal(locked.spec.provenance.plannerModel, "mock-planner");
  });
});
