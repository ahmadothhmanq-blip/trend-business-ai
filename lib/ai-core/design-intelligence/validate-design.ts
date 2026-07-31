import type { DesignIntelligenceBrief } from "@/lib/ai-core/design-intelligence/types";
import type {
  DesignIntelligenceValidation,
  DesignPolicy,
  DesignTraceEntry,
} from "@/lib/ai-core/design-intelligence/die-types";
import type { WebsiteGenerationPlan } from "@/lib/ai-core/architecture-validation/types";
import { isEditorialLayoutIndustry } from "@/lib/ai-core/architecture-knowledge-base";

let entryCounter = 0;

function trace(
  phase: DesignTraceEntry["phase"],
  ruleId: string,
  passed: boolean,
  severity: DesignTraceEntry["severity"],
  message: string,
  knowledgeEntryId?: string,
): DesignTraceEntry {
  entryCounter += 1;
  return {
    id: `die-${Date.now()}-${entryCounter}`,
    phase,
    ruleId,
    passed,
    severity,
    message,
    knowledgeEntryId,
    timestamp: new Date().toISOString(),
  };
}

export function resetDesignValidationTraceCounter(): void {
  entryCounter = 0;
}

/**
 * Validate design intelligence brief against DKB policy and architecture plan.
 */
export function validateDesignIntelligence(
  intelligence: DesignIntelligenceBrief,
  policy: DesignPolicy,
  websiteGenerationPlan?: WebsiteGenerationPlan | null,
): DesignIntelligenceValidation {
  const entries: DesignTraceEntry[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];
  const corrections: string[] = [];
  const kid = policy.knowledgeEntryId;

  if (!policy.allowedPremiumStyleIds.includes(intelligence.premiumStyleId)) {
    const msg = `Premium style "${intelligence.premiumStyleId}" not allowed for ${policy.industryId} (DKB allows: ${policy.allowedPremiumStyleIds.join(", ")})`;
    entries.push(trace("validation", "premium-style-allowed", false, "error", msg, kid));
    errors.push(msg);
    corrections.push(`premiumStyleId→${policy.defaultPremiumStyleId}`);
  } else {
    entries.push(
      trace(
        "validation",
        "premium-style-allowed",
        true,
        "info",
        `Premium style ${intelligence.premiumStyleId} allowed by DKB`,
        kid,
      ),
    );
  }

  if (
    policy.forbiddenLayoutVariationIds.includes(intelligence.layoutVariationId)
  ) {
    const msg = `Layout variation "${intelligence.layoutVariationId}" forbidden for ${policy.industryId}`;
    entries.push(trace("validation", "layout-variation-forbidden", false, "error", msg, kid));
    errors.push(msg);
    corrections.push(
      `layoutVariationId→${policy.defaultLayoutVariationId}`,
    );
  } else {
    entries.push(
      trace(
        "validation",
        "layout-variation-forbidden",
        true,
        "info",
        `Layout variation ${intelligence.layoutVariationId} permitted`,
        kid,
      ),
    );
  }

  if (websiteGenerationPlan) {
    const familyMatch =
      String(websiteGenerationPlan.layoutFamily) === policy.layoutFamily ||
      intelligence.layoutStyle.includes(policy.layoutFamily) ||
      policy.layoutFamily.includes(String(websiteGenerationPlan.layoutFamily));
    entries.push(
      trace(
        "validation",
        "layout-family-alignment",
        familyMatch,
        familyMatch ? "info" : "warning",
        familyMatch
          ? `Layout family aligned: plan=${websiteGenerationPlan.layoutFamily} · policy=${policy.layoutFamily}`
          : `Layout family drift: plan=${websiteGenerationPlan.layoutFamily} · policy=${policy.layoutFamily}`,
        kid,
      ),
    );
    if (!familyMatch) {
      warnings.push(
        `Layout family drift between WebsiteGenerationPlan and DKB`,
      );
    }

    const editorialIndustry = isEditorialLayoutIndustry(policy.industryId);
    const editorialBlocked =
      !editorialIndustry &&
      (intelligence.layoutVariationId === "editorial" ||
        intelligence.heroTreatment.includes("editorial") ||
        intelligence.sectionLayout.includes("editorial"));
    if (editorialBlocked) {
      const msg = "Editorial design treatment conflicts with architecture routing";
      entries.push(trace("validation", "architecture-alignment", false, "error", msg, kid));
      errors.push(msg);
      corrections.push(`layoutVariationId→${policy.defaultLayoutVariationId}`);
    } else {
      entries.push(
        trace(
          "validation",
          "architecture-alignment",
          true,
          "info",
          "Design aligned with architecture routing",
          kid,
        ),
      );
    }
  }

  entries.push(
    trace(
      "accessibility",
      "contrast-policy",
      true,
      "info",
      `Min contrast ratio ${policy.minContrastRatio}:1 enforced by DKB`,
      kid,
    ),
  );

  entries.push(
    trace(
      "responsive",
      "responsive-strategy",
      true,
      "info",
      `Responsive strategy: ${policy.responsiveStrategy}`,
      kid,
    ),
  );

  return {
    valid: errors.length === 0,
    warnings,
    errors,
    trace: entries,
    corrections,
  };
}

export function applyDesignPolicyCorrections(
  intelligence: DesignIntelligenceBrief,
  policy: DesignPolicy,
): DesignIntelligenceBrief {
  let corrected = { ...intelligence };

  if (!policy.allowedPremiumStyleIds.includes(corrected.premiumStyleId)) {
    corrected = {
      ...corrected,
      premiumStyleId: policy.defaultPremiumStyleId,
      reason: `${corrected.reason}; DKB corrected premium style to ${policy.defaultPremiumStyleId}`,
    };
  }

  if (
    policy.forbiddenLayoutVariationIds.includes(corrected.layoutVariationId)
  ) {
    corrected = {
      ...corrected,
      layoutVariationId: policy.defaultLayoutVariationId,
      reason: `${corrected.reason}; DKB corrected layout to ${policy.defaultLayoutVariationId}`,
    };
  }

  return corrected;
}
