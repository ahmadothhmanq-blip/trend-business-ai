import { generateJsonWithValidation } from "@/lib/ai/generator";
import { type PlannedFile } from "@/lib/ai/planner";
import { sortFilesByDependency } from "@/lib/ai/planner";
import { resolvePromptContext } from "@/lib/ai-core/context-engine";
import { assemblePrompt } from "@/lib/ai-core/prompt-engine";
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
  injectProfessionalComponents,
} from "@/lib/ai-core/components";
import {
  resolveWebsiteGenerationProfile,
} from "@/lib/website/generation-flags";
import { injectAiImagesIntoProject } from "@/lib/ai-core/image-engine";
import { getThemePageArchitecture } from "@/lib/website/builder/theme-architecture";
import {
  applyV2StructureDuringGeneration,
  resolveGenerationTemplatePackageId,
  resolveTemplateIntelligenceForStructurePackage,
  shouldUseV2StructureDuringGeneration,
} from "@/lib/website/template-v2/generation/v2-generation-bridge";
import {
  buildGenerationRepairInstruction,
  validateWebsiteGeneration,
} from "@/lib/ai-core/website-builder/generation-validation";
import { usesLlmLocalizedWebsiteCopy } from "@/lib/ai-core/content/content-language";
import { getActiveWebsiteProfiler } from "@/lib/ai-core/performance/profiler-context";
import type { ProfilerCategory } from "@/lib/ai-core/performance/website-profiler";
import {
  isParallelRepairEnabled,
  runSafeParallelRepair,
  runSerialRepair,
} from "@/lib/ai-core/repair-engine";
import {
  evaluateProjectQualityGate,
  isQualityGateEnforcementEnabled,
  QualityGateBlockedError,
  verifyPostRepair,
} from "@/lib/ai-core/quality-authority";
import { performance } from "node:perf_hooks";
import {
  buildWebsiteLanguageDirective,
} from "@/lib/ai-core/website-builder/language-directive";
import { websiteGenerateJson } from "@/lib/ai-core/website-builder/llm-calls";
import { productionContentForPreview } from "@/lib/ai-core/content/production-content";
import { buildWebsiteGenerationKey } from "@/lib/ai-core/website-builder/prompt-industry";
import { designSystemCssVariables } from "@/plugins/website/layers/design-engine";
import {
  runUnifiedQualityPipeline,
  type UnifiedQualityDashboardModel,
  type UnifiedQualityPipelineResult,
  type UnifiedQualityReport,
} from "@/lib/ai-core/quality-platform";
import type { SemanticContentQualityReport } from "@/lib/ai-core/semantic-content-quality";
import type { VisualDesignQualityReport } from "@/lib/ai-core/visual-design-quality";
import { generatedFileSchema } from "@/plugins/website/schemas";
import type {
  AssetManifest,
  GeneratedProjectFile,
  GeneratedWebsiteProject,
  QualityReport,
  WebsiteGenerationInput,
  WebsitePlanResult,
  WebsiteProjectAnalysis,
} from "@/plugins/website/types";
import type { GenerationContext } from "@/lib/ai/types";
import { runWebsiteFileLoop } from "@/plugins/website/file-generation-loop";

const FILE_GENERATION_RETRIES = 3;
const PROJECT_VALIDATION_ROUNDS = 2;

