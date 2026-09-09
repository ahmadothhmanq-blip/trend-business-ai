import { generateWithValidation } from "@/lib/ai/generator";
import { type PlannedFile } from "@/lib/ai/planner";
import { resolvePromptContext } from "@/lib/ai-core/context-engine";
import { assemblePrompt } from "@/lib/ai-core/prompt-engine";
import {
  LlmConcurrencyGate,
  resolveLlmConcurrencyCap,
} from "@/lib/ai-core/file-generation";
import { webappFilePrompt } from "@/lib/ai/prompts/webapp";
import { validateGeneratedFileContent } from "@/lib/ai/validator";
import { mergeWebAppProductionRequirements } from "@/lib/ai/webapp-requirements";
import {
  entityTablesFromAppModel,
  resolveWebAppEntityTables,
} from "@/lib/ai/webapp-entity-tables";
import {
  buildWebAppScaffold,
  groupWebAppFilesIntoWaves,
} from "@/lib/ai/webapp-scaffold";
import { validateAndRepairWebAppProject } from "@/lib/ai/webapp-repair-pipeline";
import {
  getActiveAppBuilderPipelineProfiler,
  timedHardener,
} from "@/lib/webapp/pipeline-profiler";
import { resetUiRepairMetrics } from "@/lib/webapp/ui-repair-metrics";
import { hardenGeneratedWebApp } from "@/lib/ai/webapp-harden";
import { isHostPlatformFilePath } from "@/lib/ai/webapp-isolation";
import { sanitizeProjectPath } from "@/lib/ai/zipper";
import { webappGeneratedFileSchema } from "@/plugins/webapp/schemas";
import type {
  GeneratedProjectFile,
  WebAppPluginInput,
  WebAppPlanResult,
  WebAppAnalysis,
} from "@/plugins/webapp/types";
import type { GenerationContext } from "@/lib/ai/types";
import {
  emptyVersionHistory,
  saveAppVersion,
} from "@/lib/ai-core/app-design-platform/versions";
import { runAppDesignEngine } from "@/lib/ai-core/app-design-platform/design-engine";

const FILE_GENERATION_RETRIES = 3;

function resolveGenerationEntityTables(
  analysis: WebAppAnalysis,
  plan: WebAppPlanResult,
): string[] {
  return resolveWebAppEntityTables({
    analysisTables: analysis.databaseTables,
    appModelTables: entityTablesFromAppModel(plan.appModel),
    blueprintModels: plan.blueprint?.dataModels,
  });
}

async function generateFileWithValidation(
  input: WebAppPluginInput,
  analysis: WebAppAnalysis,
  plan: WebAppPlanResult,
  filePlans: PlannedFile[],
  existingFiles: GeneratedProjectFile[],
  filePlan: PlannedFile,
  ctx: GenerationContext,
  extraValidationReason = "",
) {
  const { promptFiles } = resolvePromptContext({
    targetPath: filePlan.path,
    targetCategory: filePlan.category,
    availableFiles: existingFiles,
    filePlans,
    productId: "webapp",
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
      filePlan,
      productId: "webapp",
    },
    (compacted) =>
      webappFilePrompt({
        input,
        analysis: compacted.analysis,
        blueprint: compacted.blueprint,
        dynamicPlan: compacted.dynamicPlan,
        filePlan,
        projectTree: compacted.projectTree,
        existingFiles: promptFiles,
        validationReason: extraValidationReason,
        unifiedPlanning: plan.unifiedPlanning,
      }),
  );

  return generateWithValidation<GeneratedProjectFile>({
    provider: ctx.provider,
    maxAttempts: FILE_GENERATION_RETRIES,
    prompt,
    schema: webappGeneratedFileSchema,
    validate: (result) => validateGeneratedFileContent(result, filePlan.path),
  }).then((file) => ({
    ...file,
    path: sanitizeProjectPath(filePlan.path),
    language: file.language || filePlan.language,
  }));
}

async function validateAndRepairProject(
  input: WebAppPluginInput,
  analysis: WebAppAnalysis,
  plan: WebAppPlanResult,
  filePlans: PlannedFile[],
  files: GeneratedProjectFile[],
  ctx: GenerationContext,
  aiFileCount: number,
) {
  const entityTables = resolveGenerationEntityTables(analysis, plan);
  return validateAndRepairWebAppProject({
    aiFileCount,
    analysis,
    plan,
    filePlans,
    files,
    flags: plan.flags,
    tablesForValidation: entityTables,
    scaffoldOptions: {
      projectName: plan.blueprint.title || analysis.appName,
      language: input.language,
      requiresAuth: Boolean(analysis.requiresAuth),
      requiresDatabase: Boolean(analysis.requiresDatabase),
      requiresDashboard: Boolean(analysis.requiresDashboard),
      tables: entityTables,
      dataModels: plan.appModel?.dataModels,
    },
    repairFileWithLlm:
      aiFileCount > 0
        ? async ({
            filePlan,
            filePlans: repairPlans,
            existingFilesWithoutTarget,
            projectIssues,
          }) =>
            generateFileWithValidation(
              input,
              analysis,
              plan,
              repairPlans,
              existingFilesWithoutTarget,
              filePlan,
              ctx,
              projectIssues,
            )
        : undefined,
  });
}

