/**
 * QE Phase 3 — Semantic Content Quality benchmark.
 * Run: npx tsx scripts/benchmark-semantic-content-quality.mjs
 */
import assert from "node:assert/strict";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";
import { runSemanticContentQuality } from "../lib/ai-core/semantic-content-quality/analyze.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

const fixtures = [
  {
    name: "furniture-good",
    files: [
      {
        path: "app/page.tsx",
        content: `<main><h1>Premium Furniture Showroom</h1><h2>Living Room Collections</h2><p>Handcrafted sofas and dining sets for modern homes.</p><button>Book Showroom Visit</button></main>`,
      },
      {
        path: "app/layout.tsx",
        content: `export const metadata = { title: "Premium Furniture Showroom", description: "Explore handcrafted furniture collections and showroom appointments across the region." };`,
      },
    ],
    prompt: "luxury furniture showroom",
    industryId: "furniture",
  },
  {
    name: "generic-weak",
    files: [
      {
        path: "app/page.tsx",
        content: `<main><h1>Welcome</h1><p>We help businesses succeed with innovative solutions.</p><a href="#">Click here</a></main>`,
      },
    ],
    prompt: "luxury furniture showroom",
    industryId: "furniture",
  },
];

const startedAt = performance.now();
const results = [];

for (const fixture of fixtures) {
  const fixtureStart = performance.now();
  const report = await runSemanticContentQuality({
    files: fixture.files,
    prompt: fixture.prompt,
    industryId: fixture.industryId,
    industry: fixture.industryId,
    language: "en",
  });
  results.push({
    name: fixture.name,
    overall: report.scores.overall,
    genericCopy: report.scores.genericCopy,
    industryRelevance: report.scores.industryRelevance,
    ctaQuality: report.scores.ctaQuality,
    semanticSeo: report.scores.semanticSeo,
    localization: report.scores.localization,
    crossPageConsistency: report.scores.crossPageConsistency,
    issueCount: report.issues.length,
    latencyMs: Math.round(performance.now() - fixtureStart),
    llmApplied: Boolean(report.llmScore?.applied),
    promptChars: report.llmScore?.promptChars ?? 0,
  });
}

const good = results.find((r) => r.name === "furniture-good");
const weak = results.find((r) => r.name === "generic-weak");
assert.ok(good && weak);
assert.ok(good.overall > weak.overall);
assert.ok(weak.issueCount > good.issueCount);

const report = {
  phase: "QE-3",
  timestamp: new Date().toISOString(),
  totalLatencyMs: Math.round(performance.now() - startedAt),
  additionalTokenUsage: results.reduce((sum, r) => sum + (r.llmApplied ? r.promptChars : 0), 0),
  llmCalls: results.filter((r) => r.llmApplied).length,
  contentQualityImprovement: good.overall - weak.overall,
  genericContentReductionSignal: weak.genericCopy < good.genericCopy,
  industryRelevanceDelta: good.industryRelevance - weak.industryRelevance,
  ctaQualityDelta: good.ctaQuality - weak.ctaQuality,
  seoSemanticDelta: good.semanticSeo - weak.semanticSeo,
  localizationDelta: good.localization - weak.localization,
  crossPageConsistencyDelta: good.crossPageConsistency - weak.crossPageConsistency,
  fixtures: results,
};

const outDir = join(__dirname, "benchmark-results");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, `benchmark-semantic-quality-${Date.now()}.json`);
writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
console.log(`Wrote ${outPath}`);
