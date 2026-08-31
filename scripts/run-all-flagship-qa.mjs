/**
 * Run flagship QA on all 10 V2 flagship templates.
 * Usage: npx tsx scripts/run-all-flagship-qa.mjs [--skip-lighthouse]
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const packages = [
  "saas-enterprise",
  "corporate-business",
  "restaurant-premium",
  "ecommerce-premium",
  "medical-premium",
  "real-estate-premium",
  "creative-agency-premium",
  "education-premium",
  "finance-premium",
  "hotel-resort-premium",
  "ai-startup-signal",
];

const skipLh = process.argv.includes("--skip-lighthouse");
const results = [];

for (const id of packages) {
  const args = ["tsx", "scripts/flagship-template-qa.mts", id];
  if (skipLh) args.push("--skip-lighthouse");
  const proc = spawnSync("npx", args, { cwd: root, encoding: "utf8", shell: true });
  const combined = `${proc.stdout}\n${proc.stderr}`;
  const jsonMatch = combined.match(/\{[\s\S]*"packageId"[\s\S]*\}$/m);
  let score = 0;
  let passed = proc.status === 0;
  try {
    const json = JSON.parse(jsonMatch?.[0] ?? "{}");
    score = json.marketplaceScore ?? 0;
    passed = json.passed95 === true;
    results.push({ id, score, passed, duplicateImages: json.preview?.duplicateImages ?? -1 });
  } catch {
    results.push({ id, score: 0, passed: false, duplicateImages: -1 });
  }
  console.log(`${passed ? "PASS" : "FAIL"} ${id} — ${score}/100`);
}

const failed = results.filter((r) => !r.passed);
console.log("\nSummary:", results);
process.exit(failed.length ? 1 : 0);
