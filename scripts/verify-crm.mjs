/**
 * Verify CRM Platform readiness.
 * Usage: npm run verify:crm
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
  "types/crm.ts",
  "lib/crm/types.ts",
  "supabase/migrations/066_crm_platform.sql",
  "lib/crm/engine.ts",
  "lib/crm/accounts.ts",
  "lib/crm/contacts.ts",
  "lib/crm/leads.ts",
  "lib/crm/pipeline.ts",
  "lib/crm/deals.ts",
  "lib/crm/tasks.ts",
  "lib/crm/activities.ts",
  "lib/crm/automation.ts",
  "lib/crm/analytics.ts",
  "lib/crm/assistant.ts",
  "lib/crm/health.ts",
  "lib/crm/permissions.ts",
  "lib/crm/integrations/index.ts",
  "lib/crm/index.ts",
  "lib/ai-core/adapters/crm-ai.ts",
  "app/api/crm/health/route.ts",
  "app/api/crm/analytics/route.ts",
  "app/api/crm/actions/route.ts",
  "app/api/crm/accounts/route.ts",
  "app/api/crm/contacts/route.ts",
  "app/api/crm/leads/route.ts",
  "app/api/crm/deals/route.ts",
  "app/api/crm/deals/[id]/route.ts",
  "app/api/crm/tasks/route.ts",
  "app/api/crm/tasks/[id]/route.ts",
  "app/api/crm/activities/route.ts",
  "app/api/crm/integrations/route.ts",
  "components/dashboard/crm/crm-workspace.tsx",
  "components/dashboard/crm/deals-pipeline.tsx",
  "app/(dashboard)/dashboard/crm/page.tsx",
  "scripts/verify-crm.mjs",
];

console.log("\n[1] Platform files");
for (const rel of FILES) {
  if (existsSync(join(root, rel))) ok(rel);
  else fail(rel, "missing");
}

console.log("\n[2] Migration 066");
const m066 = readFileSync(join(root, "supabase/migrations/066_crm_platform.sql"), "utf8");
for (const t of [
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
]) {
  if (m066.includes(t)) ok(`table: ${t}`);
  else fail(`missing table: ${t}`);
}
if (m066.includes("enable row level security")) ok("RLS enabled");
else fail("RLS missing");

console.log("\n[3] CRM engine");
const engine = readFileSync(join(root, "lib/crm/engine.ts"), "utf8");
if (engine.includes("runCrmAssistant")) ok("engine: runCrmAssistant");
else fail("missing: runCrmAssistant");

console.log("\n[4] Assistant actions");
const actions = readFileSync(join(root, "app/api/crm/actions/route.ts"), "utf8");
for (const a of [
  "analyze_customer",
  "score_lead",
  "suggest_next_action",
  "summarize_history",
  "generate_sales_email",
  "improve_deal_strategy",
]) {
  if (actions.includes(a)) ok(`action: ${a}`);
  else fail(`action missing: ${a}`);
}

console.log("\n[5] Integrations foundation");
const integrations = readFileSync(join(root, "lib/crm/integrations/index.ts"), "utf8");
for (const b of [
  "getMarketingLeadBridge",
  "getSocialInteractionBridge",
  "getBusinessManagerTaskBridge",
  "getCalendarMeetingsBridge",
  "getEmailCommunicationBridge",
  "importFromGrowthEngine",
]) {
  if (integrations.includes(b)) ok(`bridge: ${b}`);
  else fail(`bridge missing: ${b}`);
}

console.log("\n[6] API security");
const protectedRoutes = [
  "app/api/crm/accounts/route.ts",
  "app/api/crm/actions/route.ts",
  "app/api/crm/analytics/route.ts",
  "app/api/crm/deals/route.ts",
];
for (const rel of protectedRoutes) {
  const src = readFileSync(join(root, rel), "utf8");
  if (src.includes("requireUser")) ok(`${rel}: requireUser`);
  else fail(`${rel}: missing requireUser`);
}
const act = readFileSync(join(root, "app/api/crm/actions/route.ts"), "utf8");
if (act.includes("enforceAiUsage")) ok("actions: credits");
else fail("actions: missing credits");

console.log("\n[7] Legacy Growth CRM preservation");
const growthApi = readFileSync(join(root, "app/api/growth/crm/route.ts"), "utf8");
if (growthApi.includes("growth_contacts") || growthApi.includes("growth_deals")) ok("legacy /api/growth/crm");
else fail("legacy growth CRM API missing");
const growthPanel = readFileSync(join(root, "components/dashboard/platform/growth-panel.tsx"), "utf8");
if (growthPanel.includes("crm") || growthPanel.includes("CRM")) ok("Growth Engine CRM tab preserved");

console.log("\n[8] Dashboard route & navigation");
const page = readFileSync(join(root, "app/(dashboard)/dashboard/crm/page.tsx"), "utf8");
if (page.includes("CrmWorkspace")) ok("dedicated /dashboard/crm page");
else fail("CRM dashboard page missing");
const nav = readFileSync(join(root, "lib/constants/dashboard-nav.ts"), "utf8");
if (nav.includes('href: "/dashboard/crm"')) ok("CRM in dashboard navigation");
else fail("CRM nav entry missing");

const workspace = readFileSync(join(root, "components/dashboard/crm/crm-workspace.tsx"), "utf8");
if (workspace.includes("DealsPipeline") && workspace.includes("AssistantPanel")) ok("CRM workspace tabs");
else fail("CRM workspace incomplete");

const pipeline = readFileSync(join(root, "components/dashboard/crm/deals-pipeline.tsx"), "utf8");
if (pipeline.includes("draggable") && pipeline.includes("onDrop")) ok("Kanban drag-and-drop");
else fail("Kanban pipeline missing");

console.log("\n[9] package.json");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
if (pkg.scripts?.["verify:crm"]) ok("npm run verify:crm");
else fail("verify script missing");

console.log(failed ? `\nCRM verify: ${failed} issue(s)\n` : "\nCRM verify: PASS\n");
process.exit(failed ? 1 : 0);
