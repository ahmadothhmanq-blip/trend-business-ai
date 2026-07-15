import { validateGeneratedProject } from "@/lib/ai/validator";
import type { LPOutput } from "@/plugins/landing-page/types";
import type { GenerationContext, ValidationResult } from "@/lib/ai/types";

export async function validateLandingPage(
  output: LPOutput,
  ctx: GenerationContext,
): Promise<ValidationResult> {
  ctx.progress.emit("Validating project...");

  const flags = {
    requiresAuth: false,
    requiresDatabase: false,
    requiresDashboard: false,
    isEcommerce: false,
    isSaas: false,
    databaseProvider: "none" as const,
  };

  const result = validateGeneratedProject(output.files, flags);

  return {
    valid: result.valid,
    reason: result.valid ? undefined : "Landing page failed production validation.",
    issues: result.issues,
    filesToRegenerate: result.filesToRegenerate,
  };
}
