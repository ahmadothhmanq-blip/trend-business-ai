/**
 * Verify ERP Platform readiness.
 * Usage: npm run verify:erp
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
  "types/erp.ts",
  "lib/erp/types.ts",
  "supabase/migrations/067_erp_platform.sql",
  "lib/erp/engine.ts",
  "lib/erp/companies.ts",
  "lib/erp/accounting.ts",
  "lib/erp/invoices.ts",
  "lib/erp/expenses.ts",
  "lib/erp/payments.ts",
  "lib/erp/products.ts",
  "lib/erp/inventory.ts",
  "lib/erp/sales-orders.ts",
  "lib/erp/procurement.ts",
  "lib/erp/hr.ts",
  "lib/erp/analytics.ts",
  "lib/erp/health.ts",
  "lib/erp/integrations/index.ts",
  "lib/erp/index.ts",
  "lib/ai-core/adapters/erp-ai.ts",
  "app/api/erp/health/route.ts",
  "app/api/erp/analytics/route.ts",
  "app/api/erp/actions/route.ts",
  "app/api/erp/companies/route.ts",
  "app/api/erp/accounts/route.ts",
  "app/api/erp/invoices/route.ts",
  "app/api/erp/expenses/route.ts",
  "app/api/erp/products/route.ts",
  "app/api/erp/inventory/route.ts",
  "app/api/erp/sales-orders/route.ts",
  "app/api/erp/purchase-orders/route.ts",
  "app/api/erp/employees/route.ts",
  "app/api/erp/integrations/route.ts",
  "components/dashboard/erp/erp-workspace.tsx",
  "app/(dashboard)/dashboard/erp/page.tsx",
  "scripts/verify-erp.mjs",
];

console.log("\n[1] Platform files");
for (const rel of FILES) {
  if (existsSync(join(root, rel))) ok(rel);
  else fail(rel, "missing");
}

console.log("\n[2] Migration 067");
const m067 = readFileSync(join(root, "supabase/migrations/067_erp_platform.sql"), "utf8");
for (const t of [
  "erp_companies",
  "erp_branches",
  "erp_departments",
  "erp_roles",
  "erp_accounts",
  "erp_transactions",
  "erp_journal_entries",
  "erp_invoices",
  "erp_expenses",
  "erp_payments",
  "erp_products",
  "erp_categories",
  "erp_warehouses",
  "erp_stock_movements",
  "erp_suppliers",
  "erp_sales_orders",
  "erp_purchase_orders",
  "erp_approvals",
  "erp_employees",
  "erp_attendance",
  "erp_payroll",
  "erp_reports",
  "erp_metrics",
]) {
  if (m067.includes(t)) ok(`table: ${t}`);
  else fail(`missing table: ${t}`);
}
if (m067.includes("enable row level security")) ok("RLS enabled");
else fail("RLS missing");

console.log("\n[3] ERP engine");
const engine = readFileSync(join(root, "lib/erp/engine.ts"), "utf8");
if (engine.includes("runErpAssistant")) ok("engine: runErpAssistant");
else fail("missing: runErpAssistant");

console.log("\n[4] Assistant actions");
const actions = readFileSync(join(root, "app/api/erp/actions/route.ts"), "utf8");
for (const a of [
  "analyze_financial_data",
  "generate_reports",
  "forecast_revenue",
  "predict_inventory",
  "recommend_actions",
  "summarize_performance",
]) {
  if (actions.includes(a)) ok(`action: ${a}`);
  else fail(`action missing: ${a}`);
}

console.log("\n[5] Integrations foundation");
const integrations = readFileSync(join(root, "lib/erp/integrations/index.ts"), "utf8");
for (const b of [
  "getCrmDealsForErp",
  "getBusinessManagerBridge",
  "getMarketingBridge",
  "getSocialBridge",
  "getBillingBridge",
  "getCalendarBridge",
  "getErpBridgeSummary",
]) {
  if (integrations.includes(b)) ok(`bridge: ${b}`);
  else fail(`bridge missing: ${b}`);
}

console.log("\n[6] API security");
const protectedRoutes = [
  "app/api/erp/companies/route.ts",
  "app/api/erp/actions/route.ts",
  "app/api/erp/analytics/route.ts",
  "app/api/erp/invoices/route.ts",
];
for (const rel of protectedRoutes) {
  const src = readFileSync(join(root, rel), "utf8");
  if (src.includes("requireUser")) ok(`${rel}: requireUser`);
  else fail(`${rel}: missing requireUser`);
}
const act = readFileSync(join(root, "app/api/erp/actions/route.ts"), "utf8");
if (act.includes("enforceAiUsage")) ok("actions: credits");
else fail("actions: missing credits");

console.log("\n[7] Legacy BM ERP bridge");
const bmBridge = readFileSync(join(root, "lib/business-manager/integrations/erp-bridge.ts"), "utf8");
if (bmBridge.includes("erp_invoices") || bmBridge.includes("legacy-bridge")) ok("BM bridge uses real ERP data");
else fail("BM bridge still uses billing only");

console.log("\n[8] Dashboard route & navigation");
const page = readFileSync(join(root, "app/(dashboard)/dashboard/erp/page.tsx"), "utf8");
if (page.includes("ErpWorkspace")) ok("dedicated /dashboard/erp page");
else fail("ERP dashboard page missing");
const nav = readFileSync(join(root, "lib/constants/dashboard-nav.ts"), "utf8");
if (nav.includes('href: "/dashboard/erp"')) ok("ERP in dashboard navigation");
else fail("ERP nav entry missing");

console.log("\n[9] package.json");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
if (pkg.scripts?.["verify:erp"]) ok("npm run verify:erp");
else fail("verify script missing");

console.log(failed ? `\nERP verify: ${failed} issue(s)\n` : "\nERP verify: PASS\n");
process.exit(failed ? 1 : 0);
