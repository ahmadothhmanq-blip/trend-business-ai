import { buildWebsiteBlueprint } from "@/lib/website/template-v2/blueprint/engine";
import { runDesignDirector } from "@/lib/website/template-v2/design-director/engine";
import { computeDesignScore } from "@/lib/website/template-v2/design-director/scoring";
import type { DesignDirectorValidation } from "@/lib/website/template-v2/design-director/types";
import { runValidationRules } from "@/lib/website/template-v2/design-director/validation-rules";
import { APPROVAL_THRESHOLD } from "@/lib/website/template-v2/design-director/weights";

export function validateDesignDirectorInput(
  input: { blueprint?: unknown; blueprintInput?: unknown },
): DesignDirectorValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!input.blueprint && !input.blueprintInput) {
    errors.push("Either blueprint or blueprintInput is required");
  }

  if (input.blueprint && input.blueprintInput) {
    warnings.push("Both blueprint and blueprintInput provided — blueprint takes precedence");
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateDesignDirector(): DesignDirectorValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  const scenarios = [
    {
      industry: "saas",
      websiteGoal: "saas" as const,
      targetAudience: "b2b" as const,
      seed: "director-validate-saas",
    },
    {
      industry: "hotel-resort",
      websiteGoal: "booking" as const,
      premiumLevel: "luxury" as const,
      visualStyle: "luxury" as const,
      seed: "director-validate-hotel",
    },
    {
      imageAvailability: "none" as const,
      accessibilityLevel: "strict" as const,
      websiteGoal: "saas" as const,
      seed: "director-validate-strict",
    },
    {
      industry: "creative-agency",
      websiteGoal: "portfolio" as const,
      imageAvailability: "rich" as const,
      seed: "director-validate-portfolio",
    },
  ];

  for (const blueprintInput of scenarios) {
    try {
      const result = runDesignDirector({ blueprintInput });
      if (result.finalScore < 0 || result.finalScore > 100) {
        errors.push(`[${blueprintInput.seed}] Score out of range: ${result.finalScore}`);
      }
      if (!result.optimizedBlueprint.meta.blueprintId) {
        errors.push(`[${blueprintInput.seed}] Missing blueprint id`);
      }
      if (result.finalScore < result.report.initialScore.overall - 5) {
        warnings.push(
          `[${blueprintInput.seed}] Optimization reduced score unexpectedly`,
        );
      }
    } catch (e) {
      errors.push(
        `[${blueprintInput.seed}] ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  const auditOnly = runDesignDirector({
    blueprintInput: {
      industry: "corporate",
      websiteGoal: "trust",
      seed: "audit-only",
    },
    auditOnly: true,
  });
  if (auditOnly.improvements.length > 0) {
    errors.push("auditOnly mode should not apply improvements");
  }

  const blueprint = buildWebsiteBlueprint({
    industry: "saas",
    websiteGoal: "saas",
    seed: "score-floor",
  });
  const score = computeDesignScore(blueprint, runValidationRules(blueprint));
  if (score.overall < APPROVAL_THRESHOLD - 30) {
    warnings.push("Clean SaaS blueprint scores lower than expected");
  }

  return { valid: errors.length === 0, errors, warnings };
}
