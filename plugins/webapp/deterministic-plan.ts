import {
  inferCategoryFromPath,
  normalizeCategory,
  type PlannedFile,
} from "@/lib/ai/planner";
import {
  getWebAppRequirementGroups,
} from "@/lib/ai/webapp-requirements";
import type { ProjectCapabilityFlags } from "@/lib/ai/validator";
import type {
  WebAppAnalysis,
  WebAppBlueprint,
  WebAppDynamicPlan,
  WebAppPluginInput,
  WebAppUnifiedPlanning,
} from "@/plugins/webapp/types";

function capabilityFlags(analysis: WebAppAnalysis): ProjectCapabilityFlags {
  return {
    requiresAuth: analysis.requiresAuth,
    requiresDatabase: analysis.requiresDatabase,
    requiresDashboard: analysis.requiresDashboard,
    isEcommerce: analysis.isEcommerce,
    isSaas: analysis.isSaas,
    databaseProvider: analysis.databaseProvider,
  };
}

function envTruthy(name: string): boolean {
  const value = process.env[name];
  return value === "1" || value === "true";
}

/**
 * Fast Stage-2 path: skip DeepSeek by default.
 * Force LLM only with WEBAPP_FORCE_LLM_PLANNING=1.
 * Disable skip with WEBAPP_DETERMINISTIC_PLANNING=0.
 */
export function isWebAppDeterministicPlanningEnabled(): boolean {
  if (envTruthy("WEBAPP_FORCE_LLM_PLANNING")) return false;
  const raw = process.env.WEBAPP_DETERMINISTIC_PLANNING;
  if (raw === "0" || raw === "false") return false;
  return true;
}

/** Strategy never calls DeepSeek unless forced — local plan is always sufficient. */
export function canSkipStage2Llm(
  _input: WebAppPluginInput,
  _analysis: WebAppAnalysis,
): boolean {
  return isWebAppDeterministicPlanningEnabled();
}

export function buildDeterministicFilePlans(
  analysis: WebAppAnalysis,
): PlannedFile[] {
  const flags = capabilityFlags(analysis);
  return getWebAppRequirementGroups(flags, analysis.databaseTables).map(
    (group) => ({
      path: group.preferred,
      purpose: group.purpose,
      language: group.language,
      category: normalizeCategory(
        group.category || inferCategoryFromPath(group.preferred),
      ),
    }),
  );
}

export function buildDeterministicUnifiedPlanning(args: {
  analysis: WebAppAnalysis;
  blueprint: WebAppBlueprint;
  filePlans: PlannedFile[];
}): WebAppUnifiedPlanning {
  const { analysis, blueprint, filePlans } = args;
  const dynamicPlan: WebAppDynamicPlan = {
    complexity: analysis.complexity,
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

  return {
    analysis,
    strategy: {
      positioning: `${analysis.appName} — ${analysis.appType}`,
      pages: blueprint.pages,
      sections: blueprint.sections,
      ctas: ["Get started", "Sign in"],
      seoFocus: [analysis.appName, analysis.appType],
    },
    universalBlueprint: {
      intentSummary: analysis.appName,
      goals: analysis.features.slice(0, 6),
      constraints: ["Next.js App Router", "TypeScript", "Prisma"],
      orderedServices: ["app-builder"],
      selectedServiceId: "app-builder",
    },
    databaseSchema: {
      provider: analysis.databaseProvider,
      tables: analysis.databaseTables.map((name) => ({
        name,
        fields: ["id", "createdAt", "updatedAt"],
      })),
    },
    apiPlan: {
      routes: blueprint.apiRoutes.map((path) => ({
        path,
        methods: ["GET", "POST", "PUT", "DELETE"],
        purpose: `API ${path}`,
      })),
    },
    uiPlan: {
      layouts: dynamicPlan.layouts,
      pages: blueprint.pages,
      components: blueprint.components,
      navigation: blueprint.navigation,
      theme: blueprint.theme,
    },
    filePlan: dynamicPlan,
    servicePlan: {
      services: ["app-builder"],
      integrations: analysis.requiresDatabase ? ["prisma"] : [],
      authProvider: analysis.requiresAuth ? "cookie-session" : "none",
    },
    dependencies: {
      npm: ["next", "react", "react-dom", "zod"],
      devNpm: ["typescript", "eslint", "eslint-config-next"],
    },
    executionMetadata: {
      complexity: analysis.complexity,
      estimatedFileCount: filePlans.length,
      generationMode: "deterministic-skip",
      notes: ["Stage 2 DeepSeek skipped — local planning"],
    },
    blueprint,
  };
}

export function buildDeterministicBlueprint(
  analysis: WebAppAnalysis,
  designedPages: string[],
  designedModels: string[],
): WebAppBlueprint {
  const pages =
    analysis.pages.length >= 3 ? analysis.pages : designedPages.length ? designedPages : analysis.pages;
  const models =
    analysis.databaseTables.length >= 1
      ? analysis.databaseTables
      : designedModels;

  const apiRoutes = models
    .filter((name) => {
      const n = name.toLowerCase();
      return !["user", "users", "account", "session"].includes(n);
    })
    .slice(0, 4)
    .map((name) => {
      const base = name
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .toLowerCase();
      const slug = base.endsWith("s") ? base : `${base}s`;
      return `/api/${slug}`;
    });

  return {
    title: analysis.appName,
    description: `${analysis.appName} — ${analysis.appType} application`,
    pages,
    sections: ["hero", "features", "dashboard"],
    dataModels: models,
    apiRoutes,
    components: ["Button", "Card", "Table", "Input", "Badge"],
    navigation: pages,
    theme: ["professional", "modern"],
    roadmap: ["scaffold", "generate", "validate"],
  };
}
