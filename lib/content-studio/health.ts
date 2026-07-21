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
    message: string;
  };
  configuration: {
    toolsDefined: boolean;
    promptsPresent: boolean;
    adapterRegistered: boolean;
  };
  checks: Array<{ id: string; ok: boolean; detail?: string }>;
};

const REQUIRED_MODULES = [
  "lib/content-generator.ts",
  "lib/ai-core/adapters/content-studio.ts",
  "plugins/content-studio/index.ts",
  "lib/ai/prompts/content-studio.ts",
  "lib/constants/content-studio.ts",
  "types/content.ts",
  "app/api/content-studio/route.ts",
  "app/api/content-studio/[id]/route.ts",
  "app/api/content-studio/calendar/route.ts",
  "app/api/content-studio/health/route.ts",
  "components/dashboard/content-studio/content-studio-tool.tsx",
  "components/dashboard/content-studio/content-studio-workspace.tsx",
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

  const migrations = ["019", "060"].map((n) => {
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
  let dbMessage = "Database client not configured.";

  if (admin) {
    [contentGenerations, contentCalendar] = await Promise.all([
      checkTable(admin, "content_generations"),
      checkTable(admin, "content_calendar"),
    ]);
    dbMessage =
      contentGenerations && contentCalendar
        ? "Content Studio tables reachable."
        : contentGenerations
          ? "content_generations OK; content_calendar missing — apply migration 019."
          : "content_generations missing — apply migrations 019 and 060.";
  }

  const constantsSrc = readFileIfExists(join(root, "lib/constants/content-studio.ts"));
  const adapterSrc = readFileIfExists(join(root, "lib/ai-core/adapters/content-studio.ts"));
  const promptsSrc = readFileIfExists(join(root, "lib/ai/prompts/content-studio.ts"));

  const configuration = {
    toolsDefined: constantsSrc.includes("CONTENT_TOOLS"),
    promptsPresent: promptsSrc.includes("contentAnalyzePrompt"),
    adapterRegistered: adapterSrc.includes("registerProductEngineAdapter"),
  };

  const runtimeChecks = [
    { id: "ai_provider", ok: aiConfigured, detail: aiConfigured ? providerName : "not configured" },
    { id: "db_content_generations", ok: contentGenerations, detail: contentGenerations ? "reachable" : "missing" },
    { id: "db_content_calendar", ok: contentCalendar, detail: contentCalendar ? "reachable" : "missing" },
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
  ];

  const all = [...fileChecks, ...runtimeChecks];
  const ok = all.every((c) => c.ok) && aiConfigured && contentGenerations;

  return {
    status: ok ? "healthy" : "degraded",
    productId: "content-studio",
    version: "1.1.0",
    aiProvider: { configured: aiConfigured, name: providerName },
    database: { contentGenerations, contentCalendar, message: dbMessage },
    configuration,
    checks: all,
  };
}
