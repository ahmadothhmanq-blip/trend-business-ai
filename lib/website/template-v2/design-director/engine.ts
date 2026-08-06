import { buildWebsiteBlueprint } from "@/lib/website/template-v2/blueprint/engine";
import { validateWebsiteBlueprint } from "@/lib/website/template-v2/blueprint/validate";
import {
  buildDesignWarnings,
  buildQualityReport,
} from "@/lib/website/template-v2/design-director/audit-report";
import { applyOptimizationRules } from "@/lib/website/template-v2/design-director/optimization-rules";
import { computeDesignScore } from "@/lib/website/template-v2/design-director/scoring";
import type {
  DesignDirectorInput,
  DesignDirectorResult,
} from "@/lib/website/template-v2/design-director/types";
import { DESIGN_DIRECTOR_VERSION } from "@/lib/website/template-v2/design-director/types";
import { runValidationRules } from "@/lib/website/template-v2/design-director/validation-rules";

/**
 * Review and optimize a Website Blueprint before rendering.
 * Uses the Blueprint Engine when only blueprintInput is provided.
 * Never modifies templates — only improves the blueprint.
 */
export function runDesignDirector(
  input: DesignDirectorInput,
): DesignDirectorResult {
  if (!input.blueprint && !input.blueprintInput) {
    throw new Error(
      "DesignDirector requires blueprint or blueprintInput",
    );
  }

  const originalBlueprint =
    input.blueprint ?? buildWebsiteBlueprint(input.blueprintInput!);

  const blueprintValidation = validateWebsiteBlueprint(originalBlueprint);
  if (!blueprintValidation.valid) {
    throw new Error(
      `Invalid blueprint: ${blueprintValidation.errors.join("; ")}`,
    );
  }

  const initialIssues = runValidationRules(originalBlueprint);
  const initialScore = computeDesignScore(originalBlueprint, initialIssues);

  let optimizedBlueprint = originalBlueprint;
  let improvements: DesignDirectorResult["improvements"] = [];

  if (!input.auditOnly) {
    const optimization = applyOptimizationRules(
      originalBlueprint,
      initialIssues,
    );
    optimizedBlueprint = optimization.blueprint;
    improvements = optimization.improvements;
  }

  const remainingIssues = runValidationRules(optimizedBlueprint);
  const finalScore = computeDesignScore(optimizedBlueprint, remainingIssues);
  const warnings = buildDesignWarnings(remainingIssues);

  const report = buildQualityReport({
    blueprint: optimizedBlueprint,
    initialScore,
    finalScore,
    issuesFound: initialIssues,
    issuesRemaining: remainingIssues,
    improvements,
  });

  return {
    originalBlueprint,
    optimizedBlueprint,
    report: {
      ...report,
      directorVersion: DESIGN_DIRECTOR_VERSION,
    },
    warnings,
    improvements,
    finalScore: finalScore.overall,
    approved: report.approved,
  };
}

/**
 * Convenience: build blueprint from input then run design director.
 */
export function directWebsiteDesign(
  input: DesignDirectorInput & { blueprintInput: NonNullable<DesignDirectorInput["blueprintInput"]> },
): DesignDirectorResult {
  return runDesignDirector(input);
}
