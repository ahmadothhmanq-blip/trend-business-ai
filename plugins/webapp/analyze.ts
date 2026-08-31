import type { ProjectCapabilityFlags } from "@/lib/ai/validator";
import { WEBAPP_TYPES } from "@/lib/constants/webapp-builder";
import type { WebAppPluginInput, WebAppAnalysis } from "@/plugins/webapp/types";
import type { GenerationContext } from "@/lib/ai/types";

function normalizeDatabaseProvider(
  value: string,
): ProjectCapabilityFlags["databaseProvider"] {
  const provider = value.toLowerCase().trim();
  if (provider.includes("prisma")) return "prisma";
  if (provider.includes("supabase")) return "supabase";
  return "none";
}

function normalizeComplexity(
  value: string,
): WebAppAnalysis["complexity"] {
  const c = value.toLowerCase().trim();
  if (c === "simple") return "simple";
  if (c === "complex") return "complex";
  return "moderate";
}

function titleCaseAppName(prompt: string, appType: string): string {
  const def = WEBAPP_TYPES.find((t) => t.id === appType);
  const fromPrompt = prompt
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .trim()
    .split(/\s+/)
    .slice(0, 4)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
  if (fromPrompt.length >= 3) return fromPrompt;
  return `${def?.label ?? appType} App`;
}

function deriveTablesFromPlanner(input: WebAppPluginInput): string[] {
  const fromBlueprint = input.universalPlannerBlueprint?.requirements?.database?.entities;
  if (Array.isArray(fromBlueprint) && fromBlueprint.length > 0) {
    return fromBlueprint.map(String);
  }
  const serviceBp = input.universalPlannerAppPlan?.serviceBlueprint as
    | { targetEntities?: unknown; database?: { entities?: unknown } }
    | undefined;
  const fromService =
    serviceBp?.targetEntities ?? serviceBp?.database?.entities;
  if (Array.isArray(fromService) && fromService.length > 0) {
    return fromService.map(String);
  }
  return ["User", "Item"];
}

/**
 * Stage 1 (idea) — deterministic seed analysis from input + Universal Planner JSON.
 * No DeepSeek call: Stage 2 owns the single planning LLM request and refines this seed.
 */
export async function analyzeWebApp(
  input: WebAppPluginInput,
  ctx: GenerationContext,
): Promise<WebAppAnalysis> {
  ctx.progress.emit("Analyzing requirements...");

  const def = WEBAPP_TYPES.find((t) => t.id === input.appType);
  const caps = input.universalPlannerBlueprint?.requirements;
  const tables = deriveTablesFromPlanner(input);
  const primary = tables.find((t) => !/^user$/i.test(t)) ?? tables[0] ?? "Item";
  const slug = primary
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();

  const isEcommerce =
    /ecommerce|e-commerce|pos|shop|store/i.test(input.appType) ||
    input.features.some((f) => /commerce|cart|product/i.test(f));
  const isSaas =
    /saas/i.test(input.appType) ||
    input.features.some((f) => /billing|subscription/i.test(f));

  const pages = [
    "Home",
    "Login",
    "Dashboard",
    `${primary} List`,
    ...(isSaas ? ["Settings"] : []),
  ];

  return {
    appName: titleCaseAppName(input.prompt, input.appType),
    appType: def?.label ?? input.appType,
    complexity: "moderate",
    pages,
    features:
      input.features.length > 0
        ? input.features
        : ["auth", "dashboard", "database", "crud"],
    technologies: ["Next.js", "TypeScript", "Prisma", "Tailwind CSS", "Zod"],
    databaseTables: tables,
    apiEndpoints: [
      "/api/auth/login",
      "/api/auth/logout",
      `/api/${slug}`,
    ],
    requiresAuth: caps?.auth?.required ?? true,
    requiresDatabase: caps?.database?.required ?? true,
    requiresDashboard: true,
    isEcommerce,
    isSaas,
    databaseProvider: normalizeDatabaseProvider(
      String(caps?.database?.provider ?? "prisma"),
    ),
  };
}

export function normalizeWebAppAnalysis(
  analysis: WebAppAnalysis,
): WebAppAnalysis {
  return {
    ...analysis,
    requiresAuth: analysis.requiresAuth ?? true,
    requiresDatabase: analysis.requiresDatabase ?? true,
    requiresDashboard: analysis.requiresDashboard ?? true,
    databaseProvider: normalizeDatabaseProvider(
      analysis.databaseProvider ?? "prisma",
    ),
    complexity: normalizeComplexity(String(analysis.complexity ?? "moderate")),
  };
}
