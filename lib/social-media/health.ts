/**
 * Social Media Manager health report.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDefaultTextProvider } from "@/lib/ai/provider-config";
import { providerManager } from "@/lib/ai/provider-manager";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

export type SocialMediaHealthReport = {
  status: "healthy" | "degraded";
  productId: string;
  version: string;
  aiProvider: { configured: boolean; name: string };
  database: {
    socialPosts: boolean;
    socialCampaigns: boolean;
    socialSchedules: boolean;
    socialAccounts: boolean;
    socialAnalytics: boolean;
    socialPublishJobs: boolean;
    workspaceGenerations: boolean;
    message: string;
  };
  configuration: {
    engineReady: boolean;
    templatesReady: boolean;
    platformsReady: boolean;
    publishingFoundation: boolean;
    oauthReady: boolean;
    analyticsFoundation: boolean;
  };
  checks: Array<{ id: string; ok: boolean; detail?: string }>;
};

const REQUIRED = [
  "lib/social-media/engine.ts",
  "lib/social-media/prompts.ts",
  "lib/social-media/templates.ts",
  "lib/social-media/platforms/index.ts",
  "lib/social-media/publishing.ts",
  "lib/social-media/publishing/engine.ts",
  "lib/social-media/oauth/providers.ts",
  "lib/social-media/crypto.ts",
  "app/api/social-media/posts/[id]/publish/route.ts",
  "app/api/social-media/accounts/connect/[platform]/route.ts",
  "lib/social-media/analytics.ts",
  "lib/social-media/brand-integration.ts",
  "lib/social-media/design-integration.ts",
  "types/social-media.ts",
  "app/api/social-media/health/route.ts",
  "app/api/social-media/posts/route.ts",
  "app/api/social-media/generate/route.ts",
  "components/dashboard/social-media/social-media-workspace.tsx",
];

async function checkTable(supabase: AnySupabase, table: string): Promise<boolean> {
  const { error } = await supabase.from(table).select("id").limit(1);
  if (!error) return true;
  if (error.code === "PGRST205" || /does not exist|schema cache/i.test(error.message ?? "")) return false;
  return true;
}

export async function buildSocialMediaHealthReport(root = process.cwd()): Promise<SocialMediaHealthReport> {
  const fileChecks = REQUIRED.map((rel) => ({
    id: rel,
    ok: existsSync(join(root, rel)),
    detail: existsSync(join(root, rel)) ? "present" : "missing",
  }));

  const hasMigration062 =
    existsSync(join(root, "supabase/migrations")) &&
    readdirSync(join(root, "supabase/migrations")).some((f) => f.startsWith("062_"));
  const hasMigration063 =
    existsSync(join(root, "supabase/migrations")) &&
    readdirSync(join(root, "supabase/migrations")).some((f) => f.startsWith("063_"));

  fileChecks.push({
    id: "migration_062",
    ok: hasMigration062,
    detail: hasMigration062 ? "present" : "missing",
  });
  fileChecks.push({
    id: "migration_063",
    ok: hasMigration063,
    detail: hasMigration063 ? "present" : "missing",
  });

  const providerName = getDefaultTextProvider();
  const resolved = providerManager.resolve(providerName);
  const aiConfigured = Boolean(resolved && providerManager.isConfigured(resolved));

  const admin = createAdminClient();
  let socialPosts = false;
  let socialCampaigns = false;
  let socialSchedules = false;
  let socialAccounts = false;
  let socialAnalytics = false;
  let socialPublishJobs = false;
  let workspaceGenerations = false;
  let dbMessage = "Database client not configured.";

  if (admin) {
    [socialPosts, socialCampaigns, socialSchedules, socialAccounts, socialAnalytics, socialPublishJobs, workspaceGenerations] =
      await Promise.all([
        checkTable(admin, "social_posts"),
        checkTable(admin, "social_campaigns"),
        checkTable(admin, "social_schedules"),
        checkTable(admin, "social_accounts"),
        checkTable(admin, "social_analytics"),
        checkTable(admin, "social_publish_jobs"),
        checkTable(admin, "workspace_generations"),
      ]);
    dbMessage =
      socialPosts && workspaceGenerations
        ? "Social platform + legacy workspace tables reachable."
        : socialPosts
          ? "Platform tables OK; workspace_generations check pending."
          : "Apply migration 062 for social platform tables.";
  }

  const engineSrc = readFileIfExists(join(root, "lib/social-media/engine.ts"));
  const templatesSrc = readFileIfExists(join(root, "lib/social-media/templates.ts"));
  const platformsSrc = readFileIfExists(join(root, "lib/social-media/platforms/index.ts"));
  const publishingSrc = readFileIfExists(join(root, "lib/social-media/publishing/engine.ts"));
  const oauthSrc = readFileIfExists(join(root, "lib/social-media/oauth/providers.ts"));
  const analyticsSrc = readFileIfExists(join(root, "lib/social-media/analytics.ts"));

  const configuration = {
    engineReady: engineSrc.includes("generateSocialPost"),
    templatesReady: templatesSrc.includes("SOCIAL_TEMPLATES"),
    platformsReady: platformsSrc.includes("PLATFORM_ADAPTERS"),
    publishingFoundation: publishingSrc.includes("publishPost") && publishingSrc.includes("processScheduledJobs"),
    oauthReady: oauthSrc.includes("OAUTH_PROVIDERS"),
    analyticsFoundation: analyticsSrc.includes("getLiveAnalytics"),
  };

  const runtimeChecks = [
    { id: "ai_provider", ok: aiConfigured, detail: aiConfigured ? providerName : "not configured" },
    { id: "db_social_posts", ok: socialPosts, detail: socialPosts ? "reachable" : "missing" },
    { id: "db_social_campaigns", ok: socialCampaigns, detail: socialCampaigns ? "reachable" : "missing" },
    { id: "db_social_schedules", ok: socialSchedules, detail: socialSchedules ? "reachable" : "missing" },
    { id: "db_social_accounts", ok: socialAccounts, detail: socialAccounts ? "reachable" : "missing" },
    { id: "db_social_analytics", ok: socialAnalytics, detail: socialAnalytics ? "reachable" : "missing" },
    { id: "db_social_publish_jobs", ok: socialPublishJobs, detail: socialPublishJobs ? "reachable" : "missing" },
    { id: "db_workspace_generations", ok: workspaceGenerations, detail: workspaceGenerations ? "reachable" : "missing" },
    { id: "config_engine", ok: configuration.engineReady, detail: configuration.engineReady ? "ready" : "missing" },
    { id: "config_templates", ok: configuration.templatesReady, detail: configuration.templatesReady ? "ready" : "missing" },
    { id: "config_platforms", ok: configuration.platformsReady, detail: configuration.platformsReady ? "ready" : "missing" },
    { id: "config_publishing", ok: configuration.publishingFoundation, detail: configuration.publishingFoundation ? "ready" : "missing" },
    { id: "config_oauth", ok: configuration.oauthReady, detail: configuration.oauthReady ? "ready" : "missing" },
    { id: "config_analytics", ok: configuration.analyticsFoundation, detail: configuration.analyticsFoundation ? "ready" : "missing" },
  ];

  const all = [...fileChecks, ...runtimeChecks];
  const ok = all.every((c) => c.ok) && aiConfigured && socialPosts;

  return {
    status: ok ? "healthy" : "degraded",
    productId: "social-media-manager",
    version: "2.1.0",
    aiProvider: { configured: aiConfigured, name: providerName },
    database: {
      socialPosts,
      socialCampaigns,
      socialSchedules,
      socialAccounts,
      socialAnalytics,
      socialPublishJobs,
      workspaceGenerations,
      message: dbMessage,
    },
    configuration,
    checks: all,
  };
}

function readFileIfExists(path: string): string {
  try {
    if (!existsSync(path)) return "";
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
}
