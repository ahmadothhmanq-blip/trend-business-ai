#!/usr/bin/env node
/**
 * Sync locale JSON files with en.json:
 * - Copy missing keys from en (deep merge, target overrides win)
 * - Report key count parity
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const LOCALES_DIR = path.join(ROOT, "locales");

function flattenKeys(obj, prefix = "") {
  const keys = [];
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return keys;
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      keys.push(...flattenKeys(v, full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

function deepMerge(base, override) {
  if (!override || typeof override !== "object" || Array.isArray(override)) {
    return override ?? base;
  }
  const out = { ...(base && typeof base === "object" ? base : {}) };
  for (const [key, value] of Object.entries(override)) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      out[key] &&
      typeof out[key] === "object" &&
      !Array.isArray(out[key])
    ) {
      out[key] = deepMerge(out[key], value);
    } else if (value !== undefined) {
      out[key] = value;
    }
  }
  return out;
}

const enPath = path.join(LOCALES_DIR, "en.json");
const en = JSON.parse(fs.readFileSync(enPath, "utf8"));
const enKeys = new Set(flattenKeys(en));

const files = fs
  .readdirSync(LOCALES_DIR)
  .filter((f) => f.endsWith(".json") && f !== "en.json");

let updated = 0;
for (const file of files) {
  const filePath = path.join(LOCALES_DIR, file);
  const current = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const merged = deepMerge(en, current);
  const mergedKeys = new Set(flattenKeys(merged));
  const missing = [...enKeys].filter((k) => !mergedKeys.has(k));
  if (missing.length > 0) {
    console.warn(`${file}: still missing ${missing.length} keys after merge`);
  }
  const next = JSON.stringify(merged, null, 2) + "\n";
  const prev = JSON.stringify(current, null, 2) + "\n";
  if (next !== prev) {
    fs.writeFileSync(filePath, next);
    updated += 1;
    console.log(`Updated ${file} (${mergedKeys.size} keys)`);
  } else {
    console.log(`OK ${file} (${mergedKeys.size} keys)`);
  }
}

console.log(`\nDone. Updated ${updated}/${files.length} locale files.`);
