/**
 * PlanDraft validation — planner-stage checks before deterministic spec build.
 */

import { isWebsiteStructure } from "@/lib/tbge/spec/website-structure";
import type { PlanDraft } from "@/lib/tbge/planning/plan-draft";
import type { PlanValidationResult } from "@/lib/tbge/planning/types";

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

function push(errors: string[], message: string): void {
  errors.push(message);
}

export function validatePlanDraft(draft: unknown): PlanValidationResult {
  const errors: string[] = [];

  if (!draft || typeof draft !== "object") {
    return { valid: false, errors: ["PlanDraft must be an object"] };
  }

  const row = draft as Partial<PlanDraft>;

  if (!row.business?.name?.trim()) {
    push(errors, "business.name is required");
  }
  if (!row.business?.industry?.trim()) {
    push(errors, "business.industry is required");
  }
  if (!row.business?.industryId?.trim()) {
    push(errors, "business.industryId is required");
  }
  if (!Array.isArray(row.business?.audience) || row.business.audience.length === 0) {
    push(errors, "business.audience must be a non-empty array");
  }
  if (!Array.isArray(row.business?.goals) || row.business.goals.length === 0) {
    push(errors, "business.goals must be a non-empty array");
  }
  if (!row.business?.tone?.trim()) push(errors, "business.tone is required");
  if (!row.business?.offer?.trim()) push(errors, "business.offer is required");

  if (!row.locale?.language?.trim()) {
    push(errors, "locale.language is required");
  }

  if (!isWebsiteStructure(row.structure)) {
    push(errors, "structure must be a valid website structure");
  } else {
    if (!row.structure.pages.length) {
      push(errors, "structure.pages must not be empty");
    }
    for (const [index, page] of row.structure.pages.entries()) {
      if (!page.name?.trim()) push(errors, `structure.pages[${index}].name is required`);
      if (!page.path?.trim()) push(errors, `structure.pages[${index}].path is required`);
      if (!page.path.startsWith("/")) {
        push(errors, `structure.pages[${index}].path must start with /`);
      }
      if (!Array.isArray(page.sections) || page.sections.length === 0) {
        push(errors, `structure.pages[${index}].sections must be a non-empty array`);
      }
    }
    if (!Array.isArray(row.structure.navigation?.items) || row.structure.navigation.items.length === 0) {
      push(errors, "structure.navigation.items must be a non-empty array");
    }
  }

  if (!row.design?.templateId?.trim()) {
    push(errors, "design.templateId is required");
  }
  if (!Array.isArray(row.design?.componentPalette) || row.design.componentPalette.length === 0) {
    push(errors, "design.componentPalette must be a non-empty array");
  }

  const tokens = row.design?.tokens;
  if (!tokens) {
    push(errors, "design.tokens is required");
  } else {
    for (const key of ["primary", "secondary", "accent", "background", "foreground"] as const) {
      const value = tokens[key];
      if (!value || !HEX_COLOR.test(value)) {
        push(errors, `design.tokens.${key} must be a #RRGGBB hex color`);
      }
    }
  }

  if (!row.capabilities || typeof row.capabilities !== "object") {
    push(errors, "capabilities is required");
  } else if (!row.capabilities.database?.provider) {
    push(errors, "capabilities.database.provider is required");
  }

  return errors.length ? { valid: false, errors } : { valid: true };
}

export function assertValidPlanDraft(draft: unknown): asserts draft is PlanDraft {
  const result = validatePlanDraft(draft);
  if (!result.valid) {
    throw new Error(`Invalid PlanDraft: ${result.errors.join("; ")}`);
  }
}
