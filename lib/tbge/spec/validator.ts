/**
 * GenerationSpec structural validation (no JSON Schema runtime dependency in Sprint 1).
 */

import { GENERATION_SPEC_VERSION } from "@/lib/tbge/spec/types";
import type { GenerationSpec, SpecValidationResult } from "@/lib/tbge/spec/types";
import { isWebsiteStructure } from "@/lib/tbge/spec/website-structure";

function push(errors: string[], message: string): void {
  errors.push(message);
}

export function validateGenerationSpec(spec: unknown): SpecValidationResult {
  const errors: string[] = [];

  if (!spec || typeof spec !== "object") {
    return { valid: false, errors: ["Spec must be an object"] };
  }

  const row = spec as Partial<GenerationSpec>;

  if (row.specVersion !== GENERATION_SPEC_VERSION) {
    push(errors, `specVersion must be "${GENERATION_SPEC_VERSION}"`);
  }
  if (!row.specId?.trim()) push(errors, "specId is required");
  if (!row.promptHash?.trim()) push(errors, "promptHash is required");
  if (!row.productId?.trim()) push(errors, "productId is required");
  if (!row.profile) push(errors, "profile is required");
  if (!row.mode) push(errors, "mode is required");

  if (!row.locale?.language?.trim()) {
    push(errors, "locale.language is required");
  }

  if (!row.business?.name?.trim()) push(errors, "business.name is required");
  if (!row.business?.industryId?.trim()) {
    push(errors, "business.industryId is required");
  }

  if (!isWebsiteStructure(row.structure)) {
    push(errors, "structure must be a valid website structure");
  } else if (!row.structure.pages.length) {
    push(errors, "structure.pages must not be empty");
  }

  if (!row.design?.templateId?.trim()) {
    push(errors, "design.templateId is required");
  }
  if (!Array.isArray(row.design?.componentPalette)) {
    push(errors, "design.componentPalette must be an array");
  }

  if (!row.capabilities || typeof row.capabilities !== "object") {
    push(errors, "capabilities is required");
  }

  if (!Array.isArray(row.fileGraph)) {
    push(errors, "fileGraph must be an array");
  } else {
    for (const [index, node] of row.fileGraph.entries()) {
      if (!node?.path?.trim()) {
        push(errors, `fileGraph[${index}].path is required`);
      }
      if (!node?.generator) {
        push(errors, `fileGraph[${index}].generator is required`);
      }
      if (!node?.wave) {
        push(errors, `fileGraph[${index}].wave is required`);
      }
    }
  }

  if (!row.provenance?.lockedAt?.trim()) {
    push(errors, "provenance.lockedAt is required");
  }
  if (!row.provenance?.promptHash?.trim()) {
    push(errors, "provenance.promptHash is required");
  }

  return errors.length ? { valid: false, errors } : { valid: true };
}

export function assertValidGenerationSpec(spec: unknown): asserts spec is GenerationSpec {
  const result = validateGenerationSpec(spec);
  if (!result.valid) {
    throw new Error(`Invalid GenerationSpec: ${result.errors.join("; ")}`);
  }
}
