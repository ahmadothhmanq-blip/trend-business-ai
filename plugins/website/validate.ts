import type { ProjectCapabilityFlags } from "@/lib/ai/validator";
import { validateGeneratedProject } from "@/lib/ai/validator";
import { runWebsiteQualityCheck } from "@/plugins/website/layers/quality";
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
  ctx.progress.emit("Running quality check...");

  const structural = validateGeneratedProject(
    output.files,
    flagsFromOutput(output),
    {
      requiredPaths: output.files.map((file) => file.path),
    },
  );

  const quality =
    output.qualityReport ??
    runWebsiteQualityCheck({
      files: output.files,
      strategy: output.strategy,
      designSystem: output.designSystem,
      assetManifest: output.assetManifest,
      pages: output.pages,
    });

  // Attach report for persistence if missing
  if (!output.qualityReport) {
    output.qualityReport = quality;
  }

  const issues = [
    ...structural.issues,
    ...quality.issues,
    ...quality.weakSections.map((w) => `Weak section: ${w}`),
  ];

  // Hard-fail only on catastrophic missing page/layout; otherwise soft-pass with issues.
  const catastrophic = issues.some(
    (i) =>
      i.includes("Missing app page") ||
      i.includes("Missing layout") ||
      i.startsWith("Missing required production file: app/page.tsx"),
  );

  return {
    valid: !catastrophic,
    reason: catastrophic
      ? "Catastrophic structure failure"
      : quality.passed
        ? undefined
        : "Saved with non-blocking quality warnings.",
    issues,
    filesToRegenerate: catastrophic ? structural.filesToRegenerate : [],
  };
}
