/**
 * Website Builder v1 — complete validation orchestrator.
 *
 * Usage:
 *   npm run qa:website-builder
 *   npm run qa:website-builder -- --skip-build
 *   npm run qa:website-builder -- --with-lighthouse
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const skipBuild = args.includes("--skip-build");
const withLighthouse = args.includes("--with-lighthouse");

const steps = [];

function runStep(name, command, cmdArgs, options = {}) {
  const started = Date.now();
  process.stdout.write(`\n▶ ${name}\n`);
  const proc = spawnSync(command, cmdArgs, {
    cwd: root,
    encoding: "utf8",
    shell: true,
    stdio: "pipe",
    ...options,
  });
  const elapsed = ((Date.now() - started) / 1000).toFixed(1);
  if (proc.stdout) process.stdout.write(proc.stdout);
  if (proc.stderr) process.stderr.write(proc.stderr);
  const ok = proc.status === 0;
  steps.push({ name, ok, elapsed });
  console.log(`${ok ? "✓" : "✗"} ${name} (${elapsed}s)`);
  return ok;
}

console.log("═══════════════════════════════════════════════════════");
console.log(" Website Builder v1 — Complete QA");
console.log("═══════════════════════════════════════════════════════");

let failed = false;

// 1. TypeScript
if (!runStep("TypeScript", "npm", ["run", "type-check"])) failed = true;

// 2. Unit tests — v1 baseline, registry, image engine, generation bridge
if (
  !runStep("V1 baseline regression", "npx", [
    "tsx",
    "--test",
    "lib/website/v1-baseline/regression.test.ts",
  ])
)
  failed = true;

if (
  !runStep("Template registry", "npx", [
    "tsx",
    "--test",
    "lib/website/builder/validate-template-registry.test.ts",
  ])
)
  failed = true;

if (
  !runStep("V2 generation bridge", "npx", [
    "tsx",
    "--test",
    "lib/website/template-v2/generation/v2-generation-bridge.test.ts",
  ])
)
  failed = true;

if (
  !runStep("Image Rules Engine", "npx", [
    "tsx",
    "--test",
    "lib/ai-core/image-engine/rules/rules-engine.test.ts",
  ])
)
  failed = true;

if (
  !runStep("Image independence audit", "npx", [
    "tsx",
    "--test",
    "lib/website/template-v2/slots/image-independence.test.ts",
  ])
)
  failed = true;

if (
  !runStep("Image engine", "npx", [
    "tsx",
    "--test",
    "lib/ai-core/image-engine/image-engine.test.ts",
  ])
)
  failed = true;

if (
  !runStep("Image management", "npx", [
    "tsx",
    "--test",
    "lib/website/image-management/image-management.test.ts",
  ])
)
  failed = true;

if (
  !runStep("Marketplace catalog", "npx", [
    "tsx",
    "--test",
    "lib/website/template-marketplace/catalog.test.ts",
  ])
)
  failed = true;

// 3. Registry sync check
if (!runStep("Flagship registry sync", "node", ["scripts/sync-flagship-registry.mjs", "--check"]))
  failed = true;

// 4. Flagship template generation + QA (all 10)
const qaArgs = ["tsx", "scripts/run-all-flagship-qa.mjs"];
if (!withLighthouse) qaArgs.push("--skip-lighthouse");
if (!runStep("Flagship generation & marketplace QA", "npx", qaArgs)) failed = true;

// 5. Golden reference compare (visual regression + metrics)
if (!runStep("Golden baseline compare", "node", ["scripts/website-builder-v1-golden-compare.mjs"]))
  failed = true;

// 6. Build
if (!skipBuild) {
  if (!runStep("Production build", "npm", ["run", "build"])) failed = true;
} else {
  console.log("\n⊘ Skipping production build (--skip-build)");
}

// Summary
console.log("\n═══════════════════════════════════════════════════════");
console.log(" QA Summary");
console.log("═══════════════════════════════════════════════════════");
for (const step of steps) {
  console.log(`  ${step.ok ? "PASS" : "FAIL"}  ${step.name} (${step.elapsed}s)`);
}
console.log("═══════════════════════════════════════════════════════");

if (failed) {
  console.error("\nWebsite Builder v1 QA FAILED");
  process.exit(1);
}

console.log("\nWebsite Builder v1 QA PASSED");
process.exit(0);
