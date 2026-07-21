/**
 * Verify Social Media Manager platform readiness.
 * Usage: npm run verify:social-media
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
  "types/social-media.ts",
  "supabase/migrations/062_social_media_platform.sql",
  "lib/social-media/engine.ts",
  "lib/social-media/prompts.ts",
  "lib/social-media/templates.ts",
  "lib/social-media/platforms/index.ts",
  "lib/social-media/publishing.ts",
  "lib/social-media/analytics.ts",
  "lib/social-media/brand-integration.ts",
  "lib/social-media/design-integration.ts",
  "lib/social-media/health.ts",
  "lib/social-media/index.ts",
  "app/api/social-media/health/route.ts",
  "app/api/social-media/generate/route.ts",
  "app/api/social-media/posts/route.ts",
  "app/api/social-media/posts/[id]/route.ts",
  "app/api/social-media/actions/route.ts",
  "app/api/social-media/templates/route.ts",
  "app/api/social-media/schedules/route.ts",
  "app/api/social-media/accounts/route.ts",
  "app/api/social-media/analytics/route.ts",
  "app/api/social-media/campaigns/route.ts",
  "components/dashboard/social-media/social-media-workspace.tsx",
  "components/dashboard/social-media/post-composer.tsx",
  "components/dashboard/social-media/post-preview.tsx",
  "components/dashboard/social-media/template-selector.tsx",
  "components/dashboard/social-media/content-library.tsx",
  "components/dashboard/social-media/social-calendar.tsx",
  "components/dashboard/social-media/social-dashboard.tsx",
  "components/dashboard/social-media/strategy-workspace.tsx",
  "app/(dashboard)/dashboard/social-media/page.tsx",
];

console.log("\n[1] Platform files");
for (const rel of FILES) {
  if (existsSync(join(root, rel))) ok(rel);
  else fail(rel, "missing");
}

console.log("\n[2] Migration 062");
const m062 = readFileSync(join(root, "supabase/migrations/062_social_media_platform.sql"), "utf8");
for (const t of ["social_posts", "social_campaigns", "social_schedules", "social_accounts", "social_analytics"]) {
  if (m062.includes(t)) ok(`table: ${t}`);
  else fail(`missing table: ${t}`);
}
if (m062.includes("enable row level security")) ok("RLS enabled");
else fail("RLS missing");

console.log("\n[3] APIs — auth & credits");
const protectedRoutes = [
  "app/api/social-media/generate/route.ts",
  "app/api/social-media/posts/route.ts",
  "app/api/social-media/actions/route.ts",
];
for (const rel of protectedRoutes) {
  const src = readFileSync(join(root, rel), "utf8");
  if (src.includes("requireUser")) ok(`${rel}: requireUser`);
  else fail(`${rel}: missing requireUser`);
}
const gen = readFileSync(join(root, "app/api/social-media/generate/route.ts"), "utf8");
if (gen.includes("enforceAiUsage")) ok("generate: credits");
else fail("generate: missing credits");
const accounts = readFileSync(join(root, "app/api/social-media/accounts/route.ts"), "utf8");
if (accounts.includes("SAFE_ACCOUNT_SELECT") && !accounts.match(/\.select\([^)]*access_token_encrypted/)) ok("accounts: token not exposed in list");
else fail("accounts: possible token leak");

console.log("\n[4] AI engine");
const engine = readFileSync(join(root, "lib/social-media/engine.ts"), "utf8");
for (const p of ["facebook", "instagram", "linkedin", "x", "tiktok"]) {
  if (readFileSync(join(root, "lib/social-media/platforms/index.ts"), "utf8").includes(p)) ok(`platform: ${p}`);
}
for (const action of ["rewrite", "improve_engagement", "shorten", "expand", "translate", "generate_variations"]) {
  if (engine.includes(action) || readFileSync(join(root, "app/api/social-media/actions/route.ts"), "utf8").includes(action)) ok(`action: ${action}`);
  else fail(`action missing: ${action}`);
}

console.log("\n[5] Templates");
const templates = readFileSync(join(root, "lib/social-media/templates.ts"), "utf8");
for (const cat of ["Product promotion", "Sales campaign", "Brand awareness", "Educational posts", "Restaurant", "E-commerce", "Real estate", "Personal brand"]) {
  if (templates.includes(cat)) ok(`category: ${cat}`);
  else fail(`category missing: ${cat}`);
}

console.log("\n[6] Brand & design integration");
const brand = readFileSync(join(root, "lib/social-media/brand-integration.ts"), "utf8");
if (brand.includes("brand_identity_generations")) ok("brand read-only integration");
else fail("brand integration missing");
const design = readFileSync(join(root, "lib/social-media/design-integration.ts"), "utf8");
if (design.includes("1080") && design.includes("1200")) ok("social dimensions defined");
else fail("dimensions missing");

console.log("\n[7] Workspace preservation");
const workspace = readFileSync(join(root, "components/dashboard/social-media/social-media-workspace.tsx"), "utf8");
if (workspace.includes("StrategyWorkspace") && workspace.includes("workspace_type")) ok("legacy strategy tab");
else if (workspace.includes("strategy") && workspace.includes("StrategyWorkspace")) ok("legacy strategy tab");
const strategy = readFileSync(join(root, "components/dashboard/social-media/strategy-workspace-client.tsx"), "utf8");
if (strategy.includes("WorkspaceTool") && strategy.includes("social-media-manager")) ok("workspace engine preserved");

console.log("\n[8] package.json");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
if (pkg.scripts?.["verify:social-media"]) ok("npm run verify:social-media");
else fail("verify script missing");

console.log(failed ? `\nSocial Media verify: ${failed} issue(s)\n` : "\nSocial Media verify: PASS\n");
process.exit(failed ? 1 : 0);
