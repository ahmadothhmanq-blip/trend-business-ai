/**
 * Verify Content Studio production readiness.
 * Usage: npm run verify:content-studio
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

const CORE_FILES = [
  "lib/content-generator.ts",
  "lib/ai-core/adapters/content-studio.ts",
  "plugins/content-studio/index.ts",
  "plugins/content-studio/types.ts",
  "plugins/content-studio/schemas.ts",
  "lib/ai/prompts/content-studio.ts",
  "lib/constants/content-studio.ts",
  "lib/content-studio/health.ts",
  "types/content.ts",
  "app/api/content-studio/route.ts",
  "app/api/content-studio/[id]/route.ts",
  "app/api/content-studio/calendar/route.ts",
  "app/api/content-studio/calendar/[id]/route.ts",
  "app/api/content-studio/health/route.ts",
  "components/dashboard/content-studio/content-studio-tool.tsx",
  "components/dashboard/content-studio/content-studio-workspace.tsx",
  "components/dashboard/content-studio/content-calendar.tsx",
  "app/(dashboard)/dashboard/content-studio/page.tsx",
  "supabase/migrations/019_content_studio.sql",
  "supabase/migrations/060_content_studio_constraints.sql",
];

console.log("\n[1] Content Studio platform files");
for (const rel of CORE_FILES) {
  if (existsSync(join(root, rel))) ok(rel);
  else fail(rel, "missing");
}

console.log("\n[2] AI pipeline wiring");
const generator = readFileSync(join(root, "lib/content-generator.ts"), "utf8");
if (generator.includes("layerRunner.run") && generator.includes("createContentStudioAdapter")) {
  ok("content-generator uses LayerRunner + adapter");
} else fail("content-generator missing pipeline wiring");

const adapter = readFileSync(join(root, "lib/ai-core/adapters/content-studio.ts"), "utf8");
if (adapter.includes("registerProductEngineAdapter") && adapter.includes("contentStudioPlugin")) {
  ok("adapter registers plugin");
} else fail("adapter missing plugin registration");

const plugin = readFileSync(join(root, "plugins/content-studio/index.ts"), "utf8");
for (const step of ["analyze", "plan", "generate", "validate"]) {
  if (plugin.includes(step)) ok(`plugin step: ${step}`);
  else fail(`plugin missing step: ${step}`);
}

console.log("\n[3] API route markers");
const mainRoute = readFileSync(join(root, "app/api/content-studio/route.ts"), "utf8");
if (mainRoute.includes("requireUser")) ok("main route: requireUser");
else fail("main route missing requireUser");
if (mainRoute.includes("enforceAiUsage")) ok("main route: enforceAiUsage / credits");
else fail("main route missing enforceAiUsage");
if (mainRoute.includes('"continue"')) ok("main route: continue mode in schema");
else fail("main route missing continue mode");

const idRoute = readFileSync(join(root, "app/api/content-studio/[id]/route.ts"), "utf8");
if (idRoute.includes("requireUser") && idRoute.includes("content_generation")) {
  ok("[id] route: auth + favorites sync");
} else fail("[id] route missing auth or favorites");

const healthRoute = readFileSync(join(root, "app/api/content-studio/health/route.ts"), "utf8");
if (healthRoute.includes("buildContentStudioHealthReport")) ok("health route wired");
else fail("health route missing");

console.log("\n[4] Database migrations");
const m060 = readFileSync(join(root, "supabase/migrations/060_content_studio_constraints.sql"), "utf8");
if (m060.includes("content_generation")) ok("060: favorites content_generation");
else fail("060 missing content_generation in favorites");
if (m060.includes("'continue'")) ok("060: continue mode constraint");
else fail("060 missing continue mode");

console.log("\n[5] Security markers");
if (!mainRoute.includes("NEXT_PUBLIC") && !mainRoute.includes("service_role")) {
  ok("no secret exposure in main route");
} else fail("possible secret exposure in main route");

const tool = readFileSync(join(root, "components/dashboard/content-studio/content-studio-tool.tsx"), "utf8");
if (tool.includes("safeMarkdownToHtml")) ok("preview uses safeMarkdownToHtml");
else fail("preview missing safeMarkdownToHtml");

console.log("\n[6] package.json script");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
if (pkg.scripts?.["verify:content-studio"]) ok("npm run verify:content-studio");
else fail("package.json missing verify:content-studio");

console.log(failed ? `\nContent Studio verify: ${failed} issue(s)\n` : "\nContent Studio verify: PASS\n");
process.exit(failed ? 1 : 0);
