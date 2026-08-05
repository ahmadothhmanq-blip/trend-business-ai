/**
 * RC2 — Live DeepSeek smoke tests for Website Builder (5 industry scenarios).
 * Usage: npx tsx scripts/rc2-live-deepseek-smoke.ts
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";
import { generateWebsite } from "@/lib/website-generator";
import { resolveBuilderTemplatePackageId } from "@/lib/website/builder/resolve-builder-template-package-id";
import { runWithWebsiteProfiler } from "@/lib/ai-core/performance/profiler-context";
import { WebsitePipelineProfiler } from "@/lib/ai-core/performance/website-profiler";
import { evaluateGenerationPublishGates } from "@/lib/website/publish-quality";
import type { WebsiteGeneration } from "@/types/database";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "scripts/benchmark-results/rc2");
mkdirSync(outDir, { recursive: true });

function loadEnvLocal() {
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

process.env.WB_PRODUCTION_PIPELINE = "1";
process.env.WB_MASTER_PLAN = "1";

const SCENARIOS = [
  {
    id: "restaurant",
    label: "Restaurant",
    prompt:
      "Fine dining restaurant in Dubai with reservations, menu highlights, chef story, and private dining events. Premium luxury aesthetic.",
    legacyTemplateId: "restaurant",
    packageId: "restaurant-signature",
    industryId: "restaurant",
  },
  {
    id: "saas",
    label: "SaaS",
    prompt:
      "B2B SaaS platform for project management with pricing tiers, feature comparison, customer testimonials, and free trial signup.",
    legacyTemplateId: "saas",
    packageId: "saas-enterprise",
    industryId: "saas",
  },
  {
    id: "medical",
    label: "Medical clinic",
    prompt:
      "Private medical clinic offering family medicine, preventive care, and online appointment booking. Clean, calming, trustworthy design.",
    legacyTemplateId: "medical",
    packageId: "medical-premium",
    industryId: "medical",
  },
  {
    id: "real-estate",
    label: "Real estate",
    prompt:
      "Luxury real estate brokerage with property listings, neighborhood guides, and client testimonials. Prestige aesthetic.",
    legacyTemplateId: "real-estate",
    packageId: "real-estate-prestige",
    industryId: "real-estate",
  },
  {
    id: "creative-agency",
    label: "Creative agency",
    prompt:
      "Creative digital agency showcasing branding, web design, and marketing campaigns. Bold portfolio and case studies.",
    legacyTemplateId: "creative",
    packageId: "creative-portfolio",
    industryId: "agency",
  },
] as const;

/** DeepSeek chat approximate USD per 1M tokens (input / output). */
const DEEPSEEK_COST_PER_M = { input: 0.27, output: 1.1 };

function estimateCostUsd(tokens: {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}): number {
  const input = tokens.promptTokens ?? 0;
  const output = tokens.completionTokens ?? 0;
  return (
    (input / 1_000_000) * DEEPSEEK_COST_PER_M.input +
    (output / 1_000_000) * DEEPSEEK_COST_PER_M.output
  );
}

function hasUndefinedDeep(obj: unknown, path = ""): string[] {
  const hits: string[] = [];
  if (obj === undefined) {
    hits.push(path || "(root)");
    return hits;
  }
  if (obj === null || typeof obj !== "object") return hits;
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => hits.push(...hasUndefinedDeep(v, `${path}[${i}]`)));
    return hits;
  }
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    hits.push(...hasUndefinedDeep(v, path ? `${path}.${k}` : k));
  }
  return hits;
}

function sumProfilerCategory(
  report: ReturnType<WebsitePipelineProfiler["toReport"]>,
  categories: string[],
): number {
  return report.categoryTotals
    .filter((c) => categories.includes(c.category))
    .reduce((s, c) => s + c.totalMs, 0);
}

