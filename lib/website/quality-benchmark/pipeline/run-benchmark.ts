import { extractArtifactSignals } from "@/lib/website/quality-benchmark/analyze/extract-artifact";
import { evaluateAllCategories } from "@/lib/website/quality-benchmark/evaluate/categories";
import {
  buildBenchmarkReport,
  buildDeveloperSummary,
  buildExecutiveSummary,
  buildQualityReport,
  buildTechnicalSummary,
} from "@/lib/website/quality-benchmark/reports/build-reports";
import type {
  WqbsBenchmarkInput,
  WqbsBenchmarkOutcome,
} from "@/lib/website/quality-benchmark/types";

function validateInput(input: WqbsBenchmarkInput): string[] {
  const errors: string[] = [];
  if (!input.files || input.files.length === 0) {
    errors.push("At least one project file is required");
  }
  for (const file of input.files ?? []) {
    if (!file.path) errors.push("File missing path");
    if (typeof file.content !== "string") errors.push(`File ${file.path} missing content`);
  }
  return errors;
}

/**
 * Run Website Quality Benchmark — evaluates generated websites only.
 * Does NOT generate websites. Provider and framework independent.
 */
export async function runWebsiteQualityBenchmark(
  input: WqbsBenchmarkInput,
): Promise<WqbsBenchmarkOutcome> {
  const started = performance.now();
  const errors = validateInput(input);
  if (errors.length > 0) return { ok: false, errors };

  const mode = input.mode ?? "standard";
  const signals = extractArtifactSignals(input.files);
  const evaluations = evaluateAllCategories(signals);
  const durationMs = performance.now() - started;

  const report = buildBenchmarkReport({
    benchmarkInput: input,
    evaluations,
    mode,
    durationMs,
  });

  const qualityReport = buildQualityReport({ evaluations, mode });
  const executiveSummary = buildExecutiveSummary(report);
  const technicalSummary = buildTechnicalSummary(report);
  const developerSummary = buildDeveloperSummary(report);

  return {
    ok: true,
    report,
    qualityReport,
    executiveSummary,
    technicalSummary,
    developerSummary,
  };
}
