#!/usr/bin/env node
/**
 * Ensure API routes using apiErrorResponse import from @/lib/i18n/api-errors.
 */
import fs from "node:fs";
import path from "node:path";

const API_DIR = path.join(process.cwd(), "app", "api");
const IMPORT_LINE =
  'import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";';

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full, files);
    else if (name.endsWith(".ts")) files.push(full);
  }
  return files;
}

function ensureImport(content) {
  if (!content.includes("apiErrorResponse") && !content.includes("apiNotFoundError") && !content.includes("apiValidationError")) {
    return content;
  }
  if (content.includes('from "@/lib/i18n/api-errors"')) return content;
  const nextImport = content.match(/^import .+ from .+;?\s*$/m);
  if (nextImport) {
    const idx = content.indexOf(nextImport[0]) + nextImport[0].length;
    return `${content.slice(0, idx)}\n${IMPORT_LINE}${content.slice(idx)}`;
  }
  return `${IMPORT_LINE}\n${content}`;
}

let changed = 0;
for (const file of walk(API_DIR)) {
  const content = fs.readFileSync(file, "utf8");
  const updated = ensureImport(content);
  if (updated !== content) {
    fs.writeFileSync(file, updated, "utf8");
    changed++;
  }
}

console.log(`Added missing API error imports in ${changed} files.`);
