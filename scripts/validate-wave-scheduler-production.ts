/**
 * Wave Scheduler production quality validation.
 *
 * Usage:
 *   npx tsx scripts/validate-wave-scheduler-production.ts
 *   npx tsx scripts/validate-wave-scheduler-production.ts --profile fast
 *   npx tsx scripts/validate-wave-scheduler-production.ts --ids restaurant,saas
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { generateWebsite } from "@/lib/website-generator";
import { runWithWebsiteProfiler } from "@/lib/ai-core/performance/profiler-context";
import { WebsitePipelineProfiler } from "@/lib/ai-core/performance/website-profiler";
import { compareGenerationQuality } from "@/lib/website/validation/wave-scheduler-quality";
import {
  WEBSITE_GOLDEN_PROMPT_SUITE,
  type GoldenPromptCase,
} from "./golden-prompts/website-generation-suite";

function loadEnvLocal(): void {
  const path = join(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    value = value.replace(/^"|"$/g, "").replace(/^'|'$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

type RunMetrics = {
  mode: "legacy" | "wave";
  wallClockMs: number;
  generationTimeMs: number;
  fileCount: number;
  provider: string;
  llmRequestCount: number;
  fileGenerationLlmCount: number;
  fileGenerationDurationMs: number;
  fileGenerationTokens: number;
  totalTokens: number;
  retryCount: number;
  heapUsedMbEnd: number;
  rssMbEnd: number;
};

type PromptComparison = {
  promptId: string;
  label: string;
  legacy: RunMetrics;
  wave: RunMetrics;
  quality: ReturnType<typeof compareGenerationQuality>;
  speedupPercent: number;
};

function parseArgs() {
  const args = {
    profile: "fast" as "fast" | "professional" | "ultra",
    ids: null as string[] | null,
  };

  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--profile" && argv[i + 1]) {
      args.profile = argv[++i] as "fast" | "professional" | "ultra";
    } else if (argv[i] === "--ids" && argv[i + 1]) {
      args.ids = argv[i + 1]!.split(",").map((value) => value.trim());
      i += 1;
    }
  }

  return args;
}

function countRetries(profiler: WebsitePipelineProfiler): number {
  const report = profiler.toReport();
  return report.llmCalls.filter((call) => call.attempt > 1).length;
}

async function runSingle(
  promptCase: GoldenPromptCase,
  mode: "legacy" | "wave",
  profile: "fast" | "professional" | "ultra",
): Promise<{
  project: Awaited<ReturnType<typeof generateWebsite>>;
  metrics: RunMetrics;
}> {
  const previousScheduler = process.env.WB_WAVE_SCHEDULER;
  process.env.WB_WAVE_SCHEDULER = mode === "wave" ? "1" : "0";

  const profiler = new WebsitePipelineProfiler();
  profiler.snapshotMemory(`${promptCase.id}-${mode}-start`);
  const started = Date.now();

  try {
    const project = await runWithWebsiteProfiler(profiler, async () =>
      generateWebsite({
        prompt: promptCase.prompt,
        language: promptCase.language,
        theme: promptCase.theme,
        projectType: "website",
        projectKind: "website",
        features: promptCase.features,
        generationProfile: profile,
        userId: `wave-validation-${promptCase.id}`,
        onProgress: () => {},
      }),
    );

    profiler.snapshotMemory(`${promptCase.id}-${mode}-end`);
    const report = profiler.toReport();
    const memoryEnd = report.memorySnapshots.at(-1);
    const fileGen = report.llmByStage["file-generation"];

    const metrics: RunMetrics = {
      mode,
      wallClockMs: Date.now() - started,
      generationTimeMs: project.generationTimeMs,
      fileCount: project.files?.length ?? 0,
      provider: project.provider,
      llmRequestCount: report.llmCalls.length,
      fileGenerationLlmCount: fileGen?.count ?? 0,
      fileGenerationDurationMs: fileGen?.durationMs ?? 0,
      fileGenerationTokens: 0,
      totalTokens: project.usage?.totalTokens ?? 0,
      retryCount: countRetries(profiler),
      heapUsedMbEnd: memoryEnd?.heapUsedMb ?? 0,
      rssMbEnd: memoryEnd?.rssMb ?? 0,
    };

    return { project, metrics };
  } finally {
    if (previousScheduler === undefined) {
      delete process.env.WB_WAVE_SCHEDULER;
    } else {
      process.env.WB_WAVE_SCHEDULER = previousScheduler;
    }
  }
}

function selectPrompts(ids: string[] | null): GoldenPromptCase[] {
  if (!ids?.length) return WEBSITE_GOLDEN_PROMPT_SUITE;
  return WEBSITE_GOLDEN_PROMPT_SUITE.filter((entry) => ids.includes(entry.id));
}

async function main() {
  const args = parseArgs();
  const prompts = selectPrompts(args.ids);

  if (!prompts.length) {
    throw new Error("No golden prompts matched the provided --ids filter.");
  }

  console.error(
    `Wave Scheduler validation: ${prompts.length} prompts · profile=${args.profile}`,
  );

  const comparisons: PromptComparison[] = [];

  for (const promptCase of prompts) {
    console.error(`\n=== ${promptCase.label} (${promptCase.id}) ===`);
    console.error("Running legacy (WB_WAVE_SCHEDULER=0)...");
    const legacyRun = await runSingle(promptCase, "legacy", args.profile);

    console.error("Running wave scheduler (WB_WAVE_SCHEDULER=1)...");
    const waveRun = await runSingle(promptCase, "wave", args.profile);

    const quality = compareGenerationQuality({
      promptId: promptCase.id,
      prompt: promptCase.prompt,
      language: promptCase.language,
      legacyFiles: legacyRun.project.files ?? [],
      waveFiles: waveRun.project.files ?? [],
    });

    const speedupPercent =
      waveRun.metrics.wallClockMs > 0
        ? Math.round(
            (1 - waveRun.metrics.wallClockMs / legacyRun.metrics.wallClockMs) *
              100,
          )
        : 0;

    comparisons.push({
      promptId: promptCase.id,
      label: promptCase.label,
      legacy: legacyRun.metrics,
      wave: waveRun.metrics,
      quality,
      speedupPercent,
    });

    console.error(
      `  legacy ${legacyRun.metrics.wallClockMs}ms · wave ${waveRun.metrics.wallClockMs}ms · speedup ${speedupPercent}% · quality ${quality.passed ? "PASS" : "FAIL"}`,
    );

    if (!quality.passed) {
      console.error(`  regressions: ${quality.regressions.join("; ")}`);
    }
  }

  const passedCount = comparisons.filter((entry) => entry.quality.passed).length;
  const avgStructure =
    comparisons.reduce((sum, entry) => sum + entry.quality.structureScore, 0) /
    comparisons.length;
  const avgJaccard =
    comparisons.reduce((sum, entry) => sum + entry.quality.filePathJaccard, 0) /
    comparisons.length;
  const avgSpeedup =
    comparisons.reduce((sum, entry) => sum + entry.speedupPercent, 0) /
    comparisons.length;
  const legacyTotalMs = comparisons.reduce(
    (sum, entry) => sum + entry.legacy.wallClockMs,
    0,
  );
  const waveTotalMs = comparisons.reduce(
    (sum, entry) => sum + entry.wave.wallClockMs,
    0,
  );

  const report = {
    timestamp: new Date().toISOString(),
    profile: args.profile,
    promptCount: comparisons.length,
    overallPassed: passedCount === comparisons.length,
    passedCount,
    failedCount: comparisons.length - passedCount,
    quality: {
      averageStructureScore: Math.round(avgStructure),
      averageFilePathJaccard: Math.round(avgJaccard * 1000) / 1000,
      qualityPreservedPercent: Math.round((passedCount / comparisons.length) * 100),
    },
    performance: {
      legacyTotalMs,
      waveTotalMs,
      averageSpeedupPercent: Math.round(avgSpeedup),
      overallSpeedupPercent: Math.round((1 - waveTotalMs / legacyTotalMs) * 100),
      legacyAvgFileGenMs: Math.round(
        comparisons.reduce((s, e) => s + e.legacy.fileGenerationDurationMs, 0) /
          comparisons.length,
      ),
      waveAvgFileGenMs: Math.round(
        comparisons.reduce((s, e) => s + e.wave.fileGenerationDurationMs, 0) /
          comparisons.length,
      ),
    },
    comparisons,
    recommendation: passedCount === comparisons.length
      ? "PASS — Enable WB_WAVE_SCHEDULER=1 on staging only. Do not enable by default."
      : "FAIL — Quality regression detected. Do not enable on staging.",
  };

  const outDir = join(process.cwd(), "scripts", "benchmark-results");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(
    outDir,
    `wave-scheduler-production-validation-${Date.now()}.json`,
  );
  writeFileSync(outPath, JSON.stringify(report, null, 2));

  console.log(JSON.stringify(report, null, 2));
  console.error(`\nwritten: ${outPath}`);

  if (!report.overallPassed) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
