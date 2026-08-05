import type { MasterPlan, MasterPlanValidationResult } from "@/lib/ai-core/generation-engine/master-plan/types";
import { MASTER_PLAN_SCHEMA_VERSION } from "@/lib/ai-core/generation-engine/master-plan/constants";

/**
 * Master Plan Validation — every generated plan must pass before use.
 */
export function validateMasterPlan(plan: MasterPlan): MasterPlanValidationResult {
  const errors: string[] = [];

  if (!plan.id) errors.push("id is required");
  if (!plan.version || plan.version < 1) errors.push("version must be >= 1");
  if (!plan.createdAt) errors.push("createdAt is required");
  if (plan.schemaVersion !== MASTER_PLAN_SCHEMA_VERSION) {
    errors.push(`schemaVersion must be ${MASTER_PLAN_SCHEMA_VERSION}`);
  }
  if (plan.providerIndependent !== true) {
    errors.push("providerIndependent must be true");
  }

  if (!plan.business?.industryId) errors.push("business.industryId is required");
  if (!plan.business?.businessType) errors.push("business.businessType is required");
  if (!plan.localization?.language) errors.push("localization.language is required");
  if (!plan.localization?.localeCode) errors.push("localization.localeCode is required");

  if (plan.pages.length === 0) errors.push("At least one page is required");
  if (plan.sections.length === 0) errors.push("At least one section is required");
  if (!plan.pages.some((p) => p.kind === "home")) errors.push("A home page is required");
  if (!plan.sections.some((s) => s.type === "hero")) errors.push("A hero section is required");
  if (!plan.sections.some((s) => s.type === "footer")) errors.push("A footer section is required");

  const pageIds = new Set(plan.pages.map((p) => p.id));
  for (const section of plan.sections) {
    if (!pageIds.has(section.pageId)) {
      errors.push(`Section ${section.id} references unknown page ${section.pageId}`);
    }
    if (!section.componentId) {
      errors.push(`Section ${section.id} missing componentId`);
    }
  }

  for (const page of plan.pages) {
    const pageSections = plan.sections.filter((s) => s.pageId === page.id);
    if (pageSections.length === 0) {
      errors.push(`Page ${page.id} has no sections`);
    }
  }

  if (plan.navigation.length === 0) errors.push("navigation must not be empty");
  if (!plan.ctaStrategy?.primary) errors.push("ctaStrategy.primary is required");
  if (!plan.conversionStrategy) errors.push("conversionStrategy is required");
  if (plan.componentsNeeded.length === 0) errors.push("componentsNeeded must not be empty");
  if (plan.businessFeatures.length === 0) errors.push("businessFeatures must not be empty");

  if (!plan.seoStrategy) errors.push("seoStrategy is required");
  if (!plan.contentStrategy) errors.push("contentStrategy is required");
  if (!plan.contentStrategy.llmOwnedFields?.length) {
    errors.push("contentStrategy.llmOwnedFields must not be empty");
  }
  if (!plan.contentStrategy.forbiddenLlmFields?.length) {
    errors.push("contentStrategy.forbiddenLlmFields must not be empty");
  }

  if (!plan.mediaStrategy) errors.push("mediaStrategy is required");
  if (!plan.ctaStrategy) errors.push("ctaStrategy is required");
  if (!plan.trustStrategy) errors.push("trustStrategy is required");
  if (!plan.legalPages?.length) errors.push("legalPages must not be empty");
  if (!plan.performanceTargets) errors.push("performanceTargets is required");
  if (!plan.accessibilityTargets) errors.push("accessibilityTargets is required");
  if (plan.accessibilityTargets.wcagLevel !== "AA" && plan.accessibilityTargets.wcagLevel !== "AAA") {
    errors.push("accessibilityTargets.wcagLevel must be AA or AAA");
  }
  if (!plan.futureExpansion?.supportedProviders?.length) {
    errors.push("futureExpansion.supportedProviders must not be empty");
  }

  if (plan.audience.length === 0) errors.push("audience must not be empty");
  if (plan.goals.length === 0) errors.push("goals must not be empty");

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

export function isMasterPlan(value: unknown): value is MasterPlan {
  if (!value || typeof value !== "object") return false;
  const result = validateMasterPlan(value as MasterPlan);
  return result.valid;
}
