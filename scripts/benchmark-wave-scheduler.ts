/**
 * Compare serial vs parallel W2 scheduler execution (mock tasks, no LLM).
 */
import { performance } from "node:perf_hooks";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { PlannedFile } from "@/lib/ai/planner";
import { buildFileGenerationWavePlan } from "@/lib/ai-core/file-generation/wave-planner";
import { runFileGenerationScheduler } from "@/lib/ai-core/file-generation/scheduler";
import type { FileGenerationProductAdapter } from "@/lib/ai-core/file-generation/types";

const adapter: FileGenerationProductAdapter = {
  productId: "benchmark",
  resolveTaskKind(plannedFile) {
    if (plannedFile.path.startsWith("components/sections/")) return "llm";
    return "library-scaffold";
  },
  buildDependencyEdges: () => [],
  waveConcurrencyForProfile(_profile, waveName) {
    return waveName === "components" ? 4 : 1;
  },
};

function planned(path: string, category: PlannedFile["category"]): PlannedFile {
  return {
    path,
    purpose: path,
    language: "tsx",
    category,
  };
}

const sectionCount = Number(process.env.WB_BENCH_SECTIONS ?? 8);
const delayMs = Number(process.env.WB_BENCH_DELAY_MS ?? 100);

const filePlans: PlannedFile[] = [
  planned("app/layout.tsx", "layout"),
  planned("components/ui/section-shell.tsx", "components"),
  ...Array.from({ length: sectionCount }, (_, index) =>
    planned(`components/sections/Section${index + 1}.tsx`, "components"),
  ),
  planned("app/page.tsx", "pages"),
];

async function runScenario(label: string, maxConcurrency: number) {
  const wavePlan = buildFileGenerationWavePlan({
    filePlans,
    adapter,
    kindContext: {
      scaffoldPaths: new Set(),
      localizedCopy: false,
      composeHomePage: true,
      generationProfile: "professional",
      reusePrevious: false,
      previousPaths: new Set(),
      hasLibraryScaffold: (path) => !path.startsWith("components/sections/"),
      shouldDeferHomePage: () => false,
    },
    maxGlobalConcurrency: maxConcurrency,
  });

  for (const wave of wavePlan.waves) {
    if (wave.name !== "components") {
      wave.maxConcurrency = 1;
    } else {
      wave.maxConcurrency = maxConcurrency;
    }
  }

  let peak = 0;
  let active = 0;
  const started = performance.now();

  await runFileGenerationScheduler({
    wavePlan,
    initialFiles: [],
    executeTask: async (ctx) => {
      if (ctx.task.path.startsWith("components/sections/")) {
        active += 1;
        peak = Math.max(peak, active);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        active -= 1;
      }
      return {
        path: ctx.task.path,
        content: `// ${ctx.task.path}`,
        language: "tsx",
      };
    },
  });

  const durationMs = Math.round(performance.now() - started);
  return { label, durationMs, peak, sectionCount, maxConcurrency };
}

async function main() {
  const serial = await runScenario("serial-w2", 1);
  const parallel = await runScenario("parallel-w2", 4);

  const speedup =
    serial.durationMs > 0
      ? Number((serial.durationMs / parallel.durationMs).toFixed(2))
      : 0;

  const payload = {
    timestamp: new Date().toISOString(),
    sectionCount,
    delayMs,
    serial,
    parallel,
    speedup,
    improvementPercent: Math.round(
      (1 - parallel.durationMs / serial.durationMs) * 100,
    ),
  };

  const outDir = join(process.cwd(), "scripts", "benchmark-results");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, `wave-scheduler-benchmark-${Date.now()}.json`);
  writeFileSync(outPath, JSON.stringify(payload, null, 2));

  console.log(JSON.stringify(payload, null, 2));
  console.log(`written: ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
