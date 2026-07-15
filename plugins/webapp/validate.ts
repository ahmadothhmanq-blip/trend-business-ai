import type { ProjectCapabilityFlags } from "@/lib/ai/validator";
import { validateGeneratedProject } from "@/lib/ai/validator";
import type { WebAppOutput } from "@/plugins/webapp/types";
import type { GenerationContext, ValidationResult } from "@/lib/ai/types";

function flagsFromOutput(output: WebAppOutput): ProjectCapabilityFlags {
  return {
    requiresAuth: output.settings?.requiresAuth === "true",
    requiresDatabase: output.settings?.requiresDatabase === "true",
    requiresDashboard: output.settings?.requiresDashboard === "true",
    isEcommerce: output.settings?.isEcommerce === "true",
    isSaas: output.settings?.isSaas === "true",
    databaseProvider: (output.settings?.databaseProvider as "prisma" | "supabase" | "none") ?? "none",
  };
}

export async function validateWebApp(
  output: WebAppOutput,
  ctx: GenerationContext,
): Promise<ValidationResult> {
  ctx.progress.emit("Validating project...");

  const result = validateGeneratedProject(output.files, flagsFromOutput(output));

  return {
    valid: result.valid,
    reason: result.valid ? undefined : "Web app project failed production validation.",
    issues: result.issues,
    filesToRegenerate: result.filesToRegenerate,
  };
}
