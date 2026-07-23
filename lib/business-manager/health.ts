/**
 * Business Manager Platform health report.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDefaultTextProvider } from "@/lib/ai/provider-config";
import { providerManager } from "@/lib/ai/provider-manager";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

export type BusinessManagerHealthReport = {
  status: "healthy" | "degraded";
  productId: string;
  version: string;
  aiProvider: { configured: boolean; name: string };
  database: Record<string, boolean> & { message: string };
  configuration: Record<string, boolean>;
  checks: Array<{ id: string; ok: boolean; detail?: string }>;
};

const REQUIRED = [
  "types/business-manager.ts",
  "lib/business-manager/engine.ts",
  "lib/business-manager/organizations.ts",
  "lib/business-manager/teams.ts",
  "lib/business-manager/projects.ts",
  "lib/business-manager/tasks.ts",
  "lib/business-manager/workflows.ts",
  "lib/business-manager/approvals.ts",
  "lib/business-manager/analytics.ts",
  "lib/business-manager/assistant.ts",
  "lib/business-manager/integrations/index.ts",
  "app/api/business-manager/health/route.ts",
  "app/api/business-manager/analytics/route.ts",
  "components/dashboard/business-manager/business-manager-workspace.tsx",
  "lib/ai-core/adapters/business-manager-ai.ts",
];

async function checkTable(supabase: AnySupabase, table: string): Promise<boolean> {
  const { error } = await supabase.from(table).select("id").limit(1);
  if (!error) return true;
  if (error.code === "PGRST205" || /does not exist|schema cache/i.test(error.message ?? "")) return false;
  return true;
}

export async function buildBusinessManagerHealthReport(
  root = process.cwd(),
): Promise<BusinessManagerHealthReport> {
  const fileChecks = REQUIRED.map((rel) => ({
    id: rel,
    ok: existsSync(join(root, rel)),
    detail: existsSync(join(root, rel)) ? "present" : "missing",
  }));

  const hasMigration =
    existsSync(join(root, "supabase/migrations")) &&
    readdirSync(join(root, "supabase/migrations")).some((f) => f.startsWith("065_"));

  fileChecks.push({ id: "migration_065", ok: hasMigration, detail: hasMigration ? "present" : "missing" });

  const providerName = getDefaultTextProvider();
  const aiConfigured = Boolean(providerManager.resolve(providerName) && providerManager.isConfigured(providerName!));

  const tables = [
    "business_organizations",
    "business_departments",
    "business_teams",
    "business_roles",
    "business_projects",
    "business_tasks",
    "business_milestones",
    "business_workflows",
    "business_approvals",
    "business_kpis",
    "workspace_generations",
  ];

  const admin = createAdminClient();
  const db: Record<string, boolean> = {};
  let dbMessage = "Database client not configured.";

  if (admin) {
    const results = await Promise.all(tables.map((t) => checkTable(admin, t)));
    tables.forEach((t, i) => {
      db[t] = results[i];
    });
    dbMessage = db.business_organizations
      ? "Business Manager platform tables reachable."
      : "Apply migration 065 for business manager platform tables.";
  }

  const engineSrc = existsSync(join(root, "lib/business-manager/engine.ts"))
    ? readFileSync(join(root, "lib/business-manager/engine.ts"), "utf8")
    : "";

  const configuration = {
    engineReady: engineSrc.includes("generateBusinessPlan"),
    projectsReady: existsSync(join(root, "lib/business-manager/projects.ts")),
    analyticsReady: existsSync(join(root, "lib/business-manager/analytics.ts")),
    workflowsReady: existsSync(join(root, "lib/business-manager/workflows.ts")),
    integrationsReady: existsSync(join(root, "lib/business-manager/integrations/index.ts")),
    workspacePreserved: existsSync(join(root, "plugins/workspace/plugins.ts")),
    legacyApiPreserved: existsSync(join(root, "app/api/workspaces/[type]/route.ts")),
  };

  const runtimeChecks = [
    { id: "ai_provider", ok: aiConfigured, detail: aiConfigured ? providerName : "not configured" },
    ...tables.map((t) => ({ id: `db_${t}`, ok: db[t] ?? false, detail: db[t] ? "reachable" : "missing" })),
    ...Object.entries(configuration).map(([k, v]) => ({
      id: `config_${k}`,
      ok: v,
      detail: v ? "ready" : "missing",
    })),
  ];

  const all = [...fileChecks, ...runtimeChecks];
  const ok = all.every((c) => c.ok) && aiConfigured && (db.business_organizations ?? false);

  return {
    status: ok ? "healthy" : "degraded",
    productId: "business-operations-platform",
    version: "1.0.0",
    aiProvider: { configured: aiConfigured, name: providerName },
    database: { ...db, message: dbMessage } as Record<string, boolean> & { message: string },
    configuration,
    checks: all,
  };
}
