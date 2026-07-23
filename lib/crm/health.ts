import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDefaultTextProvider } from "@/lib/ai/provider-config";
import { providerManager } from "@/lib/ai/provider-manager";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

export type CrmHealthReport = {
  status: "healthy" | "degraded";
  productId: string;
  version: string;
  aiProvider: { configured: boolean; name: string };
  database: Record<string, boolean> & { message: string };
  configuration: Record<string, boolean>;
  checks: Array<{ id: string; ok: boolean; detail?: string }>;
};

const REQUIRED = [
  "types/crm.ts",
  "lib/crm/engine.ts",
  "lib/crm/contacts.ts",
  "lib/crm/accounts.ts",
  "lib/crm/leads.ts",
  "lib/crm/deals.ts",
  "lib/crm/pipeline.ts",
  "lib/crm/activities.ts",
  "lib/crm/tasks.ts",
  "lib/crm/analytics.ts",
  "lib/crm/assistant.ts",
  "lib/crm/integrations/index.ts",
  "app/api/crm/health/route.ts",
  "app/api/crm/analytics/route.ts",
  "components/dashboard/crm/crm-workspace.tsx",
  "app/api/growth/crm/route.ts",
];

const TABLES = [
  "crm_accounts",
  "crm_contacts",
  "crm_leads",
  "crm_deals",
  "crm_stages",
  "crm_tasks",
  "crm_activities",
  "crm_notes",
  "crm_assignments",
  "crm_automation_rules",
  "crm_analytics",
  "growth_contacts",
  "growth_deals",
  "growth_leads",
];

async function checkTable(supabase: AnySupabase, table: string): Promise<boolean> {
  const { error } = await supabase.from(table).select("id").limit(1);
  if (!error) return true;
  if (error.code === "PGRST205" || /does not exist|schema cache/i.test(error.message ?? "")) return false;
  return true;
}

export async function buildCrmHealthReport(root = process.cwd()): Promise<CrmHealthReport> {
  const fileChecks = REQUIRED.map((rel) => ({
    id: rel,
    ok: existsSync(join(root, rel)),
    detail: existsSync(join(root, rel)) ? "present" : "missing",
  }));

  const hasMigration =
    existsSync(join(root, "supabase/migrations")) &&
    readdirSync(join(root, "supabase/migrations")).some((f) => f.startsWith("066_"));
  fileChecks.push({ id: "migration_066", ok: hasMigration, detail: hasMigration ? "present" : "missing" });

  const providerName = getDefaultTextProvider();
  const aiConfigured = Boolean(providerManager.resolve(providerName) && providerManager.isConfigured(providerName!));

  const admin = createAdminClient();
  const db: Record<string, boolean> = {};
  let dbMessage = "Database client not configured.";

  if (admin) {
    const results = await Promise.all(TABLES.map((t) => checkTable(admin, t)));
    TABLES.forEach((t, i) => {
      db[t] = results[i];
    });
    dbMessage = db.crm_contacts
      ? "CRM platform tables reachable."
      : "Apply migration 066 for CRM platform tables.";
  }

  const configuration = {
    engineReady: existsSync(join(root, "lib/crm/engine.ts")),
    pipelineReady: existsSync(join(root, "lib/crm/pipeline.ts")),
    analyticsReady: existsSync(join(root, "lib/crm/analytics.ts")),
    integrationsReady: existsSync(join(root, "lib/crm/integrations/index.ts")),
    legacyGrowthPreserved: existsSync(join(root, "app/api/growth/crm/route.ts")),
    growthEnginePreserved: existsSync(join(root, "components/dashboard/platform/growth-panel.tsx")),
  };

  const runtimeChecks = [
    { id: "ai_provider", ok: aiConfigured, detail: aiConfigured ? providerName : "not configured" },
    ...TABLES.map((t) => ({ id: `db_${t}`, ok: db[t] ?? false, detail: db[t] ? "reachable" : "missing" })),
    ...Object.entries(configuration).map(([k, v]) => ({
      id: `config_${k}`,
      ok: v,
      detail: v ? "ready" : "missing",
    })),
  ];

  const all = [...fileChecks, ...runtimeChecks];
  const ok = all.every((c) => c.ok) && aiConfigured && (db.crm_contacts ?? false);

  return {
    status: ok ? "healthy" : "degraded",
    productId: "ai-crm-platform",
    version: "1.0.0",
    aiProvider: { configured: aiConfigured, name: providerName },
    database: { ...db, message: dbMessage } as Record<string, boolean> & { message: string },
    configuration,
    checks: all,
  };
}
