import { generateWithValidation } from "@/lib/ai/generator";
import { truncateForContext, type PlannedFile } from "@/lib/ai/planner";
import {
  inferCategoryFromPath,
  normalizeCategory,
  sortFilesByDependency,
} from "@/lib/ai/planner";
import { webappFilePrompt } from "@/lib/ai/prompts/webapp";
import {
  getProductionRequirements,
  validateGeneratedFileContent,
  validateGeneratedProject,
} from "@/lib/ai/validator";
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
const PROJECT_VALIDATION_ROUNDS = 2;

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
  return generateWithValidation({
    provider: ctx.provider,
    maxAttempts: FILE_GENERATION_RETRIES,
    prompt: webappFilePrompt({
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
    }),
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
) {
  let currentFiles = [...files];
  const planByPath = new Map(filePlans.map((entry) => [entry.path, entry]));

  for (let round = 0; round < PROJECT_VALIDATION_ROUNDS; round += 1) {
    const validation = validateGeneratedProject(currentFiles, plan.flags);
    if (validation.valid) {
      return currentFiles;
    }

    const targets = new Set(validation.filesToRegenerate);

    for (const missingPath of validation.issues
      .filter((issue) => issue.startsWith("Missing required production file:"))
      .map((issue) => issue.replace("Missing required production file: ", ""))) {
      targets.add(missingPath);
      if (!planByPath.has(missingPath)) {
        const requirement = getProductionRequirements(plan.flags).find(
          (file) => file.path === missingPath,
        );
        if (requirement) {
          const planned: PlannedFile = {
            path: requirement.path,
            purpose: requirement.purpose,
            language: requirement.language,
            category: normalizeCategory(
              requirement.category || inferCategoryFromPath(requirement.path),
            ),
          };
          planByPath.set(missingPath, planned);
          filePlans.push(planned);
        }
      }
    }

    if (targets.size === 0) break;

    const regenerated = new Map(currentFiles.map((file) => [file.path, file]));

    for (const targetPath of targets) {
      const filePlan = planByPath.get(targetPath);
      if (!filePlan) continue;

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
      );

      regenerated.set(targetPath, repaired);
    }

    currentFiles = sortFilesByDependency([...planByPath.values()])
      .map((entry) => regenerated.get(entry.path))
      .filter((file): file is GeneratedProjectFile => Boolean(file));
  }

  const finalValidation = validateGeneratedProject(currentFiles, plan.flags);
  if (!finalValidation.valid) {
    throw new Error(
      `Generated web app failed production validation:\n${finalValidation.issues.join("\n")}`,
    );
  }

  return currentFiles;
}

export async function generateWebApp(
  input: WebAppPluginInput,
  analysis: WebAppAnalysis,
  plan: WebAppPlanResult,
  ctx: GenerationContext,
) {
  ctx.progress.emit("Generating files...");

  const files: GeneratedProjectFile[] = [];
  for (const filePlan of plan.filePlans) {
    ctx.progress.emit(`Generating ${filePlan.path}...`);
    files.push(
      await generateFileWithValidation(
        input,
        analysis,
        plan,
        plan.filePlans,
        files,
        filePlan,
        ctx,
      ),
    );
  }

  ctx.progress.emit("Validating project...");

  const validatedFiles = await validateAndRepairProject(
    input,
    analysis,
    plan,
    plan.filePlans,
    files,
    ctx,
  );

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
    },
    appModel,
    appDesign: plan.appDesign,
    versionHistory,
  };
}
