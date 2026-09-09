/**
 * App Builder launch readiness verification.
 * Usage:
 *   npm run verify:app-builder:launch
 *   npm run verify:app-builder:launch -- --production
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const forceProduction = process.argv.includes("--production");

function loadEnv() {
  for (const name of [".env.local", ".env"]) {
    const path = join(root, name);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq === -1) continue;
      const k = t.slice(0, eq).trim();
      let v = t.slice(eq + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (!process.env[k]) process.env[k] = v;
    }
  }
}

loadEnv();

let failed = 0;

function ok(label, detail = "") {
  console.log(`  ✓ ${label}${detail ? ` — ${detail}` : ""}`);
}
function fail(label, detail = "") {
  failed += 1;
  console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
}

const SPAWN_OPTS = { encoding: "utf8", stdio: "pipe", maxBuffer: 50 * 1024 * 1024 };

function runNpm(script, label) {
  const result = spawnSync("npm", ["run", script], {
    cwd: root,
    ...SPAWN_OPTS,
    shell: process.platform === "win32",
  });
  if (result.status === 0) {
    ok(label);
    return true;
  }
  const tail = (result.stderr || result.stdout || "").trim().split(/\r?\n/).slice(-5).join(" ");
  fail(label, tail);
  return false;
}

function runNode(script, label) {
  const result = spawnSync("node", [script], {
    cwd: root,
    ...SPAWN_OPTS,
    shell: process.platform === "win32",
  });
  if (result.status === 0) {
    ok(label);
    return true;
  }
  const tail = (result.stderr || result.stdout || "").trim().split(/\r?\n/).slice(-5).join(" ");
  fail(label, tail);
  return false;
}

function readJson(rel) {
  return JSON.parse(readFileSync(join(root, rel), "utf8"));
}

const LAUNCH_FILES = [
  "docs/APP_BUILDER_PRODUCTION_LAUNCH.md",
  "lib/webapp/builder/client-api-error.ts",
  "components/dashboard/webapp-builder/app-copilot-command-panel.tsx",
  "components/dashboard/webapp-builder/app-studio-chat.tsx",
  "components/dashboard/webapp-builder/app-builder-onboarding.tsx",
  "components/dashboard/webapp-builder/hooks/use-app-copilot-command.ts",
  "app/api/webapp-builder/[id]/copilot/commands/route.ts",
  "app/api/webapp-builder/[id]/copilot/stream/route.ts",
  "app/api/webapp-builder/[id]/copilot/undo/route.ts",
  "app/api/webapp-builder/studio-chat/route.ts",
  "app/w/app/[slug]/route.ts",
  "lib/webapp/public-demo-banner.ts",
  "supabase/migrations/046_webapp_deployments.sql",
  "supabase/migrations/076_webapp_platform_foundation.sql",
  "supabase/migrations/097_webapp_publications.sql",
];

const COPILOT_I18N_KEYS = [
  "copilot.title",
  "copilot.subtitle",
  "copilot.runCommand",
  "copilot.errors.streamFailed",
  "copilot.errors.commandFailed",
  "copilot.errors.undoFailed",
  "copilot.examples.changeColor.label",
  "copilot.examples.changeColor.command",
];

console.log("\n[1] Launch files");
for (const rel of LAUNCH_FILES) {
  if (existsSync(join(root, rel))) ok(rel);
  else fail(rel, "missing");
}

console.log("\n[2] Copilot i18n keys (en + ar)");
const en = readJson("locales/en.json");
const ar = readJson("locales/ar.json");

function getNested(obj, dotted) {
  return dotted.split(".").reduce((acc, key) => acc?.[key], obj);
}

for (const key of COPILOT_I18N_KEYS) {
  const enVal = getNested(en.products?.webappBuilder, key);
  const arVal = getNested(ar.products?.webappBuilder, key);
  if (typeof enVal === "string" && enVal.trim()) ok(`en: webappBuilder.${key}`);
  else fail(`en: webappBuilder.${key}`, "missing");
  if (typeof arVal === "string" && arVal.trim() && arVal !== enVal) {
    ok(`ar: webappBuilder.${key}`);
  } else if (typeof arVal === "string" && arVal.trim()) {
    ok(`ar: webappBuilder.${key}`, "same as EN (acceptable)");
  } else {
    fail(`ar: webappBuilder.${key}`, "missing");
  }
}

console.log("\n[2b] Studio Chat + onboarding i18n keys (en + ar)");
const STUDIO_I18N_KEYS = [
  "studioChat.buildTitle",
  "studioChat.send",
  "onboarding.title",
  "onboarding.verticals.crm.label",
  "management.zipPlaybookTitle",
];
for (const key of STUDIO_I18N_KEYS) {
  const enVal = getNested(en.products?.webappBuilder, key);
  const arVal = getNested(ar.products?.webappBuilder, key);
  if (typeof enVal === "string" && enVal.trim()) ok(`en: webappBuilder.${key}`);
  else fail(`en: webappBuilder.${key}`, "missing");
  if (typeof arVal === "string" && arVal.trim()) ok(`ar: webappBuilder.${key}`);
  else fail(`ar: webappBuilder.${key}`, "missing");
}

console.log("\n[3] Copilot panel wired to i18n");
const panel = readFileSync(
  join(root, "components/dashboard/webapp-builder/app-copilot-command-panel.tsx"),
  "utf8",
);
if (panel.includes('useProductT("webappBuilder")') && panel.includes('p("copilot.')) {
  ok("app-copilot-command-panel uses useProductT");
} else {
  fail("app-copilot-command-panel i18n wiring");
}

console.log("\n[4] Sub-verifiers");
runNpm("verify:app-builder", "verify:app-builder");
runNode("scripts/verify-app-copilot.mjs", "verify-app-copilot");

console.log("\n[5] Unit tests (all lib/ai/webapp-*.test.ts)");
const webappTestDir = join(root, "lib", "ai");
const webappTestFiles = readdirSync(webappTestDir)
  .filter((name) => /^webapp-.*\.test\.ts$/.test(name))
  .sort()
  .map((name) => join("lib", "ai", name));

if (webappTestFiles.length === 0) {
  fail("lib/ai/webapp-*.test.ts", "no test files found");
} else {
  const testResult = spawnSync(
    "npx",
    ["tsx", "--test", ...webappTestFiles],
    { cwd: root, ...SPAWN_OPTS, shell: process.platform === "win32" },
  );
  if (testResult.status === 0) {
    ok(`webapp unit tests (${webappTestFiles.length} files)`);
  } else {
    const tail = (testResult.stderr || testResult.stdout || "")
      .trim()
      .split(/\r?\n/)
      .slice(-8)
      .join(" ");
    fail(`webapp unit tests (${webappTestFiles.length} files)`, tail);
  }
}

if (forceProduction) {
  console.log("\n[6] Production env");
  if (process.env.DEEPSEEK_API_KEY?.trim()) ok("DEEPSEEK_API_KEY set");
  else fail("DEEPSEEK_API_KEY missing");
  if (process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) ok("SUPABASE_SERVICE_ROLE_KEY set");
  else fail("SUPABASE_SERVICE_ROLE_KEY missing");
}

console.log("");
if (failed > 0) {
  console.error(`verify-app-builder-launch: FAILED (${failed})`);
  process.exit(1);
}
console.log("verify-app-builder-launch: PASS");
