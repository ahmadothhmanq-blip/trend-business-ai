import { generateJsonWithValidation } from "@/lib/ai/generator";
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
import {
  hasProfessionalScaffold,
  injectProfessionalComponents,
  getProfessionalScaffoldByPath,
} from "@/lib/ai-core/components";
import {
  composedHomePagePlaceholder,
  resolveWebsiteGenerationProfile,
  shouldSkipLlmForComposedHomePage,
} from "@/lib/website/generation-flags";
import { injectAiImagesIntoProject } from "@/lib/ai-core/image-engine";
import { buildGenerationRepairInstruction,
  validateWebsiteGeneration,
} from "@/lib/ai-core/website-builder/generation-validation";
import { usesLlmLocalizedWebsiteCopy } from "@/lib/ai-core/content/content-language";
import {
  buildWebsiteLanguageDirective,
} from "@/lib/ai-core/website-builder/language-directive";
import { websiteGenerateJson } from "@/lib/ai-core/website-builder/llm-calls";
import { productionContentForPreview } from "@/lib/ai-core/content/production-content";
import { buildWebsiteGenerationKey } from "@/lib/ai-core/website-builder/prompt-industry";
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

const FILE_GENERATION_RETRIES = 3;
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
  return websiteGenerateJson<GeneratedProjectFile>({
    stage: "file-generation",
    input,
    provider: ctx.provider,
    maxAttempts: FILE_GENERATION_RETRIES,
    filePath: filePlan.path,
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
  repairMode: "full" | "fatal-only" = "full",
) {
  let currentFiles = [...files];
  const planByPath = new Map(filePlans.map((entry) => [entry.path, entry]));
  const requiredPaths = filePlans.map((file) => file.path);
  const maxRounds = repairMode === "fatal-only" ? 1 : PROJECT_VALIDATION_ROUNDS;

  for (let round = 0; round < maxRounds; round += 1) {
    const validation = validateGeneratedProject(currentFiles, plan.flags, {
      requiredPaths,
    });
    if (validation.valid) {
      return currentFiles;
    }

    const targets = new Set<string>();

    if (repairMode === "fatal-only") {
      for (const missingPath of validation.issues
        .filter((issue) => issue.startsWith("Missing required production file:"))
        .map((issue) => issue.replace("Missing required production file: ", ""))) {
        if (!planByPath.has(missingPath)) continue;
        targets.add(missingPath);
      }
    } else {
      for (const path of validation.filesToRegenerate.filter((path) =>
        planByPath.has(path),
      )) {
        targets.add(path);
      }

      for (const missingPath of validation.issues
        .filter((issue) => issue.startsWith("Missing required production file:"))
        .map((issue) => issue.replace("Missing required production file: ", ""))) {
        if (!planByPath.has(missingPath)) continue;
        targets.add(missingPath);
      }
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
  const languageBlock = buildWebsiteLanguageDirective({
    language: input.language,
    prompt: input.prompt,
  });
  const fullInstruction = `${improveInstruction}\n${languageBlock}`;

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
        { ...input, continueInstruction: fullInstruction, mode: "continue" },
        analysis,
        plan,
        plan.filePlans,
        existingWithoutTarget,
        filePlan,
        ctx,
        fullInstruction,
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
  /** fast | professional — controls repair strictness and file scope */
  generationProfile?: import("@/lib/website/generation-flags").WebsiteGenerationProfile;
};

export async function generateWebsite(
  input: WebsiteGenerationInput,
  analysis: WebsiteProjectAnalysis,
  plan: WebsitePlanResult,
  ctx: GenerationContext,
  options?: GenerateWebsiteOptions,
) {
  const generationProfile =
    options?.generationProfile ?? resolveWebsiteGenerationProfile(input);
  const minimalGeneration =
    generationProfile === "fast" || generationProfile === "ultra";
  const ultraGeneration = generationProfile === "ultra";

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
          generationKey: buildWebsiteGenerationKey({
            userId: input.userId,
            parentGenerationId: input.parentGenerationId,
            mode: input.mode,
            prompt: input.prompt,
          }),
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

  if (minimalGeneration) {
    ctx.progress.emit(
      `[${ultraGeneration ? "ultra" : "fast"}] Generating ${aiFilePlans.length} required production files…`,
    );
  }

  const previousByPath = new Map(
    (input.previousFiles ?? []).map((file) => [file.path, file]),
  );
  const reusePrevious =
    (input.mode === "continue" ||
      input.mode === "regenerate" ||
      input.mode === "retry") &&
    previousByPath.size > 0;

  const componentPaletteForCompose = plan.designSystem.componentPalette?.map(
    String,
  );
  const localizedCopy = usesLlmLocalizedWebsiteCopy(input.language);

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

    if (
      !localizedCopy &&
      shouldSkipLlmForComposedHomePage({
        filePath: filePlan.path,
        componentPalette: componentPaletteForCompose,
        composePage: true,
        generationProfile,
      })
    ) {
      ctx.progress.emit(
        `Deferring home page ${index}/${aiFilePlans.length}: ${filePlan.path} (composed after sections)`,
      );
      files.push(composedHomePagePlaceholder(filePlan));
      try {
        await ctx.onFilesCheckpoint?.(files, {
          message: `Saved progress · ${files.length} files · ${filePlan.path} (deferred)`,
        });
      } catch {
        // Checkpoint failures must never abort generation.
      }
      continue;
    }

    const scaffold = getProfessionalScaffoldByPath(filePlan.path);
    const preferLlmCopy = localizedCopy;
    if (
      scaffold &&
      hasProfessionalScaffold(filePlan.path) &&
      !preferLlmCopy
    ) {
      ctx.progress.emit(
        `Using Professional Components Library ${index}/${aiFilePlans.length}: ${filePlan.path}`,
      );
      files.push({
        path: filePlan.path,
        content: scaffold,
        language: filePlan.language || "tsx",
      });
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

    // Persist partial file progress so disconnects can resume instead of losing work.
    try {
      await ctx.onFilesCheckpoint?.(files, {
        message: `Saved progress · ${files.length} files · ${filePlan.path}`,
      });
    } catch {
      // Checkpoint failures must never abort generation.
    }
  }

  // AI Image Engine: inject lib/site-images.ts and wire photographic URLs into components.
  const industryHint =
    analysis.businessProfile?.industry || plan.designSystem.industryPattern;
  const coreManifest =
    assetManifest as import("@/lib/ai-core/layers/types").CoreAssetManifest;
  const filesWithImages = injectAiImagesIntoProject({
    files,
    assetManifest: coreManifest,
    industry: industryHint,
  });

  // Industry copy → hero/CTA props on composed home page.
  const { buildIndustryCopyPack } = await import(
    "@/lib/ai-core/content/industry-copy"
  );
  const { buildProductionContentPack } = await import(
    "@/lib/ai-core/content/production-content"
  );
  const { polishGeneratedProject } = await import(
    "@/lib/ai-core/content/polish-project"
  );
  const brandName =
    analysis.businessProfile?.projectName || analysis.projectName;
  const componentIds = plan.designSystem.componentPalette?.map(String);
  const homeComponentOrder = plan.designSystem.homeComponentOrder?.map(String);

  let templateVisualCss: string | null = null;
  if (input.templateIntelligenceId) {
    const { getTemplateIntelligence } = await import(
      "@/lib/ai-core/template-intelligence/catalog"
    );
    const { buildTemplateVisualCss } = await import(
      "@/lib/ai-core/template-intelligence/visual-preset"
    );
    const ti = getTemplateIntelligence(input.templateIntelligenceId);
    if (ti) templateVisualCss = buildTemplateVisualCss(ti);
  }

  let filesWithComponents: GeneratedProjectFile[];
  let productionContent: Awaited<
    ReturnType<typeof buildProductionContentPack>
  > | null = null;

  if (localizedCopy) {
    filesWithComponents = injectProfessionalComponents({
      files: filesWithImages,
      composePage: false,
      language: input.language,
    });
  } else {
    const copyPack = buildIndustryCopyPack({
      industryId: analysis.businessProfile?.industry,
      profile: analysis.businessProfile,
      strategy: plan.strategy,
      language: input.language,
    });
    productionContent = buildProductionContentPack(
      copyPack,
      brandName,
      input.language,
    );

    filesWithComponents = injectProfessionalComponents({
      files: filesWithImages,
      componentPaths: plan.filePlans
        .map((f) => f.path)
        .filter(
          (p) =>
            p.startsWith("components/sections/") ||
            p.startsWith("components/layout/") ||
            p.startsWith("components/ui/"),
        ),
      componentIds,
      homeComponentOrder,
      brandName,
      pageTitle:
        plan.blueprint.title || productionContent.heroHeadline || analysis.projectName,
      pageDescription:
        plan.blueprint.description || productionContent.heroSubheadline,
      heroHeadline: productionContent.heroHeadline,
      heroSubheadline: productionContent.heroSubheadline,
      primaryCta: productionContent.primaryCta,
      secondaryCta: productionContent.secondaryCta,
      heroEyebrow: productionContent.heroEyebrow,
      content: productionContent,
      composePage: true,
      language: input.language,
      templateIntelligenceId: input.templateIntelligenceId,
      templateVisualCss,
    });

    filesWithComponents = polishGeneratedProject({
      files: filesWithComponents,
      componentIds,
      brandName,
      pageTitle:
        plan.blueprint.title || productionContent.heroHeadline || analysis.projectName,
      pageDescription:
        plan.blueprint.description || productionContent.heroSubheadline,
      content: productionContent,
      language: input.language,
    });
  }

  ctx.progress.emit("Validating project...");

  let validatedFiles = await validateAndRepairProject(
    input,
    analysis,
    plan,
    plan.filePlans,
    filesWithComponents,
    ctx,
    assetSummary,
    minimalGeneration ? "fatal-only" : "full",
  );

  // Re-inject after validation repairs so LLM rewrites cannot drop site imagery.
  validatedFiles = injectAiImagesIntoProject({
    files: validatedFiles,
    assetManifest: coreManifest,
    industry: industryHint,
  });

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
      skipImprove: minimalGeneration,
    });
    validatedFiles = qualityResult.files;
    qualityReport = qualityResult.qualityReport;
  }

  const validation = validateWebsiteGeneration({
    prompt: input.prompt,
    language: input.language,
    industry: analysis.businessProfile?.industry,
    industryId:
      typeof input.industryId === "string" ? input.industryId : undefined,
    files: validatedFiles,
    assetManifest,
    expectedPages: analysis.pages,
  });

  if (!validation.passed) {
    const repairInstruction = buildGenerationRepairInstruction(validation);
    if (repairInstruction) {
      ctx.progress.emit(
        "[validation] Regenerating sections that failed industry/language checks…",
      );
      try {
        validatedFiles = await applyQualityImprovePass(
          input,
          analysis,
          plan,
          validatedFiles,
          ctx,
          assetManifestForPrompt(assetManifest),
          repairInstruction,
        );
        validatedFiles = injectAiImagesIntoProject({
          files: validatedFiles,
          assetManifest: coreManifest,
          industry: industryHint,
        });
        if (!localizedCopy && productionContent) {
          validatedFiles = injectProfessionalComponents({
            files: validatedFiles,
            componentPaths: plan.filePlans
              .map((f) => f.path)
              .filter(
                (p) =>
                  p.startsWith("components/sections/") ||
                  p.startsWith("components/layout/") ||
                  p.startsWith("components/ui/"),
              ),
            componentIds,
            brandName,
            pageTitle:
              plan.blueprint.title ||
              productionContent.heroHeadline ||
              analysis.projectName,
            pageDescription:
              plan.blueprint.description || productionContent.heroSubheadline,
            heroHeadline: productionContent.heroHeadline,
            heroSubheadline: productionContent.heroSubheadline,
            primaryCta: productionContent.primaryCta,
            secondaryCta: productionContent.secondaryCta,
            heroEyebrow: productionContent.heroEyebrow,
            content: productionContent,
            composePage: true,
            language: input.language,
          });
        } else if (localizedCopy) {
          validatedFiles = injectProfessionalComponents({
            files: validatedFiles,
            composePage: false,
            language: input.language,
          });
        }
      } catch (error) {
        logger.warn("validation repair pass failed", "website-generate", {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  // Final image pass — quality improve must never leave empty placeholders.
  validatedFiles = injectAiImagesIntoProject({
    files: validatedFiles,
    assetManifest: coreManifest,
    industry: industryHint,
  });

  const localizedContent =
    localizedCopy
      ? plan.blueprint.content
      : productionContent
        ? productionContentForPreview(productionContent)
        : plan.blueprint.content;

  return {
    projectKind: input.projectKind,
    title: plan.blueprint.title || analysis.projectName,
    description: plan.blueprint.description,
    pages: plan.blueprint.pages,
    sections: plan.blueprint.sections,
    colorPalette: plan.blueprint.colorPalette,
    typography: plan.blueprint.typography,
    components: plan.blueprint.components,
    content: localizedContent,
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
      generationProfile: String(generationProfile),
      ...(input.templateIntelligenceId
        ? { templateIntelligenceId: input.templateIntelligenceId }
        : {}),
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
  /** When true, run checks only — skip applyQualityImprovePass (fast generation). */
  skipImprove?: boolean;
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
    language: input.language,
  });

  if (
    !params.skipImprove &&
    (!qualityReport.passed || qualityReport.weakSections.length > 0)
  ) {
    ctx.progress.emit("Improving weak sections...");
    const improveInstruction = buildQualityImproveInstruction(
      qualityReport,
      input.language,
    );
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
          language: input.language,
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

  // Restore AI Image Engine wiring after improve rewrites.
  validatedFiles = injectAiImagesIntoProject({
    files: validatedFiles,
    assetManifest:
      assetManifest as import("@/lib/ai-core/layers/types").CoreAssetManifest,
    industry:
      analysis.businessProfile?.industry || plan.designSystem.industryPattern,
  });

  return { files: validatedFiles, qualityReport };
}
