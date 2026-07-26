#!/usr/bin/env node
/**
 * Verify locale translation depth — flags keys still identical to English.
 */
import fs from "node:fs";
import path from "node:path";

const LOCALES_DIR = path.join(process.cwd(), "locales");

function flatten(obj, prefix = "", out = {}) {
  for (const [k, v] of Object.entries(obj || {})) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) flatten(v, p, out);
    else out[p] = v;
  }
  return out;
}

function shouldSkipValue(value) {
  if (typeof value !== "string") return true;
  if (!value.trim()) return true;
  if (/^[\d\s%{}./:-]+$/.test(value)) return true;
  if (/^https?:\/\//.test(value)) return true;
  return false;
}

const en = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, "en.json"), "utf8"));
const enFlat = flatten(en);

const locales = fs
  .readdirSync(LOCALES_DIR)
  .filter((f) => f.endsWith(".json") && f !== "en.json")
  .map((f) => f.replace(".json", ""));

let totalEnglishCopies = 0;
let totalComparable = 0;
const localeRows = [];

for (const locale of locales) {
  const loc = JSON.parse(
    fs.readFileSync(path.join(LOCALES_DIR, `${locale}.json`), "utf8"),
  );
  const locFlat = flatten(loc);
  let same = 0;
  let comparable = 0;

  for (const [key, enValue] of Object.entries(enFlat)) {
    if (typeof enValue === "string") {
      if (shouldSkipValue(enValue)) continue;
      comparable++;
      if (locFlat[key] === enValue) same++;
      continue;
    }
    if (Array.isArray(enValue)) {
      const locValue = locFlat[key];
      if (!Array.isArray(locValue)) continue;
      for (let i = 0; i < enValue.length; i++) {
        if (shouldSkipValue(enValue[i])) continue;
        comparable++;
        if (locValue[i] === enValue[i]) same++;
      }
    }
  }

  totalEnglishCopies += same;
  totalComparable += comparable;
  const pct = comparable ? Math.round((100 * (comparable - same)) / comparable) : 100;
  localeRows.push({ locale, same, comparable, pct });
}

localeRows.sort((a, b) => a.pct - b.pct);

console.log("# Locale translation depth\n");
for (const row of localeRows) {
  const status = row.pct >= 98 ? "OK" : row.pct >= 90 ? "WARN" : "FAIL";
  console.log(
    `- ${row.locale}: ${row.pct}% translated (${row.comparable - row.same}/${row.comparable}) [${status}]`,
  );
}

const overallPct = totalComparable
  ? Math.round((100 * (totalComparable - totalEnglishCopies)) / totalComparable)
  : 100;

const uiScore = overallPct >= 98 ? 50 : overallPct >= 90 ? 40 : 25;
const failingLocales = localeRows.filter((r) => r.pct < 98).length;
const localeScore = failingLocales === 0 ? 50 : failingLocales <= 3 ? 40 : 25;
const score = uiScore + localeScore;

console.log(`\nOverall translation depth: ${overallPct}%`);
console.log(`Locales below 98%: ${failingLocales}`);
console.log(`\n## Localization score: ${score}/100`);

if (failingLocales > 0 || overallPct < 98) {
  console.log("\nRemaining issues:");
  for (const row of localeRows.filter((r) => r.pct < 98)) {
    console.log(`- ${row.locale}: ${row.same} English copies remaining`);
  }
  process.exitCode = 1;
}
