/**
 * TBGE Assembly Engine benchmark — deterministic, no LLM.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
import { join } from "node:path";
import { createAssemblyEngine } from "@/lib/tbge/assembly/engine";
import { createFullAssemblyTestSpec } from "@/lib/tbge/spec/fixtures/assembly-spec";
import { createTestGenerationSpec } from "@/lib/tbge/spec/fixtures/test-spec";

const ITERATIONS = Number(process.env.TBGE_BENCH_ITERATIONS ?? 100);

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[sorted.length - 1] + sorted[mid]) / 2
    : sorted[mid];
}

async function bench(label: string, fn: () => Promise<void>) {
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
  const engine = createAssemblyEngine();
  const single = createTestGenerationSpec();
  const full = createFullAssemblyTestSpec();

  const results = [
    await bench("assemble single-node spec", async () => {
      const result = await engine.assemble(single);
      if (result.files.length !== 1) throw new Error("expected one file");
    }),
    await bench("assemble full website graph", async () => {
      const result = await engine.assemble(full);
      if (result.files.length < 9) throw new Error("expected full graph output");
    }),
  ];

  const report = {
    generatedAt: new Date().toISOString(),
    sprint: "TBGE Sprint 3",
    iterations: ITERATIONS,
    llmMode: "none",
    results,
  };

  const outDir = join(process.cwd(), "scripts", "benchmark-results");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, `tbge-assembly-benchmark-${Date.now()}.json`);
  writeFileSync(outPath, JSON.stringify(report, null, 2));

  console.log("TBGE Assembly Engine Benchmark\n");
  for (const row of results) {
    console.log(`${row.label}: median ${row.medianMs}ms, total ${row.totalMs}ms`);
  }
  console.log(`\nReport: ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
