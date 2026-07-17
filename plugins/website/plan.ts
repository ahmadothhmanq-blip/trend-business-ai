import type { ProjectCapabilityFlags } from "@/lib/ai/validator";
import { generateJsonWithValidation } from "@/lib/ai/generator";
import {
  inferCategoryFromPath,
  normalizeCategory,
  sortFilesByDependency,
  type PlannedFile,
} from "@/lib/ai/planner";
import {
  websiteBlueprintPrompt,
  websitePlanPrompt,
} from "@/lib/ai/prompts/website";
import { mergeProductionRequirements } from "@/lib/ai/validator";
import { capPlannedFiles, MAX_WEBSITE_FILES } from "@/lib/ai/website-scaffold";
import { sanitizeProjectPath } from "@/lib/ai/zipper";
import { buildWebsiteIterationPrompt } from "@/plugins/website/iteration";
import {
  validateWebsiteBlueprint,
  validateWebsiteDynamicPlan,
} from "@/plugins/website/pipeline-validate";
import {
  websiteBlueprintSchema,
  websiteDynamicPlanSchema,
} from "@/plugins/website/schemas";
import type {
  WebsiteGenerationInput,
  WebsitePlanResult,
  WebsiteProjectAnalysis,
  WebsiteProjectBlueprint,
  WebsiteDynamicPlan,
} from "@/plugins/website/types";
import type { GenerationContext } from "@/lib/ai/types";

export function getCapabilityFlags(
  analysis: WebsiteProjectAnalysis,
): ProjectCapabilityFlags {
  return {
    requiresAuth: analysis.requiresAuth,
    requiresDatabase: analysis.requiresDatabase,
    requiresDashboard: analysis.requiresDashboard,
    isEcommerce: analysis.isEcommerce,
    isSaas: analysis.isSaas,
    databaseProvider: analysis.databaseProvider,
  };
}

function normalizePlannedFiles(
  plan: WebsiteDynamicPlan,
  flags: ProjectCapabilityFlags,
): PlannedFile[] {
  const merged = mergeProductionRequirements(plan.files, flags).map((file) => {
    const path = sanitizeProjectPath(file.path);
    return {
      path,
      purpose: file.purpose,
      language: file.language,
      category: normalizeCategory(file.category || inferCategoryFromPath(path)),
    };
  });

  const byPath = new Map<string, PlannedFile>();
  for (const file of merged) {
    byPath.set(file.path, file);
  }

  const capped = capPlannedFiles([...byPath.values()], MAX_WEBSITE_FILES);
  return sortFilesByDependency(capped);
}

export async function planWebsite(
  input: WebsiteGenerationInput,
  analysis: WebsiteProjectAnalysis,
  ctx: GenerationContext,
): Promise<WebsitePlanResult> {
  const iterationInput = {
    ...input,
    prompt: buildWebsiteIterationPrompt(input),
  };

  ctx.progress.emit("Creating blueprint...");

  const blueprint = await generateJsonWithValidation<WebsiteProjectBlueprint>({
    provider: ctx.provider,
    prompt: websiteBlueprintPrompt(iterationInput, analysis),
    schema: websiteBlueprintSchema,
    maxAttempts: 3,
    validate: validateWebsiteBlueprint,
  });

  ctx.progress.emit("Planning files...");

  const dynamicPlan = await generateJsonWithValidation<WebsiteDynamicPlan>({
    provider: ctx.provider,
    prompt: websitePlanPrompt(iterationInput, analysis, blueprint),
    schema: websiteDynamicPlanSchema,
    maxAttempts: 3,
    validate: validateWebsiteDynamicPlan,
  });

  const flags = getCapabilityFlags(analysis);
  const filePlans = normalizePlannedFiles(
    {
      ...dynamicPlan,
      estimatedFileCount: Math.min(
        dynamicPlan.estimatedFileCount || MAX_WEBSITE_FILES,
        MAX_WEBSITE_FILES,
      ),
    },
    flags,
  );

  return {
    blueprint,
    dynamicPlan: {
      ...dynamicPlan,
      estimatedFileCount: filePlans.length,
      files: filePlans,
    },
    filePlans,
    flags,
  };
}
