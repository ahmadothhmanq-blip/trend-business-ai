/**
 * Verify Website Builder client chunks do not reference server-only modules.
 * Usage: node scripts/verify-wb-client-bundle.mjs
 * Run after `next dev` has compiled /dashboard/website-builder at least once.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const chunkDir = join(root, ".next/dev/static/chunks");

function listJsFiles(dir) {
  const out = [];
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) out.push(...listJsFiles(p));
    else if (ent.name.endsWith(".js")) out.push(p);
  }
  return out;
}

const forbidden = [
  "product-options",
  "content-language",
  "server-only",
  "invitation-email",
  "builder/access",
];

let failed = 0;
try {
  statSync(chunkDir);
} catch {
  console.error("verify-wb-client-bundle: .next/dev/static/chunks missing — run next dev first");
  process.exit(1);
}

const wbChunks = listJsFiles(chunkDir).filter(
  (p) =>
    p.includes("website-builder") ||
    p.includes("components_dashboard_1wf7mvm") ||
    p.includes("components_dashboard_website-builder-tool"),
);

for (const file of wbChunks) {
  const text = readFileSync(file, "utf8");
  for (const needle of forbidden) {
    if (text.includes(needle)) {
      console.error(`FAIL ${file.replace(root + "\\", "")}: contains "${needle}"`);
      failed++;
    }
  }
}

if (failed) {
  console.error(`\nverify-wb-client-bundle: FAILED (${failed} hits)`);
  process.exit(1);
}

console.log(
  `verify-wb-client-bundle: OK (${wbChunks.length} chunk files scanned, no forbidden imports)`,
);
