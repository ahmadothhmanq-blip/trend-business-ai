import type {
  Tbge2PlanningInput,
  Tbge2PlanningPlan,
  Tbge2ValidationResult,
} from "@/lib/ai-core/generation-engine/core/types";

export function validatePlanningInput(input: Tbge2PlanningInput): Tbge2ValidationResult {
  const errors: string[] = [];

  if (!input.userPrompt || input.userPrompt.trim().length < 3) {
    errors.push("userPrompt must be at least 3 characters");
  }

  if (input.userPrompt && input.userPrompt.length > 10_000) {
    errors.push("userPrompt exceeds maximum length of 10000 characters");
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

export function validatePlanningPlan(plan: Tbge2PlanningPlan): Tbge2ValidationResult {
  const errors: string[] = [];

  if (!plan.intent?.category) {
    errors.push("intent.category is required");
  }

  if (!plan.business?.industryId) {
    errors.push("business.industryId is required");
  }

  if (!plan.business?.language) {
    errors.push("business.language is required");
  }

  if (plan.pages.length === 0) {
    errors.push("At least one page is required");
  }

  if (plan.sections.length === 0) {
    errors.push("At least one section is required");
  }

  const pageIds = new Set(plan.pages.map((p) => p.id));
  for (const section of plan.sections) {
    if (!pageIds.has(section.pageId)) {
      errors.push(`Section ${section.id} references unknown page ${section.pageId}`);
    }
  }

  const homePage = plan.pages.find((p) => p.kind === "home");
  if (!homePage) {
    errors.push("A home page is required");
  }

  const heroSection = plan.sections.find((s) => s.type === "hero");
  if (!heroSection) {
    errors.push("A hero section is required");
  }

  if (!plan.website.primaryCta) {
    errors.push("website.primaryCta is required");
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}
