import { generateWithValidation } from "@/lib/ai/generator";
import { truncateForContext, type PlannedFile } from "@/lib/ai/planner";
import {
  inferCategoryFromPath,
  normalizeCategory,
  sortFilesByDependency,
} from "@/lib/ai/planner";
import { lpFilePrompt } from "@/lib/ai/prompts/landing-page";
import {
  getProductionRequirements,
  validateGeneratedFileContent,
  validateGeneratedProject,
} from "@/lib/ai/validator";
import { sanitizeProjectPath } from "@/lib/ai/zipper";
import { lpGeneratedFileSchema } from "@/plugins/landing-page/schemas";
import type {
  GeneratedProjectFile,
  LandingPagePluginInput,
  LPPlanResult,
  LPAnalysis,
} from "@/plugins/landing-page/types";
import type { GenerationContext } from "@/lib/ai/types";

const FILE_GENERATION_RETRIES = 3;
const PROJECT_VALIDATION_ROUNDS = 2;

async function generateFileWithValidation(
  input: LandingPagePluginInput,
  analysis: LPAnalysis,
  plan: LPPlanResult,
  filePlans: PlannedFile[],
  existingFiles: GeneratedProjectFile[],
  filePlan: PlannedFile,
  ctx: GenerationContext,
  extraValidationReason = "",
) {
  return generateWithValidation({
    provider: ctx.provider,
    maxAttempts: FILE_GENERATION_RETRIES,
    prompt: lpFilePrompt({
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
      projectTree: filePlans.map((f) => ({
        path: f.path,
        category: f.category,
        purpose: f.purpose,
      })),
      existingFiles: existingFiles.map((f) => ({
        path: f.path,
        language: f.language,
        content: truncateForContext(f.content),
      })),
      validationReason: extraValidationReason,
    }),
    schema: lpGeneratedFileSchema,
    validate: (result) => validateGeneratedFileContent(result, filePlan.path),
  }).then((file) => ({
    ...file,
    path: sanitizeProjectPath(filePlan.path),
    language: file.language || filePlan.language,
  }));
}

async function validateAndRepairProject(
  input: LandingPagePluginInput,
  analysis: LPAnalysis,
  plan: LPPlanResult,
  filePlans: PlannedFile[],
  files: GeneratedProjectFile[],
  ctx: GenerationContext,
) {
  let currentFiles = [...files];
  const planByPath = new Map(filePlans.map((e) => [e.path, e]));

  for (let round = 0; round < PROJECT_VALIDATION_ROUNDS; round += 1) {
    const validation = validateGeneratedProject(currentFiles, plan.flags);
    if (validation.valid) return currentFiles;

    const targets = new Set(validation.filesToRegenerate);

    for (const missingPath of validation.issues
      .filter((i) => i.startsWith("Missing required production file:"))
      .map((i) => i.replace("Missing required production file: ", ""))) {
      targets.add(missingPath);
      if (!planByPath.has(missingPath)) {
        const req = getProductionRequirements(plan.flags).find((f) => f.path === missingPath);
        if (req) {
          const planned: PlannedFile = {
            path: req.path,
            purpose: req.purpose,
            language: req.language,
            category: normalizeCategory(req.category || inferCategoryFromPath(req.path)),
          };
          planByPath.set(missingPath, planned);
          filePlans.push(planned);
        }
      }
    }

    if (targets.size === 0) break;

    const regenerated = new Map(currentFiles.map((f) => [f.path, f]));

    for (const targetPath of targets) {
      const filePlan = planByPath.get(targetPath);
      if (!filePlan) continue;

      const issues = validation.issues
        .filter((i) => i.startsWith(`${targetPath}:`) || i.includes(targetPath))
        .join("\n");

      const repaired = await generateFileWithValidation(
        input, analysis, plan,
        sortFilesByDependency([...planByPath.values()]),
        currentFiles.filter((f) => f.path !== targetPath),
        filePlan, ctx, issues,
      );
      regenerated.set(targetPath, repaired);
    }

    currentFiles = sortFilesByDependency([...planByPath.values()])
      .map((e) => regenerated.get(e.path))
      .filter((f): f is GeneratedProjectFile => Boolean(f));
  }

  const finalValidation = validateGeneratedProject(currentFiles, plan.flags);
  if (!finalValidation.valid) {
    throw new Error(
      `Landing page failed production validation:\n${finalValidation.issues.join("\n")}`,
    );
  }
  return currentFiles;
}

export async function generateLandingPage(
  input: LandingPagePluginInput,
  analysis: LPAnalysis,
  plan: LPPlanResult,
  ctx: GenerationContext,
) {
  ctx.progress.emit("Generating files...");

  const files: GeneratedProjectFile[] = [];
  for (const filePlan of plan.filePlans) {
    ctx.progress.emit(`Generating ${filePlan.path}...`);
    files.push(
      await generateFileWithValidation(input, analysis, plan, plan.filePlans, files, filePlan, ctx),
    );
  }

  ctx.progress.emit("Validating project...");

  const validatedFiles = await validateAndRepairProject(input, analysis, plan, plan.filePlans, files, ctx);

  const sectionList = plan.blueprint.sections.map((name) => ({
    name,
    description: name,
  }));

  return {
    title: plan.blueprint.title || analysis.pageName,
    description: plan.blueprint.description,
    pageType: input.pageType,
    framework: "Next.js App Router",
    sections: sectionList,
    files: validatedFiles,
    settings: {
      framework: "Next.js App Router",
      styling: "Tailwind CSS",
      packageManager: "npm",
      deploymentTarget: "Vercel or Node hosting",
      complexity: plan.dynamicPlan.complexity,
      estimatedFileCount: String(validatedFiles.length),
      requiresAuth: "false",
      requiresDatabase: "false",
      requiresDashboard: "false",
      isEcommerce: "false",
      isSaas: "false",
      databaseProvider: "none",
    },
  };
}
