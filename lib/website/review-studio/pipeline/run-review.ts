import { randomUUID } from "node:crypto";
import { runWebsiteQualityBenchmark } from "@/lib/website/quality-benchmark";
import { analyzeWebsite } from "@/lib/website/review-studio/analyze/website-analyzer";
import { generateImprovements } from "@/lib/website/review-studio/improvements/improvement-engine";
import {
  buildReviewOutput,
  detectIssues,
} from "@/lib/website/review-studio/review/review-engine";
import {
  getOrCreateSession,
  getCurrentVersion,
  listVersions,
  registerSessionReview,
} from "@/lib/website/review-studio/versions/version-manager";
import {
  REVIEW_STUDIO_PHASE,
  REVIEW_STUDIO_VERSION,
} from "@/lib/website/review-studio/constants";
import type {
  ReviewStudioInput,
  ReviewStudioOutcome,
} from "@/lib/website/review-studio/types";

function validateInput(input: ReviewStudioInput): string[] {
  const errors: string[] = [];
  if (!input.files?.length) errors.push("At least one project file is required");
  return errors;
}

/**
 * Run full website review — analyze, quality benchmark, issues, improvements.
 * Does NOT generate websites. Does NOT modify files.
 */
export async function runWebsiteReview(
  input: ReviewStudioInput,
): Promise<ReviewStudioOutcome> {
  const started = performance.now();
  const errors = validateInput(input);
  if (errors.length > 0) return { ok: false, errors };

  const session = getOrCreateSession(input);
  const benchmark = await runWebsiteQualityBenchmark({
    files: input.files,
    mode: "standard",
    title: input.title,
    language: input.language,
    industryId: input.industryId,
  });
  if (!benchmark.ok) return { ok: false, errors: benchmark.errors };

  const analysis = analyzeWebsite(input);
  const issues = detectIssues(analysis, benchmark.report, input);
  const improvements = generateImprovements({
    issues,
    analysis,
    benchmark: benchmark.report,
    studioInput: input,
  });

  const review = buildReviewOutput({
    analysis,
    benchmark: benchmark.report,
    issues,
    improvements,
    studioInput: input,
  });

  const currentVersion = getCurrentVersion(session.sessionId)!;
  currentVersion.qualityScores = review.categoryScores;

  const result = {
    ok: true as const,
    meta: {
      reviewId: randomUUID(),
      sessionId: session.sessionId,
      version: REVIEW_STUDIO_VERSION,
      phase: REVIEW_STUDIO_PHASE,
      reviewedAt: new Date().toISOString(),
      durationMs: performance.now() - started,
      providerIndependent: true as const,
      frameworkIndependent: true as const,
    },
    analysis,
    review,
    versions: listVersions(session.sessionId),
    currentVersion,
  };

  registerSessionReview(session.sessionId, result, improvements);
  return result;
}
