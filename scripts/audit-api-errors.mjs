#!/usr/bin/env node
/**
 * Audit API routes for remaining raw English error responses.
 */
import fs from "node:fs";
import path from "node:path";

const API_DIR = path.join(process.cwd(), "app", "api");

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full, files);
    else if (name.endsWith(".ts")) files.push(full);
  }
  return files;
}

const hits = [];
for (const file of walk(API_DIR)) {
  const rel = path.relative(process.cwd(), file).replace(/\\/g, "/");
  const content = fs.readFileSync(file, "utf8");
  if (content.includes("i18n:api-internal")) continue;
  if (!content.includes("error:")) continue;
  if (content.includes("apiErrorResponse") || content.includes("apiValidationError")) {
    const raw = content.match(/NextResponse\.json\([\s\S]{0,200}?error:[\s\S]{0,200}?\)/g) ?? [];
    const bad = raw.filter(
      (block) =>
        !block.includes("apiErrorResponse") &&
        !block.includes("apiValidationError") &&
        !block.includes("apiNotFoundError"),
    );
    if (bad.length) hits.push({ file: rel, count: bad.length });
    continue;
  }
  if (/NextResponse\.json\([\s\S]*?error:/.test(content)) {
    hits.push({ file: rel, count: 1 });
  }
}

hits.sort((a, b) => b.count - a.count);
console.log(`# API error localization audit\n`);
console.log(`Files with raw error responses: ${hits.length}\n`);
for (const row of hits.slice(0, 40)) {
  console.log(`- ${row.file} (${row.count})`);
}
if (hits.length > 40) console.log(`- ... and ${hits.length - 40} more`);
process.exitCode = hits.length ? 1 : 0;
