/**
 * Verify Content Studio AI Content Creation Platform.
 * Usage: npm run verify:content-studio-platform
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

const PLATFORM_FILES = [
  "supabase/migrations/061_content_studio_platform.sql",
  "lib/content-studio/templates.ts",
  "lib/content-studio/actions.ts",
  "lib/content-studio/brand-voice.ts",
  "lib/content-studio/documents.ts",
  "lib/content-studio/versions.ts",
  "lib/content-studio/index.ts",
  "components/dashboard/content-studio/content-platform-workspace.tsx",
  "components/dashboard/content-studio/content-editor.tsx",
  "components/dashboard/content-studio/content-templates-panel.tsx",
  "app/api/content-studio/templates/route.ts",
  "app/api/content-studio/documents/route.ts",
  "app/api/content-studio/documents/[id]/route.ts",
  "app/api/content-studio/versions/route.ts",
  "app/api/content-studio/actions/route.ts",
  "app/api/content-studio/stream/route.ts",
  "app/api/content-studio/projects/route.ts",
  "app/api/content-studio/health/route.ts",
];

const API_ROUTES = [
  "app/api/content-studio/health/route.ts",
  "app/api/content-studio/templates/route.ts",
  "app/api/content-studio/documents/route.ts",
  "app/api/content-studio/documents/[id]/route.ts",
  "app/api/content-studio/versions/route.ts",
  "app/api/content-studio/actions/route.ts",
];

console.log("\n[1] Platform files");
for (const rel of PLATFORM_FILES) {
  if (existsSync(join(root, rel))) ok(rel);
  else fail(rel, "missing");
}

console.log("\n[2] Database migration 061");
const m061 = readFileSync(join(root, "supabase/migrations/061_content_studio_platform.sql"), "utf8");
for (const table of ["content_projects", "content_documents", "content_versions", "content_templates"]) {
  if (m061.includes(table)) ok(`table: ${table}`);
  else fail(`table missing: ${table}`);
}
if (m061.includes("enable row level security")) ok("RLS enabled");
else fail("RLS policies missing");
if (m061.includes("auth.uid() = user_id")) ok("user isolation policies");
else fail("user isolation policies missing");

console.log("\n[3] API routes — auth & credits");
for (const rel of API_ROUTES) {
  const src = readFileSync(join(root, rel), "utf8");
  if (rel.includes("health")) {
    if (src.includes("buildContentStudioHealthReport")) ok(`${rel}: health wired`);
    else fail(`${rel}: health missing`);
    continue;
  }
  if (src.includes("requireUser")) ok(`${rel}: requireUser`);
  else fail(`${rel}: missing requireUser`);
}
const actions = readFileSync(join(root, "app/api/content-studio/actions/route.ts"), "utf8");
if (actions.includes("enforceAiUsage")) ok("actions: credits enforcement");
else fail("actions: missing enforceAiUsage");
const stream = readFileSync(join(root, "app/api/content-studio/stream/route.ts"), "utf8");
if (stream.includes("enforceAiUsage") && stream.includes("token")) ok("stream: credits + token events");
else fail("stream: missing credits or token streaming");

console.log("\n[4] Platform exports");
const index = readFileSync(join(root, "lib/content-studio/index.ts"), "utf8");
for (const exp of ["runContentAction", "applyTemplateVariables", "fetchBrandVoiceContext", "createDocumentVersion", "documentCounts"]) {
  if (index.includes(exp)) ok(`export: ${exp}`);
  else fail(`export missing: ${exp}`);
}

console.log("\n[5] AI writing actions");
const actionsLib = readFileSync(join(root, "lib/content-studio/actions.ts"), "utf8");
for (const action of ["rewrite", "improve", "expand", "shorten", "summarize", "translate", "change_tone", "change_style"]) {
  if (actionsLib.includes(action)) ok(`action: ${action}`);
  else fail(`action missing: ${action}`);
}

console.log("\n[6] Templates catalog");
const templates = readFileSync(join(root, "lib/content-studio/templates.ts"), "utf8");
for (const cat of ["Blog", "Social Media", "Ads", "Email", "Product Description", "Landing Pages", "SEO Articles", "Business Documents"]) {
  if (templates.includes(cat)) ok(`category: ${cat}`);
  else fail(`category missing: ${cat}`);
}
if (templates.includes("applyTemplateVariables")) ok("template variable substitution");

console.log("\n[7] Brand voice integration (read-only)");
const brand = readFileSync(join(root, "lib/content-studio/brand-voice.ts"), "utf8");
if (brand.includes("brand_identity_generations") && brand.includes("brandVoiceToPromptContext")) {
  ok("brand voice extraction from Brand Studio data");
} else fail("brand voice integration incomplete");

console.log("\n[8] Workspace & editor wiring");
const workspace = readFileSync(join(root, "components/dashboard/content-studio/content-studio-workspace.tsx"), "utf8");
if (workspace.includes("ContentPlatformWorkspace") && workspace.includes("workspace")) ok("workspace tab wired");
else fail("workspace tab missing");
const editor = readFileSync(join(root, "components/dashboard/content-studio/content-editor.tsx"), "utf8");
if (editor.includes("countWords") && editor.includes("/api/content-studio/actions")) ok("editor: word count + AI actions");
else fail("editor wiring incomplete");

console.log("\n[9] Security markers");
const docsRoute = readFileSync(join(root, "app/api/content-studio/documents/route.ts"), "utf8");
if (docsRoute.includes(".eq(\"user_id\"")) ok("documents: user scoping");
else fail("documents: user scoping missing");
if (!actions.includes("NEXT_PUBLIC") && !stream.includes("service_role")) ok("no secret exposure in AI routes");
else fail("possible secret exposure");

console.log("\n[10] package.json script");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
if (pkg.scripts?.["verify:content-studio-platform"]) ok("npm run verify:content-studio-platform");
else fail("package.json missing verify:content-studio-platform");

console.log(failed ? `\nContent Studio platform verify: ${failed} issue(s)\n` : "\nContent Studio platform verify: PASS\n");
process.exit(failed ? 1 : 0);
