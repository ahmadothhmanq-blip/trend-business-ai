import type { ArchitectureValidationResult } from "@/lib/ai-core/architecture-validation/types";

export class ArchitectureValidationFailure extends Error {
  readonly code = "ARCHITECTURE_VALIDATION_FAILED";
  readonly validation: ArchitectureValidationResult;

  constructor(validation: ArchitectureValidationResult) {
    const summary = validation.errors.slice(0, 3).join(" · ");
    super(
      `Website architecture validation failed after ${validation.attempt} attempt(s): ${summary}`,
    );
    this.name = "ArchitectureValidationFailure";
    this.validation = validation;
  }

  toExplainablePayload() {
    return {
      code: this.code,
      status: this.validation.status,
      errors: this.validation.errors,
      warnings: this.validation.warnings,
      confidence: this.validation.confidence,
      reasoning: this.validation.reasoning,
      recommendedCorrections: this.validation.recommendedCorrections,
      trace: this.validation.trace,
      attempt: this.validation.attempt,
      validatedAt: this.validation.validatedAt,
    };
  }
}
