/**
 * TBGE Sprint 5 verification — Website Builder integration.
 */
import { resolveWebsiteTbgeRoute } from "@/lib/tbge/integration/router";
import { runTbgeWebsiteGeneration } from "@/lib/tbge/integration/run-website-generation";
import { resolveTbgeFlags } from "@/lib/tbge/flags";
import { createTbgeOrchestrator } from "@/lib/tbge/kernel/orchestrator";
import { assemblyEngineSkeleton } from "@/lib/tbge/assembly/engine";
import { createMasterPlanner } from "@/lib/tbge/planning/master-planner";
import { createTestPlanDraftJson } from "@/lib/tbge/planning/fixtures/plan-draft";
import { resolveTbgeProductAdapter } from "@/lib/tbge/adapters/registry";
import type { AIProvider } from "@/lib/ai/types";
import type { WebsiteGenerationInput } from "@/lib/website/types";

async function main() {
  const checks: Array<{ name: string; ok: boolean; detail?: string }> = [];

  function record(name: string, ok: boolean, detail?: string) {
    checks.push({ name, ok, detail });
  }

  const flags = resolveTbgeFlags();
  record("TBGE integration flags default off", flags.enabled === false);
  record("legacy route by default", resolveWebsiteTbgeRoute().mode === "legacy");

  const sampleInput: WebsiteGenerationInput = {
    prompt: "Create a website for a gaming company",
    projectType: "business",
    projectKind: "website",
    language: "English",
    theme: "dark",
    features: ["contact"],
  };

  process.env.TBGE_ENABLED = "1";
  process.env.TBGE_PLANNING = "1";
  process.env.TBGE_ASSEMBLY = "1";

  record("tbge-primary route when configured", resolveWebsiteTbgeRoute().mode === "tbge-primary");

  const orchestrator = createTbgeOrchestrator({
    assemblyEngine: assemblyEngineSkeleton,
    masterPlanner: createMasterPlanner({
      llmClient: {
        async complete() {
          return { content: createTestPlanDraftJson(), model: "verify-mock" };
        },
      },
    }),
    resolveAdapter: resolveTbgeProductAdapter,
  });

  const result = await runTbgeWebsiteGeneration({
    pluginInput: sampleInput,
    providerName: "deepseek",
    deps: {
      orchestrator,
      getProvider: () =>
        ({
          name: "deepseek",
          async generateJson<T>() {
            return {} as T;
          },
        }) as AIProvider,
    },
  });

  record("TBGE website generation produces files", result.files.length > 0);
  record("TBGE metrics collected", Boolean(result.tbgeIntegration));
  record("planner LLM call recorded", result.tbgeIntegration?.llmCalls === 1);

  delete process.env.TBGE_ENABLED;
  delete process.env.TBGE_PLANNING;
  delete process.env.TBGE_ASSEMBLY;

  const failed = checks.filter((c) => !c.ok);
  console.log("TBGE Sprint 5 Verification\n");
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
