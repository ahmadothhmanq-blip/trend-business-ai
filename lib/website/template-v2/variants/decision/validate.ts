import { decideVariantPlan } from "@/lib/website/template-v2/variants/decision/engine";
import type {
  VariantDecisionContext,
  VariantDecisionPlan,
  VariantDecisionValidation,
} from "@/lib/website/template-v2/variants/decision/types";
import { resolveDecisionSections } from "@/lib/website/template-v2/variants/decision/weights";
import {
  getDefaultVariantId,
  getVariantDefinition,
  validateVariantRegistry,
} from "@/lib/website/template-v2/variants/registry";
import type { SectionKind, SectionVariantId } from "@/lib/website/template-v2/variants/types";
import { VARIANT_DECISION_PROFILES } from "@/lib/website/template-v2/variants/decision/profiles";

export function validateDecisionContext(
  context: VariantDecisionContext,
): VariantDecisionValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (context.imageAvailability === "none" && context.websiteGoal === "portfolio") {
    warnings.push("Portfolio goal with no images may produce weak visual sections");
  }

  if (context.languageDirection === "rtl" && context.visualStyle === "editorial") {
    warnings.push("Editorial style with RTL may need manual review");
  }

  if (context.sections?.length === 0) {
    errors.push("sections array must not be empty when provided");
  }

  const validAudiences = ["b2b", "b2c", "enterprise", "luxury", "startup", "consumer"];
  if (context.targetAudience && !validAudiences.includes(context.targetAudience)) {
    warnings.push(`Unknown targetAudience: ${context.targetAudience}`);
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateDecisionPlan(
  plan: VariantDecisionPlan,
): VariantDecisionValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  const registryCheck = validateVariantRegistry();
  if (!registryCheck.valid) {
    errors.push(...registryCheck.errors.map((e) => `Registry: ${e}`));
  }

  const profileCount = Object.keys(VARIANT_DECISION_PROFILES).length;
  if (profileCount !== 77) {
    errors.push(`Expected 77 decision profiles, found ${profileCount}`);
  }

  const sections = resolveDecisionSections(plan.context);

  for (const sectionKind of sections) {
    const selection = plan.selections[sectionKind];
    if (!selection) {
      errors.push(`Missing selection for section: ${sectionKind}`);
      continue;
    }

    const def = getVariantDefinition(sectionKind, selection.variantId as SectionVariantId);
    if (!def) {
      errors.push(`Invalid variant ${selection.variantId} for ${sectionKind}`);
    }

    if (selection.score <= 0 && selection.variantId !== getDefaultVariantId(sectionKind)) {
      warnings.push(`${sectionKind}: zero score but non-default variant selected`);
    }
  }

  const scoredSections = Object.keys(plan.scored) as SectionKind[];
  for (const kind of scoredSections) {
    const list = plan.scored[kind];
    if (!list?.length) {
      errors.push(`No scored variants for ${kind}`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateDecisionEngine(): VariantDecisionValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  const registry = validateVariantRegistry();
  if (!registry.valid) errors.push(...registry.errors);

  const sample = decideVariantPlan({
    industry: "saas",
    websiteGoal: "saas",
    targetAudience: "b2b",
    businessModel: "product",
    premiumLevel: "premium",
    seed: "validation-seed",
  });

  const planValidation = validateDecisionPlan(sample);
  if (!planValidation.valid) errors.push(...planValidation.errors);
  warnings.push(...planValidation.warnings);

  return { valid: errors.length === 0, errors, warnings };
}