async function runScenario(scenario: (typeof SCENARIOS)[number]) {
  const errors: string[] = [];
  const warnings: string[] = [];
  const progressEvents: string[] = [];
  const profiler = new WebsitePipelineProfiler();
  const wallStart = performance.now();

  const resolved = resolveBuilderTemplatePackageId(scenario.legacyTemplateId);
  if (resolved !== scenario.packageId) {
    errors.push(`Template resolution: ${scenario.legacyTemplateId} → ${resolved}, expected ${scenario.packageId}`);
  }

  let result: Awaited<ReturnType<typeof generateWebsite>> | null = null;
  try {
    result = await runWithWebsiteProfiler(profiler, () =>
      generateWebsite({
        prompt: scenario.prompt,
        projectType: "business",
        projectKind: "website",
        language: "English",
        theme: "modern",
        industryId: scenario.industryId,
        websiteStructureTemplateId: scenario.packageId,
        templateId: scenario.legacyTemplateId,
        features: ["contact-form", "seo"],
        generationProfile: "fast",
        preferredProvider: "deepseek",
        autoFallback: false,
        userId: `rc2-smoke-${scenario.id}`,
        onProgress: (msg) => {
          progressEvents.push(msg);
          if (process.env.RC2_VERBOSE === "1") console.error(`[${scenario.id}] ${msg}`);
        },
      }),
    );
  } catch (e) {
    errors.push(`Generation exception: ${e instanceof Error ? e.message : String(e)}`);
  }

  const wallMs = Math.round(performance.now() - wallStart);
  const perfReport = profiler.toReport();

  if (!result) {
    return {
      scenario: scenario.id,
      label: scenario.label,
      passed: false,
      errors,
      warnings,
      timing: { wallMs, planningMs: 0, contentMs: 0, builderMs: 0, totalMs: wallMs },
      tokens: null,
      estimatedCostUsd: 0,
      publishReady: false,
      publishBlockers: [],
      fileCount: 0,
      provider: null,
    };
  }

  if (result.provider !== "deepseek") {
    warnings.push(`Provider was ${result.provider}, expected deepseek`);
  }

  const files = result.files ?? [];
  if (files.length === 0) errors.push("No files generated");
  for (const file of files) {
    if (!file.path) errors.push("File missing path");
    if (file.content === undefined) errors.push(`File ${file.path} has undefined content`);
    if (typeof file.content === "string" && file.content.includes("undefined")) {
      warnings.push(`File ${file.path} contains literal 'undefined' string`);
    }
  }

  const undefinedHits = hasUndefinedDeep({
    title: result.title,
    files: files.map((f) => ({ path: f.path, len: f.content?.length })),
    usage: result.usage,
    provider: result.provider,
  });
  if (undefinedHits.length) {
    errors.push(`Undefined values: ${undefinedHits.slice(0, 5).join(", ")}`);
  }

  const jsonErrors = progressEvents.filter(
    (e) =>
      /json parse|unexpected token|invalid json/i.test(e) ||
      e.includes("JSON.parse"),
  );
  if (jsonErrors.length) errors.push(`JSON parsing failures in progress: ${jsonErrors.join("; ")}`);

  const providerErrors = progressEvents.filter((e) =>
    /provider.*fail|deepseek.*error|rate limit|empty response/i.test(e),
  );
  if (providerErrors.length) errors.push(`Provider failures: ${providerErrors.join("; ")}`);

  const productionTiming = result.productionPipelineReports?.timing;
  const planningMs = Math.round(
    productionTiming?.planningMs ??
      sumProfilerCategory(perfReport, ["ai-planning", "layer-runner"]),
  );
  const contentMs = Math.round(
    productionTiming?.contentMs ??
      sumProfilerCategory(perfReport, ["ai-request", "prompt-generation"]),
  );
  const builderMs = Math.round(
    productionTiming?.builderMs ??
      sumProfilerCategory(perfReport, ["website-builder", "file-generation", "plugin"]),
  );

  const generationStub = {
    id: `rc2-${scenario.id}`,
    project_name: scenario.label,
    blueprint: result,
  } as unknown as WebsiteGeneration;
  const gates = evaluateGenerationPublishGates(generationStub);

  return {
    scenario: scenario.id,
    label: scenario.label,
    passed: errors.length === 0,
    errors,
    warnings,
    timing: {
      wallMs,
      planningMs,
      contentMs,
      builderMs,
      totalMs: result.generationTimeMs ?? wallMs,
    },
    tokens: result.usage,
    estimatedCostUsd: Math.round(estimateCostUsd(result.usage) * 10000) / 10000,
    publishReady: gates.publishReady,
    publishBlockers: gates.blockers,
    fileCount: files.length,
    provider: result.provider,
    templateResolved: resolved,
  };
}

async function main() {
  if (!process.env.DEEPSEEK_API_KEY?.trim()) {
    console.error("FAIL: DEEPSEEK_API_KEY not set in environment");
    process.exit(1);
  }

  const results = [];
  for (const scenario of SCENARIOS) {
    console.error(`\n=== RC2 Live Smoke: ${scenario.label} ===`);
    results.push(await runScenario(scenario));
  }

  const report = {
    generatedAt: new Date().toISOString(),
    release: "RC2",
    provider: "deepseek",
    generationProfile: "fast",
    scenarios: results,
    summary: {
      total: results.length,
      passed: results.filter((r) => r.passed).length,
      failed: results.filter((r) => !r.passed).length,
      totalTokens: results.reduce((s, r) => s + (r.tokens?.totalTokens ?? 0), 0),
      totalEstimatedCostUsd: Math.round(
        results.reduce((s, r) => s + r.estimatedCostUsd, 0) * 10000,
      ) / 10000,
      avgWallMs: Math.round(
        results.reduce((s, r) => s + r.timing.wallMs, 0) / results.length,
      ),
      publishReadyCount: results.filter((r) => r.publishReady).length,
    },
  };

  writeFileSync(join(outDir, "rc2-live-deepseek-smoke.json"), JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.summary.failed > 0 ? 1 : 0);
}

void main();
