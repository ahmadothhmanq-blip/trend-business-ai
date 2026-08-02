/**
 * TBGE Component Composer benchmark — deterministic, no LLM.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
import { join } from "node:path";
import { createComponentComposer } from "@/lib/tbge/composer/runtime";
import { composePage } from "@/lib/tbge/composer/page-engine";
import { createComponentRegistry } from "@/lib/tbge/composer/registry";
import { composeTheme } from "@/lib/tbge/composer/theme";
import { createComposerTestSpec } from "@/lib/tbge/spec/fixtures/composer-spec";

const ITERATIONS = Number(process.env.TBGE_BENCH_ITERATIONS ?? 200);

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

async function bench(label: string, fn: () => void) {
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

async function main() {
  const spec = createComposerTestSpec();
  const registry = createComponentRegistry();
  const composer = createComponentComposer();

  const results = [
    await bench("composeTheme", () => {
      composeTheme(spec);
    }),
    await bench("composePage", () => {
      const pattern = registry.resolvePattern(spec).compose(spec);
      composePage({ spec, registry, industryPattern: pattern });
    }),
    await bench("composeSite (full runtime)", () => {
      composer.compose(spec);
    }),
  ];

  const report = {
    generatedAt: new Date().toISOString(),
    sprint: "TBGE Sprint 4",
    iterations: ITERATIONS,
    llmMode: "none",
    results,
  };

  const outDir = join(process.cwd(), "scripts", "benchmark-results");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, `tbge-composer-benchmark-${Date.now()}.json`);
  writeFileSync(outPath, JSON.stringify(report, null, 2));

  console.log("TBGE Component Composer Benchmark\n");
  for (const row of results) {
    console.log(`${row.label}: median ${row.medianMs}ms, total ${row.totalMs}ms`);
  }
  console.log(`\nReport: ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
