import { generateWithValidation } from "@/lib/ai/generator";
import { truncateForContext, type PlannedFile } from "@/lib/ai/planner";
import {
  inferCategoryFromPath,
  normalizeCategory,
  sortFilesByDependency,
} from "@/lib/ai/planner";
import { websiteFilePrompt } from "@/lib/ai/prompts/website";
import {
  getProductionRequirements,
  validateGeneratedFileContent,
  validateGeneratedProject,
} from "@/lib/ai/validator";
import { sanitizeProjectPath } from "@/lib/ai/zipper";
import { generatedFileSchema } from "@/plugins/website/schemas";
import type {
  GeneratedProjectFile,
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

    if (targets.size === 0) {
      break;
    }

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
      `Generated project failed production validation:\n${finalValidation.issues.join("\n")}`,
    );
  }

  return currentFiles;
}

export async function generateWebsite(
  input: WebsiteGenerationInput,
  analysis: WebsiteProjectAnalysis,
  plan: WebsitePlanResult,
  ctx: GenerationContext,
) {
  ctx.progress.emit("Generating files...");

  const files: GeneratedProjectFile[] = [];
  for (const filePlan of plan.filePlans) {
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

// Remove unused generateSingleFile or use it - I'll remove the duplicate function in cleanup
