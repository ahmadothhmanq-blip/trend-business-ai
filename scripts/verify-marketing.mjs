/**
 * Verify Marketing Intelligence Platform readiness.
 * Usage: npm run verify:marketing
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;
function ok(label, detail = "") {
  console.log(`  ✓ ${label}${detail ? ` — ${detail}` : ""}`);
}
function fail(label, detail = "") {
  failed++;
  console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
}

const FILES = [
  "types/marketing.ts",
  "supabase/migrations/064_marketing_platform.sql",
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
  "lib/marketing/health.ts",
  "lib/marketing/crypto.ts",
  "lib/marketing/integrations/providers.ts",
  "lib/marketing/index.ts",
  "lib/ai-core/adapters/marketing-ai.ts",
  "app/api/marketing/health/route.ts",
  "app/api/marketing/campaigns/route.ts",
  "app/api/marketing/campaigns/[id]/route.ts",
  "app/api/marketing/generate/route.ts",
  "app/api/marketing/actions/route.ts",
  "app/api/marketing/personas/route.ts",
  "app/api/marketing/analytics/route.ts",
  "app/api/marketing/calendar/route.ts",
  "app/api/marketing/email/route.ts",
  "app/api/marketing/ads/route.ts",
  "app/api/marketing/workflows/route.ts",
  "app/api/marketing/integrations/route.ts",
  "app/api/marketing/integrations/seo/route.ts",
  "components/dashboard/marketing/marketing-workspace.tsx",
  "components/dashboard/marketing/campaign-list.tsx",
  "components/dashboard/marketing/campaign-editor.tsx",
  "components/dashboard/marketing/strategy-workspace.tsx",
  "app/(dashboard)/dashboard/marketing/page.tsx",
  "scripts/verify-marketing.mjs",
];

console.log("\n[1] Platform files");
for (const rel of FILES) {
  if (existsSync(join(root, rel))) ok(rel);
  else fail(rel, "missing");
}

console.log("\n[2] Migration 064");
const m064 = readFileSync(join(root, "supabase/migrations/064_marketing_platform.sql"), "utf8");
for (const t of [
  "marketing_campaigns",
  "marketing_plans",
  "marketing_personas",
  "marketing_workflows",
  "marketing_analytics",
  "marketing_calendar_events",
  "marketing_email_campaigns",
  "marketing_ads_drafts",
  "marketing_integrations",
]) {
  if (m064.includes(t)) ok(`table: ${t}`);
  else fail(`missing table: ${t}`);
}
if (m064.includes("enable row level security")) ok("RLS enabled");
else fail("RLS missing");

console.log("\n[3] AI engine");
const engine = readFileSync(join(root, "lib/marketing/engine.ts"), "utf8");
for (const fn of ["generateCampaign", "generatePersona", "runMarketingAssistant"]) {
  if (engine.includes(fn)) ok(`engine: ${fn}`);
  else fail(`missing: ${fn}`);
}

console.log("\n[4] Assistant actions");
const actions = readFileSync(join(root, "app/api/marketing/actions/route.ts"), "utf8");
for (const a of ["improve_campaign", "rewrite_copy", "generate_ideas", "analyze_campaign", "suggest_improvements"]) {
  if (actions.includes(a)) ok(`action: ${a}`);
  else fail(`action missing: ${a}`);
}

console.log("\n[5] Integrations foundation");
const providers = readFileSync(join(root, "lib/marketing/integrations/providers.ts"), "utf8");
for (const p of ["google_ads", "meta_ads", "sendgrid", "mailchimp", "google_analytics"]) {
  if (providers.includes(p)) ok(`provider: ${p}`);
  else fail(`provider missing: ${p}`);
}

console.log("\n[6] API security");
const protectedRoutes = [
  "app/api/marketing/campaigns/route.ts",
  "app/api/marketing/generate/route.ts",
  "app/api/marketing/actions/route.ts",
  "app/api/marketing/analytics/route.ts",
];
for (const rel of protectedRoutes) {
  const src = readFileSync(join(root, rel), "utf8");
  if (src.includes("requireUser")) ok(`${rel}: requireUser`);
  else fail(`${rel}: missing requireUser`);
}
const gen = readFileSync(join(root, "app/api/marketing/generate/route.ts"), "utf8");
if (gen.includes("enforceAiUsage")) ok("generate: credits");
else fail("generate: missing credits");

const integrations = readFileSync(join(root, "app/api/marketing/integrations/route.ts"), "utf8");
if (integrations.includes("SAFE_INTEGRATION_SELECT") && !integrations.match(/\.select\([^)]*access_token_encrypted/)) {
  ok("integrations: tokens not exposed");
} else fail("integrations: possible token leak");

console.log("\n[7] Workspace preservation");
const workspace = readFileSync(join(root, "components/dashboard/marketing/marketing-workspace.tsx"), "utf8");
if (workspace.includes("StrategyWorkspace") && workspace.includes("strategy")) ok("legacy strategy tab");
const strategy = readFileSync(join(root, "lib/ai-core/adapters/marketing-ai.ts"), "utf8");
if (strategy.includes("marketingPlugin") && strategy.includes("registerProductEngineAdapter")) ok("AI Core pipeline preserved");
else fail("AI Core pipeline missing");

console.log("\n[8] Read-only bridges");
const calendar = readFileSync(join(root, "lib/marketing/calendar.ts"), "utf8");
if (calendar.includes("content_documents") && calendar.includes("social_schedules")) ok("calendar bridges");
const seoBridge = readFileSync(join(root, "lib/marketing/integrations/seo-bridge.ts"), "utf8");
if (seoBridge.includes("analyzeSeo")) ok("SEO read-only bridge");

console.log("\n[9] package.json");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
if (pkg.scripts?.["verify:marketing"]) ok("npm run verify:marketing");
else fail("verify script missing");

console.log(failed ? `\nMarketing verify: ${failed} issue(s)\n` : "\nMarketing verify: PASS\n");
process.exit(failed ? 1 : 0);
