import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { websiteBuilderTbgeAdapter } from "@/lib/tbge/adapters/website-adapter";
import { createTbgeRunBudget } from "@/lib/tbge/kernel/run-budget";
import { createTestPlanDraftJson } from "@/lib/tbge/planning/fixtures/plan-draft";
import { createMasterPlanner } from "@/lib/tbge/planning/master-planner";
import { runPlanningPipeline } from "@/lib/tbge/planning/pipeline";
import type { PlannerLlmClient } from "@/lib/tbge/planning/types";
import { isSpecLocked } from "@/lib/tbge/spec/lock";
import { validateGenerationSpec } from "@/lib/tbge/spec/validator";

function createMockPlannerLlmClient(): PlannerLlmClient {
  return {
    async complete() {
      return {
        content: createTestPlanDraftJson(),
        model: "tbge-mock-planner",
      };
    },
  };
}

describe("TBGE planning pipeline", () => {
  it("produces a locked GenerationSpec from mock LLM", async () => {
    const budget = createTbgeRunBudget("professional");
    const result = await runPlanningPipeline(
      { llmClient: createMockPlannerLlmClient() },
      {
        brief: {
          prompt: "Create a website for a gaming company",
          productId: "website-builder",
        },
        mode: "generate",
        profile: "professional",
        adapter: websiteBuilderTbgeAdapter,
        budget,
      },
    );

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(isSpecLocked(result.spec), true);
      assert.equal(validateGenerationSpec(result.spec).valid, true);
      assert.equal(budget.usedLlmCalls, 1);
      assert.equal(result.plannerModel, "tbge-mock-planner");
    }
  });

  it("fails when LLM returns invalid JSON", async () => {
    const budget = createTbgeRunBudget("professional");
    const client: PlannerLlmClient = {
      async complete() {
        return { content: "{}", model: "bad" };
      },
    };

    const result = await runPlanningPipeline(
      { llmClient: client },
      {
        brief: { prompt: "test", productId: "website-builder" },
        mode: "generate",
        profile: "professional",
        adapter: websiteBuilderTbgeAdapter,
        budget,
      },
    );

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.stage, "parse");
    }
  });
});

describe("TBGE Master Planner", () => {
  it("delegates to planning pipeline", async () => {
    const planner = createMasterPlanner({ llmClient: createMockPlannerLlmClient() });
    const result = await planner.plan({
      brief: { prompt: "Gaming studio site", productId: "website-builder" },
      mode: "generate",
      profile: "fast",
      adapter: websiteBuilderTbgeAdapter,
      budget: createTbgeRunBudget("fast"),
    });

    assert.equal(result.ok, true);
  });
});
