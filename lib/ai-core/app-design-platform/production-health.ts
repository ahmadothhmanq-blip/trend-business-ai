/**
 * App Builder production health checks.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { listAppTemplates } from "@/lib/ai-core/app-design-platform/templates";
import { APP_COMPONENT_LIBRARY } from "@/lib/ai-core/app-design-platform/components";
import { getDefaultTextProvider } from "@/lib/ai/provider-config";
import { providerManager } from "@/lib/ai/provider-manager";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

export type AppBuilderHealthReport = {
  ok: boolean;
  readyForProduction: boolean;
  blockers: string[];
  warnings: string[];
  database: { webappGenerations: boolean; webappDeployments: boolean; message: string };
  templates: { count: number };
  components: { count: number };
  aiProvider: { configured: boolean; name: string };
  livePreview: { endpoint: string };
  deployment: { endpoint: string };
};

async function checkTable(supabase: AnySupabase, table: string): Promise<boolean> {
  const { error } = await supabase.from(table).select("id").limit(1);
  return !error || error.code !== "PGRST205";
}

export async function buildAppBuilderHealthReport(
  userSupabase: AnySupabase,
): Promise<AppBuilderHealthReport> {
  const admin = createAdminClient();
  const db = admin ?? userSupabase;

  const [webappGenerations, webappDeployments] = await Promise.all([
    checkTable(db, "webapp_generations"),
    checkTable(db, "webapp_deployments"),
  ]);

  const providerName = getDefaultTextProvider();
  const aiConfigured = Boolean(
    providerManager.resolve(providerName) &&
      providerManager.isConfigured(providerManager.resolve(providerName)!),
  );

  const blockers: string[] = [];
  const warnings: string[] = [];

  if (!webappGenerations) {
    blockers.push("Apply migration 013_webapp_generations.sql");
  }
  if (!webappDeployments) {
    warnings.push("Apply migration 046_webapp_deployments.sql for deployment tracking.");
  }
  if (!aiConfigured) {
    warnings.push("No AI provider configured — generation and assistant agent limited.");
  }

  return {
    ok: blockers.length === 0,
    readyForProduction: blockers.length === 0 && aiConfigured,
    blockers,
    warnings,
    database: {
      webappGenerations,
      webappDeployments,
      message: webappGenerations
        ? webappDeployments
          ? "All App Builder tables reachable."
          : "Core table OK; optional deployments table missing."
        : "webapp_generations missing.",
    },
    templates: { count: listAppTemplates().length },
    components: { count: APP_COMPONENT_LIBRARY.length },
    aiProvider: { configured: aiConfigured, name: providerName },
    livePreview: { endpoint: "/api/webapp-builder/[id]/live-preview" },
    deployment: { endpoint: "/api/webapp-builder/[id]/deploy" },
  };
}
