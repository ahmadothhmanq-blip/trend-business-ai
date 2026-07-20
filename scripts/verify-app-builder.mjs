/**
 * Verify App Builder platform upgrade (live preview, editor, deploy, health).
 * Usage: npm run verify:app-builder
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

const APP_BUILDER_FILES = [
  "lib/webapp/build-app-preview.ts",
  "lib/webapp/live-preview.ts",
  "lib/ai-core/app-design-platform/sync.ts",
  "lib/ai-core/app-design-platform/assistant-agent.ts",
  "lib/ai-core/app-design-platform/deploy.ts",
  "lib/ai-core/app-design-platform/backend.ts",
  "lib/ai-core/app-design-platform/workflows.ts",
  "lib/ai-core/app-design-platform/production-health.ts",
  "app/api/webapp-builder/[id]/live-preview/route.ts",
  "app/api/webapp-builder/[id]/deploy/route.ts",
  "app/api/webapp-builder/health/route.ts",
  "supabase/migrations/046_webapp_deployments.sql",
  "components/dashboard/webapp-builder/app-management-dashboard.tsx",
];

const REQUIRED_EXPORTS = [
  ["lib/ai-core/app-design-platform/index.ts", "syncAppModelToFiles"],
  ["lib/ai-core/app-design-platform/index.ts", "runAppAssistantAgent"],
  ["lib/ai-core/app-design-platform/index.ts", "provisionAppBackend"],
  ["lib/ai-core/app-design-platform/index.ts", "executeWorkflow"],
  ["lib/ai-core/app-design-platform/index.ts", "buildAppBuilderHealthReport"],
];

console.log("\n[1] App Builder platform files");
for (const rel of APP_BUILDER_FILES) {
  if (existsSync(join(root, rel))) ok(rel);
  else fail(rel, "missing");
}

console.log("\n[2] Public exports");
for (const [file, symbol] of REQUIRED_EXPORTS) {
  const src = readFileSync(join(root, file), "utf8");
  if (src.includes(symbol)) ok(`${file} exports ${symbol}`);
  else fail(`${file} missing export ${symbol}`);
}

console.log("\n[3] API route markers");
const manageRoute = readFileSync(
  join(root, "app/api/webapp-builder/[id]/manage/route.ts"),
  "utf8",
);
for (const action of [
  "editor_add_component",
  "sync_files",
  "provision_backend",
  "run_workflow",
]) {
  if (manageRoute.includes(action)) ok(`manage action: ${action}`);
  else fail(`manage action missing: ${action}`);
}

console.log("\n[4] Live preview iframe wiring");
const dashboard = readFileSync(
  join(root, "components/dashboard/webapp-builder/app-management-dashboard.tsx"),
  "utf8",
);
if (dashboard.includes("/live-preview")) ok("management dashboard iframe");
else fail("management dashboard missing live-preview iframe");

const tool = readFileSync(
  join(root, "components/dashboard/webapp-builder/webapp-builder-tool.tsx"),
  "utf8",
);
if (tool.includes("/live-preview")) ok("builder tool live preview");
else fail("builder tool missing live preview");

console.log("\n[5] Framing headers (next.config)");
const nextConfig = readFileSync(join(root, "next.config.ts"), "utf8");
if (nextConfig.includes("/api/webapp-builder/:id/live-preview")) {
  ok("next.config webapp live-preview headers");
} else {
  fail("next.config missing webapp live-preview headers");
}

console.log(failed ? `\nApp Builder verify: ${failed} issue(s)\n` : "\nApp Builder verify: PASS\n");
process.exit(failed ? 1 : 0);
