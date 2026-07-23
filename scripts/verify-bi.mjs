/**
 * Verify BI Platform readiness.
 * Usage: npm run verify:bi
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
  "types/bi.ts",
  "lib/bi/types.ts",
  "supabase/migrations/068_bi_platform.sql",
  "lib/bi/engine.ts",
  "lib/bi/metrics.ts",
  "lib/bi/dashboards.ts",
  "lib/bi/widgets.ts",
  "lib/bi/reports.ts",
  "lib/bi/queries.ts",
  "lib/bi/alerts.ts",
  "lib/bi/analytics.ts",
  "lib/bi/health.ts",
  "lib/bi/permissions.ts",
  "lib/bi/audit.ts",
  "lib/bi/assistant.ts",
  "lib/bi/integrations/index.ts",
  "lib/bi/index.ts",
  "lib/ai-core/adapters/bi-ai.ts",
  "app/api/bi/health/route.ts",
  "app/api/bi/analytics/route.ts",
  "app/api/bi/actions/route.ts",
  "app/api/bi/data-sources/route.ts",
  "app/api/bi/datasets/route.ts",
  "app/api/bi/dashboards/route.ts",
  "app/api/bi/metrics/route.ts",
  "app/api/bi/reports/route.ts",
  "app/api/bi/integrations/route.ts",
  "components/dashboard/bi/bi-workspace.tsx",
  "app/(dashboard)/dashboard/bi/page.tsx",
  "scripts/verify-bi.mjs",
];

console.log("\n[1] Platform files");
for (const rel of FILES) {
  if (existsSync(join(root, rel))) ok(rel);
  else fail(rel, "missing");
}

console.log("\n[2] Migration 068");
const m068 = readFileSync(join(root, "supabase/migrations/068_bi_platform.sql"), "utf8");
for (const t of [
  "bi_data_sources",
  "bi_datasets",
  "bi_models",
  "bi_metrics",
  "bi_dimensions",
  "bi_kpis",
  "bi_dashboards",
  "bi_widgets",
  "bi_reports",
  "bi_scheduled_reports",
  "bi_queries",
  "bi_alerts",
  "bi_audit_log",
]) {
  if (m068.includes(t)) ok(`table: ${t}`);
  else fail(`missing table: ${t}`);
}
if (m068.includes("enable row level security")) ok("RLS enabled");
else fail("RLS missing");

console.log("\n[3] BI engine");
const engine = readFileSync(join(root, "lib/bi/engine.ts"), "utf8");
if (engine.includes("runBiAssistant")) ok("engine: runBiAssistant");
else fail("missing: runBiAssistant");

console.log("\n[4] Assistant actions");
const actions = readFileSync(join(root, "app/api/bi/actions/route.ts"), "utf8");
for (const a of [
  "analyze_performance",
  "explain_kpi",
  "detect_trends",
  "detect_anomalies",
  "forecast_revenue",
  "generate_executive_report",
  "natural_language_query",
]) {
  if (actions.includes(a)) ok(`action: ${a}`);
  else fail(`action missing: ${a}`);
}

console.log("\n[5] Integrations (read-only)");
const integrations = readFileSync(join(root, "lib/bi/integrations/index.ts"), "utf8");
for (const b of [
  "getCrmBiData",
  "getErpBiData",
  "getMarketingBiData",
  "getSocialBiData",
  "getBusinessManagerBiData",
  "getWebsiteBiData",
  "getBillingBiData",
  "collectIntegratedMetrics",
]) {
  if (integrations.includes(b)) ok(`bridge: ${b}`);
  else fail(`bridge missing: ${b}`);
}

console.log("\n[6] Calculated metrics");
const metrics = readFileSync(join(root, "lib/bi/metrics.ts"), "utf8");
for (const m of ["revenue", "expenses", "profit", "conversionRate", "pipelineValue", "customerGrowth", "inventoryValue", "marketingRoi"]) {
  if (metrics.includes(m)) ok(`metric: ${m}`);
  else fail(`metric missing: ${m}`);
}

console.log("\n[7] API security");
const protectedRoutes = [
  "app/api/bi/dashboards/route.ts",
  "app/api/bi/actions/route.ts",
  "app/api/bi/analytics/route.ts",
  "app/api/bi/data-sources/route.ts",
];
for (const rel of protectedRoutes) {
  const src = readFileSync(join(root, rel), "utf8");
  if (src.includes("requireUser")) ok(`${rel}: requireUser`);
  else fail(`${rel}: missing requireUser`);
}
const act = readFileSync(join(root, "app/api/bi/actions/route.ts"), "utf8");
if (act.includes("enforceAiUsage")) ok("actions: credits");
else fail("actions: missing credits");

console.log("\n[8] Dashboard route & navigation");
const page = readFileSync(join(root, "app/(dashboard)/dashboard/bi/page.tsx"), "utf8");
if (page.includes("BiWorkspace")) ok("dedicated /dashboard/bi page");
else fail("BI dashboard page missing");
const nav = readFileSync(join(root, "lib/constants/dashboard-nav.ts"), "utf8");
if (nav.includes('href: "/dashboard/bi"')) ok("BI in dashboard navigation");
else fail("BI nav entry missing");
const legacy = readFileSync(join(root, "lib/constants/dashboard-nav.ts"), "utf8");
if (legacy.includes('href: "/dashboard/business-intelligence"')) ok("Legacy Business Suite nav preserved");
else fail("Legacy Business Suite nav missing");

console.log("\n[9] package.json");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
if (pkg.scripts?.["verify:bi"]) ok("npm run verify:bi");
else fail("verify script missing");

console.log(failed ? `\nBI verify: ${failed} issue(s)\n` : "\nBI verify: PASS\n");
process.exit(failed ? 1 : 0);
