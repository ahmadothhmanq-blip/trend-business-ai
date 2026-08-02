/**
 * Component Composer validation pipeline.
 */

import type {
  ComposerValidationResult,
  SiteComposition,
} from "@/lib/tbge/composer/types";
import type { GenerationSpec } from "@/lib/tbge/spec/types";
import { isSpecLocked } from "@/lib/tbge/spec/lock";
import { validateGenerationSpec } from "@/lib/tbge/spec/validator";

function push(errors: string[], message: string) {
  errors.push(message);
}

export function validateSiteComposition(
  spec: GenerationSpec,
  composition: SiteComposition,
): ComposerValidationResult {
  const errors: string[] = [];

  const specValidation = validateGenerationSpec(spec);
  if (!specValidation.valid) {
    return { valid: false, errors: specValidation.errors };
  }

  if (!isSpecLocked(spec)) {
    push(errors, "GenerationSpec must be locked before composition");
  }

  if (composition.specId !== spec.specId) {
    push(errors, "composition.specId must match GenerationSpec.specId");
  }

  if (!composition.pages.length) {
    push(errors, "composition.pages must not be empty");
  }

  for (const page of composition.pages) {
    if (!page.sections.length) {
      push(errors, `page ${page.path} must have at least one section`);
    }
    const orders = new Set(page.sections.map((section) => section.order));
    if (orders.size !== page.sections.length) {
      push(errors, `duplicate section order on page ${page.path}`);
    }
    for (const section of page.sections) {
      if (!section.variant.componentType) {
        push(errors, `section ${section.id} missing componentType`);
      }
      if (!section.layout.breakpoints.lg) {
        push(errors, `section ${section.id} missing responsive breakpoints`);
      }
    }
  }

  if (!composition.theme.cssVariables["--color-primary"]) {
    push(errors, "theme must include primary css variable");
  }

  if (!composition.industryPattern.id) {
    push(errors, "industryPattern.id is required");
  }

  return errors.length ? { valid: false, errors } : { valid: true };
}

export function assertValidSiteComposition(
  spec: GenerationSpec,
  composition: SiteComposition,
): void {
  const result = validateSiteComposition(spec, composition);
  if (!result.valid) {
    throw new Error(`Invalid site composition: ${result.errors.join("; ")}`);
  }
}
