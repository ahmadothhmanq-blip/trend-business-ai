/**
 * Profile Website Builder generation end-to-end and emit a performance report.
 *
 * Usage:
 *   node scripts/profile-website-generation.mjs
 *   node scripts/profile-website-generation.mjs --profile ultra
 *   node scripts/profile-website-generation.mjs --profile professional --prompt "..."
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const resultsDir = join(root, "scripts", "benchmark-results");

function parseArgs(argv) {
  const args = {
    profile: "ultra",
    prompt:
      "Fine dining restaurant in Dubai with reservations, menu highlights, chef story, and private dining events. Premium luxury aesthetic.",
    fromBenchmark: null,
  };
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === "--profile" && argv[i + 1]) {
      args.profile = argv[++i];
    } else if (argv[i] === "--prompt" && argv[i + 1]) {
      args.prompt = argv[++i];
    } else if (argv[i] === "--from-benchmark" && argv[i + 1]) {
      args.fromBenchmark = argv[++i];
    }
  }
  return args;
}

function loadLatestBenchmark(profile) {
  if (!existsSync(resultsDir)) return null;
  const files = readdirSync(resultsDir)
    .filter((f) => f.startsWith(`benchmark-${profile}-`) && f.endsWith(".json"))
    .sort()
    .reverse();
  if (!files.length) return null;
  return JSON.parse(readFileSync(join(resultsDir, files[0]), "utf8"));
}

function benchmarkToReport(benchmark) {
  const stageMap = new Map();
  for (const row of benchmark.progressStageTimings ?? []) {
    stageMap.set(row.stage, (stageMap.get(row.stage) ?? 0) + row.durationMs);
  }
  const stageTimings = [...stageMap.entries()]
    .map(([label, totalMs]) => ({
      category: label === "generation" ? "plugin" : "layer-runner",
      label,
      totalMs,
      count: benchmark.progressStageTimings.filter((r) => r.stage === label).length,
      avgMs: Math.round(
        totalMs / benchmark.progressStageTimings.filter((r) => r.stage === label).length,
      ),
      sharePercent:
        benchmark.wallClockMs > 0
          ? Math.round((totalMs / benchmark.wallClockMs) * 1000) / 10
          : 0,
    }))
    .sort((a, b) => b.totalMs - a.totalMs);

  const llmTotal = Object.values(benchmark.llmByStage ?? {}).reduce(
    (s, v) => s + v.durationMs,
    0,
  );

  return {
    source: "historical-benchmark",
    profile: benchmark.profile,
    prompt: benchmark.prompt,
    gitHead: benchmark.gitHead,
    timestamp: benchmark.timestamp,
    totalGenerationMs: benchmark.wallClockMs,
    measuredWallMs: benchmark.wallClockMs,
    layerRunnerMs: benchmark.layerRunnerMs,
    fileCount: benchmark.fileCount,
    provider: benchmark.provider,
    llmRequestCount: benchmark.llmRequestCount,
    llmByStage: benchmark.llmByStage,
    stageTimings,
    aiSharePercent:
      benchmark.wallClockMs > 0
        ? Math.round((llmTotal / benchmark.wallClockMs) * 1000) / 10
        : 0,
    duplicateStageExecutions: benchmark.progressStageTimings.reduce((acc, row) => {
      acc[row.stage] = (acc[row.stage] ?? 0) + 1;
      return acc;
    }, {}),
  };
}

function formatBenchmarkMarkdown(report, benchmark) {
  const lines = [
    "# Website Builder — Performance Profiling Report",
    "",
    `> **Source:** Historical benchmark (git \`${benchmark.gitHead}\`, ${benchmark.timestamp})`,
    `> **Profile:** ${benchmark.profile}`,
    "",
    `**Total generation time:** ${report.totalGenerationMs}ms (${(report.totalGenerationMs / 1000).toFixed(1)}s)`,
    `**Files generated:** ${benchmark.fileCount}`,
    `**LLM requests:** ${benchmark.llmRequestCount}`,
    `**AI time share:** ~${report.aiSharePercent}%`,
    "",
    "## Time per Pipeline Stage",
    "",
  ];
  for (const row of report.stageTimings) {
    lines.push(
      `- **${row.label}**: ${row.totalMs}ms (${row.sharePercent}%) · ${row.count} execution(s)`,
    );
  }
  lines.push("", "## AI Requests by Stage", "");
  for (const [stage, stats] of Object.entries(benchmark.llmByStage ?? {})) {
    lines.push(
      `- **${stage}**: ${stats.count} calls · ${stats.durationMs}ms · ${stats.promptChars} prompt chars`,
    );
  }
  const dups = Object.entries(report.duplicateStageExecutions).filter(([, c]) => c > 1);
  if (dups.length) {
    lines.push("", "## Duplicate Stage Executions", "");
    for (const [stage, count] of dups) {
      lines.push(`- \`${stage}\`: ${count}×`);
    }
  }
  lines.push(
    "",
    "## Recommendations (by impact)",
    "",
    "1. **[critical]** Per-file LLM generation is the dominant cost — batch or parallelize independent files.",
    "2. **[high]** Strategy + design-system LLM calls add significant pre-generation latency.",
    "3. **[medium]** Duplicate master-planner/template stage entries suggest redundant orchestration steps.",
    "4. **[medium]** Run live profiler with API keys for Supabase checkpoint/persist measurements.",
    "",
  );
  return lines.join("\n");
}

const runnerPath = join(root, "scripts", "profile-website-generation-runner.ts");
const runnerSource = `import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { generateWebsite } from "@/lib/website-generator";
import { runWithWebsiteProfiler } from "@/lib/ai-core/performance/profiler-context";
import { WebsitePipelineProfiler } from "@/lib/ai-core/performance/website-profiler";

const profile = process.env.WB_PROFILE ?? "ultra";
const prompt = process.env.WB_PROMPT ?? "";

async function main() {
  const profiler = new WebsitePipelineProfiler();
  profiler.snapshotMemory("profile-start");

  const startedAt = Date.now();
  const result = await runWithWebsiteProfiler(profiler, async () =>
    generateWebsite({
      prompt,
      language: "English",
      theme: "modern",
      features: ["contact-form", "seo"],
      generationProfile: profile as "ultra" | "fast" | "professional",
      userId: "profile-run-user",
      onProgress: (msg) => {
        if (process.env.WB_PROFILE_VERBOSE === "1") console.error(msg);
      },
    }),
  );

  profiler.snapshotMemory("profile-end");
  const wallClockMs = Date.now() - startedAt;
  const report = profiler.toReport();

  const payload = {
    source: "live-profile",
    profile,
    prompt,
    wallClockMs,
    generationTimeMs: result.generationTimeMs,
    fileCount: result.files?.length ?? 0,
    provider: result.provider,
    usage: result.usage,
    pipelinePerformanceReport: report,
    pipelinePerformanceMarkdown: profiler.formatMarkdownReport(),
  };

  const outDir = join(process.cwd(), "scripts", "benchmark-results");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, \`profile-\${profile}-\${Date.now()}.json\`);
  writeFileSync(outPath, JSON.stringify(payload, null, 2));
  console.log(outPath);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
`;

writeFileSync(runnerPath, runnerSource, "utf8");

const args = parseArgs(process.argv);

if (args.fromBenchmark) {
  const benchmark = JSON.parse(readFileSync(args.fromBenchmark, "utf8"));
  const report = benchmarkToReport(benchmark);
  const outPath = join(resultsDir, `profile-report-${args.profile}-${Date.now()}.json`);
  mkdirSync(resultsDir, { recursive: true });
  writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  console.log(`\nReport written: ${outPath}`);
  process.exit(0);
}

const hasProvider =
  process.env.DEEPSEEK_API_KEY ||
  process.env.OPENAI_API_KEY ||
  process.env.ANTHROPIC_API_KEY;

if (!hasProvider) {
  console.warn("No AI provider key found — using latest historical benchmark data.");
  const benchmark = loadLatestBenchmark(args.profile);
  if (!benchmark) {
    console.error("No benchmark results in scripts/benchmark-results/. Run with API keys or add benchmark JSON.");
    process.exit(1);
  }
  const report = benchmarkToReport(benchmark);
  const markdown = formatBenchmarkMarkdown(report, benchmark);
  const outPath = join(resultsDir, `profile-report-${args.profile}-${Date.now()}.json`);
  mkdirSync(resultsDir, { recursive: true });
  writeFileSync(outPath, JSON.stringify({ ...report, markdown }, null, 2));
  console.log(markdown);
  console.log(`\nReport written: ${outPath}`);
  process.exit(0);
}

const result = spawnSync("npx", ["tsx", runnerPath], {
  cwd: root,
  env: {
    ...process.env,
    WB_PROFILE: args.profile,
    WB_PROMPT: args.prompt,
  },
  stdio: ["ignore", "pipe", "pipe"],
  shell: true,
});

if (result.status !== 0) {
  console.error(result.stderr?.toString() || result.stdout?.toString());
  process.exit(result.status ?? 1);
}

const outFile = result.stdout.toString().trim().split("\n").pop();
const payload = JSON.parse(readFileSync(outFile, "utf8"));
console.log(payload.pipelinePerformanceMarkdown);
console.log(`\nFull JSON: ${outFile}`);
