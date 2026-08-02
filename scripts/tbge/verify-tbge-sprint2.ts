/**
 * TBGE Sprint 2 verification — Master Planner + GenerationSpec (mock LLM).
 */
import { resolveTbgeProductAdapter } from "@/lib/tbge/adapters/registry";
import { assemblyEngineSkeleton } from "@/lib/tbge/assembly/engine";
import { resolveTbgeFlags, shouldRunTbgePlanning } from "@/lib/tbge/flags";
import { createTbgeOrchestrator } from "@/lib/tbge/kernel/orchestrator";
import { createTbgeRunBudget } from "@/lib/tbge/kernel/run-budget";
import { createTestPlanDraftJson } from "@/lib/tbge/planning/fixtures/plan-draft";
import { createMasterPlanner } from "@/lib/tbge/planning/master-planner";
import { runPlanningPipeline } from "@/lib/tbge/planning/pipeline";
import type { PlannerLlmClient } from "@/lib/tbge/planning/types";
import { isSpecLocked } from "@/lib/tbge/spec/lock";
import { validateGenerationSpec } from "@/lib/tbge/spec/validator";

async function main() {
  const checks: Array<{ name: string; ok: boolean; detail?: string }> = [];

  function record(name: string, ok: boolean, detail?: string) {
    checks.push({ name, ok, detail });
  }

  const flags = resolveTbgeFlags();
  record("TBGE_PLANNING defaults off", flags.planning === false);
  record("shouldRunTbgePlanning defaults false", shouldRunTbgePlanning() === false);

  const adapter = resolveTbgeProductAdapter("website-builder");
  record("website adapter resolves", adapter?.productId === "website-builder");

  const mockClient: PlannerLlmClient = {
    async complete() {
      return { content: createTestPlanDraftJson(), model: "tbge-verify-mock" };
    },
  };

  const budget = createTbgeRunBudget("professional");
  const planned = await runPlanningPipeline(
    { llmClient: mockClient },
    {
      brief: { prompt: "Create a website for a gaming company", productId: "website-builder" },
      mode: "generate",
      profile: "professional",
      adapter: adapter!,
      budget,
    },
  );
  record("planning pipeline produces spec", planned.ok === true);
  if (planned.ok) {
    record("spec is locked", isSpecLocked(planned.spec));
    record("spec validates", validateGenerationSpec(planned.spec).valid === true);
    record("single LLM call recorded", budget.usedLlmCalls === 1);
  }

  process.env.TBGE_ENABLED = "1";
  process.env.TBGE_PLANNING = "1";

  const orchestrator = createTbgeOrchestrator({
    assemblyEngine: assemblyEngineSkeleton,
    masterPlanner: createMasterPlanner({ llmClient: mockClient }),
    resolveAdapter: resolveTbgeProductAdapter,
  });
  const run = await orchestrator.run({
    brief: { prompt: "Create a website for a gaming company", productId: "website-builder" },
  });
  record("orchestrator planning path completes", run.status === "completed");
  record("orchestrator records one LLM call", run.trace.llmCalls === 1);

  delete process.env.TBGE_ENABLED;
  delete process.env.TBGE_PLANNING;

  const failed = checks.filter((c) => !c.ok);
  console.log("TBGE Sprint 2 Verification\n");
  for (const check of checks) {
    console.log(`${check.ok ? "PASS" : "FAIL"}  ${check.name}${check.detail ? ` — ${check.detail}` : ""}`);
  }
  console.log(`\nSummary: ${checks.length - failed.length}/${checks.length} passed`);
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
