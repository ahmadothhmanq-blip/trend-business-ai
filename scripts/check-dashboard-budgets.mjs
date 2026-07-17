/**
 * Advisory dashboard / app bundle budget check (L05).
 * Inspects .next/static/chunks after `npm run build`.
 * Exit 0 by default; pass --strict to fail on warnings.
 */
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const chunksDir = join(root, ".next", "static", "chunks");
const strict = process.argv.includes("--strict");

const SINGLE_CHUNK_WARN_BYTES = 350 * 1024;
const TOTAL_CHUNKS_WARN_BYTES = 6 * 1024 * 1024;

function walkJsFiles(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, name.name);
    if (name.isDirectory()) {
      walkJsFiles(path, acc);
      continue;
    }
    if (name.isFile() && name.name.endsWith(".js")) {
      acc.push({ path, size: statSync(path).size, name: name.name });
    }
  }
  return acc;
}

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

if (!existsSync(join(root, ".next"))) {
  console.log(
    "[perf:budget] No .next build found. Run `npm run build` first. (advisory skip)",
  );
  process.exit(0);
}

const files = walkJsFiles(chunksDir);
if (files.length === 0) {
  console.log(
    "[perf:budget] No JS chunks under .next/static/chunks. Build may be incomplete. (advisory skip)",
  );
  process.exit(0);
}

const total = files.reduce((sum, f) => sum + f.size, 0);
const sorted = [...files].sort((a, b) => b.size - a.size);
const oversized = files.filter((f) => f.size > SINGLE_CHUNK_WARN_BYTES);
const warnings = [];

if (total > TOTAL_CHUNKS_WARN_BYTES) {
  warnings.push(
    `Total static JS chunks ${formatKb(total)} exceeds soft limit ${formatKb(TOTAL_CHUNKS_WARN_BYTES)}`,
  );
}

for (const file of oversized) {
  warnings.push(
    `Chunk ${file.name} is ${formatKb(file.size)} (soft limit ${formatKb(SINGLE_CHUNK_WARN_BYTES)})`,
  );
}

console.log(`[perf:budget] Scanned ${files.length} JS chunks · total ${formatKb(total)}`);
console.log("[perf:budget] Top 10 largest chunks:");
for (const file of sorted.slice(0, 10)) {
  console.log(`  - ${formatKb(file.size).padStart(10)}  ${file.name}`);
}

if (warnings.length === 0) {
  console.log("[perf:budget] OK — within soft budgets.");
  process.exit(0);
}

console.log(`[perf:budget] ${warnings.length} warning(s):`);
for (const warning of warnings) {
  console.log(`  ! ${warning}`);
}
console.log("[perf:budget] See docs/PERFORMANCE_BUDGETS.md");

if (strict) {
  process.exit(1);
}
process.exit(0);
