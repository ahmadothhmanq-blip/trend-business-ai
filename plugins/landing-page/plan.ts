import type { ProjectCapabilityFlags } from "@/lib/ai/validator";
import {
  inferCategoryFromPath,
  normalizeCategory,
  sortFilesByDependency,
  type PlannedFile,
} from "@/lib/ai/planner";
import { lpBlueprintPrompt, lpPlanPrompt } from "@/lib/ai/prompts/landing-page";
import { mergeProductionRequirements } from "@/lib/ai/validator";
import { sanitizeProjectPath } from "@/lib/ai/zipper";
import { lpBlueprintSchema, lpDynamicPlanSchema } from "@/plugins/landing-page/schemas";
import type {
  LandingPagePluginInput,
  LPAnalysis,
  LPBlueprint,
  LPDynamicPlan,
  LPPlanResult,
} from "@/plugins/landing-page/types";
import type { GenerationContext } from "@/lib/ai/types";

function getCapabilityFlags(analysis: LPAnalysis): ProjectCapabilityFlags {
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
  plan: LPDynamicPlan,
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
  for (const file of merged) byPath.set(file.path, file);
  return sortFilesByDependency([...byPath.values()]);
}

export async function planLandingPage(
  input: LandingPagePluginInput,
  analysis: LPAnalysis,
  ctx: GenerationContext,
): Promise<LPPlanResult> {
  ctx.progress.emit("Creating blueprint...");

  const blueprint = await ctx.provider.generateJson<LPBlueprint>({
    prompt: lpBlueprintPrompt(input, analysis),
    schema: lpBlueprintSchema,
  });

  ctx.progress.emit("Planning files...");

  const dynamicPlan = await ctx.provider.generateJson<LPDynamicPlan>({
    prompt: lpPlanPrompt(input, analysis, blueprint),
    schema: lpDynamicPlanSchema,
  });

  const flags = getCapabilityFlags(analysis);
  const filePlans = normalizePlannedFiles(dynamicPlan, flags);

  return { blueprint, dynamicPlan, filePlans, flags };
}
