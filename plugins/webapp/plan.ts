import type { ProjectCapabilityFlags } from "@/lib/ai/validator";
import {
  inferCategoryFromPath,
  normalizeCategory,
  sortFilesByDependency,
  type PlannedFile,
} from "@/lib/ai/planner";
import { webappUnifiedPlanningPrompt } from "@/lib/ai/prompts/webapp";
import { mergeWebAppProductionRequirements } from "@/lib/ai/webapp-requirements";
import { resolveWebAppEntityTables } from "@/lib/ai/webapp-entity-tables";
import { sanitizeProjectPath } from "@/lib/ai/zipper";
import { recordAppBuilderPlanningMetrics } from "@/lib/webapp/planning-metrics";
import { getActiveAppBuilderPipelineProfiler } from "@/lib/webapp/pipeline-profiler";
import { getActiveAppBuilderTiming } from "@/lib/webapp/stage-timing-context";
import { normalizeWebAppAnalysis } from "@/plugins/webapp/analyze";
import {
  buildDeterministicBlueprint,
  buildDeterministicFilePlans,
  buildDeterministicUnifiedPlanning,
  canSkipStage2Llm,
} from "@/plugins/webapp/deterministic-plan";
import { webappUnifiedPlanningSchema } from "@/plugins/webapp/schemas";
import type {
  WebAppPluginInput,
  WebAppAnalysis,
  WebAppBlueprint,
  WebAppDynamicPlan,
  WebAppPlanResult,
  WebAppUnifiedPlanning,
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
  tables: string[],
): PlannedFile[] {
  const merged = mergeWebAppProductionRequirements(
    plan.files,
    flags,
    tables,
  ).map((file) => {
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

function compactUniversalPlannerContext(input: WebAppPluginInput): unknown {
  const blueprint = input.universalPlannerBlueprint;
  const appPlan = input.universalPlannerAppPlan;
  if (!blueprint && !appPlan) {
    return { enabled: Boolean(input.universalPlannerEnabled) };
  }

  return {
    enabled: Boolean(input.universalPlannerEnabled),
    traceRef: input.universalPlannerTraceRef ?? null,
    industry: blueprint?.industry ?? null,
    intent: blueprint?.intent ?? null,
    requirements: blueprint?.requirements ?? null,
    executionPlan: blueprint?.executionPlan ?? null,
    selectedServiceId: blueprint?.selectedServiceId ?? "app-builder",
    appServicePlan: appPlan
      ? {
          serviceId: appPlan.serviceId,
          supported: appPlan.supported,
          serviceBlueprint: appPlan.serviceBlueprint,
          note: appPlan.note ?? null,
        }
      : null,
  };
}

function mergeBlueprintWithDesign(
  blueprint: WebAppBlueprint,
  designed: ReturnType<typeof runAppDesignEngine>,
): WebAppBlueprint {
  const next = { ...blueprint };
  if (!next.pages?.length) next.pages = designed.blueprint.screens;
  if (!next.dataModels?.length) next.dataModels = designed.blueprint.dataEntities;
  if (!next.navigation?.length) {
    next.navigation = designed.blueprint.navigationFlow;
  }
  if (!next.components?.length) {
    next.components = designed.model.components
      .map((c) => c.type)
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 24);
  }
  return next;
}

/**
 * Stage 2 (strategy) — prefer deterministic local planning (0 DeepSeek).
 * Falls back to ONE DeepSeek unified planning request when forced or incomplete.
 */
export async function planWebApp(
  input: WebAppPluginInput,
  analysis: WebAppAnalysis,
  ctx: GenerationContext,
): Promise<WebAppPlanResult> {
  const timing = getActiveAppBuilderTiming();
  const pipeline = getActiveAppBuilderPipelineProfiler();
  timing?.beginStage("strategy", "planWebApp");
  const planningStartedAt = Date.now();

  ctx.progress.emit("Designing application...");

  timing?.setWaitingFor("design_engine", "runAppDesignEngine");
  const designed = runAppDesignEngine({
    prompt: input.prompt,
    appType: input.appType || analysis.appType,
    language: input.language,
    designStyle: input.designStyle,
    colorStyle: input.colorStyle,
    features: input.features.length ? input.features : analysis.features,
    industryHint: analysis.appType,
  });
  timing?.setWaitingFor("idle", "runAppDesignEngine complete");

  const seedAnalysis: WebAppAnalysis = {
    ...analysis,
    pages:
      analysis.pages?.length >= 2
        ? analysis.pages
        : designed.model.screens.map((s) => s.name).length >= 2
          ? designed.model.screens.map((s) => s.name)
          : ["Home", "Login", "Dashboard"],
    features: Array.from(
      new Set([...(analysis.features || []), ...designed.blueprint.features]),
    ),
    databaseTables: resolveWebAppEntityTables({
      analysisTables: analysis.databaseTables,
      appModelTables: designed.model.dataModels.map((m) => m.name),
      blueprintModels: designed.blueprint.dataEntities,
    }),
  };

  // Default: never block strategy on DeepSeek.
  if (canSkipStage2Llm(input, seedAnalysis)) {
    pipeline?.start("planning", { mode: "deterministic-skip" });
    ctx.progress.emit("Building local plan (skipping DeepSeek)...");
    timing?.setWaitingFor("idle", "deterministic Stage 2 (no LLM)");

    const refinedAnalysis = normalizeWebAppAnalysis(seedAnalysis);
    const blueprint = mergeBlueprintWithDesign(
      buildDeterministicBlueprint(
        refinedAnalysis,
        designed.blueprint.screens,
        designed.model.dataModels.map((m) => m.name),
      ),
      designed,
    );
    const filePlans = normalizePlannedFiles(
      {
        complexity: refinedAnalysis.complexity,
        estimatedFileCount: 0,
        layouts: ["app/layout.tsx"],
        pages: blueprint.pages,
        components: blueprint.components,
        apiRoutes: blueprint.apiRoutes,
        hooks: [],
        utilities: [],
        types: [],
        configs: [],
        files: buildDeterministicFilePlans(refinedAnalysis),
      },
      getCapabilityFlags(refinedAnalysis),
      refinedAnalysis.databaseTables,
    );
    const dynamicPlan: WebAppDynamicPlan = {
      complexity: refinedAnalysis.complexity,
      estimatedFileCount: filePlans.length,
      layouts: ["app/layout.tsx"],
      pages: blueprint.pages,
      components: blueprint.components,
      apiRoutes: blueprint.apiRoutes,
      hooks: [],
      utilities: ["lib/utils.ts"],
      types: [],
      configs: filePlans.filter((f) => f.category === "configs").map((f) => f.path),
      files: filePlans,
    };
    const unifiedPlanning = buildDeterministicUnifiedPlanning({
      analysis: refinedAnalysis,
      blueprint,
      filePlans,
    });

    recordAppBuilderPlanningMetrics({
      totalPlanningMs: Date.now() - planningStartedAt,
      llmRequestCount: 0,
      promptChars: 0,
      responseChars: 0,
      mode: "deterministic-skip",
    });
    pipeline?.end("planning", {
      mode: "deterministic-skip",
      llmRequestCount: 0,
      totalPlanningMs: Date.now() - planningStartedAt,
    });
    timing?.endStage("strategy");

    return {
      blueprint,
      dynamicPlan,
      filePlans,
      flags: getCapabilityFlags(refinedAnalysis),
      unifiedPlanning,
      refinedAnalysis,
      appDesign: designed.blueprint,
      appModel: {
        ...designed.model,
        settings: {
          ...designed.model.settings,
          appName:
            blueprint.title ||
            refinedAnalysis.appName ||
            designed.model.settings.appName ||
            analysis.appName,
        },
        brand: {
          ...designed.model.brand,
          businessName:
            blueprint.title ||
            refinedAnalysis.appName ||
            designed.model.brand.businessName ||
            analysis.appName,
        },
      },
    };
  }

  pipeline?.start("planning", { mode: "unified-single-llm" });
  ctx.progress.emit("Creating unified plan...");

  const designSeed = {
    screens: designed.blueprint.screens,
    dataEntities: designed.blueprint.dataEntities,
    navigationFlow: designed.blueprint.navigationFlow,
    features: designed.blueprint.features,
    componentTypes: designed.model.components.map((c) => c.type).slice(0, 24),
  };

  const prompt = webappUnifiedPlanningPrompt({
    input,
    seedAnalysis,
    designSeed,
    universalPlannerContext: compactUniversalPlannerContext(input),
  });

  timing?.setWaitingFor("llm_response", "webappUnifiedPlanning generateJson");
  const unified = await ctx.provider.generateJson<WebAppUnifiedPlanning>({
    prompt,
    schema: webappUnifiedPlanningSchema,
  });
  timing?.setWaitingFor("idle", "unified planning LLM complete");

  const promptChars = prompt.length;
  const responseChars = JSON.stringify(unified).length;
  recordAppBuilderPlanningMetrics({
    totalPlanningMs: Date.now() - planningStartedAt,
    llmRequestCount: 1,
    promptChars,
    responseChars,
    mode: "unified-single-llm",
  });
  pipeline?.end("planning", {
    mode: "unified-single-llm",
    llmRequestCount: 1,
    promptChars,
    responseChars,
    totalPlanningMs: Date.now() - planningStartedAt,
  });

  const refinedAnalysis = normalizeWebAppAnalysis({
    ...seedAnalysis,
    ...unified.analysis,
    pages:
      unified.analysis.pages?.length >= 3
        ? unified.analysis.pages
        : seedAnalysis.pages,
    databaseTables: resolveWebAppEntityTables({
      analysisTables:
        unified.analysis.databaseTables?.length >= 1
          ? unified.analysis.databaseTables
          : unified.databaseSchema.tables.map((t) => t.name),
      appModelTables: designed.model.dataModels.map((m) => m.name),
      blueprintModels: designed.blueprint.dataEntities,
    }),
    apiEndpoints:
      unified.analysis.apiEndpoints?.length >= 1
        ? unified.analysis.apiEndpoints
        : unified.apiPlan.routes.map((r) => r.path),
  });

  let blueprint = mergeBlueprintWithDesign(unified.blueprint, designed);
  if (!blueprint.pages?.length && unified.strategy.pages.length) {
    blueprint = { ...blueprint, pages: unified.strategy.pages };
  }
  if (!blueprint.sections?.length && unified.strategy.sections.length) {
    blueprint = { ...blueprint, sections: unified.strategy.sections };
  }
  if (
    !blueprint.dataModels?.length &&
    unified.databaseSchema.tables.length
  ) {
    blueprint = {
      ...blueprint,
      dataModels: unified.databaseSchema.tables.map((t) => t.name),
    };
  }
  if (!blueprint.apiRoutes?.length && unified.apiPlan.routes.length) {
    blueprint = {
      ...blueprint,
      apiRoutes: unified.apiPlan.routes.map((r) => r.path),
    };
  }
  if (!blueprint.components?.length && unified.uiPlan.components.length) {
    blueprint = { ...blueprint, components: unified.uiPlan.components };
  }
  if (!blueprint.navigation?.length && unified.uiPlan.navigation.length) {
    blueprint = { ...blueprint, navigation: unified.uiPlan.navigation };
  }

  const dynamicPlan: WebAppDynamicPlan = {
    ...unified.filePlan,
    complexity:
      unified.filePlan.complexity ||
      unified.executionMetadata.complexity ||
      refinedAnalysis.complexity,
    estimatedFileCount:
      unified.filePlan.estimatedFileCount ||
      unified.executionMetadata.estimatedFileCount ||
      unified.filePlan.files?.length ||
      18,
  };

  const flags = getCapabilityFlags(refinedAnalysis);
  const filePlans = normalizePlannedFiles(
    dynamicPlan,
    flags,
    refinedAnalysis.databaseTables,
  );

  timing?.endStage("strategy");

  return {
    blueprint,
    dynamicPlan,
    filePlans,
    flags,
    unifiedPlanning: unified,
    refinedAnalysis,
    appDesign: designed.blueprint,
    appModel: {
      ...designed.model,
      settings: {
        ...designed.model.settings,
        appName:
          blueprint.title ||
          refinedAnalysis.appName ||
          designed.model.settings.appName ||
          analysis.appName,
      },
      brand: {
        ...designed.model.brand,
        businessName:
          blueprint.title ||
          refinedAnalysis.appName ||
          designed.model.brand.businessName ||
          analysis.appName,
      },
    },
  };
}
