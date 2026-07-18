import { generateWithValidation } from "@/lib/ai/generator";
import { truncateForContext, type PlannedFile } from "@/lib/ai/planner";
import { sortFilesByDependency } from "@/lib/ai/planner";
import { websiteFilePrompt } from "@/lib/ai/prompts/website";
import {
  validateGeneratedFileContent,
  validateGeneratedProject,
} from "@/lib/ai/validator";
import {
  buildWebsiteScaffold,
  SCAFFOLD_PATHS,
  syncPackageJsonDependencies,
} from "@/lib/ai/website-scaffold";
import { sanitizeProjectPath } from "@/lib/ai/zipper";
import { logger } from "@/lib/logger";
import {
  assetManifestForPrompt,
  generateWebsiteAssets,
} from "@/plugins/website/layers/assets";
import { designSystemCssVariables } from "@/plugins/website/layers/design-engine";
import {
  buildQualityImproveInstruction,
  runWebsiteQualityCheck,
} from "@/plugins/website/layers/quality";
import { generatedFileSchema } from "@/plugins/website/schemas";
import type {
  AssetManifest,
  GeneratedProjectFile,
  QualityReport,
  WebsiteGenerationInput,
  WebsitePlanResult,
  WebsiteProjectAnalysis,
} from "@/plugins/website/types";
import type { GenerationContext } from "@/lib/ai/types";

const FILE_GENERATION_RETRIES = 2;
const PROJECT_VALIDATION_ROUNDS = 2;

async function generateFileWithValidation(
  input: WebsiteGenerationInput,
  analysis: WebsiteProjectAnalysis,
  plan: WebsitePlanResult,
  filePlans: PlannedFile[],
  existingFiles: GeneratedProjectFile[],
  filePlan: PlannedFile,
  ctx: GenerationContext,
  extraValidationReason = "",
  assetSummary = "",
) {
  return generateWithValidation({
    provider: ctx.provider,
    maxAttempts: FILE_GENERATION_RETRIES,
    prompt: websiteFilePrompt({
      input,
      analysis,
      blueprint: plan.blueprint,
      dynamicPlan: {
        complexity: plan.dynamicPlan.complexity,
        estimatedFileCount: plan.dynamicPlan.estimatedFileCount,
        layouts: plan.dynamicPlan.layouts,
        pages: plan.dynamicPlan.pages,
        components: plan.dynamicPlan.components,
        apiRoutes: plan.dynamicPlan.apiRoutes,
        hooks: plan.dynamicPlan.hooks,
        utilities: plan.dynamicPlan.utilities,
        types: plan.dynamicPlan.types,
        configs: plan.dynamicPlan.configs,
      },
      filePlan,
      projectTree: filePlans.map((file) => ({
        path: file.path,
        category: file.category,
        purpose: file.purpose,
      })),
      existingFiles: existingFiles.map((file) => ({
        path: file.path,
        language: file.language,
        content: truncateForContext(file.content),
      })),
      validationReason: extraValidationReason,
      strategy: plan.strategy,
      designSystem: plan.designSystem,
      assetManifestSummary: assetSummary,
    }),
    schema: generatedFileSchema,
    validate: (result) => validateGeneratedFileContent(result, filePlan.path),
  }).then((file) => ({
    ...file,
    path: sanitizeProjectPath(filePlan.path),
    language: file.language || filePlan.language,
  }));
}

async function validateAndRepairProject(
  input: WebsiteGenerationInput,
  analysis: WebsiteProjectAnalysis,
  plan: WebsitePlanResult,
  filePlans: PlannedFile[],
  files: GeneratedProjectFile[],
  ctx: GenerationContext,
  assetSummary: string,
) {
  let currentFiles = [...files];
  const planByPath = new Map(filePlans.map((entry) => [entry.path, entry]));
  const requiredPaths = filePlans.map((file) => file.path);

  for (let round = 0; round < PROJECT_VALIDATION_ROUNDS; round += 1) {
    const validation = validateGeneratedProject(currentFiles, plan.flags, {
      requiredPaths,
    });
    if (validation.valid) {
      return currentFiles;
    }

    const targets = new Set(
      validation.filesToRegenerate.filter((path) => planByPath.has(path)),
    );

    for (const missingPath of validation.issues
      .filter((issue) => issue.startsWith("Missing required production file:"))
      .map((issue) => issue.replace("Missing required production file: ", ""))) {
      if (!planByPath.has(missingPath)) continue;
      targets.add(missingPath);
    }

    if (targets.size === 0) {
      break;
    }

    const regenerated = new Map(currentFiles.map((file) => [file.path, file]));

    for (const targetPath of targets) {
      const filePlan = planByPath.get(targetPath);
      if (!filePlan) continue;
      if (SCAFFOLD_PATHS.has(targetPath)) continue;

      const projectIssues = validation.issues
        .filter(
          (issue) =>
            issue.startsWith(`${targetPath}:`) || issue.includes(targetPath),
        )
        .join("\n");

      const existingWithoutTarget = currentFiles.filter(
        (file) => file.path !== targetPath,
      );

      const repaired = await generateFileWithValidation(
        input,
        analysis,
        plan,
        sortFilesByDependency([...planByPath.values()]),
        existingWithoutTarget,
        filePlan,
        ctx,
        projectIssues,
        assetSummary,
      );

      regenerated.set(targetPath, repaired);
    }

    currentFiles = sortFilesByDependency([...planByPath.values()])
      .map((entry) => regenerated.get(entry.path))
      .filter((file): file is GeneratedProjectFile => Boolean(file));
  }

  currentFiles = syncPackageJsonDependencies(currentFiles);

  const finalValidation = validateGeneratedProject(currentFiles, plan.flags, {
    requiredPaths,
  });
  if (!finalValidation.valid) {
    logger.warn(
      "Soft-passing website project validation issues",
      "website-generate",
      {
        issueCount: finalValidation.issues.length,
        sampleIssues: finalValidation.issues.slice(0, 12),
      },
    );
  }

  return currentFiles;
}

