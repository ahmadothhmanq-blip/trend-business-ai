#!/usr/bin/env node
/**
 * Deep-merges locales/en.json structure into all other locale files.
 * Preserves existing translations; missing keys get English placeholders.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const LOCALES_DIR = path.join(ROOT, "locales");
const EN_PATH = path.join(LOCALES_DIR, "en.json");

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function countLeaves(obj) {
  if (!isPlainObject(obj)) return 0;
  let n = 0;
  for (const value of Object.values(obj)) {
    if (isPlainObject(value)) n += countLeaves(value);
    else n += 1;
  }
  return n;
}

/**
 * Merge `source` (en) into `target` locale.
 * - Nested objects: recurse
 * - Leaf missing in target: copy from source (English placeholder)
 * - Leaf present in target: keep target value
 */
function mergeLocaleStructure(target, source) {
  let added = 0;
  for (const [key, value] of Object.entries(source)) {
    if (isPlainObject(value)) {
      if (!isPlainObject(target[key])) target[key] = {};
      added += mergeLocaleStructure(target[key], value);
    } else if (!(key in target)) {
      target[key] = value;
      added += 1;
    }
  }
  return added;
}

const en = JSON.parse(fs.readFileSync(EN_PATH, "utf8"));
const enLeaves = countLeaves(en);

const files = fs
  .readdirSync(LOCALES_DIR)
  .filter((name) => name.endsWith(".json") && name !== "en.json")
  .sort();

const report = [];

for (const file of files) {
  const filePath = path.join(LOCALES_DIR, file);
  const raw = fs.readFileSync(filePath, "utf8").trim();
  let locale = {};
  if (raw && raw !== "{}") {
    try {
      locale = JSON.parse(raw);
    } catch (error) {
      console.warn(`  Skipping ${file}: invalid JSON (${error.message})`);
      locale = {};
    }
  }
  const beforeLeaves = countLeaves(locale);
  const added = mergeLocaleStructure(locale, en);
  fs.writeFileSync(filePath, `${JSON.stringify(locale, null, 2)}\n`, "utf8");
  const afterLeaves = countLeaves(locale);
  report.push({ file, added, beforeLeaves, afterLeaves });
}

console.log("sync-locale-files.mjs");
console.log(`  en.json leaf keys: ${enLeaves}`);
console.log(`  Locale files updated: ${report.length}`);
let totalAdded = 0;
for (const row of report) {
  totalAdded += row.added;
  console.log(
    `    ${row.file}: +${row.added} keys (${row.beforeLeaves} → ${row.afterLeaves} leaves)`,
  );
}
console.log(`  Total placeholder keys added across locales: ${totalAdded}`);
