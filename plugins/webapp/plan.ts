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
import { runAppDesignEngine } from "@/lib/ai-core/app-design-platform/design-engine";

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
  ctx.progress.emit("Designing application...");

  // Structured App Design Engine — architecture before file generation.
  const designed = runAppDesignEngine({
    prompt: input.prompt,
    appType: input.appType || analysis.appType,
    language: input.language,
    designStyle: input.designStyle,
    colorStyle: input.colorStyle,
    features: input.features.length ? input.features : analysis.features,
    industryHint: analysis.appType,
  });

  // Prefer designed screen/entity names when AI blueprint is thin.
  const enrichedAnalysis: WebAppAnalysis = {
    ...analysis,
    pages:
      analysis.pages?.length >= 3
        ? analysis.pages
        : designed.model.screens.map((s) => s.name),
    features: Array.from(
      new Set([...(analysis.features || []), ...designed.blueprint.features]),
    ),
    databaseTables:
      analysis.databaseTables?.length >= 2
        ? analysis.databaseTables
        : designed.model.dataModels.map((m) => m.name),
  };

  ctx.progress.emit("Creating blueprint...");

  const blueprint = await ctx.provider.generateJson<WebAppBlueprint>({
    prompt: webappBlueprintPrompt(input, enrichedAnalysis),
    schema: webappBlueprintSchema,
  });

  // Merge design-engine screens into blueprint when AI omits structure.
  if (!blueprint.pages?.length) {
    blueprint.pages = designed.blueprint.screens;
  }
  if (!blueprint.dataModels?.length) {
    blueprint.dataModels = designed.blueprint.dataEntities;
  }
  if (!blueprint.navigation?.length) {
    blueprint.navigation = designed.blueprint.navigationFlow;
  }
  if (!blueprint.components?.length) {
    blueprint.components = designed.model.components
      .map((c) => c.type)
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 24);
  }

  ctx.progress.emit("Planning files...");

  const dynamicPlan = await ctx.provider.generateJson<WebAppDynamicPlan>({
    prompt: webappPlanPrompt(input, enrichedAnalysis, blueprint),
    schema: webappDynamicPlanSchema,
  });

  const flags = getCapabilityFlags(enrichedAnalysis);
  const filePlans = normalizePlannedFiles(dynamicPlan, flags);

  return {
    blueprint,
    dynamicPlan,
    filePlans,
    flags,
    appDesign: designed.blueprint,
    appModel: {
      ...designed.model,
      settings: {
        ...designed.model.settings,
        appName: blueprint.title || designed.model.settings.appName || analysis.appName,
      },
      brand: {
        ...designed.model.brand,
        businessName:
          blueprint.title || designed.model.brand.businessName || analysis.appName,
      },
    },
  };
}
