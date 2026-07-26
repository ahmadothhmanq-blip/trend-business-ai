/**
 * Website Copilot Phase 4 — kernel extraction verification.
 * Usage: node scripts/verify-website-copilot-phase4.mjs
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
  "docs/WEBSITE_COPILOT_PHASE4.md",
  "lib/ai-core/copilot-kernel/index.ts",
  "lib/ai-core/copilot-kernel/types.ts",
  "lib/ai-core/copilot-kernel/meta.ts",
  "lib/ai-core/copilot-kernel/stream-loop.ts",
];

for (const rel of requiredPaths) {
  try {
    readFileSync(join(root, rel), "utf8");
    ok(`file exists: ${rel}`);
  } catch {
    fail(`file exists: ${rel}`, "missing");
  }
}

const websiteProcessor = readFileSync(
  join(root, "lib/ai-core/website-copilot/processor.ts"),
  "utf8",
);
if (!websiteProcessor.includes("copilot-kernel")) {
  fail("website processor uses kernel", "missing import");
} else ok("website processor uses copilot-kernel");

const websiteStream = readFileSync(
  join(root, "lib/ai-core/website-copilot/stream.ts"),
  "utf8",
);
if (!websiteStream.includes("runCopilotStreamLoop")) {
  fail("website stream uses kernel loop", "missing");
} else ok("website stream uses kernel loop");

const websiteIndex = readFileSync(
  join(root, "lib/ai-core/website-copilot/index.ts"),
  "utf8",
);
for (const needle of ["attachCostHint", "runCopilotStreamLoop"]) {
  if (!websiteIndex.includes(needle)) fail(`website index: ${needle}`, "missing");
  else ok(`website index exports ${needle}`);
}

if (failed) {
  console.error(`\nverify-website-copilot-phase4: FAILED (${failed})`);
  process.exit(1);
}
console.log("\nverify-website-copilot-phase4: OK");
