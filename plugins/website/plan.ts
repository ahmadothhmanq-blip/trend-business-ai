import type { ProjectCapabilityFlags } from "@/lib/ai/validator";
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
import { sanitizeProjectPath } from "@/lib/ai/zipper";
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

  return sortFilesByDependency([...byPath.values()]);
}

export async function planWebsite(
  input: WebsiteGenerationInput,
  analysis: WebsiteProjectAnalysis,
  ctx: GenerationContext,
): Promise<WebsitePlanResult> {
  ctx.progress.emit("Creating blueprint...");

  const blueprint = await ctx.provider.generateJson<WebsiteProjectBlueprint>({
    prompt: websiteBlueprintPrompt(input, analysis),
    schema: websiteBlueprintSchema,
  });

  ctx.progress.emit("Planning files...");

  const dynamicPlan = await ctx.provider.generateJson<WebsiteDynamicPlan>({
    prompt: websitePlanPrompt(input, analysis, blueprint),
    schema: websiteDynamicPlanSchema,
  });

  const flags = getCapabilityFlags(analysis);
  const filePlans = normalizePlannedFiles(dynamicPlan, flags);

  return {
    blueprint,
    dynamicPlan,
    filePlans,
    flags,
  };
}
