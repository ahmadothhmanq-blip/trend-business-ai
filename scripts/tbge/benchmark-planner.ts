/**
 * TBGE Master Planner benchmark — mock LLM only (no live AI calls).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
import { join } from "node:path";
import { websiteBuilderTbgeAdapter } from "@/lib/tbge/adapters/website-adapter";
import { createTbgeRunBudget } from "@/lib/tbge/kernel/run-budget";
import { buildGenerationSpecFromDraft } from "@/lib/tbge/planning/build-spec";
import { createTestPlanDraft, createTestPlanDraftJson } from "@/lib/tbge/planning/fixtures/plan-draft";
import { runPlanningPipeline } from "@/lib/tbge/planning/pipeline";
import { parsePlanDraftFromLlm } from "@/lib/tbge/planning/parse";
import { validatePlanDraft } from "@/lib/tbge/planning/validate";
import type { PlannerLlmClient } from "@/lib/tbge/planning/types";
import { lockSpec } from "@/lib/tbge/spec/lock";

const ITERATIONS = Number(process.env.TBGE_BENCH_ITERATIONS ?? 200);

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function bench(label: string, fn: () => void): { label: string; medianMs: number; totalMs: number } {
  const samples: number[] = [];
  const totalStart = performance.now();
  for (let i = 0; i < ITERATIONS; i += 1) {
    const start = performance.now();
    fn();
    samples.push(performance.now() - start);
  }
  return {
    label,
    medianMs: Number(median(samples).toFixed(4)),
    totalMs: Number((performance.now() - totalStart).toFixed(2)),
  };
}

async function benchAsync(
  label: string,
  fn: () => Promise<void>,
): Promise<{ label: string; medianMs: number; totalMs: number }> {
  const samples: number[] = [];
  const totalStart = performance.now();
  for (let i = 0; i < ITERATIONS; i += 1) {
    const start = performance.now();
    await fn();
    samples.push(performance.now() - start);
  }
  return {
    label,
    medianMs: Number(median(samples).toFixed(4)),
    totalMs: Number((performance.now() - totalStart).toFixed(2)),
  };
}

async function main() {
  const json = createTestPlanDraftJson();
  const draft = createTestPlanDraft();
  const mockClient: PlannerLlmClient = {
    async complete() {
      return { content: json, model: "tbge-benchmark-mock" };
    },
  };

  const deterministic = [
    bench("parsePlanDraftFromLlm", () => {
      const result = parsePlanDraftFromLlm(json);
      if (!result.ok) throw new Error("parse failed");
    }),
    bench("validatePlanDraft", () => {
      const result = validatePlanDraft(draft);
      if (!result.valid) throw new Error("validate failed");
    }),
    bench("buildGenerationSpecFromDraft", () => {
      buildGenerationSpecFromDraft({
        draft,
        adapter: websiteBuilderTbgeAdapter,
        productId: "website-builder",
        profile: "professional",
        mode: "generate",
        prompt: "Create a website for a gaming company",
        plannerModel: "tbge-benchmark-mock",
      });
    }),
    bench("lockSpec", () => {
      const spec = buildGenerationSpecFromDraft({
        draft,
        adapter: websiteBuilderTbgeAdapter,
        productId: "website-builder",
        profile: "professional",
        mode: "generate",
        prompt: "Create a website for a gaming company",
      });
      lockSpec(websiteBuilderTbgeAdapter.extendSpec(spec), "Create a website for a gaming company");
    }),
  ];

  const pipelineBench = await benchAsync("runPlanningPipeline (mock LLM)", async () => {
    const budget = createTbgeRunBudget("professional");
    const result = await runPlanningPipeline(
      { llmClient: mockClient },
      {
        brief: { prompt: "Create a website for a gaming company", productId: "website-builder" },
        mode: "generate",
        profile: "professional",
        adapter: websiteBuilderTbgeAdapter,
        budget,
      },
    );
    if (!result.ok) throw new Error("pipeline failed");
  });

  const report = {
    generatedAt: new Date().toISOString(),
    sprint: "TBGE Sprint 2",
    iterations: ITERATIONS,
    llmMode: "mock",
    results: [...deterministic, pipelineBench],
  };

  const outDir = join(process.cwd(), "scripts", "benchmark-results");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, `tbge-planner-benchmark-${Date.now()}.json`);
  writeFileSync(outPath, JSON.stringify(report, null, 2));

  console.log("TBGE Master Planner Benchmark\n");
  for (const row of report.results) {
    console.log(`${row.label}: median ${row.medianMs}ms, total ${row.totalMs}ms`);
  }
  console.log(`\nReport: ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
