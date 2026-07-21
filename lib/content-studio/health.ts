/**
 * Content Studio platform health report.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDefaultTextProvider } from "@/lib/ai/provider-config";
import { providerManager } from "@/lib/ai/provider-manager";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

export type ContentStudioHealthReport = {
  status: "healthy" | "degraded";
  productId: string;
  version: string;
  aiProvider: {
    configured: boolean;
    name: string;
  };
  database: {
    contentGenerations: boolean;
    contentCalendar: boolean;
    contentProjects: boolean;
    contentDocuments: boolean;
    contentVersions: boolean;
    contentTemplates: boolean;
    message: string;
  };
  configuration: {
    toolsDefined: boolean;
    promptsPresent: boolean;
    adapterRegistered: boolean;
    platformModules: boolean;
    templatesCatalog: boolean;
  };
  checks: Array<{ id: string; ok: boolean; detail?: string }>;
};

const REQUIRED_MODULES = [
  "lib/content-generator.ts",
  "lib/ai-core/adapters/content-studio.ts",
  "plugins/content-studio/index.ts",
  "lib/ai/prompts/content-studio.ts",
  "lib/constants/content-studio.ts",
  "lib/content-studio/health.ts",
  "lib/content-studio/templates.ts",
  "lib/content-studio/actions.ts",
  "lib/content-studio/brand-voice.ts",
  "lib/content-studio/documents.ts",
  "lib/content-studio/versions.ts",
  "lib/content-studio/index.ts",
  "types/content.ts",
  "app/api/content-studio/route.ts",
  "app/api/content-studio/[id]/route.ts",
  "app/api/content-studio/calendar/route.ts",
  "app/api/content-studio/health/route.ts",
  "app/api/content-studio/templates/route.ts",
  "app/api/content-studio/documents/route.ts",
  "app/api/content-studio/documents/[id]/route.ts",
  "app/api/content-studio/versions/route.ts",
  "app/api/content-studio/actions/route.ts",
  "app/api/content-studio/stream/route.ts",
  "app/api/content-studio/projects/route.ts",
  "components/dashboard/content-studio/content-studio-tool.tsx",
  "components/dashboard/content-studio/content-studio-workspace.tsx",
  "components/dashboard/content-studio/content-platform-workspace.tsx",
  "components/dashboard/content-studio/content-editor.tsx",
  "components/dashboard/content-studio/content-templates-panel.tsx",
  "components/dashboard/content-studio/content-calendar.tsx",
  "app/(dashboard)/dashboard/content-studio/page.tsx",
];

async function checkTable(supabase: AnySupabase, table: string): Promise<boolean> {
  const { error } = await supabase.from(table).select("id").limit(1);
  if (!error) return true;
  if (error.code === "PGRST205" || /does not exist|schema cache/i.test(error.message ?? "")) {
    return false;
  }
  return true;
}

export function buildContentStudioFileChecks(root = process.cwd()) {
  const checks = REQUIRED_MODULES.map((rel) => ({
    id: rel,
    ok: existsSync(join(root, rel)),
    detail: existsSync(join(root, rel)) ? "present" : "missing",
  }));

  const migrations = ["019", "060", "061"].map((n) => {
    const ok =
      existsSync(join(root, "supabase/migrations")) &&
      readdirSync(join(root, "supabase/migrations")).some((f) => f.startsWith(`${n}_`));
    return { id: `migration_${n}`, ok, detail: ok ? "present" : "missing" };
  });

  const migration060 = readFileIfExists(join(root, "supabase/migrations/060_content_studio_constraints.sql"));
  checks.push({
    id: "migration_060_content_generation_favorite",
    ok: migration060.includes("content_generation"),
    detail: migration060.includes("content_generation") ? "present" : "missing content_generation",
  });
  checks.push({
    id: "migration_060_continue_mode",
    ok: migration060.includes("'continue'"),
    detail: migration060.includes("'continue'") ? "present" : "missing continue mode",
  });

  return [...checks, ...migrations];
}

function readFileIfExists(path: string): string {
  try {
    if (!existsSync(path)) return "";
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
}

export async function buildContentStudioHealthReport(
  root = process.cwd(),
): Promise<ContentStudioHealthReport> {
  const fileChecks = buildContentStudioFileChecks(root);

  const providerName = getDefaultTextProvider();
  const resolved = providerManager.resolve(providerName);
  const aiConfigured = Boolean(resolved && providerManager.isConfigured(resolved));

  const admin = createAdminClient();
  let contentGenerations = false;
  let contentCalendar = false;
  let contentProjects = false;
  let contentDocuments = false;
  let contentVersions = false;
  let contentTemplates = false;
  let dbMessage = "Database client not configured.";

  if (admin) {
    [contentGenerations, contentCalendar, contentProjects, contentDocuments, contentVersions, contentTemplates] =
      await Promise.all([
        checkTable(admin, "content_generations"),
        checkTable(admin, "content_calendar"),
        checkTable(admin, "content_projects"),
        checkTable(admin, "content_documents"),
        checkTable(admin, "content_versions"),
        checkTable(admin, "content_templates"),
      ]);
    dbMessage =
      contentGenerations && contentDocuments
        ? "Content Studio platform tables reachable."
        : contentGenerations
          ? "Core tables OK; apply migration 061 for platform tables."
          : "content_generations missing — apply migrations 019, 060, and 061.";
  }

  const constantsSrc = readFileIfExists(join(root, "lib/constants/content-studio.ts"));
  const adapterSrc = readFileIfExists(join(root, "lib/ai-core/adapters/content-studio.ts"));
  const promptsSrc = readFileIfExists(join(root, "lib/ai/prompts/content-studio.ts"));
  const templatesSrc = readFileIfExists(join(root, "lib/content-studio/templates.ts"));
  const indexSrc = readFileIfExists(join(root, "lib/content-studio/index.ts"));

  const configuration = {
    toolsDefined: constantsSrc.includes("CONTENT_TOOLS"),
    promptsPresent: promptsSrc.includes("contentAnalyzePrompt"),
    adapterRegistered: adapterSrc.includes("registerProductEngineAdapter"),
    platformModules: indexSrc.includes("runContentAction") && indexSrc.includes("createDocumentVersion"),
    templatesCatalog: templatesSrc.includes("SYSTEM_CONTENT_TEMPLATES"),
  };

  const runtimeChecks = [
    { id: "ai_provider", ok: aiConfigured, detail: aiConfigured ? providerName : "not configured" },
    { id: "db_content_generations", ok: contentGenerations, detail: contentGenerations ? "reachable" : "missing" },
    { id: "db_content_calendar", ok: contentCalendar, detail: contentCalendar ? "reachable" : "missing" },
    { id: "db_content_projects", ok: contentProjects, detail: contentProjects ? "reachable" : "missing" },
    { id: "db_content_documents", ok: contentDocuments, detail: contentDocuments ? "reachable" : "missing" },
    { id: "db_content_versions", ok: contentVersions, detail: contentVersions ? "reachable" : "missing" },
    { id: "db_content_templates", ok: contentTemplates, detail: contentTemplates ? "reachable" : "missing" },
    {
      id: "config_tools",
      ok: configuration.toolsDefined,
      detail: configuration.toolsDefined ? "CONTENT_TOOLS defined" : "missing",
    },
    {
      id: "config_prompts",
      ok: configuration.promptsPresent,
      detail: configuration.promptsPresent ? "prompts present" : "missing",
    },
    {
      id: "config_adapter",
      ok: configuration.adapterRegistered,
      detail: configuration.adapterRegistered ? "adapter registered" : "missing",
    },
    {
      id: "config_platform",
      ok: configuration.platformModules,
      detail: configuration.platformModules ? "platform modules exported" : "missing",
    },
    {
      id: "config_templates",
      ok: configuration.templatesCatalog,
      detail: configuration.templatesCatalog ? "template catalog present" : "missing",
    },
  ];

  const all = [...fileChecks, ...runtimeChecks];
  const ok = all.every((c) => c.ok) && aiConfigured && contentGenerations;

  return {
    status: ok ? "healthy" : "degraded",
    productId: "content-studio",
    version: "2.0.0",
    aiProvider: { configured: aiConfigured, name: providerName },
    database: {
      contentGenerations,
      contentCalendar,
      contentProjects,
      contentDocuments,
      contentVersions,
      contentTemplates,
      message: dbMessage,
    },
    configuration,
    checks: all,
  };
}
