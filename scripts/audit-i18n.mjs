#!/usr/bin/env node
/**
 * Audit hardcoded user-facing strings not routed through i18n.
 * Reports files with likely English UI strings.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const EXT = new Set([".tsx", ".ts"]);
const SKIP_DIRS = new Set(["node_modules", ".next", "locales", "supabase/migrations"]);

const I18N_MARKERS = [
  "useTranslation",
  "useI18n",
  "useProductT",
  "useWorkspaceT",
  "useScopedT",
  "getServerTranslator",
  "dashboardPageMetadata",
  "labelKey",
  "titleKey",
  "descriptionKey",
  "I18N_CATALOG",
  "LocalizedDashboardHeader",
  "getNavLabel",
  "translateOption",
  "translateField",
  "readLocalizedApiError",
  "translateApiError",
];

const SKIP_FILES = new Set([
  "components/ui/brand-logo.tsx",
  "components/marketing/official-logo.tsx",
]);

const STRING_PATTERNS = [
  />\s*[A-Z][a-zA-Z\s&,'./-]{3,60}\s*</g,
  /title="[A-Z][^"]{3,80}"/g,
  /description="[A-Z][^"]{3,120}"/g,
  /placeholder="[A-Z][^"]{3,60}"/g,
  /label:\s*"[A-Z][^"]{3,60}"/g,
];

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, files);
    else if (EXT.has(path.extname(name))) files.push(full);
  }
  return files;
}

const targets = [
  "components",
  "app",
  "lib/constants",
].map((p) => path.join(ROOT, p));

const results = [];

for (const base of targets) {
  if (!fs.existsSync(base)) continue;
  for (const file of walk(base)) {
    const rel = path.relative(ROOT, file).replace(/\\/g, "/");
    if (rel.includes("lib/i18n/")) continue;
    if (SKIP_FILES.has(rel)) continue;
    const content = fs.readFileSync(file, "utf8");
    if (rel.startsWith("app/api/") && content.includes("i18n:api-internal")) continue;
    if (
      rel.startsWith("lib/constants/") &&
      (content.includes("labelKey") || content.includes("I18N_CATALOG"))
    ) {
      continue;
    }
    const usesI18n = I18N_MARKERS.some((m) => content.includes(m));
    let hits = 0;
    for (const pattern of STRING_PATTERNS) {
      const matches = content.match(pattern);
      if (matches) hits += matches.length;
    }
    if (hits > 0 && !usesI18n) {
      results.push({ file: rel, hits });
    } else if (hits > 5 && usesI18n) {
      results.push({ file: rel, hits, partial: true });
    }
  }
}

results.sort((a, b) => b.hits - a.hits);

console.log("# i18n Audit — likely remaining hardcoded UI strings\n");
console.log(`Scanned: ${results.length} files with potential hardcoded strings\n`);

const untranslated = results.filter((r) => !r.partial);
const partial = results.filter((r) => r.partial);

console.log(`## Fully untranslated files (${untranslated.length})\n`);
for (const row of untranslated.slice(0, 40)) {
  console.log(`- ${row.file} (~${row.hits} matches)`);
}
if (untranslated.length > 40) {
  console.log(`- ... and ${untranslated.length - 40} more`);
}

console.log(`\n## Partially migrated (${partial.length})\n`);
for (const row of partial.slice(0, 20)) {
  console.log(`- ${row.file} (~${row.hits} remaining)`);
}

console.log(`\nTotal estimated remaining UI string occurrences: ${results.reduce((s, r) => s + r.hits, 0)}`);
