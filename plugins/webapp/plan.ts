import type { ProjectCapabilityFlags } from "@/lib/ai/validator";
import {
  inferCategoryFromPath,
  normalizeCategory,
  sortFilesByDependency,
  type PlannedFile,
} from "@/lib/ai/planner";
import {
  webappBlueprintPrompt,
  webappPlanPrompt,
} from "@/lib/ai/prompts/webapp";
import { mergeProductionRequirements } from "@/lib/ai/validator";
import { sanitizeProjectPath } from "@/lib/ai/zipper";
import {
  webappBlueprintSchema,
  webappDynamicPlanSchema,
} from "@/plugins/webapp/schemas";
import type {
  WebAppPluginInput,
  WebAppAnalysis,
  WebAppBlueprint,
  WebAppDynamicPlan,
  WebAppPlanResult,
} from "@/plugins/webapp/types";
import type { GenerationContext } from "@/lib/ai/types";

export function getCapabilityFlags(
  analysis: WebAppAnalysis,
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
  plan: WebAppDynamicPlan,
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

export async function planWebApp(
  input: WebAppPluginInput,
  analysis: WebAppAnalysis,
  ctx: GenerationContext,
): Promise<WebAppPlanResult> {
  ctx.progress.emit("Creating blueprint...");

  const blueprint = await ctx.provider.generateJson<WebAppBlueprint>({
    prompt: webappBlueprintPrompt(input, analysis),
    schema: webappBlueprintSchema,
  });

  ctx.progress.emit("Planning files...");

  const dynamicPlan = await ctx.provider.generateJson<WebAppDynamicPlan>({
    prompt: webappPlanPrompt(input, analysis, blueprint),
    schema: webappDynamicPlanSchema,
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
