import type {
  ImageIntelligenceValidation,
  ImagePolicy,
  ImageSpecification,
  ImageSystemSpec,
  ImageTraceEntry,
} from "@/lib/ai-core/image-intelligence/iie-types";
import type { ImagePurpose } from "@/lib/ai-core/image-engine/types";
import { validateSemanticRelevance } from "@/lib/ai-core/image-intelligence/semantic-relevance";

let entryCounter = 0;

function trace(
  phase: ImageTraceEntry["phase"],
  ruleId: string,
  passed: boolean,
  severity: ImageTraceEntry["severity"],
  message: string,
  knowledgeEntryId?: string,
): ImageTraceEntry {
  entryCounter += 1;
  return {
    id: `iie-${Date.now()}-${entryCounter}`,
    phase,
    ruleId,
    passed,
    severity,
    message,
    knowledgeEntryId,
    timestamp: new Date().toISOString(),
  };
}

export function resetImageValidationTraceCounter(): void {
  entryCounter = 0;
}

export function validateImageSpecifications(
  spec: ImageSystemSpec,
  policy: ImagePolicy,
): ImageIntelligenceValidation {
  const entries: ImageTraceEntry[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];
  const corrections: string[] = [];
  const kid = policy.knowledgeEntryId;

  if (spec.specifications.length < policy.minImageCount) {
    const msg = `Image count ${spec.specifications.length} below IKB minimum ${policy.minImageCount}`;
    entries.push(trace("validation", "min-image-count", false, "error", msg, kid));
    errors.push(msg);
    corrections.push("add-required-purpose-images");
  } else {
    entries.push(
      trace(
        "validation",
        "min-image-count",
        true,
        "info",
        `${spec.specifications.length} images planned (min ${policy.minImageCount})`,
        kid,
      ),
    );
  }

  if (spec.coverage.missingPurposes.length > 0) {
    const msg = `Missing required purposes: ${spec.coverage.missingPurposes.join(", ")}`;
    entries.push(trace("validation", "required-purposes", false, "error", msg, kid));
    errors.push(msg);
    corrections.push(`add-purposes:${spec.coverage.missingPurposes.join(",")}`);
  } else {
    entries.push(
      trace(
        "validation",
        "required-purposes",
        true,
        "info",
        `All required purposes covered: ${policy.requiredPurposes.join(", ")}`,
        kid,
      ),
    );
  }

  for (const imageSpec of spec.specifications) {
    const hay = `${imageSpec.providerPrompt} ${imageSpec.subject} ${imageSpec.scene}`.toLowerCase();
    const forbiddenHit = policy.forbiddenSubjects.find((f) =>
      hay.includes(f.toLowerCase()),
    );
    if (forbiddenHit) {
      const msg = `Spec ${imageSpec.id} references forbidden subject "${forbiddenHit}"`;
      entries.push(trace("validation", "forbidden-subjects", false, "error", msg, kid));
      errors.push(msg);
      corrections.push(`remove-forbidden:${imageSpec.id}`);
    }
  }

  if (!errors.length) {
    entries.push(
      trace(
        "validation",
        "forbidden-subjects",
        true,
        "info",
        `No forbidden subjects in ${spec.specifications.length} specifications`,
        kid,
      ),
    );
  }

  for (const imageSpec of spec.specifications) {
    if (!imageSpec.accessibility.altText?.trim()) {
      const msg = `Spec ${imageSpec.id} missing alt text`;
      entries.push(trace("accessibility", "alt-text", false, "error", msg, kid));
      errors.push(msg);
    } else if (imageSpec.accessibility.altText.length < 10) {
      warnings.push(`Spec ${imageSpec.id} has short alt text`);
      entries.push(
        trace("accessibility", "alt-text", true, "warning", `Short alt for ${imageSpec.id}`, kid),
      );
    }
  }

  for (const imageSpec of spec.specifications) {
    if (imageSpec.seo.description.length < policy.seoKeywordMinLength) {
      warnings.push(`Spec ${imageSpec.id} SEO description below minimum length`);
      entries.push(
        trace(
          "seo-metadata",
          "seo-description-length",
          true,
          "warning",
          `SEO description ${imageSpec.seo.description.length} chars for ${imageSpec.id}`,
          kid,
        ),
      );
    }
  }

  entries.push(
    trace(
      "color-harmony",
      "design-spec-alignment",
      Boolean(spec.colorHarmony.primary),
      "info",
      `Color harmony locked to primary ${spec.colorHarmony.primary}`,
      kid,
    ),
  );

  const semantic = validateSemanticRelevance(spec.specifications, policy);
  if (!semantic.valid) {
    for (const issue of semantic.issues.slice(0, 6)) {
      entries.push(
        trace("validation", "semantic-relevance", false, "error", issue, kid),
      );
      errors.push(issue);
      corrections.push("replan-semantic-visual-concept");
    }
  } else {
    entries.push(
      trace(
        "validation",
        "semantic-relevance",
        true,
        "info",
        `All ${spec.specifications.length} specifications semantically aligned to section purpose`,
        kid,
      ),
    );
  }

  for (const imageSpec of spec.specifications) {
    if (!imageSpec.providerPrompt?.trim() || imageSpec.providerPrompt.length < 40) {
      const msg = `Spec ${imageSpec.id} providerPrompt too short for semantic generation`;
      entries.push(trace("validation", "provider-prompt", false, "warning", msg, kid));
      warnings.push(msg);
    }
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
    trace: entries,
    corrections,
  };
}

export function computeCoverage(
  specifications: ImageSpecification[],
  requiredPurposes: ImagePurpose[],
): ImageSystemSpec["coverage"] {
  const plannedPurposes = [
    ...new Set(specifications.map((s) => s.purpose)),
  ] as ImagePurpose[];
  const missingPurposes = requiredPurposes.filter(
    (p) => !plannedPurposes.includes(p),
  );
  return {
    requiredPurposes: [...requiredPurposes],
    plannedPurposes,
    missingPurposes,
  };
}
