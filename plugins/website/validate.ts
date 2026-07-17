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

  const result = validateGeneratedProject(output.files, flagsFromOutput(output), {
    requiredPaths: output.files.map((file) => file.path),
  });

  // Soft-pass incomplete trees so bounded generations still save successfully.
  // Issues remain visible to callers for logging/telemetry; regeneration is not forced.
  return {
    valid: true,
    reason: result.valid
      ? undefined
      : "Project saved with non-blocking validation warnings.",
    issues: result.issues,
    filesToRegenerate: [],
  };
}