export async function applyQualityImprovePass(
  input: WebsiteGenerationInput,
  analysis: WebsiteProjectAnalysis,
  plan: WebsitePlanResult,
  files: GeneratedProjectFile[],
  ctx: GenerationContext,
  assetSummary: string,
  improveInstruction: string,
) {
  const planByPath = new Map(plan.filePlans.map((entry) => [entry.path, entry]));
  const targets = plan.filePlans.filter(
    (f) =>
      f.path.includes("page.tsx") ||
      f.path.includes("layout.tsx") ||
      f.path.includes("Hero") ||
      f.path.includes("components/"),
  );

  let current = [...files];
  for (const filePlan of targets.slice(0, 4)) {
    if (SCAFFOLD_PATHS.has(filePlan.path) && !filePlan.path.includes("page")) {
      continue;
    }
    const existingWithoutTarget = current.filter((f) => f.path !== filePlan.path);
    try {
      const improved = await generateFileWithValidation(
        { ...input, continueInstruction: improveInstruction, mode: "continue" },
        analysis,
        plan,
        plan.filePlans,
        existingWithoutTarget,
        filePlan,
        ctx,
        improveInstruction,
        assetSummary,
      );
      current = [
        ...existingWithoutTarget,
        improved,
      ];
    } catch (error) {
      logger.warn("quality improve file failed", "website-generate", {
        path: filePlan.path,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Ensure plan order
  const byPath = new Map(current.map((f) => [f.path, f]));
  return sortFilesByDependency([...planByPath.values()])
    .map((p) => byPath.get(p.path))
    .filter((f): f is GeneratedProjectFile => Boolean(f))
    .concat(current.filter((f) => !planByPath.has(f.path)));
}

export type GenerateWebsiteOptions = {
  /** Precomputed assets from AI Core assets layer */
  assetManifest?: AssetManifest;
  /** Skip asset generation (requires assetManifest) */
  skipAssetGeneration?: boolean;
  /** Skip quality check/improve (Core quality layer will run) */
  skipQuality?: boolean;
};

export async function generateWebsite(
  input: WebsiteGenerationInput,
  analysis: WebsiteProjectAnalysis,
  plan: WebsitePlanResult,
  ctx: GenerationContext,
  options?: GenerateWebsiteOptions,
) {
  const assetManifest =
    options?.skipAssetGeneration && options.assetManifest
      ? options.assetManifest
      : await generateWebsiteAssets({
          input,
          businessProfile: analysis.businessProfile,
          strategy: plan.strategy,
          designSystem: plan.designSystem,
          ctx,
          userId: input.userId,
          generationKey: input.parentGenerationId ?? `draft-${Date.now()}`,
        });
  const assetSummary = assetManifestForPrompt(assetManifest);

  ctx.progress.emit("Generating files...");

  const scaffold = buildWebsiteScaffold(
    plan.blueprint.title || analysis.projectName,
    {
      cssVariables: designSystemCssVariables(plan.designSystem),
      primary: plan.designSystem.colors.primary,
      background: plan.designSystem.colors.background,
      foreground: plan.designSystem.colors.foreground,
    },
  );
  const scaffoldByPath = new Map(scaffold.map((file) => [file.path, file]));

  const files: GeneratedProjectFile[] = [];
  for (const planned of plan.filePlans) {
    if (!SCAFFOLD_PATHS.has(planned.path)) continue;
    const scaffoldFile = scaffoldByPath.get(planned.path);
    if (scaffoldFile) files.push(scaffoldFile);
  }

  // Always ensure design-token globals.css is present even if not in filePlans.
  if (!files.some((f) => f.path === "app/globals.css")) {
    const globals = scaffoldByPath.get("app/globals.css");
    if (globals) files.push(globals);
  }

  const aiFilePlans = plan.filePlans.filter(
    (file) => !SCAFFOLD_PATHS.has(file.path),
  );

  const previousByPath = new Map(
    (input.previousFiles ?? []).map((file) => [file.path, file]),
  );
  const reusePrevious =
    (input.mode === "continue" || input.mode === "regenerate") &&
    previousByPath.size > 0;

  let index = 0;
  for (const filePlan of aiFilePlans) {
    index += 1;
    const prior = reusePrevious ? previousByPath.get(filePlan.path) : undefined;

    if (
      input.mode === "continue" &&
      prior &&
      !input.continueInstruction?.toLowerCase().includes(filePlan.path.toLowerCase()) &&
      !input.continueInstruction?.toLowerCase().includes("[quality]") &&
      !input.continueInstruction?.toLowerCase().includes("[design]") &&
      !input.continueInstruction?.toLowerCase().includes("[strategy]")
    ) {
      ctx.progress.emit(
        `Reusing file ${index}/${aiFilePlans.length}: ${filePlan.path}`,
      );
      files.push(prior);
      continue;
    }

    ctx.progress.emit(
      `Generating file ${index}/${aiFilePlans.length}: ${filePlan.path}`,
    );
    files.push(
      await generateFileWithValidation(
        input,
        analysis,
        plan,
        plan.filePlans,
        files,
        filePlan,
        ctx,
        prior
          ? `Improve this existing file while preserving working imports:\n${prior.content.slice(0, 4000)}`
          : "",
        assetSummary,
      ),
    );
  }

  ctx.progress.emit("Validating project...");

  let validatedFiles = await validateAndRepairProject(
    input,
    analysis,
    plan,
    plan.filePlans,
    files,
    ctx,
    assetSummary,
  );

  let qualityReport: QualityReport | undefined;
  if (options?.skipQuality) {
    qualityReport = {
      passed: true,
      dimensions: [],
      weakSections: [],
      improveApplied: false,
      issues: [],
    };
  } else {
    const qualityResult = await runWebsiteQualityLayer({
      input,
      analysis,
      plan,
      files: validatedFiles,
      assetManifest,
      ctx,
    });
    validatedFiles = qualityResult.files;
    qualityReport = qualityResult.qualityReport;
  }

  return {
    projectKind: input.projectKind,
    title: plan.blueprint.title || analysis.projectName,
    description: plan.blueprint.description,
    pages: plan.blueprint.pages,
    sections: plan.blueprint.sections,
    colorPalette: plan.blueprint.colorPalette,
    typography: plan.blueprint.typography,
    components: plan.blueprint.components,
    content: plan.blueprint.content,
    seo: plan.blueprint.seo,
    roadmap: plan.blueprint.roadmap,
    files: validatedFiles,
    businessProfile: analysis.businessProfile,
    strategy: plan.strategy,
    designSystem: plan.designSystem,
    assetManifest,
    qualityReport,
    settings: {
      framework: "Next.js App Router",
      styling: "Tailwind CSS",
      packageManager: "npm",
      deploymentTarget: "Vercel or Node hosting",
      complexity: plan.dynamicPlan.complexity,
      estimatedFileCount: String(validatedFiles.length),
      requiresAuth: String(plan.flags.requiresAuth),
      requiresDatabase: String(plan.flags.requiresDatabase),
      requiresDashboard: String(plan.flags.requiresDashboard),
      isEcommerce: String(plan.flags.isEcommerce),
      isSaas: String(plan.flags.isSaas),
      databaseProvider: plan.flags.databaseProvider,
    },
  };
}

/** Quality check + optional improve pass (used by plugin and AI Core quality layer). */
export async function runWebsiteQualityLayer(params: {
  input: WebsiteGenerationInput;
  analysis: WebsiteProjectAnalysis;
  plan: WebsitePlanResult;
  files: GeneratedProjectFile[];
  assetManifest: AssetManifest;
  ctx: GenerationContext;
}): Promise<{ files: GeneratedProjectFile[]; qualityReport: QualityReport }> {
  const { input, analysis, plan, assetManifest, ctx } = params;
  let validatedFiles = params.files;
  const assetSummary = assetManifestForPrompt(assetManifest);

  ctx.progress.emit("Running quality check...");
  let qualityReport = runWebsiteQualityCheck({
    files: validatedFiles,
    strategy: plan.strategy,
    designSystem: plan.designSystem,
    assetManifest,
    pages: plan.blueprint.pages,
    requiredSections: analysis.businessProfile.requiredSections,
  });

  if (!qualityReport.passed || qualityReport.weakSections.length > 0) {
    ctx.progress.emit("Improving weak sections...");
    const improveInstruction = buildQualityImproveInstruction(qualityReport);
    try {
      validatedFiles = await applyQualityImprovePass(
        input,
        analysis,
        plan,
        validatedFiles,
        ctx,
        assetSummary,
        improveInstruction,
      );
      qualityReport = {
        ...runWebsiteQualityCheck({
          files: validatedFiles,
          strategy: plan.strategy,
          designSystem: plan.designSystem,
          assetManifest,
          pages: plan.blueprint.pages,
          requiredSections: analysis.businessProfile.requiredSections,
        }),
        improveApplied: true,
        improveNotes: [improveInstruction],
      };
    } catch (error) {
      logger.warn("quality improve pass failed", "website-generate", {
        error: error instanceof Error ? error.message : String(error),
      });
      qualityReport = { ...qualityReport, improveApplied: false };
    }
  }

  return { files: validatedFiles, qualityReport };
}