async function profilePlugin<T>(
  category: ProfilerCategory,
  label: string,
  fn: () => Promise<T>,
): Promise<T> {
  const profiler = getActiveWebsiteProfiler();
  if (!profiler) return fn();
  return profiler.measure(category, label, fn);
}

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
  const profiler = getActiveWebsiteProfiler();
  const promptStart = performance.now();
  const { promptFiles } = resolvePromptContext({
    targetPath: filePlan.path,
    targetCategory: filePlan.category,
    availableFiles: existingFiles,
    filePlans,
    composeHomePage: true,
    productId: "website",
  });
  const { prompt } = assemblePrompt(
    {
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
      projectTree: filePlans.map((file) => ({
        path: file.path,
        category: file.category,
        purpose: file.purpose,
      })),
      strategy: plan.strategy,
      designSystem: plan.designSystem,
      filePlan,
      productId: "website",
    },
    (compacted) =>
      websiteFilePrompt({
        input,
        analysis: compacted.analysis,
        blueprint: compacted.blueprint,
        dynamicPlan: compacted.dynamicPlan,
        filePlan,
        projectTree: compacted.projectTree,
        existingFiles: promptFiles,
        validationReason: extraValidationReason,
        strategy: compacted.strategy,
        designSystem: compacted.designSystem,
        assetManifestSummary: assetSummary,
      }),
  );
  if (profiler) {
    profiler.record(
      "prompt-generation",
      `websiteFilePrompt · ${filePlan.path}`,
      Math.round(performance.now() - promptStart),
      { promptChars: prompt.length },
    );
  }

  return websiteGenerateJson<GeneratedProjectFile>({
    stage: "file-generation",
    input,
    provider: ctx.provider,
    maxAttempts: FILE_GENERATION_RETRIES,
    filePath: filePlan.path,
    prompt,
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
    const repairTargets = [...targets].filter(
      (targetPath) =>
        planByPath.has(targetPath) && !SCAFFOLD_PATHS.has(targetPath),
    );

    const runRepair = isParallelRepairEnabled()
      ? runSafeParallelRepair
      : runSerialRepair;

    const repairResult = await runRepair({
      targets: repairTargets,
      filePlans: [...planByPath.values()],
      files: currentFiles,
      composeHomePage: true,
      onProgress: (message) => ctx.progress.emit(message),
      repairFile: async (targetPath, snapshotFiles) => {
        const filePlan = planByPath.get(targetPath);
        if (!filePlan) {
          throw new Error(`Missing file plan for ${targetPath}`);
        }

        const projectIssues = validation.issues
          .filter(
            (issue) =>
              issue.startsWith(`${targetPath}:`) || issue.includes(targetPath),
          )
          .join("\n");

        const existingWithoutTarget = snapshotFiles.filter(
          (file) => file.path !== targetPath,
        );

        return generateFileWithValidation(
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
      },
      validateWave: (filesAfterWave, repairedPaths) => {
        const waveValidation = validateGeneratedProject(filesAfterWave, plan.flags, {
          requiredPaths,
        });
        return !repairedPaths.some((path) =>
          waveValidation.filesToRegenerate.includes(path),
        );
      },
    });

    const repairedFiles = [...repairResult.files];
    for (const file of repairedFiles) {
      regenerated.set(file.path, file);
    }

    const candidateFiles = sortFilesByDependency([...planByPath.values()])
      .map((entry) => regenerated.get(entry.path))
      .filter((file): file is GeneratedProjectFile => Boolean(file));

    const verification = verifyPostRepair({
      beforeIssues: validation.issues,
      afterIssues: validateGeneratedProject(candidateFiles, plan.flags, {
        requiredPaths,
      }).issues,
    });

    if (!verification.accepted) {
      logger.warn(
        "Post-repair regression detected — rolling back repair wave",
        "website-generate",
        {
          beforeBlockerCount: verification.beforeBlockerCount,
          afterBlockerCount: verification.afterBlockerCount,
          regressionIssues: verification.regressionIssues.slice(0, 8),
        },
      );
      break;
    }

    currentFiles = candidateFiles;
  }

  currentFiles = syncPackageJsonDependencies(currentFiles);

  const finalValidation = validateGeneratedProject(currentFiles, plan.flags, {
    requiredPaths,
  });
  const finalGate = evaluateProjectQualityGate(finalValidation.issues);

  if (finalGate.warningIssues.length > 0) {
    logger.warn("Non-blocking website project validation warnings", "website-generate", {
      warningCount: finalGate.warningIssues.length,
      sampleWarnings: finalGate.warningIssues.slice(0, 12),
    });
  }

  if (isQualityGateEnforcementEnabled() && !finalGate.passed) {
    throw new QualityGateBlockedError(finalGate.blockingIssues);
  }

  if (!finalValidation.valid && !isQualityGateEnforcementEnabled()) {
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

  const structurePackageId = resolveGenerationTemplatePackageId(input);
  const useV2Structure = structurePackageId
    ? await shouldUseV2StructureDuringGeneration(structurePackageId)
    : false;
  const generationInput: WebsiteGenerationInput = useV2Structure && structurePackageId
    ? {
        ...input,
        templateIntelligenceId: resolveTemplateIntelligenceForStructurePackage(
          input,
          structurePackageId,
        ),
        websiteStructureTemplateId:
          input.websiteStructureTemplateId?.trim() || structurePackageId,
      }
    : input;

  const assetManifest =
    options?.skipAssetGeneration && options.assetManifest
      ? options.assetManifest
      : await profilePlugin("image-generation", "generateWebsiteAssets", () =>
          generateWebsiteAssets({
            input: generationInput,
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
          }),
        );
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

  let files: GeneratedProjectFile[] = [];
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

  files = await runWebsiteFileLoop({
    input: generationInput,
    analysis,
    plan,
    ctx,
    assetSummary,
    files,
    aiFilePlans,
    generationProfile,
    minimalGeneration,
    ultraGeneration,
    localizedCopy,
    componentPaletteForCompose: useV2Structure ? undefined : componentPaletteForCompose,
    useV2Structure,
    reusePrevious,
    previousByPath,
    generateFile: (filePlan, existingFiles, extraValidationReason) =>
      generateFileWithValidation(
        generationInput,
        analysis,
        plan,
        plan.filePlans,
        existingFiles,
        filePlan,
        ctx,
        extraValidationReason,
        assetSummary,
      ),
  });

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
  const { resolveProductionContentWithIntelligence } = await import(
    "@/lib/ai-core/content-intelligence/resolve"
  );
  const { repairAccessibility } = await import(
    "@/lib/ai-core/accessibility/validate"
  );
  const { polishGeneratedProject } = await import(
    "@/lib/ai-core/content/polish-project"
  );
  const brandName =
    analysis.businessProfile?.projectName || analysis.projectName;
  const componentIds = plan.designSystem.componentPalette?.map(String);
  const homeComponentOrder = plan.designSystem.homeComponentOrder?.map(String);
  const themeArch = !useV2Structure && generationInput.templateIntelligenceId
    ? getThemePageArchitecture(generationInput.templateIntelligenceId)
    : !useV2Structure && generationInput.websiteThemeId
      ? getThemePageArchitecture(generationInput.websiteThemeId)
      : null;
  const excellenceShell =
    (plan.designSystem.sectionShellVariant as
      | import("@/lib/ai-core/components/scaffolds").SectionShellVariant
      | undefined) ?? null;
  const sectionShellVariant =
    themeArch?.sectionShellVariant ?? excellenceShell ?? null;
  const injectComponentIds = themeArch?.components.length
    ? themeArch.components.map(String)
    : componentIds;
  const injectHomeOrder = themeArch?.components.length
    ? themeArch.components.map(String)
    : homeComponentOrder;

  let templateVisualCss: string | null = null;
  if (!useV2Structure && generationInput.templateIntelligenceId) {
    const { getTemplateIntelligence } = await import(
      "@/lib/ai-core/template-intelligence/catalog"
    );
    const { buildTemplateVisualCss } = await import(
      "@/lib/ai-core/template-intelligence/visual-preset"
    );
    const ti = getTemplateIntelligence(generationInput.templateIntelligenceId);
    if (ti) templateVisualCss = buildTemplateVisualCss(ti);
  }

  let filesWithComponents: GeneratedProjectFile[];
  let productionContent: Awaited<
    ReturnType<typeof resolveProductionContentWithIntelligence>
  >["pack"] | null = null;
  let contentIntelligenceTrace: Awaited<
    ReturnType<typeof resolveProductionContentWithIntelligence>
  >["trace"] | null = null;

  if (useV2Structure) {
    const contentResolution = resolveProductionContentWithIntelligence({
      agencyContract: generationInput.agencyContract ?? null,
      brandName,
      language: generationInput.language,
      profile: analysis.businessProfile,
      strategy: plan.strategy,
      masterPlan: generationInput.masterWebsitePlan ?? null,
      businessProfile:
        generationInput.agencyContract?.businessIntelligence.profile ?? null,
    });
    productionContent = contentResolution.pack;
    contentIntelligenceTrace = contentResolution.trace;
    filesWithComponents = filesWithImages;
  } else if (localizedCopy) {
    filesWithComponents = injectProfessionalComponents({
      files: filesWithImages,
      composePage: false,
      language: generationInput.language,
    });
  } else {
    const contentResolution = resolveProductionContentWithIntelligence({
      agencyContract: generationInput.agencyContract ?? null,
      brandName,
      language: generationInput.language,
      profile: analysis.businessProfile,
      strategy: plan.strategy,
      masterPlan: generationInput.masterWebsitePlan ?? null,
      businessProfile:
        generationInput.agencyContract?.businessIntelligence.profile ?? null,
    });
    productionContent = contentResolution.pack;
    contentIntelligenceTrace = contentResolution.trace;

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
      componentIds: injectComponentIds,
      homeComponentOrder: injectHomeOrder,
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
      language: generationInput.language,
      templateIntelligenceId: generationInput.templateIntelligenceId,
      templateVisualCss,
      sectionShellVariant,
      websiteThemeId: themeArch?.themeId ?? null,
      pageTopology: themeArch?.pageTopology ?? null,
      floatingCta: themeArch?.floatingCta ?? false,
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
      language: generationInput.language,
      eliteColors: generationInput.agencyContract?.brandKit.colorPalette,
      spacingDensity: plan.designSystem.uiStyle?.density,
    });
  }

  ctx.progress.emit("Validating project...");

  let validatedFiles = await profilePlugin(
    "validation",
    "validateAndRepairProject",
    () =>
      validateAndRepairProject(
        generationInput,
        analysis,
        plan,
        plan.filePlans,
        filesWithComponents,
        ctx,
        assetSummary,
        minimalGeneration ? "fatal-only" : "full",
      ),
  );

  // Re-inject after validation repairs so LLM rewrites cannot drop site imagery.
  validatedFiles = injectAiImagesIntoProject({
    files: validatedFiles,
    assetManifest: coreManifest,
    industry: industryHint,
  });

  validatedFiles = repairAccessibility(validatedFiles);

  if (input.agencyContract?.brandKit.logos) {
    const { brandLogoReactComponent } = await import(
      "@/lib/ai-core/agency-brand-kit/logo-svg"
    );
    const logoPath = "components/brand-logo.tsx";
    if (!validatedFiles.some((f) => f.path === logoPath)) {
      validatedFiles.push({
        path: logoPath,
        content: brandLogoReactComponent(
          input.agencyContract.brandKit,
          {
            logoLight: input.agencyContract.brandKit.logos.light,
            logoDark: input.agencyContract.brandKit.logos.dark,
            monogram: input.agencyContract.brandKit.logos.monogram,
            favicon: input.agencyContract.brandKit.logos.favicon,
          },
        ),
        language: "typescript",
      });
    }
  }

  let qualityReport: QualityReport | undefined;
  let semanticContentQualityReport: SemanticContentQualityReport | undefined;
  let visualDesignQualityReport: VisualDesignQualityReport | undefined;
  let unifiedQualityReport: UnifiedQualityReport | undefined;
  let qualityDashboard: UnifiedQualityDashboardModel | undefined;
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
    semanticContentQualityReport = qualityResult.semanticContentQualityReport;
    visualDesignQualityReport = qualityResult.visualDesignQualityReport;
    unifiedQualityReport = qualityResult.unifiedQualityReport;
    qualityDashboard = qualityResult.qualityDashboard;
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
          generationInput,
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
        if (!useV2Structure && !localizedCopy && productionContent) {
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
            componentIds: injectComponentIds,
            homeComponentOrder: injectHomeOrder,
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
            language: generationInput.language,
            templateIntelligenceId: generationInput.templateIntelligenceId,
            sectionShellVariant,
            websiteThemeId: themeArch?.themeId ?? null,
            pageTopology: themeArch?.pageTopology ?? null,
            floatingCta: themeArch?.floatingCta ?? false,
          });
        } else if (!useV2Structure && localizedCopy) {
          validatedFiles = injectProfessionalComponents({
            files: validatedFiles,
            composePage: false,
            language: generationInput.language,
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

  let v2AppliedProject: GeneratedWebsiteProject | null = null;
  if (useV2Structure && structurePackageId) {
    ctx.progress.emit(
      `[v2] Applying structure template ${structurePackageId}…`,
    );
    v2AppliedProject = await applyV2StructureDuringGeneration({
      project: {
        projectKind: generationInput.projectKind,
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
        settings: {
          templateIntelligenceId: generationInput.templateIntelligenceId,
        } as GeneratedWebsiteProject["settings"],
      },
      templatePackageId: structurePackageId,
      language: generationInput.language,
    });
    validatedFiles = v2AppliedProject.files ?? validatedFiles;
  }

  const v2Settings = (v2AppliedProject?.settings ?? {}) as Record<string, unknown>;

  return {
    projectKind: generationInput.projectKind,
    title: v2AppliedProject?.title ?? (plan.blueprint.title || analysis.projectName),
    description: v2AppliedProject?.description ?? plan.blueprint.description,
    pages: v2AppliedProject?.pages ?? plan.blueprint.pages,
    sections: v2AppliedProject?.sections ?? plan.blueprint.sections,
    colorPalette: v2AppliedProject?.colorPalette ?? plan.blueprint.colorPalette,
    typography: v2AppliedProject?.typography ?? plan.blueprint.typography,
    components: v2AppliedProject?.components ?? plan.blueprint.components,
    content: v2AppliedProject?.content ?? localizedContent,
    seo: v2AppliedProject?.seo ?? plan.blueprint.seo,
    roadmap: v2AppliedProject?.roadmap ?? plan.blueprint.roadmap,
    files: validatedFiles,
    businessProfile: analysis.businessProfile,
    strategy: plan.strategy,
    designSystem: v2AppliedProject?.designSystem ?? plan.designSystem,
    assetManifest,
    qualityReport,
    semanticContentQualityReport,
    visualDesignQualityReport,
    unifiedQualityReport,
    qualityDashboard,
    agencyContract: generationInput.agencyContract,
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
      ...(generationInput.templateIntelligenceId
        ? { templateIntelligenceId: generationInput.templateIntelligenceId }
        : {}),
      ...(contentIntelligenceTrace
        ? { contentIntelligenceTrace }
        : {}),
      ...v2Settings,
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
}): Promise<
  UnifiedQualityPipelineResult & {
    semanticContentQualityReport?: SemanticContentQualityReport;
    visualDesignQualityReport?: VisualDesignQualityReport;
  }
> {
  const { input, analysis, plan, assetManifest, ctx } = params;
  const assetSummary = assetManifestForPrompt(assetManifest);

  const pipelineResult = await runUnifiedQualityPipeline({
    input,
    analysis,
    plan,
    files: params.files,
    assetManifest,
    ctx,
    skipImprove: params.skipImprove,
    improveFile: async (instruction, files) =>
      applyQualityImprovePass(
        input,
        analysis,
        plan,
        files,
        ctx,
        assetSummary,
        instruction,
      ),
  });

  const validatedFiles = injectAiImagesIntoProject({
    files: pipelineResult.files,
    assetManifest:
      assetManifest as import("@/lib/ai-core/layers/types").CoreAssetManifest,
    industry:
      analysis.businessProfile?.industry || plan.designSystem.industryPattern,
  });

  return {
    ...pipelineResult,
    files: validatedFiles,
    semanticContentQualityReport: pipelineResult.semanticContentQualityReport,
    visualDesignQualityReport: pipelineResult.visualDesignQualityReport,
  };
}

