import { randomUUID } from "node:crypto";
import {
  WQBS_PASS_THRESHOLD,
  WQBS_PHASE,
  WQBS_VERSION,
} from "@/lib/website/quality-benchmark/constants";
import {
  collectStrengthsWeaknesses,
  finalizeScores,
  filterEvaluationsByMode,
  resolveGateStatus,
} from "@/lib/website/quality-benchmark/scoring/model";
import { generateRecommendations } from "@/lib/website/quality-benchmark/recommendations/engine";
import type {
  WqbsBenchmarkInput,
  WqbsBenchmarkMeta,
  WqbsBenchmarkMode,
  WqbsBenchmarkReport,
  WqbsCategoryEvaluation,
  WqbsDeveloperSummary,
  WqbsExecutiveSummary,
  WqbsQualityReport,
  WqbsTechnicalSummary,
} from "@/lib/website/quality-benchmark/types";

export function buildQualityReport(input: {
  evaluations: WqbsCategoryEvaluation[];
  mode: WqbsBenchmarkMode;
  threshold?: number;
}): WqbsQualityReport {
  const filtered = filterEvaluationsByMode(input.evaluations, input.mode);
  const scores = finalizeScores(filtered, input.mode);
  const threshold = input.threshold ?? WQBS_PASS_THRESHOLD;
  const recommendations = generateRecommendations(filtered, input.mode);
  const { strengths, weaknesses } = collectStrengthsWeaknesses(filtered);

  return {
    passed: scores.overall >= threshold,
    threshold,
    scores,
    categories: filtered,
    recommendations,
    strengths,
    weaknesses,
  };
}

export function buildBenchmarkReport(input: {
  benchmarkInput: WqbsBenchmarkInput;
  evaluations: WqbsCategoryEvaluation[];
  mode: WqbsBenchmarkMode;
  durationMs: number;
  threshold?: number;
}): WqbsBenchmarkReport {
  const quality = buildQualityReport({
    evaluations: input.evaluations,
    mode: input.mode,
    threshold: input.threshold,
  });

  const meta: WqbsBenchmarkMeta = {
    benchmarkId: input.benchmarkInput.id ?? randomUUID(),
    mode: input.mode,
    version: WQBS_VERSION,
    phase: WQBS_PHASE,
    evaluatedAt: new Date().toISOString(),
    durationMs: input.durationMs,
    providerIndependent: true,
    frameworkIndependent: true,
    fileCount: input.benchmarkInput.files.length,
    pageCount: input.evaluations.find((e) => e.category === "userExperience")
      ? input.benchmarkInput.files.filter((f) => /page\./i.test(f.path)).length || 1
      : 1,
  };

  return {
    ...quality,
    meta,
    mode: input.mode,
    gateStatus: resolveGateStatus(quality.scores.overall, quality.threshold),
  };
}

export function buildExecutiveSummary(report: WqbsBenchmarkReport): WqbsExecutiveSummary {
  const statusLabels = { pass: "Meets quality gate", fail: "Below quality gate", review: "Borderline — review recommended" };

  return {
    headline: `Overall quality score: ${report.scores.overall}/100 — ${statusLabels[report.gateStatus]}`,
    overallScore: report.scores.overall,
    gateStatus: report.gateStatus,
    topStrengths: report.strengths.slice(0, 5),
    topWeaknesses: report.weaknesses.slice(0, 5),
    priorityActions: report.recommendations
      .filter((r) => r.priority === "critical" || r.priority === "high")
      .slice(0, 5)
      .map((r) => r.recommendation),
    categoryHighlights: report.categories.map((c) => ({
      category: c.category,
      score: c.score,
      status: c.score >= report.threshold ? "pass" : c.score >= report.threshold - 10 ? "review" : "fail",
    })),
  };
}

export function buildTechnicalSummary(report: WqbsBenchmarkReport): WqbsTechnicalSummary {
  const subDimensionBreakdown = report.categories.flatMap((c) => c.subDimensions);
  const signals = subDimensionBreakdown.flatMap((s) => s.signals).slice(0, 20);
  const issues = subDimensionBreakdown.flatMap((s) => s.issues).slice(0, 20);

  const perfCat = report.categories.find((c) => c.category === "performance");
  const seoCat = report.categories.find((c) => c.category === "seo");
  const a11yCat = report.categories.find((c) => c.category === "accessibility");

  return {
    scores: report.scores,
    subDimensionBreakdown,
    signals,
    issues,
    performanceNotes: perfCat?.subDimensions.flatMap((s) => s.issues) ?? [],
    seoNotes: seoCat?.subDimensions.flatMap((s) => s.issues) ?? [],
    accessibilityNotes: a11yCat?.subDimensions.flatMap((s) => s.issues) ?? [],
  };
}

export function buildDeveloperSummary(report: WqbsBenchmarkReport): WqbsDeveloperSummary {
  const fixQueue = report.recommendations;
  const quickWins = fixQueue.filter((r) => r.estimatedEffort === "low").slice(0, 8);
  const structuralChanges = fixQueue.filter((r) => r.estimatedEffort === "high").slice(0, 8);

  const fileHints = [
    { path: "app/layout.tsx", hint: "Ensure lang attribute and semantic landmarks" },
    { path: "app/globals.css", hint: "Define design tokens and focus-visible styles" },
    { path: "app/page.tsx", hint: "Single H1, CTA, and sufficient content depth" },
  ].filter((_, i) => report.recommendations.length > i);

  return { fixQueue, fileHints, quickWins, structuralChanges };
}
