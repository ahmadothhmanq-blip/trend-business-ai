/**
 * Website Copilot Phase 5 — memory, review, cross-product, chat UI verification.
 * Usage: node scripts/verify-website-copilot-phase5.mjs
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

const requiredPaths = [
  "docs/WEBSITE_COPILOT_PHASE5.md",
  "supabase/migrations/077_copilot_session_memory.sql",
  "lib/ai-core/copilot-kernel/memory.ts",
  "lib/ai-core/copilot-kernel/memory-service.ts",
  "lib/ai-core/copilot-kernel/review.ts",
  "lib/ai-core/copilot-kernel/cross-product.ts",
  "lib/ai-core/copilot-kernel/phase5.ts",
  "lib/ai-core/website-copilot/review.ts",
  "lib/ai-core/app-copilot/review.ts",
];

for (const rel of requiredPaths) {
  try {
    readFileSync(join(root, rel), "utf8");
    ok(`file exists: ${rel}`);
  } catch {
    fail(`file exists: ${rel}`, "missing");
  }
}

const crossProductSrc = readFileSync(
  join(root, "lib/ai-core/copilot-kernel/cross-product.ts"),
  "utf8",
);
if (
  !crossProductSrc.includes("detectCrossProductCommand") ||
  !crossProductSrc.includes("WEBSITE_SIGNALS") ||
  !crossProductSrc.includes("APP_SIGNALS")
) {
  fail("cross-product module", "missing detection logic");
} else ok("cross-product module");

const memorySrc = readFileSync(
  join(root, "lib/ai-core/copilot-kernel/memory.ts"),
  "utf8",
);
if (
  !memorySrc.includes("enrichCommandWithMemory") ||
  !memorySrc.includes("memoryTurnsToChatThread")
) {
  fail("memory module", "missing helpers");
} else ok("memory module");

const reviewSrc = readFileSync(
  join(root, "lib/ai-core/copilot-kernel/review.ts"),
  "utf8",
);
if (!reviewSrc.includes("buildCopilotReviewResult")) {
  fail("review module", "missing builder");
} else ok("review module");

const websiteProcessor = readFileSync(
  join(root, "lib/ai-core/website-copilot/processor.ts"),
  "utf8",
);
for (const needle of [
  "detectCrossProductCommand",
  "enrichCommandWithMemory",
  "finalizeCopilotPhase5",
  "runWebsiteCopilotReview",
  "sessionId",
]) {
  if (!websiteProcessor.includes(needle)) fail(`website processor: ${needle}`, "missing");
  else ok(`website processor: ${needle}`);
}

const appProcessor = readFileSync(
  join(root, "lib/ai-core/app-copilot/processor.ts"),
  "utf8",
);
for (const needle of [
  "detectCrossProductCommand",
  "finalizeCopilotPhase5",
  "runAppCopilotReview",
]) {
  if (!appProcessor.includes(needle)) fail(`app processor: ${needle}`, "missing");
  else ok(`app processor: ${needle}`);
}

const websiteTypes = readFileSync(
  join(root, "lib/ai-core/website-copilot/types.ts"),
  "utf8",
);
for (const needle of [
  "sessionId",
  "includeReview",
  "crossProductSplit",
  "website.advisory.cross-product",
]) {
  if (!websiteTypes.includes(needle)) fail(`website types: ${needle}`, "missing");
  else ok(`website types: ${needle}`);
}

const commandsRoute = readFileSync(
  join(root, "app/api/website-builder/[id]/copilot/commands/route.ts"),
  "utf8",
);
if (!commandsRoute.includes("sessionId")) {
  fail("commands route Phase 5", "missing sessionId schema");
} else ok("commands route sessionId schema");

const panel = readFileSync(
  join(root, "components/dashboard/website-builder/copilot-command-panel.tsx"),
  "utf8",
);
if (!panel.includes("Chat view") || !panel.includes("thread")) {
  fail("website copilot chat UI", "missing chat view");
} else ok("website CopilotCommandPanel chat view");

const appPanel = readFileSync(
  join(root, "components/dashboard/webapp-builder/app-copilot-command-panel.tsx"),
  "utf8",
);
if (!appPanel.includes("Chat view") || !appPanel.includes("thread")) {
  fail("app copilot chat UI", "missing chat view");
} else ok("app AppCopilotCommandPanel chat view");

const migration = readFileSync(
  join(root, "supabase/migrations/077_copilot_session_memory.sql"),
  "utf8",
);
if (!migration.includes("copilot_session_memory")) {
  fail("migration 077", "missing table");
} else ok("migration 077 copilot_session_memory");

if (failed) {
  console.error(`\nverify-website-copilot-phase5: FAILED (${failed})`);
  process.exit(1);
}
console.log("\nverify-website-copilot-phase5: OK");
