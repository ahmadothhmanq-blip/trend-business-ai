/**
 * Benchmark parallel repair wave planning and execution timing (no LLM).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { PlannedFile } from "@/lib/ai/planner";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import {
  estimateRepairWaveCounts,
  planRepairWaves,
  runSafeParallelRepair,
  runSerialRepair,
} from "@/lib/ai-core/repair-engine";

function planned(path: string, category: PlannedFile["category"]): PlannedFile {
  return { path, purpose: path, language: "tsx", category };
}

const REPAIR_DELAY_MS = 40;

const sections = Array.from({ length: 8 }, (_, index) =>
  planned(`components/sections/Section${index + 1}.tsx`, "components"),
);

const filePlans: PlannedFile[] = [
  planned("app/layout.tsx", "layout"),
  planned("components/ui/section-shell.tsx", "components"),
  planned("components/ui/motion.tsx", "components"),
  ...sections,
  planned("app/page.tsx", "pages"),
];

const files: GeneratedProjectFile[] = filePlans.map((plan) => ({
  path: plan.path,
  language: "tsx",
  content:
    plan.path === "app/page.tsx"
      ? sections
          .map(
            (section) =>
              `import { S${section.path.split("/").pop()!.replace(".tsx", "")} } from "@/${section.path.replace(/\.tsx$/, "")}";`,
          )
          .join("\n")
      : `export default function X() { return null; }`,
}));

const targets = filePlans
  .filter((plan) => plan.path.startsWith("components/sections/"))
  .map((plan) => plan.path);

const plan = planRepairWaves({ targets, filePlans, files });
const serialEstimate = estimateRepairWaveCounts(targets.length);

async function main() {
  const repairOptions = {
    targets,
    filePlans,
    files: [],
    maxConcurrency: 4,
    repairFile: async (targetPath: string) => {
      await new Promise((resolve) => setTimeout(resolve, REPAIR_DELAY_MS));
      return { path: targetPath, content: "", language: "tsx" as const };
    },
  };

  const serialResult = await runSerialRepair(repairOptions);
  const parallelResult = await runSafeParallelRepair(repairOptions);

  const payload = {
    timestamp: new Date().toISOString(),
    targetCount: targets.length,
    repairDelayMs: REPAIR_DELAY_MS,
    serialRepairWaves: serialEstimate.serialWaves,
    plannedRepairWaves: plan.waves.length,
    parallelizableTargets: plan.parallelizableTargetCount,
    waveReductionPercent: Math.round(
      (1 - plan.waves.length / serialEstimate.serialWaves) * 100,
    ),
    peakParallelWaveSize: Math.max(
      ...plan.waves.map((wave) => wave.targets.length),
      0,
    ),
    timing: {
      serialDurationMs: serialResult.stats.durationMs,
      parallelDurationMs: parallelResult.stats.durationMs,
      speedupPercent: Math.round(
        (1 - parallelResult.stats.durationMs / serialResult.stats.durationMs) *
          100,
      ),
      serialPeakConcurrency: serialResult.stats.peakConcurrency,
      parallelPeakConcurrency: parallelResult.stats.peakConcurrency,
      parallelWaveCount: parallelResult.stats.waveCount,
    },
    waves: plan.waves,
  };

  const outDir = join(process.cwd(), "scripts", "benchmark-results");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, `parallel-repair-benchmark-${Date.now()}.json`);
  writeFileSync(outPath, JSON.stringify(payload, null, 2));
  console.log(JSON.stringify(payload, null, 2));
  console.log(`written: ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
