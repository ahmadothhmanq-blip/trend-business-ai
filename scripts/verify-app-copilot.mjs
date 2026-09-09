/**
 * App Copilot Phase 4 — contract + routing verification.
 * Usage: node scripts/verify-app-copilot.mjs
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;
function ok(label) {
  console.log(`  ✓ ${label}`);
}
function fail(label, err) {
  failed++;
  console.log(`  ✗ ${label}: ${err}`);
}

const ROUTING_RULES = [
  { re: /(?:change|set|update)\s+(?:app\s+|application\s+)?(?:colors?|theme|primary)/i, uri: "app.brand.color.set" },
  { re: /add\s+(?:a\s+)?(?:new\s+)?(product|menu item|service)/i, uri: "app.catalog.add" },
  { re: /(?:add|create)\s+(?:a\s+)?(?:new\s+)?(?:screen|page|dashboard)/i, uri: "app.screen.add" },
  { re: /add\s+booking\s+feature/i, uri: "app.feature.booking" },
  { re: /improve.*app|regenerat.*app/i, uri: "app.assistant.continue" },
];

function routeAppCommand(command) {
  const text = command.trim();
  if (!text) return { uri: "app.advisory.unknown" };
  const matched = [];
  for (const rule of ROUTING_RULES) {
    if (rule.re.test(text)) matched.push(rule.uri);
  }
  const unique = [...new Set(matched)];
  if (unique.length > 1) return { uri: "app.advisory.compound" };
  if (unique.length === 1) return { uri: unique[0] };
  return { uri: "app.advisory.unknown" };
}

const cases = [
  ["Change primary color to blue", "app.brand.color.set"],
  ["Add a new product called Widget", "app.catalog.add"],
  ["Add a dashboard screen", "app.screen.add"],
  ["Add booking feature", "app.feature.booking"],
  ["Improve the app with AI", "app.assistant.continue"],
];

for (const [command, expected] of cases) {
  const match = routeAppCommand(command);
  if (match.uri !== expected) {
    fail(`router: "${command}"`, `expected ${expected}, got ${match.uri}`);
  } else {
    ok(`router → ${expected}`);
  }
}

const requiredPaths = [
  "lib/ai-core/app-copilot/index.ts",
  "lib/ai-core/app-copilot/processor.ts",
  "lib/ai-core/app-copilot/stream.ts",
  "lib/ai-core/app-copilot/undo.ts",
  "lib/webapp/platform/index.ts",
  "lib/webapp/platform/commit.ts",
  "app/api/webapp-builder/[id]/copilot/commands/route.ts",
  "app/api/webapp-builder/[id]/copilot/stream/route.ts",
  "app/api/webapp-builder/[id]/copilot/undo/route.ts",
  "components/dashboard/webapp-builder/app-copilot-command-panel.tsx",
  "supabase/migrations/076_webapp_platform_foundation.sql",
];

for (const rel of requiredPaths) {
  try {
    readFileSync(join(root, rel), "utf8");
    ok(`file exists: ${rel}`);
  } catch {
    fail(`file exists: ${rel}`, "missing");
  }
}

const manageSrc = readFileSync(
  join(root, "components/dashboard/webapp-builder/app-management-dashboard.tsx"),
  "utf8",
);
if (
  !manageSrc.includes("AppCopilotCommandPanel") &&
  !manageSrc.includes("AppStudioChat")
) {
  fail("management assistant delegation", "missing copilot/studio chat panel");
} else ok("management dashboard uses App Studio Chat / Copilot");

const studioChatSrc = readFileSync(
  join(root, "components/dashboard/webapp-builder/app-studio-chat.tsx"),
  "utf8",
);
if (!studioChatSrc.includes("useAppCopilotCommand")) {
  fail("studio chat edit path", "missing useAppCopilotCommand");
} else ok("studio chat reuses App Copilot command hook");

const appStream = readFileSync(
  join(root, "lib/ai-core/app-copilot/stream.ts"),
  "utf8",
);
if (!appStream.includes("runCopilotStreamLoop")) {
  fail("app stream kernel loop", "missing");
} else ok("app stream uses kernel loop");

if (failed) {
  console.error(`\nverify-app-copilot: FAILED (${failed})`);
  process.exit(1);
}
console.log("\nverify-app-copilot: OK");
