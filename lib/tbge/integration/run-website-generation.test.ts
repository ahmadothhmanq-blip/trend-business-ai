import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { assemblyEngineSkeleton } from "@/lib/tbge/assembly/engine";
import { createComponentComposer } from "@/lib/tbge/composer/runtime";
import { runTbgeWebsiteGeneration } from "@/lib/tbge/integration/run-website-generation";
import { createTbgeOrchestrator } from "@/lib/tbge/kernel/orchestrator";
import { createMasterPlanner } from "@/lib/tbge/planning/master-planner";
import { createTestPlanDraftJson } from "@/lib/tbge/planning/fixtures/plan-draft";
import { resolveTbgeProductAdapter } from "@/lib/tbge/adapters/registry";
import type { AIProvider } from "@/lib/ai/types";
import type { WebsiteGenerationInput } from "@/lib/website/types";

const ORIGINAL_ENV = { ...process.env };

function restoreEnv() {
  for (const key of Object.keys(process.env)) {
    if (!(key in ORIGINAL_ENV)) delete process.env[key];
  }
  for (const [key, value] of Object.entries(ORIGINAL_ENV)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

const sampleInput: WebsiteGenerationInput = {
  prompt: "Create a website for a gaming company",
  projectType: "business",
  projectKind: "website",
  language: "English",
  theme: "dark",
  features: ["contact"],
};

describe("runTbgeWebsiteGeneration", () => {
  afterEach(restoreEnv);

  it("runs planner, assembly, and optional composer with mock LLM", async () => {
    process.env.TBGE_ENABLED = "1";
    process.env.TBGE_PLANNING = "1";
    process.env.TBGE_ASSEMBLY = "1";
    process.env.TBGE_COMPOSER = "1";

    const orchestrator = createTbgeOrchestrator({
      assemblyEngine: assemblyEngineSkeleton,
      masterPlanner: createMasterPlanner({
        llmClient: {
          async complete() {
            return { content: createTestPlanDraftJson(), model: "mock" };
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
        composer: createComponentComposer(),
        getProvider: () =>
          ({
            name: "deepseek",
            async generateJson<T>() {
              return {} as T;
            },
            getLastUsage: () => ({
              promptTokens: 0,
              completionTokens: 0,
              totalTokens: 0,
            }),
            getModelName: () => "deepseek-v4-flash",
          }) as AIProvider,
      },
    });

    assert.ok(result.title.length > 0);
    assert.ok(result.files.length > 0);
    assert.ok(result.tbgeSpec);
    assert.ok(result.tbgeComposition);
    assert.equal(result.tbgeIntegration?.route, "tbge-primary");
    assert.equal(result.tbgeIntegration?.llmCalls, 1);
  });
});
