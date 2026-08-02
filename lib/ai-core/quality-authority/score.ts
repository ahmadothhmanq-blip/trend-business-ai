import { classifyValidationGateIssues } from "@/lib/ai-core/quality-authority/gates";
import type {
  UnifiedQualityScoreInput,
  UnifiedQualityScores,
} from "@/lib/ai-core/quality-authority/types";

const DIMENSION_WEIGHTS: Record<
  Exclude<keyof UnifiedQualityScores, "overall">,
  number
> = {
  build: 0.2,
  validation: 0.15,
  content: 0.12,
  seo: 0.13,
  accessibility: 0.1,
  ux: 0.15,
  ui: 0.15,
};

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function firstDefined(...values: Array<number | undefined>): number | undefined {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }
  return undefined;
}

function buildScoreFromValidation(issues: string[] | undefined): number {
  if (!issues?.length) return 95;
  const gate = classifyValidationGateIssues(issues);
  const blockerPenalty = gate.blockers.length * 22;
  const warningPenalty = gate.warnings.length * 4;
  return clamp(100 - blockerPenalty - warningPenalty);
}

/**
 * Single source of truth for website quality scores across pipeline stages.
 */
export function computeUnifiedQualityScores(
  input: UnifiedQualityScoreInput,
): UnifiedQualityScores {
  const build = buildScoreFromValidation(input.validationIssues);

  const validationGate = input.validationIssues
    ? classifyValidationGateIssues(input.validationIssues)
    : null;
  const validation = clamp(
    validationGate
      ? 100 -
          validationGate.blockers.length * 25 -
          validationGate.warnings.length * 3
      : (input.qualityReport?.passed === false ? 55 : 82),
  );

  const content = clamp(
    firstDefined(
      input.finalQualityScores?.conversion,
      input.optimizationScores?.ux,
      input.qualityReport?.score,
    ) ?? 70,
  );

  const seo = clamp(
    firstDefined(
      input.finalQualityScores?.seo,
      input.optimizationScores?.seo,
      input.qualityReport?.seoReadinessScore,
    ) ?? 72,
  );

  const accessibility = clamp(
    88 - (input.accessibilityIssueCount ?? 0) * 8,
  );

  const ux = clamp(
    firstDefined(
      input.finalQualityScores?.ux,
      input.optimizationScores?.ux,
    ) ?? 75,
  );

  const ui = clamp(
    firstDefined(
      input.finalQualityScores?.design,
      input.optimizationScores?.design,
      input.qualityReport?.designConsistencyPassed === false ? 58 : undefined,
    ) ?? 76,
  );

  const overall = clamp(
    build * DIMENSION_WEIGHTS.build +
      validation * DIMENSION_WEIGHTS.validation +
      content * DIMENSION_WEIGHTS.content +
      seo * DIMENSION_WEIGHTS.seo +
      accessibility * DIMENSION_WEIGHTS.accessibility +
      ux * DIMENSION_WEIGHTS.ux +
      ui * DIMENSION_WEIGHTS.ui,
  );

  return { build, validation, content, seo, accessibility, ux, ui, overall };
}
