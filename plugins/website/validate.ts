import type { ProjectCapabilityFlags } from "@/lib/ai/validator";
import { validateGeneratedProject } from "@/lib/ai/validator";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { GenerationContext, ValidationResult } from "@/lib/ai/types";

function flagsFromOutput(output: GeneratedWebsiteProject): ProjectCapabilityFlags {
  return {
    requiresAuth: output.settings?.requiresAuth === "true",
    requiresDatabase: output.settings?.requiresDatabase === "true",
    requiresDashboard: output.settings?.requiresDashboard === "true",
    isEcommerce: output.settings?.isEcommerce === "true",
    isSaas: output.settings?.isSaas === "true",
    databaseProvider: output.settings?.databaseProvider ?? "none",
  };
}

export async function validateWebsite(
  output: GeneratedWebsiteProject,
  ctx: GenerationContext,
): Promise<ValidationResult> {
  ctx.progress.emit("Validating project...");

  const result = validateGeneratedProject(output.files, flagsFromOutput(output));

  return {
    valid: result.valid,
    reason: result.valid ? undefined : "Project failed production validation.",
    issues: result.issues,
    filesToRegenerate: result.filesToRegenerate,
  };
}
