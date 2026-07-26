#!/usr/bin/env node
/**
 * Bulk-migrate API routes to coded error responses while preserving error messages.
 */
import fs from "node:fs";
import path from "node:path";

const API_DIR = path.join(process.cwd(), "app", "api");
const IMPORT =
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
  if (!/(apiErrorResponse|apiNotFoundError|apiValidationError)/.test(content)) return content;
  if (content.includes('from "@/lib/i18n/api-errors"')) return content;
  const m = content.match(/^import .+;?\s*$/m);
  if (m) {
    const i = content.indexOf(m[0]) + m[0].length;
    return `${content.slice(0, i)}\n${IMPORT}${content.slice(i)}`;
  }
  return `${IMPORT}\n${content}`;
}

const REPLACEMENTS = [
  [/return NextResponse\.json\(\s*\{\s*error:\s*error\.message\s*\}\s*,\s*\{\s*status:\s*500\s*\}\s*\)/g, "return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, error.message)"],
  [/return NextResponse\.json\(\s*\{\s*error:\s*(\w+)\.message\s*\}\s*,\s*\{\s*status:\s*500\s*\}\s*\)/g, "return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, $1.message)"],
  [/return NextResponse\.json\(\s*\{\s*error:\s*"Unauthorized"\s*\}\s*,\s*\{\s*status:\s*401\s*\}\s*\)/g, "return apiErrorResponse(API_ERROR_CODES.UNAUTHORIZED, 401)"],
  [/return NextResponse\.json\(\s*\{\s*error:\s*"Forbidden"\s*\}\s*,\s*\{\s*status:\s*403\s*\}\s*\)/g, "return apiErrorResponse(API_ERROR_CODES.FORBIDDEN, 403)"],
  [/return NextResponse\.json\(\s*\{\s*error:\s*"Not found"\s*\}\s*,\s*\{\s*status:\s*404\s*\}\s*\)/g, "return apiNotFoundError()"],
  [/return NextResponse\.json\(\s*\{\s*error:\s*"Invalid JSON body"\s*\}\s*,\s*\{\s*status:\s*400\s*\}\s*\)/g, "return apiErrorResponse(API_ERROR_CODES.INVALID_JSON, 400)"],
  [/return NextResponse\.json\(\s*\{\s*error:\s*"Invalid request"\s*\}\s*,\s*\{\s*status:\s*400\s*\}\s*\)/g, "return apiValidationError()"],
  [/return NextResponse\.json\(\s*\{\s*error:\s*"Generation not found"\s*\}\s*,\s*\{\s*status:\s*404\s*\}\s*\)/g, "return apiErrorResponse(API_ERROR_CODES.GENERATION_NOT_FOUND, 404)"],
  [/return NextResponse\.json\(\s*\{\s*error:\s*"Video not found"\s*\}\s*,\s*\{\s*status:\s*404\s*\}\s*\)/g, "return apiErrorResponse(API_ERROR_CODES.VIDEO_NOT_FOUND, 404)"],
  [/return NextResponse\.json\(\s*\{\s*error:\s*"Template not found"\s*\}\s*,\s*\{\s*status:\s*404\s*\}\s*\)/g, "return apiErrorResponse(API_ERROR_CODES.TEMPLATE_NOT_FOUND, 404)"],
  [/return NextResponse\.json\(\s*\{\s*error:\s*"Too many requests"\s*\}\s*,\s*\{\s*status:\s*429\s*\}\s*\)/g, "return apiErrorResponse(API_ERROR_CODES.RATE_LIMITED, 429)"],
  [/return NextResponse\.json\(\s*\{\s*error:\s*"Something went wrong"\s*\}\s*,\s*\{\s*status:\s*500\s*\}\s*\)/g, "return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500)"],
  [/return NextResponse\.json\(\s*\{\s*error:\s*parsed\.error\.issues\[0\]\?\.message\s*\?\?\s*"[^"]*"\s*\}\s*,\s*\{\s*status:\s*400\s*\}\s*,?\s*\)/gs, "return apiValidationError(parsed.error.issues[0]?.message)"],
  [/return NextResponse\.json\(\s*\{\s*error:\s*parsed\.error\.issues\[0\]\?\.message\s*\}\s*,\s*\{\s*status:\s*400\s*\}\s*,?\s*\)/gs, "return apiValidationError(parsed.error.issues[0]?.message)"],
  [/return NextResponse\.json\(\s*\{\s*error:\s*(\w+)\.error\s*\}\s*,\s*\{\s*status:\s*500\s*\}\s*,?\s*\)/gs, "return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, $1.error)"],
  [/return NextResponse\.json\(\s*\{\s*error:\s*(\w+)\.error\s*\}\s*,\s*\{\s*status:\s*(\w+)\.status\s*\}\s*,?\s*\)/gs, "return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, $2.status, $1.error)"],
  [/return NextResponse\.json\(\s*\{\s*error:\s*(\w+)\.error\s*\}\s*,\s*\{\s*status:\s*403\s*\}\s*,?\s*\)/gs, "return apiErrorResponse(API_ERROR_CODES.FORBIDDEN, 403, $1.error)"],
  [/return NextResponse\.json\(\s*\{\s*error:\s*message\s*\}\s*,\s*\{\s*status:\s*500\s*\}\s*,?\s*\)/gs, "return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, message)"],
  [/return NextResponse\.json\(\s*\{\s*error:\s*message\s*\}\s*,\s*\{\s*status:\s*400\s*\}\s*,?\s*\)/gs, "return apiValidationError(message)"],
  [/return NextResponse\.json\(\s*\{\s*error:\s*(\w+)\s*\?\?\s*"[^"]*"\s*\}\s*,\s*\{\s*status:\s*403\s*\}\s*,?\s*\)/gs, "return apiErrorResponse(API_ERROR_CODES.FORBIDDEN, 403, $1)"],
  [/return NextResponse\.json\(\{\s*error:\s*error\.message\s*\},\s*\{\s*status:\s*500\s*\}\)/g, "return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, error.message)"],
  [/return NextResponse\.json\(\{\s*error:\s*validated\.error\s*\},\s*\{\s*status:\s*400\s*\}\)/g, "return apiValidationError(validated.error)"],
  [/return NextResponse\.json\(\{\s*error:\s*(\w+)\.error\s*\},\s*\{\s*status:\s*500\s*\}\)/g, "return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, $1.error)"],
  [/return NextResponse\.json\(\{\s*error:\s*(\w+)\.error\s*\},\s*\{\s*status:\s*(\d+)\s*\}\)/g, "return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, $2, $1.error)"],
  [/error:\s*NextResponse\.json\(\{\s*error:\s*error\.message\s*\},\s*\{\s*status:\s*500\s*\}\)/g, "error: apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, error.message)"],
  [/error:\s*NextResponse\.json\(\{\s*error:\s*"([^"]+)"\s*\},\s*\{\s*status:\s*404\s*\}\)/g, 'error: apiErrorResponse(API_ERROR_CODES.NOT_FOUND, 404, "$1")'],
  [/return NextResponse\.json\(\s*\{\s*error:\s*e instanceof Error \? e\.message : "[^"]*"\s*\}\s*,\s*\{\s*status:\s*500\s*\}\s*,?\s*\)/gs, "return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, e instanceof Error ? e.message : undefined)"],
];

let changed = 0;
for (const file of walk(API_DIR)) {
  if (file.endsWith("api-errors.ts")) continue;
  let content = fs.readFileSync(file, "utf8");
  let updated = content;
  for (const [pattern, replacement] of REPLACEMENTS) {
    updated = updated.replace(pattern, replacement);
  }

  // Generic fallback: { error: "..." } with status -> coded response (incl. multiline)
  updated = updated.replace(
    /return NextResponse\.json\(\s*\{\s*error:\s*"([^"]+)"\s*\}\s*,\s*\{\s*status:\s*(400)\s*\}\s*,?\s*\)/gs,
    'return apiValidationError("$1")',
  );
  updated = updated.replace(
    /return NextResponse\.json\(\s*\{\s*error:\s*"([^"]+)"\s*\}\s*,\s*\{\s*status:\s*(404)\s*\}\s*,?\s*\)/gs,
    'return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "$1")',
  );
  updated = updated.replace(
    /return NextResponse\.json\(\s*\{\s*error:\s*"([^"]+)"\s*\}\s*,\s*\{\s*status:\s*(403)\s*\}\s*,?\s*\)/gs,
    'return apiErrorResponse(API_ERROR_CODES.FORBIDDEN, 403, "$1")',
  );
  updated = updated.replace(
    /return NextResponse\.json\(\s*\{\s*error:\s*"([^"]+)"\s*\}\s*,\s*\{\s*status:\s*(401)\s*\}\s*,?\s*\)/gs,
    'return apiErrorResponse(API_ERROR_CODES.UNAUTHORIZED, 401, "$1")',
  );
  updated = updated.replace(
    /return NextResponse\.json\(\s*\{\s*error:\s*"([^"]+)"\s*\}\s*,\s*\{\s*status:\s*(500)\s*\}\s*,?\s*\)/gs,
    'return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, "$1")',
  );
  updated = updated.replace(
    /return NextResponse\.json\(\s*\{\s*error:\s*"([^"]+)"\s*\}\s*,\s*\{\s*status:\s*(503)\s*\}\s*,?\s*\)/gs,
    'return apiErrorResponse(API_ERROR_CODES.MIGRATION_REQUIRED, 503, "$1")',
  );
  updated = updated.replace(
    /return NextResponse\.json\(\s*\{\s*error:\s*"([^"]+)"\s*\}\s*,\s*\{\s*status:\s*(429)\s*\}\s*,?\s*\)/gs,
    'return apiErrorResponse(API_ERROR_CODES.RATE_LIMITED, 429, "$1")',
  );
  updated = updated.replace(
    /return NextResponse\.json\(\s*\{\s*error:\s*"([^"]+)"\s*\}\s*,\s*\{\s*status:\s*(501)\s*\}\s*,?\s*\)/gs,
    'return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 501, "$1")',
  );
  updated = updated.replace(
    /return NextResponse\.json\(\{\s*error:\s*"([^"]+)"\s*\},\s*\{\s*status:\s*(\d+)\s*\}\)/g,
    (match, msg, status) => {
      const code = Number(status);
      if (code === 401) return `return apiErrorResponse(API_ERROR_CODES.UNAUTHORIZED, 401, "${msg}")`;
      if (code === 403) return `return apiErrorResponse(API_ERROR_CODES.FORBIDDEN, 403, "${msg}")`;
      if (code === 404) return `return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "${msg}")`;
      if (code === 400) return `return apiValidationError("${msg}")`;
      if (code === 503) return `return apiErrorResponse(API_ERROR_CODES.MIGRATION_REQUIRED, 503, "${msg}")`;
      if (code === 429) return `return apiErrorResponse(API_ERROR_CODES.RATE_LIMITED, 429, "${msg}")`;
      return `return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, ${code}, "${msg}")`;
    },
  );

  if (updated !== content) {
    updated = ensureImport(updated);
    fs.writeFileSync(file, updated, "utf8");
    changed++;
  }
}

console.log(`Bulk migrated ${changed} API route files.`);
