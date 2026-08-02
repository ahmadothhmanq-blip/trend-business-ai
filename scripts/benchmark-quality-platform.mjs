/**
 * QE Phase 5 — Unified Quality Platform micro-benchmark.
 * Run: npx tsx scripts/benchmark-quality-platform.mjs
 */
import assert from "node:assert/strict";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";
import {
  collapseOverlappingMessages,
  dedupeRepairInstructions,
} from "../lib/ai-core/quality-platform/heuristics.ts";
import { buildUnifiedRepairQueue } from "../lib/ai-core/quality-platform/repair-queue.ts";
import {
  buildUnifiedQualityReport,
  createQualityTelemetry,
} from "../lib/ai-core/quality-platform/report.ts";
import { toQualityDashboardModel } from "../lib/ai-core/quality-platform/dashboard.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SAMPLE_FILES = [
  {
    path: "app/page.tsx",
    content: `<main><h1>Studio</h1><p>Creative agency.</p><button>Get Started</button></main>`,
  },
  {
    path: "app/layout.tsx",
    content: `export const metadata = { title: "Studio", description: "Creative agency." };`,
  },
];

const structural = {
  passed: false,
  dimensions: [],
  weakSections: ["hero", "seo"],
  improveApplied: false,
  issues: [
    "Hero CTA is weak — use action-oriented copy.",
    "Missing meta description keywords.",
  ],
};

const semantic = {
  passed: false,
  issues: [
    {
      id: "cta-1",
      dimension: "cta",
      severity: "warning",
      message: "Hero CTA is weak — use action-oriented copy.",
      repairHint: "Use specific CTA.",
    },
  ],
  weakSections: ["hero"],
  scores: {
    overall: 64,
    content: 62,
    semanticSeo: 66,
    cta: 58,
    headings: 72,
    industry: 70,
  },
};

const visual = {
  passed: true,
  issues: [
    {
      id: "spacing-1",
      dimension: "spacing",
      severity: "info",
      message: "Hero section spacing could use more vertical rhythm.",
      repairHint: "Increase py-* on hero container.",
    },
  ],
  weakSections: ["hero"],
  scores: { overall: 74, ux: 76, hierarchy: 78, spacing: 70, tokens: 72 },
};

const repairMessages = [
  "Strengthen hero CTA with action-oriented label.",
  "Strengthen hero CTA with action-oriented label!",
  "Add SEO meta description with primary keyword.",
  "Improve heading hierarchy on homepage.",
  "Visual hierarchy: add subheading under hero h1.",
];

const collapseStart = performance.now();
const collapsed = collapseOverlappingMessages(repairMessages);
const collapseMs = performance.now() - collapseStart;

const dedupeStart = performance.now();
const dedupedInstructions = dedupeRepairInstructions([
  "Fix hero CTA copy.",
  "Fix hero CTA copy!",
  "Add meta description.",
]);
const dedupeMs = performance.now() - dedupeStart;

const queueStart = performance.now();
const repairQueue = buildUnifiedRepairQueue({
  structural,
  semantic,
  visual,
  language: "en",
});
const queueMs = performance.now() - queueStart;

const reportRuns = [];
for (let i = 0; i < 10; i += 1) {
  const started = performance.now();
  const report = buildUnifiedQualityReport({
    structural,
    semantic,
    visual,
    files: SAMPLE_FILES,
    repairQueue: repairQueue.items,
    repairInstruction: repairQueue.instruction,
    dedupedCount: repairQueue.dedupedCount,
    durationMs: 50,
    modules: {
      structural: true,
      semantic: true,
      visual: true,
      accessibility: true,
    },
  });
  const dashboard = toQualityDashboardModel(report);
  reportRuns.push({
    latencyMs: performance.now() - started,
    overall: report.scores.overall,
    publishReady: report.publishReady,
    hash: report.telemetry.scoreStabilityHash,
    dashboardScore: dashboard.overallScore,
  });
}

const overallScores = reportRuns.map((r) => r.overall);
const hashes = new Set(reportRuns.map((r) => r.hash));
const publishDecisions = new Set(reportRuns.map((r) => r.publishReady));
const avgReportLatency =
  reportRuns.reduce((sum, r) => sum + r.latencyMs, 0) / reportRuns.length;

const report = {
  phase: "QE-5",
  timestamp: new Date().toISOString(),
  repairDeduplication: {
    rawMessages: repairMessages.length,
    collapsed: collapsed.length,
    dedupedInstructions: dedupedInstructions.length,
    queueItems: repairQueue.items.length,
    dedupedCount: repairQueue.dedupedCount,
    collapseMs: Number(collapseMs.toFixed(3)),
    dedupeMs: Number(dedupeMs.toFixed(3)),
    queueMs: Number(queueMs.toFixed(3)),
  },
  pipelineLatency: {
    samples: reportRuns.length,
    avgReportBuildMs: Number(avgReportLatency.toFixed(3)),
    maxReportBuildMs: Number(Math.max(...reportRuns.map((r) => r.latencyMs)).toFixed(3)),
  },
  scoreStability: {
    minOverall: Math.min(...overallScores),
    maxOverall: Math.max(...overallScores),
    spread: Math.max(...overallScores) - Math.min(...overallScores),
    uniqueHashes: hashes.size,
    stable: hashes.size === 1 && Math.max(...overallScores) - Math.min(...overallScores) === 0,
  },
  publishConsistency: {
    uniqueDecisions: publishDecisions.size,
    consistent: publishDecisions.size === 1,
  },
  dashboardConsistency: {
    allMatchReport: reportRuns.every((r) => r.dashboardScore === r.overall),
  },
};

assert.ok(collapsed.length < repairMessages.length);
assert.ok(dedupedInstructions.length === 2);
assert.ok(repairQueue.dedupedCount >= 0);
assert.equal(hashes.size, 1);
assert.equal(publishDecisions.size, 1);
assert.equal(report.dashboardConsistency.allMatchReport, true);
assert.equal(report.scoreStability.stable, true);

const outDir = join(__dirname, "benchmark-results");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, `benchmark-quality-platform-${Date.now()}.json`);
writeFileSync(outPath, JSON.stringify(report, null, 2));

console.log(JSON.stringify(report, null, 2));
console.log(`Wrote ${outPath}`);
