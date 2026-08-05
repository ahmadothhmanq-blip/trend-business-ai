import type { AwqeWebsiteSpecification } from "@/lib/ai-core/generation-engine/quality-engine/types";
import { AWQE_SPEC_VERSION } from "@/lib/ai-core/generation-engine/quality-engine/constants";

export function validateWebsiteSpecification(
  spec: AwqeWebsiteSpecification,
): { valid: true } | { valid: false; errors: string[] } {
  const errors: string[] = [];

  if (!spec.id) errors.push("id is required");
  if (spec.schemaVersion !== AWQE_SPEC_VERSION) errors.push(`schemaVersion must be ${AWQE_SPEC_VERSION}`);
  if (spec.providerIndependent !== true) errors.push("providerIndependent must be true");
  if (!spec.masterPlanId) errors.push("masterPlanId is required");

  if (spec.pages.length === 0) errors.push("pages required");
  if (spec.sections.length === 0) errors.push("sections required");
  if (!spec.scores || spec.scores.overall < 0 || spec.scores.overall > 100) {
    errors.push("valid scores required");
  }

  if (!spec.seo?.pageTitles || Object.keys(spec.seo.pageTitles).length === 0) {
    errors.push("seo.pageTitles required");
  }
  if (!spec.conversion?.primaryCta) errors.push("conversion.primaryCta required");
  if (!spec.accessibility?.wcagLevel) errors.push("accessibility.wcagLevel required");
  if (!spec.performance?.imageStrategy) errors.push("performance.imageStrategy required");

  if (!spec.report?.strengths?.length && !spec.report?.weaknesses?.length) {
    errors.push("improvement report required");
  }

  const pageIds = new Set(spec.pages.map((p) => p.id));
  for (const section of spec.sections) {
    if (!pageIds.has(section.pageId)) {
      errors.push(`Section ${section.id} references unknown page`);
    }
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

export function isAwqeWebsiteSpecification(value: unknown): value is AwqeWebsiteSpecification {
  if (!value || typeof value !== "object") return false;
  const result = validateWebsiteSpecification(value as AwqeWebsiteSpecification);
  return result.valid;
}