export async function generateWebApp(
  input: WebAppPluginInput,
  analysis: WebAppAnalysis,
  plan: WebAppPlanResult,
  ctx: GenerationContext,
) {
  resetUiRepairMetrics();
  ctx.progress.emit("Generating files...");

  plan.filePlans = plan.filePlans.filter(
    (filePlan) => !isHostPlatformFilePath(filePlan.path),
  );

  // Single source of truth: design/appModel tables must drive scaffold + validation.
  const entityTables = resolveGenerationEntityTables(analysis, plan);
  analysis.databaseTables = entityTables;
  plan.filePlans = mergeWebAppProductionRequirements(
    plan.filePlans,
    plan.flags,
    entityTables,
  );

  const scaffold = buildWebAppScaffold({
    projectName: plan.blueprint.title || analysis.appName,
    language: input.language,
    requiresAuth: Boolean(analysis.requiresAuth),
    requiresDatabase: Boolean(analysis.requiresDatabase),
    requiresDashboard: Boolean(analysis.requiresDashboard),
    tables: entityTables,
    dataModels: plan.appModel?.dataModels,
    templateId: plan.appModel?.templateId,
  });
  const scaffoldByPath = new Map(scaffold.map((file) => [file.path, file]));

  const files: GeneratedProjectFile[] = [];
  for (const planned of plan.filePlans) {
    const scaffoldFile = scaffoldByPath.get(planned.path);
    if (scaffoldFile) files.push(scaffoldFile);
  }

  // Always keep core toolchain scaffolds even if the planner omitted a path.
  for (const scaffoldFile of scaffold) {
    if (!files.some((file) => file.path === scaffoldFile.path)) {
      files.push(scaffoldFile);
    }
  }

  const aiFilePlans = plan.filePlans.filter(
    (filePlan) => !scaffoldByPath.has(filePlan.path),
  );

  ctx.progress.emit(
    `Scaffolded ${files.length} toolchain files · generating ${aiFilePlans.length} app files…`,
  );

  const pipeline = getActiveAppBuilderPipelineProfiler();
  const fileGenStarted = Date.now();
  pipeline?.start("file-generation", { aiFileCount: aiFilePlans.length });

  const gate = new LlmConcurrencyGate({
    maxConcurrency: resolveLlmConcurrencyCap(),
  });
  const waves = groupWebAppFilesIntoWaves(aiFilePlans);
  let generatedCount = 0;

  for (const wave of waves) {
    const snapshot = [...files];
    const waveResults = await Promise.all(
      wave.map((filePlan) =>
        gate.run(async () => {
          generatedCount += 1;
          pipeline?.markFileGenLlmCall();
          ctx.progress.emit(
            `Generating ${generatedCount}/${aiFilePlans.length}: ${filePlan.path}`,
          );
          return generateFileWithValidation(
            input,
            analysis,
            plan,
            plan.filePlans,
            snapshot,
            filePlan,
            ctx,
          );
        }),
      ),
    );
    files.push(...waveResults);
  }

  pipeline?.end("file-generation", {
    aiFileCount: aiFilePlans.length,
    durationMs: Date.now() - fileGenStarted,
  });

  ctx.progress.emit("Validating project...");

  const repaired = await validateAndRepairProject(
    input,
    analysis,
    plan,
    plan.filePlans,
    timedHardener(() => hardenGeneratedWebApp(files)),
    ctx,
    aiFilePlans.length,
  );
  const validatedFiles = timedHardener(() => hardenGeneratedWebApp(repaired));
  pipeline?.flushNestedPostGenerationStages();

  const pageList =
    plan.appModel?.screens.map((s) => ({
      name: s.name,
      path: s.path,
      description: s.purpose,
    })) ??
    plan.blueprint.pages.map((pageName, idx) => ({
      name: pageName,
      path:
        plan.dynamicPlan.pages[idx] ??
        `/${pageName.toLowerCase().replace(/\s+/g, "-")}`,
      description: pageName,
    }));

  const appModel =
    plan.appModel ??
    runAppDesignEngine({
      prompt: input.prompt,
      appType: input.appType,
      language: input.language,
      designStyle: input.designStyle,
      colorStyle: input.colorStyle,
      features: input.features,
      templateId: input.templateId,
    }).model;

  const versionHistory = saveAppVersion(
    emptyVersionHistory(),
    appModel,
    "Initial generation",
  );

  return {
    title: plan.blueprint.title || analysis.appName,
    description: plan.blueprint.description,
    appType: input.appType,
    framework: "Next.js App Router",
    pages: pageList,
    files: validatedFiles,
    settings: {
      framework: "Next.js App Router",
      styling: "Tailwind CSS",
      database: "Prisma",
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
      templateId: appModel.templateId,
      architecture: appModel.architecture,
      trustReady: "true",
      publicHostPath: "/w/app/[slug]",
      livePreviewPath: "/api/webapp-builder/[id]/live-preview",
    },
    appModel,
    appDesign: plan.appDesign,
    versionHistory,
  };
}
