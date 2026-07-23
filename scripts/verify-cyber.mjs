/**
 * Verify Cybersecurity Platform readiness.
 * Usage: npm run verify:cyber
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
  "types/cyber.ts",
  "supabase/migrations/070_cybersecurity_platform.sql",
  "lib/cyber/engine.ts",
  "lib/cyber/threats.ts",
  "lib/cyber/intelligence.ts",
  "lib/cyber/osint.ts",
  "lib/cyber/assets.ts",
  "lib/cyber/vulnerabilities.ts",
  "lib/cyber/scans.ts",
  "lib/cyber/alerts.ts",
  "lib/cyber/monitoring.ts",
  "lib/cyber/incidents.ts",
  "lib/cyber/cases.ts",
  "lib/cyber/playbooks.ts",
  "lib/cyber/analytics.ts",
  "lib/cyber/reports.ts",
  "lib/cyber/assistant.ts",
  "lib/cyber/integrations/index.ts",
  "lib/cyber/permissions.ts",
  "lib/cyber/audit.ts",
  "lib/cyber/health.ts",
  "lib/cyber/index.ts",
  "lib/ai-core/adapters/cyber-ai.ts",
  "app/api/cyber/health/route.ts",
  "app/api/cyber/analytics/route.ts",
  "app/api/cyber/actions/route.ts",
  "app/api/cyber/assets/route.ts",
  "app/api/cyber/threats/route.ts",
  "app/api/cyber/alerts/route.ts",
  "app/api/cyber/incidents/route.ts",
  "app/api/cyber/vulnerabilities/route.ts",
  "app/api/cyber/osint/route.ts",
  "app/api/cyber/integrations/route.ts",
  "app/api/cyber/reports/route.ts",
  "components/dashboard/cybersecurity/cyber-workspace.tsx",
  "app/(dashboard)/dashboard/cybersecurity/page.tsx",
  "scripts/verify-cyber.mjs",
];

console.log("\n[1] Platform files");
for (const rel of FILES) {
  if (existsSync(join(root, rel))) ok(rel);
  else fail(rel, "missing");
}

console.log("\n[2] Migration 070");
const m070 = readFileSync(join(root, "supabase/migrations/070_cybersecurity_platform.sql"), "utf8");
for (const t of [
  "cyber_organizations",
  "cyber_roles",
  "cyber_users",
  "cyber_assets",
  "cyber_threats",
  "cyber_iocs",
  "cyber_feeds",
  "cyber_threat_reports",
  "cyber_events",
  "cyber_alerts",
  "cyber_detection_rules",
  "cyber_vulnerabilities",
  "cyber_scans",
  "cyber_findings",
  "cyber_incidents",
  "cyber_cases",
  "cyber_playbooks",
  "cyber_case_events",
  "cyber_risk_scores",
  "cyber_metrics",
  "cyber_audit_log",
]) {
  if (m070.includes(t)) ok(`table: ${t}`);
  else fail(`missing table: ${t}`);
}
if (m070.includes("enable row level security")) ok("RLS enabled");
else fail("RLS missing");

console.log("\n[3] Cyber engine");
const engine = readFileSync(join(root, "lib/cyber/engine.ts"), "utf8");
if (engine.includes("runCyberAssistant")) ok("engine: runCyberAssistant");
else fail("missing: runCyberAssistant");

console.log("\n[4] Assistant actions");
const actions = readFileSync(join(root, "app/api/cyber/actions/route.ts"), "utf8");
for (const a of [
  "analyze_posture",
  "explain_threat",
  "summarize_incident",
  "recommend_remediation",
  "generate_security_report",
  "risk_assessment",
  "compliance_recommendations",
]) {
  if (actions.includes(a)) ok(`action: ${a}`);
  else fail(`action missing: ${a}`);
}

console.log("\n[5] Integrations (read-only)");
const integrations = readFileSync(join(root, "lib/cyber/integrations/index.ts"), "utf8");
for (const b of [
  "getCrmSecurityContext",
  "getErpAssetContext",
  "getBiSecurityMetrics",
  "getBmIncidentTasks",
  "collectCyberIntegrations",
]) {
  if (integrations.includes(b)) ok(`bridge: ${b}`);
  else fail(`bridge missing: ${b}`);
}

console.log("\n[6] API security");
const protectedRoutes = [
  "app/api/cyber/assets/route.ts",
  "app/api/cyber/actions/route.ts",
  "app/api/cyber/analytics/route.ts",
  "app/api/cyber/incidents/route.ts",
];
for (const rel of protectedRoutes) {
  const src = readFileSync(join(root, rel), "utf8");
  if (src.includes("requireUser")) ok(`${rel}: requireUser`);
  else fail(`${rel}: missing requireUser`);
}
const act = readFileSync(join(root, "app/api/cyber/actions/route.ts"), "utf8");
if (act.includes("enforceAiUsage")) ok("actions: credits");
else fail("actions: missing credits");

console.log("\n[7] Dashboard route & navigation");
const page = readFileSync(join(root, "app/(dashboard)/dashboard/cybersecurity/page.tsx"), "utf8");
if (page.includes("CyberWorkspace")) ok("dedicated /dashboard/cybersecurity page");
else fail("Cyber dashboard page missing");
const nav = readFileSync(join(root, "lib/constants/dashboard-nav.ts"), "utf8");
if (nav.includes('href: "/dashboard/cybersecurity"')) ok("Cybersecurity in dashboard navigation");
else fail("Cyber nav entry missing");

console.log("\n[8] package.json");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
if (pkg.scripts?.["verify:cyber"]) ok("npm run verify:cyber");
else fail("verify script missing");

console.log(failed ? `\nCyber verify: ${failed} issue(s)\n` : "\nCyber verify: PASS\n");
process.exit(failed ? 1 : 0);
