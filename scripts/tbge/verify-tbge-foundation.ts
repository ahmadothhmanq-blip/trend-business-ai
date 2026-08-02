/**
 * TBGE Sprint 1 foundation verification (no AI, no Website Builder wiring).
 */
import { websiteBuilderTbgeAdapter } from "@/lib/tbge/adapters/website-adapter";
import { createAssemblyEngine } from "@/lib/tbge/assembly/engine";
import { getDefaultTbgeContainer, resetDefaultTbgeContainer } from "@/lib/tbge/di/bootstrap";
import { TBGE_TOKENS } from "@/lib/tbge/di/tokens";
import { resolveTbgeFlags, shouldUseTbgeOrchestrator } from "@/lib/tbge/flags";
import type { TbgeOrchestrator } from "@/lib/tbge/kernel/orchestrator";
import { createTestGenerationSpec } from "@/lib/tbge/spec/fixtures/test-spec";
import { validateGenerationSpec } from "@/lib/tbge/spec/validator";

async function main() {
  const checks: Array<{ name: string; ok: boolean; detail?: string }> = [];

  function record(name: string, ok: boolean, detail?: string) {
    checks.push({ name, ok, detail });
  }

  const flags = resolveTbgeFlags();
  record("flags default TBGE_ENABLED off", flags.enabled === false);
  record("legacy engine path default", shouldUseTbgeOrchestrator() === false);

  const spec = createTestGenerationSpec();
  const validation = validateGenerationSpec(spec);
  record("GenerationSpec fixture validates", validation.valid === true);

  const adapter = websiteBuilderTbgeAdapter;
  record(
    "website adapter registered",
    adapter.productId === "website-builder" && adapter.assemblyProfile.generators.length > 0,
  );

  const assembly = createAssemblyEngine();
  const assemblyResult = await assembly.assemble(spec);
  record(
    "assembly skeleton runs",
    assemblyResult.stats.tasksRun === spec.fileGraph.length,
  );

  resetDefaultTbgeContainer();
  const disabled = await getDefaultTbgeContainer()
    .resolve<TbgeOrchestrator>(TBGE_TOKENS.orchestrator)
    .run({
      brief: { prompt: "test", productId: "website-builder" },
    });
  record("orchestrator disabled by default", disabled.status === "not_enabled");

  process.env.TBGE_ENABLED = "1";
  resetDefaultTbgeContainer();
  const enabled = await getDefaultTbgeContainer()
    .resolve<TbgeOrchestrator>(TBGE_TOKENS.orchestrator)
    .run({
      brief: { prompt: "Create a website for a gaming company", productId: "website-builder" },
      spec,
    });
  record("orchestrator enabled path completes", enabled.status === "completed");
  delete process.env.TBGE_ENABLED;
  resetDefaultTbgeContainer();

  const failed = checks.filter((c) => !c.ok);
  console.log("TBGE Foundation Verification\n");
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
