/**
 * Marketing Platform health report.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDefaultTextProvider } from "@/lib/ai/provider-config";
import { providerManager } from "@/lib/ai/provider-manager";
import { isMarketingEncryptionConfigured } from "@/lib/marketing/crypto";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

export type MarketingHealthReport = {
  status: "healthy" | "degraded";
  productId: string;
  version: string;
  aiProvider: { configured: boolean; name: string };
  database: Record<string, boolean> & { message: string };
  configuration: Record<string, boolean>;
  checks: Array<{ id: string; ok: boolean; detail?: string }>;
};

const REQUIRED = [
  "types/marketing.ts",
  "lib/marketing/engine.ts",
  "lib/marketing/campaigns.ts",
  "lib/marketing/personas.ts",
  "lib/marketing/planning.ts",
  "lib/marketing/analytics.ts",
  "lib/marketing/automation.ts",
  "lib/marketing/calendar.ts",
  "lib/marketing/email.ts",
  "lib/marketing/ads.ts",
  "lib/marketing/prompts.ts",
  "lib/marketing/integrations/providers.ts",
  "app/api/marketing/health/route.ts",
  "app/api/marketing/campaigns/route.ts",
  "app/api/marketing/analytics/route.ts",
  "components/dashboard/marketing/marketing-workspace.tsx",
  "lib/ai-core/adapters/marketing-ai.ts",
];

async function checkTable(supabase: AnySupabase, table: string): Promise<boolean> {
  const { error } = await supabase.from(table).select("id").limit(1);
  if (!error) return true;
  if (error.code === "PGRST205" || /does not exist|schema cache/i.test(error.message ?? "")) return false;
  return true;
}

export async function buildMarketingHealthReport(root = process.cwd()): Promise<MarketingHealthReport> {
  const fileChecks = REQUIRED.map((rel) => ({
    id: rel,
    ok: existsSync(join(root, rel)),
    detail: existsSync(join(root, rel)) ? "present" : "missing",
  }));

  const hasMigration =
    existsSync(join(root, "supabase/migrations")) &&
    readdirSync(join(root, "supabase/migrations")).some((f) => f.startsWith("064_"));

  fileChecks.push({ id: "migration_064", ok: hasMigration, detail: hasMigration ? "present" : "missing" });

  const providerName = getDefaultTextProvider();
  const aiConfigured = Boolean(providerManager.resolve(providerName) && providerManager.isConfigured(providerName!));

  const tables = [
    "marketing_campaigns",
    "marketing_plans",
    "marketing_personas",
    "marketing_workflows",
    "marketing_analytics",
    "marketing_calendar_events",
    "marketing_email_campaigns",
    "marketing_ads_drafts",
    "marketing_integrations",
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
    dbMessage = db.marketing_campaigns
      ? "Marketing platform tables reachable."
      : "Apply migration 064 for marketing platform tables.";
  }

  const engineSrc = existsSync(join(root, "lib/marketing/engine.ts"))
    ? readFileSync(join(root, "lib/marketing/engine.ts"), "utf8")
    : "";

  const configuration = {
    engineReady: engineSrc.includes("generateCampaign"),
    campaignsReady: existsSync(join(root, "lib/marketing/campaigns.ts")),
    analyticsReady: existsSync(join(root, "lib/marketing/analytics.ts")),
    calendarReady: existsSync(join(root, "lib/marketing/calendar.ts")),
    emailFoundation: existsSync(join(root, "lib/marketing/email.ts")),
    adsFoundation: existsSync(join(root, "lib/marketing/ads.ts")),
    integrationsReady: existsSync(join(root, "lib/marketing/integrations/providers.ts")),
    workspacePreserved: existsSync(join(root, "lib/ai-core/adapters/marketing-ai.ts")),
    encryptionConfigured: isMarketingEncryptionConfigured(),
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
  const ok = all.every((c) => c.ok) && aiConfigured && (db.marketing_campaigns ?? false);

  return {
    status: ok ? "healthy" : "degraded",
    productId: "marketing-intelligence-platform",
    version: "3.0.0",
    aiProvider: { configured: aiConfigured, name: providerName },
    database: { ...db, message: dbMessage } as Record<string, boolean> & { message: string },
    configuration,
    checks: all,
  };
}
