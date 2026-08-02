import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { getDefaultTbgeContainer, resetDefaultTbgeContainer } from "@/lib/tbge/di/bootstrap";
import { TBGE_TOKENS } from "@/lib/tbge/di/tokens";
import { canTransition } from "@/lib/tbge/kernel/phases";
import { createTbgeRunBudget, recordTbgeLlmCall } from "@/lib/tbge/kernel/run-budget";
import { createTbgeOrchestrator, type TbgeOrchestrator } from "@/lib/tbge/kernel/orchestrator";
import { assemblyEngineSkeleton } from "@/lib/tbge/assembly/engine";
import { createTestPlanDraftJson } from "@/lib/tbge/planning/fixtures/plan-draft";
import { createMasterPlanner } from "@/lib/tbge/planning/master-planner";
import type { PlannerLlmClient } from "@/lib/tbge/planning/types";
import { resolveTbgeProductAdapter } from "@/lib/tbge/adapters/registry";
import { createTestGenerationSpec } from "@/lib/tbge/spec/fixtures/test-spec";
import { websiteBuilderTbgeAdapter } from "@/lib/tbge/adapters/website-adapter";

const ORIGINAL_ENV = { ...process.env };

function restoreEnv() {
  for (const key of Object.keys(process.env)) {
    if (!(key in ORIGINAL_ENV)) delete process.env[key];
  }
  for (const [key, value] of Object.entries(ORIGINAL_ENV)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  resetDefaultTbgeContainer();
}

describe("TBGE orchestrator skeleton", () => {
  afterEach(restoreEnv);

  it("returns not_enabled when TBGE_ENABLED is unset", async () => {
    delete process.env.TBGE_ENABLED;
    const orchestrator = getDefaultTbgeContainer().resolve<TbgeOrchestrator>(
      TBGE_TOKENS.orchestrator,
    );
    const result = await orchestrator.run({
      brief: {
        prompt: "Create a website for a gaming company",
        productId: "website-builder",
      },
    });
    assert.equal(result.status, "not_enabled");
    assert.equal(result.files.length, 0);
  });

  it("completes assembly path when enabled with valid spec", async () => {
    process.env.TBGE_ENABLED = "1";
    resetDefaultTbgeContainer();
    const orchestrator = getDefaultTbgeContainer().resolve<TbgeOrchestrator>(
      TBGE_TOKENS.orchestrator,
    );
    const result = await orchestrator.run({
      brief: {
        prompt: "انشئ موقع لشركة ألعاب",
        productId: "website-builder",
        language: "Arabic",
      },
      spec: createTestGenerationSpec(),
    });
    assert.equal(result.status, "completed");
    assert.ok(result.trace.phases.includes("completed"));
    assert.equal(result.trace.llmCalls, 0);
  });

  it("fails when planning disabled and no spec provided", async () => {
    process.env.TBGE_ENABLED = "1";
    resetDefaultTbgeContainer();
    const orchestrator = getDefaultTbgeContainer().resolve<TbgeOrchestrator>(
      TBGE_TOKENS.orchestrator,
    );
    const result = await orchestrator.run({
      brief: {
        prompt: "Create a website for a gaming company",
        productId: "website-builder",
      },
    });
    assert.equal(result.status, "failed");
    assert.match(result.message ?? "", /Planning disabled|TBGE_PLANNING/);
  });

  it("plans and completes when TBGE_PLANNING is enabled", async () => {
    process.env.TBGE_ENABLED = "1";
    process.env.TBGE_PLANNING = "1";
    resetDefaultTbgeContainer();

    const mockClient: PlannerLlmClient = {
      async complete() {
        return { content: createTestPlanDraftJson(), model: "tbge-mock-planner" };
      },
    };

    const orchestrator = createTbgeOrchestrator({
      assemblyEngine: assemblyEngineSkeleton,
      masterPlanner: createMasterPlanner({ llmClient: mockClient }),
      resolveAdapter: resolveTbgeProductAdapter,
    });

    const result = await orchestrator.run({
      brief: {
        prompt: "Create a website for a gaming company",
        productId: "website-builder",
      },
    });

    assert.equal(result.status, "completed");
    assert.ok(result.spec);
    assert.equal(result.trace.llmCalls, 1);
    assert.ok(result.trace.phases.includes("spec_locked"));
  });
});

describe("TBGE architecture contracts", () => {
  it("phase transitions enforce ordering", () => {
    assert.equal(canTransition("accepted", "planning"), true);
    assert.equal(canTransition("completed", "planning"), false);
  });

  it("run budget enforces profile cap", () => {
    const budget = createTbgeRunBudget("ultra");
    recordTbgeLlmCall(budget, 2);
    assert.throws(() => recordTbgeLlmCall(budget, 1), /budget exceeded/);
  });

  it("website adapter enriches spec deterministically", () => {
    const spec = createTestGenerationSpec({
      design: {
        ...createTestGenerationSpec().design,
        templateIntelligenceId: undefined,
      },
    });
    const extended = websiteBuilderTbgeAdapter.extendSpec(spec);
    assert.equal(extended.design.templateIntelligenceId, spec.design.templateId);
    assert.equal(websiteBuilderTbgeAdapter.productId, "website-builder");
  });
});
