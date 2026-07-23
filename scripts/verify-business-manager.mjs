/**
 * Verify Business Manager Operations Platform readiness.
 * Usage: npm run verify:business-manager
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
  "types/business-manager.ts",
  "lib/business-manager/types.ts",
  "supabase/migrations/065_business_manager_platform.sql",
  "lib/business-manager/engine.ts",
  "lib/business-manager/organizations.ts",
  "lib/business-manager/teams.ts",
  "lib/business-manager/projects.ts",
  "lib/business-manager/tasks.ts",
  "lib/business-manager/workflows.ts",
  "lib/business-manager/approvals.ts",
  "lib/business-manager/analytics.ts",
  "lib/business-manager/assistant.ts",
  "lib/business-manager/health.ts",
  "lib/business-manager/integrations/index.ts",
  "lib/business-manager/index.ts",
  "lib/ai-core/adapters/business-manager-ai.ts",
  "app/api/business-manager/health/route.ts",
  "app/api/business-manager/analytics/route.ts",
  "app/api/business-manager/actions/route.ts",
  "app/api/business-manager/organizations/route.ts",
  "app/api/business-manager/teams/route.ts",
  "app/api/business-manager/projects/route.ts",
  "app/api/business-manager/projects/[id]/route.ts",
  "app/api/business-manager/tasks/route.ts",
  "app/api/business-manager/tasks/[id]/route.ts",
  "app/api/business-manager/milestones/route.ts",
  "app/api/business-manager/workflows/route.ts",
  "app/api/business-manager/approvals/route.ts",
  "app/api/business-manager/kpis/route.ts",
  "app/api/business-manager/integrations/route.ts",
  "components/dashboard/business-manager/business-manager-workspace.tsx",
  "components/dashboard/business-manager/strategy-workspace.tsx",
  "app/(dashboard)/dashboard/business-manager/page.tsx",
  "scripts/verify-business-manager.mjs",
];

console.log("\n[1] Platform files");
for (const rel of FILES) {
  if (existsSync(join(root, rel))) ok(rel);
  else fail(rel, "missing");
}

console.log("\n[2] Migration 065");
const m065 = readFileSync(join(root, "supabase/migrations/065_business_manager_platform.sql"), "utf8");
for (const t of [
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
]) {
  if (m065.includes(t)) ok(`table: ${t}`);
  else fail(`missing table: ${t}`);
}
if (m065.includes("enable row level security")) ok("RLS enabled");
else fail("RLS missing");

console.log("\n[3] AI engine");
const engine = readFileSync(join(root, "lib/business-manager/engine.ts"), "utf8");
for (const fn of ["generateBusinessPlan", "runBusinessAssistant"]) {
  if (engine.includes(fn)) ok(`engine: ${fn}`);
  else fail(`missing: ${fn}`);
}

console.log("\n[4] Assistant actions");
const actions = readFileSync(join(root, "app/api/business-manager/actions/route.ts"), "utf8");
for (const a of ["analyze", "improve", "summarize", "recommend"]) {
  if (actions.includes(a)) ok(`action: ${a}`);
  else fail(`action missing: ${a}`);
}

console.log("\n[5] Integrations foundation");
const integrations = readFileSync(join(root, "lib/business-manager/integrations/index.ts"), "utf8");
for (const b of ["getCrmBridgeSummary", "getErpBridgeSummary", "getMarketingBridgeSummary", "getSocialBridgeSummary", "getCalendarBridgeEvents"]) {
  if (integrations.includes(b)) ok(`bridge: ${b}`);
  else fail(`bridge missing: ${b}`);
}

console.log("\n[6] API security");
const protectedRoutes = [
  "app/api/business-manager/projects/route.ts",
  "app/api/business-manager/actions/route.ts",
  "app/api/business-manager/analytics/route.ts",
];
for (const rel of protectedRoutes) {
  const src = readFileSync(join(root, rel), "utf8");
  if (src.includes("requireUser")) ok(`${rel}: requireUser`);
  else fail(`${rel}: missing requireUser`);
}
const act = readFileSync(join(root, "app/api/business-manager/actions/route.ts"), "utf8");
if (act.includes("enforceAiUsage")) ok("actions: credits");
else fail("actions: missing credits");

console.log("\n[7] Workspace preservation");
const workspace = readFileSync(join(root, "components/dashboard/business-manager/business-manager-workspace.tsx"), "utf8");
if (workspace.includes("StrategyWorkspace") && workspace.includes("strategy")) ok("legacy AI Strategy tab");
const strategy = readFileSync(join(root, "lib/ai-core/adapters/business-manager-ai.ts"), "utf8");
if (strategy.includes("managerPlugin") && strategy.includes("registerProductEngineAdapter")) ok("AI Core pipeline preserved");
else fail("AI Core pipeline missing");

const legacyApi = readFileSync(join(root, "app/api/workspaces/[type]/route.ts"), "utf8");
if (legacyApi.includes("requireUser") || legacyApi.includes("workspace")) ok("legacy /api/workspaces/manager route");

console.log("\n[8] Dashboard route");
const page = readFileSync(join(root, "app/(dashboard)/dashboard/business-manager/page.tsx"), "utf8");
if (page.includes("BusinessManagerWorkspace") && !page.includes('redirect("/dashboard/business-intelligence")')) {
  ok("dedicated business-manager dashboard");
} else fail("dashboard still redirects to BI");

const nextConfig = readFileSync(join(root, "next.config.ts"), "utf8");
if (!nextConfig.includes('source: "/dashboard/business-manager"')) ok("next.config redirect removed");
else fail("next.config still redirects business-manager");

console.log("\n[9] package.json");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
if (pkg.scripts?.["verify:business-manager"]) ok("npm run verify:business-manager");
else fail("verify script missing");

console.log(failed ? `\nBusiness Manager verify: ${failed} issue(s)\n` : "\nBusiness Manager verify: PASS\n");
process.exit(failed ? 1 : 0);
