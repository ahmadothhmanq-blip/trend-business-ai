/**
 * TBGE Validation Benchmark — Legacy Website Builder vs TBGE (5 industries).
 * Run: npx tsx scripts/tbge/benchmark-legacy-vs-tbge.ts
 *      npx tsx scripts/tbge/benchmark-legacy-vs-tbge.ts --industry restaurant
 *      npx tsx scripts/tbge/benchmark-legacy-vs-tbge.ts --skip-lighthouse
 */
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  writeFileSync,
  readFileSync,
  existsSync,
  mkdtempSync,
  rmSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { performance } from "node:perf_hooks";
import { createServer } from "node:http";

function loadEnvLocal() {
  const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
  const path = join(root, ".env.local");
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

import { validateAccessibility } from "@/lib/ai-core/accessibility/validate";
import { runVisualDesignQuality } from "@/lib/ai-core/visual-design-quality/analyze";
import { runSemanticContentQuality } from "@/lib/ai-core/semantic-content-quality/analyze";
import { runWithWebsiteProfiler } from "@/lib/ai-core/performance/profiler-context";
import { WebsitePipelineProfiler } from "@/lib/ai-core/performance/website-profiler";
import { defaultAssemblyEngine } from "@/lib/tbge/assembly/engine";
import { defaultComponentComposer } from "@/lib/tbge/composer/runtime";
import { hashPrompt } from "@/lib/tbge/spec/lock";
import { generateWebsite } from "@/lib/website-generator";
import { buildStaticPreviewHtml } from "@/lib/website/build-static-preview.server";
import type { TbgeWebsiteGenerationResult } from "@/lib/tbge/integration/types";
import type { GeneratedProjectFile } from "@/lib/website/types";

type GenerateResult = Awaited<ReturnType<typeof generateWebsite>> &
  Partial<
    Pick<
      TbgeWebsiteGenerationResult,
      "tbgeIntegration" | "tbgeSpec" | "tbgeComposition" | "tbgeTrace"
    >
  >;

const INDUSTRIES = [
  {
    id: "restaurant",
    label: "Restaurant",
    prompt:
      "Fine dining restaurant in Dubai with online reservations, seasonal menu highlights, chef story, private dining events, and wine pairings. Premium luxury aesthetic with warm gold accents.",
    projectType: "Restaurant",
    theme: "Gold Luxury",
  },
  {
    id: "real-estate",
    label: "Real Estate",
    prompt:
      "Luxury real estate agency with featured property listings, neighborhood guides, mortgage calculator CTA, agent profiles, and seller services. Elegant high-end visual style.",
    projectType: "Real Estate",
    theme: "Elegant Luxury",
  },
  {
    id: "saas",
    label: "SaaS",
    prompt:
      "B2B SaaS project management platform for remote teams with pricing tiers, feature comparison grid, customer testimonials, integrations, and signup CTA. Modern professional aesthetic.",
    projectType: "SaaS",
    theme: "Modern Professional",
  },
  {
    id: "medical",
    label: "Medical Clinic",
    prompt:
      "Private medical clinic offering primary care, pediatrics, and telehealth appointments. Include doctor profiles, insurance accepted, patient portal, and emergency contact. Clean trustworthy design.",
    projectType: "Healthcare",
    theme: "Clean Medical",
  },
  {
    id: "gaming",
    label: "Gaming",
    prompt:
      "Indie game studio showcasing released titles, upcoming games, developer blog, community Discord link, and press kit downloads. Bold cyberpunk gaming aesthetic with neon accents.",
    projectType: "Gaming",
    theme: "Cyberpunk Neon",
  },
] as const;

/** DeepSeek Chat approximate pricing (USD per 1M tokens). */
const DEEPSEEK_INPUT_PER_M = 0.14;
const DEEPSEEK_OUTPUT_PER_M = 0.28;

type Engine = "legacy" | "tbge";

type RunMetrics = {
  engine: Engine;
  industryId: string;
  success: boolean;
  error?: string;
  wallClockMs: number;
  generationTimeMs: number;
  llmCalls: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  fileCount: number;
  buildSuccess: boolean;
  buildError?: string;
  plannerTimeMs?: number;
  assemblyTimeMs?: number;
  composerTimeMs?: number;
  specHash?: string;
  specJson?: string;
  componentReuseRate?: number;
  quality: {
    accessibilityScore: number;
    visualOverall: number;
    responsiveQuality: number;
    semanticSeo: number;
    semanticOverall: number;
    heuristicQuality: number;
  };
  lighthouse?: {
    performance: number;
    accessibility: number;
    seo: number;
    bestPractices: number;
  };
  provider: string;
};

function parseArgs() {
  const args = process.argv.slice(2);
  const industry = args.includes("--industry")
    ? args[args.indexOf("--industry") + 1]
    : null;
  const skipLighthouse = args.includes("--skip-lighthouse");
  return { industry, skipLighthouse };
}

function estimateCost(promptTokens: number, completionTokens: number): number {
  return Number(
    (
      (promptTokens / 1_000_000) * DEEPSEEK_INPUT_PER_M +
      (completionTokens / 1_000_000) * DEEPSEEK_OUTPUT_PER_M
    ).toFixed(6),
  );
}

function setTbgeEnv(enabled: boolean) {
  if (enabled) {
    process.env.TBGE_ENABLED = "1";
    process.env.TBGE_PLANNING = "1";
    process.env.TBGE_ASSEMBLY = "1";
    process.env.TBGE_COMPOSER = "1";
    delete process.env.TBGE_SHADOW_MODE;
    delete process.env.TBGE_LEGACY_FULL;
  } else {
    delete process.env.TBGE_ENABLED;
    delete process.env.TBGE_PLANNING;
    delete process.env.TBGE_ASSEMBLY;
    delete process.env.TBGE_COMPOSER;
    delete process.env.TBGE_SHADOW_MODE;
    process.env.TBGE_LEGACY_FULL = "1";
  }
}

function validateBuild(files: GeneratedProjectFile[]): { ok: boolean; error?: string } {
  const paths = new Set(files.map((f) => f.path));
  const required = ["package.json", "app/page.tsx", "app/layout.tsx"];
  const missing = required.filter((p) => !paths.has(p));
  if (missing.length) return { ok: false, error: `Missing: ${missing.join(", ")}` };
  const empty = files.filter((f) => !f.content.trim()).map((f) => f.path);
  if (empty.length) return { ok: false, error: `Empty files: ${empty.slice(0, 3).join(", ")}` };
  try {
    buildStaticPreviewHtml({
      title: "Benchmark Preview",
      description: "Benchmark",
      files,
      pages: ["/"],
      sections: ["Hero"],
      colorPalette: ["#111", "#fff"],
      typography: ["Inter"],
      components: [],
      content: [],
      seo: [],
      roadmap: [],
      projectKind: "website",
    });
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function analyzeQuality(files: GeneratedProjectFile[], brandName: string) {
  const accessibility = validateAccessibility(files);
  const visual = runVisualDesignQuality({ files, brandName });
  const semantic = await runSemanticContentQuality({
    files,
    brandName,
    industry: brandName,
  });
  const nonEmpty = files.filter((f) => f.content.trim().length > 0).length;
  const heuristicQuality = files.length ? (nonEmpty / files.length) * 100 : 0;
  return {
    accessibilityScore: accessibility.score,
    visualOverall: visual.scores.overall,
    responsiveQuality: visual.scores.responsiveLayout,
    semanticSeo: semantic.scores.semanticSeo,
    semanticOverall: semantic.scores.overall,
    heuristicQuality: Number(heuristicQuality.toFixed(2)),
  };
}

function computeComponentReuse(tbgeSpec: { structure: { pages: Array<{ sections: string[] }> } } | undefined, composition: { pages: Array<{ sections: Array<{ componentType: string }> }> } | undefined): number | undefined {
  if (!composition) return undefined;
  const sectionTypes = composition.pages.flatMap((p) => p.sections.map((s) => s.componentType));
  if (!sectionTypes.length) return 0;
  const unique = new Set(sectionTypes);
  return Number((1 - unique.size / sectionTypes.length).toFixed(4));
}

async function runLighthouse(html: string): Promise<RunMetrics["lighthouse"] | undefined> {
  const dir = mkdtempSync(join(tmpdir(), "tbge-lh-"));
  const htmlPath = join(dir, "index.html");
  writeFileSync(htmlPath, html, "utf8");

  return new Promise((resolve) => {
    const server = createServer((_req, res) => {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(html);
    });

    server.listen(0, "127.0.0.1", () => {
      const port = (server.address() as { port: number }).port;
      const url = `http://127.0.0.1:${port}/`;
      const outPath = join(dir, "report.json");

      const result = spawnSync(
        "npx",
        [
          "lighthouse",
          url,
          "--output=json",
          `--output-path=${outPath}`,
          "--chrome-flags=--headless --no-sandbox",
          "--only-categories=performance,accessibility,best-practices,seo",
          "--quiet",
        ],
        { stdio: "pipe", shell: true, timeout: 120_000 },
      );

      server.close();
      try {
        if (!existsSync(outPath)) {
          resolve(undefined);
          return;
        }
        const report = JSON.parse(readFileSync(outPath, "utf8"));
        resolve({
          performance: Math.round((report.categories?.performance?.score ?? 0) * 100),
          accessibility: Math.round((report.categories?.accessibility?.score ?? 0) * 100),
          seo: Math.round((report.categories?.seo?.score ?? 0) * 100),
          bestPractices: Math.round((report.categories?.["best-practices"]?.score ?? 0) * 100),
        });
      } catch {
        resolve(undefined);
      } finally {
        try {
          rmSync(dir, { recursive: true, force: true });
        } catch {
          /* ignore */
        }
      }
    });
  });
}

async function runEngine(
  engine: Engine,
  industry: (typeof INDUSTRIES)[number],
  skipLighthouse: boolean,
): Promise<RunMetrics> {
  setTbgeEnv(engine === "tbge");
  const profiler = new WebsitePipelineProfiler();
  const wallStart = performance.now();
  let result: GenerateResult | null = null;
  let error: string | undefined;

  try {
    result = await runWithWebsiteProfiler(profiler, () =>
      generateWebsite({
        prompt: industry.prompt,
        language: "English",
        theme: industry.theme,
        projectType: industry.projectType,
        projectKind: "website",
        features: ["contact-form", "seo", "responsive"],
        generationProfile: "professional",
        userId: `benchmark-${engine}-${industry.id}`,
        onProgress: (msg) => {
          console.error(`[${engine}/${industry.id}] ${msg}`);
        },
      }),
    );
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  const wallClockMs = performance.now() - wallStart;
  const report = profiler.toReport();

  if (!result || error) {
    return {
      engine,
      industryId: industry.id,
      success: false,
      error,
      wallClockMs: Number(wallClockMs.toFixed(2)),
      generationTimeMs: 0,
      llmCalls: 0,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      estimatedCostUsd: 0,
      fileCount: 0,
      buildSuccess: false,
      quality: {
        accessibilityScore: 0,
        visualOverall: 0,
        responsiveQuality: 0,
        semanticSeo: 0,
        semanticOverall: 0,
        heuristicQuality: 0,
      },
      provider: "none",
    };
  }

  const files = result.files ?? [];
  const build = validateBuild(files);
  const quality = await analyzeQuality(files, industry.label);

  let plannerTimeMs: number | undefined;
  let assemblyTimeMs: number | undefined;
  let composerTimeMs: number | undefined;
  let specHash: string | undefined;
  let componentReuseRate: number | undefined;

  if (engine === "legacy") {
    const plannerStages = report.stageTimings.filter(
      (s) => s.label.includes("master-planner") || s.label.includes("strategy"),
    );
    plannerTimeMs = plannerStages.reduce((s, r) => s + r.totalMs, 0);
  }

  if (engine === "tbge" && result.tbgeSpec) {
    specHash = hashPrompt(JSON.stringify(result.tbgeSpec.structure));
    const traceStart = result.tbgeTrace?.startedAt
      ? new Date(result.tbgeTrace.startedAt).getTime()
      : wallStart;
    const traceEnd = result.tbgeTrace?.completedAt
      ? new Date(result.tbgeTrace.completedAt).getTime()
      : wallStart + result.generationTimeMs;
    const orchestratorMs = traceEnd - traceStart;

    const asmStart = performance.now();
    await defaultAssemblyEngine.assemble(result.tbgeSpec);
    assemblyTimeMs = Number((performance.now() - asmStart).toFixed(2));
    plannerTimeMs = Number(Math.max(0, orchestratorMs - assemblyTimeMs).toFixed(2));

    if (result.tbgeComposition) {
      const compStart = performance.now();
      defaultComponentComposer.compose(result.tbgeSpec);
      composerTimeMs = Number((performance.now() - compStart).toFixed(2));
      componentReuseRate = computeComponentReuse(result.tbgeSpec, result.tbgeComposition);
    }
  }

  const llmCalls =
    engine === "tbge"
      ? (result.tbgeIntegration?.llmCalls ?? result.tbgeTrace?.llmCalls ?? 0)
      : report.llmCalls.length;

  const promptTokens = result.usage?.promptTokens ?? 0;
  const completionTokens = result.usage?.completionTokens ?? 0;
  const totalTokens = result.usage?.totalTokens ?? promptTokens + completionTokens;

  let lighthouse: RunMetrics["lighthouse"];
  if (!skipLighthouse && build.ok && files.length) {
    try {
      const html = buildStaticPreviewHtml({
        title: industry.label,
        description: industry.prompt.slice(0, 160),
        files,
        pages: ["/"],
        sections: ["Hero"],
        colorPalette: result.colorPalette ?? ["#111", "#fff"],
        typography: result.typography ?? ["Inter"],
        components: result.components ?? [],
        content: result.content ?? [],
        seo: result.seo ?? [],
        roadmap: result.roadmap ?? [],
        projectKind: "website",
      });
      lighthouse = await runLighthouse(html);
    } catch {
      lighthouse = undefined;
    }
  }

  return {
    engine,
    industryId: industry.id,
    success: true,
    wallClockMs: Number(wallClockMs.toFixed(2)),
    generationTimeMs: result.generationTimeMs,
    llmCalls,
    promptTokens,
    completionTokens,
    totalTokens,
    estimatedCostUsd: estimateCost(promptTokens, completionTokens),
    fileCount: files.length,
    buildSuccess: build.ok,
    buildError: build.error,
    plannerTimeMs,
    assemblyTimeMs,
    composerTimeMs,
    specHash,
    specJson: engine === "tbge" && result.tbgeSpec ? JSON.stringify(result.tbgeSpec) : undefined,
    componentReuseRate,
    quality,
    lighthouse,
    provider: result.provider,
  };
}

async function measureDeterminism(specJson?: string): Promise<number> {
  if (!specJson) return 0;
  try {
    const spec = JSON.parse(specJson);
    const first = await defaultAssemblyEngine.assemble(spec);
    const second = await defaultAssemblyEngine.assemble(spec);
    const hashFiles = (files: GeneratedProjectFile[]) =>
      hashPrompt(files.map((f) => `${f.path}:${f.content.length}`).join("|"));
    const assemblyMatch = hashFiles(first.files) === hashFiles(second.files) ? 50 : 0;
    const comp1 = defaultComponentComposer.compose(spec);
    const comp2 = defaultComponentComposer.compose(spec);
    const composerMatch =
      hashPrompt(JSON.stringify(comp1.composition)) ===
      hashPrompt(JSON.stringify(comp2.composition))
        ? 50
        : 0;
    return assemblyMatch + composerMatch;
  } catch {
    return 0;
  }
}

function aggregate(runs: RunMetrics[]) {
  const legacy = runs.filter((r) => r.engine === "legacy");
  const tbge = runs.filter((r) => r.engine === "tbge");
  const sum = (arr: RunMetrics[], key: keyof RunMetrics) =>
    arr.reduce((s, r) => s + (typeof r[key] === "number" ? (r[key] as number) : 0), 0);
  const avg = (arr: RunMetrics[], key: keyof RunMetrics) =>
    arr.length ? sum(arr, key) / arr.length : 0;
  const successRate = (arr: RunMetrics[]) =>
    arr.length ? (arr.filter((r) => r.success).length / arr.length) * 100 : 0;
  const buildRate = (arr: RunMetrics[]) =>
    arr.length ? (arr.filter((r) => r.buildSuccess).length / arr.length) * 100 : 0;

  return {
    legacy: {
      count: legacy.length,
      successRate: successRate(legacy),
      buildRate: buildRate(legacy),
      avgWallMs: avg(legacy, "wallClockMs"),
      avgLlmCalls: avg(legacy, "llmCalls"),
      avgCostUsd: avg(legacy, "estimatedCostUsd"),
      avgFiles: avg(legacy, "fileCount"),
      avgVisual: avg(legacy.map((r) => ({ ...r, visualOverall: r.quality.visualOverall })) as RunMetrics[], "visualOverall" as keyof RunMetrics),
    },
    tbge: {
      count: tbge.length,
      successRate: successRate(tbge),
      buildRate: buildRate(tbge),
      avgWallMs: avg(tbge, "wallClockMs"),
      avgLlmCalls: avg(tbge, "llmCalls"),
      avgCostUsd: avg(tbge, "estimatedCostUsd"),
      avgFiles: avg(tbge, "fileCount"),
      avgPlannerMs: avg(tbge, "plannerTimeMs"),
      avgAssemblyMs: avg(tbge, "assemblyTimeMs"),
      avgComposerMs: avg(tbge, "composerTimeMs"),
    },
  };
}

function buildReports(runs: RunMetrics[], determinism: Record<string, number>) {
  const agg = aggregate(runs);
  const timestamp = new Date().toISOString();

  const benchmarkReport = {
    title: "TBGE vs Legacy Benchmark Report",
    timestamp,
    industries: INDUSTRIES.map((i) => i.id),
    runs,
    determinism,
    summary: agg,
  };

  const performanceReport = {
    title: "TBGE Performance Report",
    timestamp,
    comparisons: runs
      .filter((r) => r.engine === "tbge")
      .map((tbge) => {
        const legacy = runs.find(
          (r) => r.engine === "legacy" && r.industryId === tbge.industryId,
        );
        return {
          industryId: tbge.industryId,
          legacyWallMs: legacy?.wallClockMs ?? null,
          tbgeWallMs: tbge.wallClockMs,
          speedupRatio: legacy ? Number((legacy.wallClockMs / tbge.wallClockMs).toFixed(2)) : null,
          legacyLlmCalls: legacy?.llmCalls ?? null,
          tbgeLlmCalls: tbge.llmCalls,
          plannerTimeMs: tbge.plannerTimeMs,
          assemblyTimeMs: tbge.assemblyTimeMs,
          composerTimeMs: tbge.composerTimeMs,
        };
      }),
    aggregates: agg,
  };

  const qualityReport = {
    title: "TBGE Quality Report",
    timestamp,
    byIndustry: INDUSTRIES.map((industry) => {
      const legacy = runs.find((r) => r.engine === "legacy" && r.industryId === industry.id);
      const tbge = runs.find((r) => r.engine === "tbge" && r.industryId === industry.id);
      return {
        industryId: industry.id,
        legacy: legacy?.quality,
        tbge: tbge?.quality,
        legacyLighthouse: legacy?.lighthouse,
        tbgeLighthouse: tbge?.lighthouse,
        componentReuseRate: tbge?.componentReuseRate,
        determinismRate: determinism[industry.id] ?? 0,
      };
    }),
  };

  const costReport = {
    title: "TBGE Cost Report",
    timestamp,
    pricingModel: {
      provider: "deepseek",
      inputPerMillion: DEEPSEEK_INPUT_PER_M,
      outputPerMillion: DEEPSEEK_OUTPUT_PER_M,
    },
    byIndustry: runs
      .reduce(
        (acc, run) => {
          const row = acc.find((r) => r.industryId === run.industryId);
          if (!row) {
            acc.push({
              industryId: run.industryId,
              legacy: run.engine === "legacy" ? run : undefined,
              tbge: run.engine === "tbge" ? run : undefined,
            });
          } else if (run.engine === "legacy") row.legacy = run;
          else row.tbge = run;
          return acc;
        },
        [] as Array<{ industryId: string; legacy?: RunMetrics; tbge?: RunMetrics }>,
      )
      .map((row) => ({
        industryId: row.industryId,
        legacyCostUsd: row.legacy?.estimatedCostUsd ?? null,
        tbgeCostUsd: row.tbge?.estimatedCostUsd ?? null,
        savingsUsd:
          row.legacy && row.tbge
            ? Number((row.legacy.estimatedCostUsd - row.tbge.estimatedCostUsd).toFixed(6))
            : null,
        legacyTokens: row.legacy?.totalTokens ?? null,
        tbgeTokens: row.tbge?.totalTokens ?? null,
      })),
    totals: {
      legacyCostUsd: runs
        .filter((r) => r.engine === "legacy")
        .reduce((s, r) => s + r.estimatedCostUsd, 0),
      tbgeCostUsd: runs
        .filter((r) => r.engine === "tbge")
        .reduce((s, r) => s + r.estimatedCostUsd, 0),
    },
  };

  const tbgeReady =
    agg.tbge.successRate >= 100 &&
    agg.tbge.buildRate >= 80 &&
    agg.tbge.avgWallMs < agg.legacy.avgWallMs &&
    agg.tbge.avgLlmCalls <= 2;

  const recommendation = {
    title: "TBGE Readiness Recommendation",
    timestamp,
    readyToReplaceLegacy: tbgeReady,
    verdict: tbgeReady
      ? "TBGE meets benchmark thresholds for cost, speed, and reliability."
      : "TBGE is NOT ready to replace Legacy Website Builder.",
    improvements: [] as string[],
    strengths: [] as string[],
  };

  if (agg.tbge.avgWallMs >= agg.legacy.avgWallMs) {
    recommendation.improvements.push(
      "Reduce end-to-end generation time — TBGE must beat legacy wall-clock on average.",
    );
  } else {
    recommendation.strengths.push(
      `TBGE is ${(agg.legacy.avgWallMs / Math.max(agg.tbge.avgWallMs, 1)).toFixed(1)}x faster on average.`,
    );
  }

  if (agg.tbge.avgLlmCalls > 2) {
    recommendation.improvements.push("Reduce LLM calls — target ≤2 per generation.");
  } else {
    recommendation.strengths.push(`TBGE averages ${agg.tbge.avgLlmCalls.toFixed(1)} LLM calls vs legacy.`);
  }

  if (agg.tbge.buildRate < 100) {
    recommendation.improvements.push(
      `Improve build success rate (current TBGE: ${agg.tbge.buildRate.toFixed(0)}%).`,
    );
  }

  if (agg.tbge.successRate < 100) {
    recommendation.improvements.push(
      `Fix generation errors (current TBGE error rate: ${(100 - agg.tbge.successRate).toFixed(0)}%).`,
    );
  }

  const avgDet = Object.values(determinism).reduce((s, v) => s + v, 0) / Math.max(Object.keys(determinism).length, 1);
  if (avgDet < 100) {
    recommendation.improvements.push(
      "Improve deterministic generation — identical prompts should produce identical spec hashes.",
    );
  }

  const legacyLh = runs.filter((r) => r.engine === "legacy" && r.lighthouse);
  const tbgeLh = runs.filter((r) => r.engine === "tbge" && r.lighthouse);
  if (legacyLh.length && tbgeLh.length) {
    const avgLegacyPerf =
      legacyLh.reduce((s, r) => s + (r.lighthouse?.performance ?? 0), 0) / legacyLh.length;
    const avgTbgePerf =
      tbgeLh.reduce((s, r) => s + (r.lighthouse?.performance ?? 0), 0) / tbgeLh.length;
    if (avgTbgePerf < avgLegacyPerf - 5) {
      recommendation.improvements.push(
        "Improve Lighthouse Performance scores — TBGE preview scores trail legacy.",
      );
    }
  } else if (!tbgeLh.length) {
    recommendation.improvements.push(
      "Validate Lighthouse scores on TBGE output (preview build or static HTML audit).",
    );
  }

  if (agg.tbge.avgFiles < agg.legacy.avgFiles * 0.5) {
    recommendation.improvements.push(
      "Increase file graph completeness — TBGE produces significantly fewer files than legacy.",
    );
  }

  return {
    benchmarkReport,
    performanceReport,
    qualityReport,
    costReport,
    recommendation,
  };
}

async function main() {
  const { industry: singleIndustry, skipLighthouse } = parseArgs();
  const industries = singleIndustry
    ? INDUSTRIES.filter((i) => i.id === singleIndustry)
    : [...INDUSTRIES];

  if (!industries.length) {
    console.error(`Unknown industry: ${singleIndustry}`);
    process.exit(1);
  }

  const runs: RunMetrics[] = [];
  const determinism: Record<string, number> = {};

  console.log("TBGE Validation Benchmark — starting");
  console.log(`Industries: ${industries.map((i) => i.id).join(", ")}`);
  console.log(`Lighthouse: ${skipLighthouse ? "skipped" : "enabled"}\n`);

  for (const industry of industries) {
    console.log(`\n=== ${industry.label.toUpperCase()} — LEGACY ===`);
    runs.push(await runEngine("legacy", industry, skipLighthouse));

    console.log(`\n=== ${industry.label.toUpperCase()} — TBGE ===`);
    const tbgeRun = await runEngine("tbge", industry, skipLighthouse);
    runs.push(tbgeRun);

    console.log(`\n=== ${industry.label.toUpperCase()} — DETERMINISM CHECK ===`);
    determinism[industry.id] = await measureDeterminism(tbgeRun.specJson);
    console.log(`Determinism rate: ${determinism[industry.id]}%`);
  }

  const sanitizedRuns = runs.map(({ specJson: _specJson, ...rest }) => rest);
  const reports = buildReports(sanitizedRuns, determinism);
  const outDir = join(process.cwd(), "scripts", "benchmark-results");
  mkdirSync(outDir, { recursive: true });
  const ts = Date.now();

  const paths = {
    benchmark: join(outDir, `tbge-benchmark-report-${ts}.json`),
    performance: join(outDir, `tbge-performance-report-${ts}.json`),
    quality: join(outDir, `tbge-quality-report-${ts}.json`),
    cost: join(outDir, `tbge-cost-report-${ts}.json`),
    recommendation: join(outDir, `tbge-recommendation-${ts}.json`),
    combined: join(outDir, `tbge-validation-benchmark-${ts}.json`),
  };

  writeFileSync(paths.benchmark, JSON.stringify({ ...reports.benchmarkReport, runs: sanitizedRuns }, null, 2));
  writeFileSync(paths.performance, JSON.stringify(reports.performanceReport, null, 2));
  writeFileSync(paths.quality, JSON.stringify(reports.qualityReport, null, 2));
  writeFileSync(paths.cost, JSON.stringify(reports.costReport, null, 2));
  writeFileSync(paths.recommendation, JSON.stringify(reports.recommendation, null, 2));
  writeFileSync(
    paths.combined,
    JSON.stringify({ ...reports, runs: sanitizedRuns, determinism }, null, 2),
  );

  console.log("\n\n=== BENCHMARK COMPLETE ===");
  console.log(JSON.stringify(reports.recommendation, null, 2));
  console.log(`\nReports written to scripts/benchmark-results/tbge-*-${ts}.json`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
