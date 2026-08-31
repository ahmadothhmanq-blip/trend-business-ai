/**
 * Strip hardcoded demo text/array defaults from template and flagship components.
 * Run: node scripts/strip-template-demo-defaults.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const TARGET_DIRS = [
  path.join(ROOT, "templates", "website"),
  path.join(ROOT, "lib", "website", "template-v2", "flagship"),
];

const DEMO_CONST_NAMES = new Set([
  "DEFAULT_METRICS",
  "DEFAULT_ITEMS",
  "DEFAULT_STATS",
  "DEFAULT_LINKS",
  "DEFAULT_TIERS",
  "DEFAULT_OUTCOMES",
  "DEFAULT_INTEGRATIONS",
  "DEFAULT_FEATURES",
  "DEFAULT_FAQ",
  "DEFAULT_DISHES",
  "DEFAULT_COURSES",
  "DEFAULT_EXPERIENCES",
  "DEFAULT_SUITES",
  "DEFAULT_PROPERTIES",
  "DEFAULT_TESTIMONIALS",
  "DEFAULT_SPECIALTIES",
  "DEFAULT_PILLARS",
  "DEFAULT_PRODUCTS",
  "DEFAULT_COLLECTIONS",
  "TRUST_BRANDS",
  "TRUST_BADGES",
  "HERO_STATS",
  "PILLARS",
  "FEATURED",
  "CASES",
  "ADVISORS",
  "NEIGHBORHOODS",
  "GALLERY_CAPTIONS",
  "CAPTIONS",
  "FOOTER_LINKS",
  "CHAPTERS",
  "DOSSIER_ITEMS",
  "STEPS",
  "CAPABILITIES",
  "SHOWCASE_ITEMS",
  "HIGHLIGHTS",
  "PHYSICIANS",
  "FEATURES",
  "SOCIAL",
  "EXPLORE_LINKS",
  "LEGAL_LINKS",
]);

function walkTsx(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walkTsx(p, out);
    else if (entry.name.endsWith(".tsx")) out.push(p);
  }
  return out;
}

function removeConstDeclaration(source, constName) {
  const marker = `const ${constName}`;
  let idx = 0;
  let result = source;
  while ((idx = result.indexOf(marker, idx)) !== -1) {
    const lineStart = result.lastIndexOf("\n", idx) + 1;
    if (lineStart > 0 && !result.slice(lineStart, idx).trim().endsWith("")) {
      const before = result.slice(0, lineStart);
      if (before.trimEnd().endsWith(";") || before.trimEnd().endsWith("}")) {
        idx += marker.length;
        continue;
      }
    }
    const eq = result.indexOf("=", idx);
    if (eq === -1) break;
    let i = eq + 1;
    while (i < result.length && /\s/.test(result[i])) i++;
    const open = result[i];
    if (open !== "[" && open !== "{") {
      idx = i + 1;
      continue;
    }
    const close = open === "[" ? "]" : "}";
    let depth = 0;
    let j = i;
    for (; j < result.length; j++) {
      const ch = result[j];
      if (ch === open) depth++;
      else if (ch === close) {
        depth--;
        if (depth === 0) {
          j++;
          while (j < result.length && result[j] !== ";") j++;
          j++;
          while (j < result.length && result[j] === "\n") j++;
          result = result.slice(0, lineStart) + result.slice(j);
          idx = lineStart;
          break;
        }
      }
    }
    if (j >= result.length) break;
  }
  return result;
}

function removeDemoConstants(source) {
  let result = source;
  const names = new Set(DEMO_CONST_NAMES);
  for (const m of source.matchAll(/^const (DEFAULT_\w+)/gm)) names.add(m[1]);
  for (const m of source.matchAll(/^const ([A-Z][A-Z0-9_]*)\s*=/gm)) {
    if (m[1].startsWith("DEFAULT_") || DEMO_CONST_NAMES.has(m[1])) names.add(m[1]);
  }
  for (const name of [...names].sort((a, b) => b.length - a.length)) {
    result = removeConstDeclaration(result, name);
  }
  return result;
}

function stripParamDefaults(params) {
  const parts = [];
  let current = "";
  let depth = 0;
  for (let i = 0; i < params.length; i++) {
    const ch = params[i];
    if (ch === "{" || ch === "[" || ch === "(") depth++;
    if (ch === "}" || ch === "]" || ch === ")") depth--;
    if (ch === "," && depth === 0) {
      parts.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) parts.push(current);

  return parts
    .map((part) => {
      const trimmed = part.trim();
      if (!trimmed) return "";
      const eqIdx = findTopLevelEq(trimmed);
      if (eqIdx === -1) return trimmed;
      return trimmed.slice(0, eqIdx).trim();
    })
    .filter(Boolean)
    .join(", ");
}

function findTopLevelEq(s) {
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === "{" || ch === "[" || ch === "(" || ch === "<") depth++;
    if (ch === "}" || ch === "]" || ch === ")" || ch === ">") depth--;
    if (ch === "=" && depth === 0 && s[i + 1] !== "=" && s[i - 1] !== "!" && s[i - 1] !== "<" && s[i - 1] !== ">") {
      return i;
    }
  }
  return -1;
}

function stripFunctionDefaults(source) {
  return source.replace(
    /export function (\w+)\(\{([\s\S]*?)\}(\s*:\s*[\w<>,\s|&\[\]{}?"'.-]+)?\)\s*\{/g,
    (match, name, params, typeAnn = "") => {
      const stripped = stripParamDefaults(params);
      return `export function ${name}({ ${stripped} }${typeAnn ?? ""}) {`;
    },
  );
}

const LIST_PROPS = [
  "items",
  "links",
  "tiers",
  "metrics",
  "stats",
  "products",
  "pillars",
  "logos",
  "features",
  "courses",
  "properties",
  "advisors",
  "neighborhoods",
  "cases",
  "steps",
  "capabilities",
  "testimonials",
  "specialties",
  "physicians",
  "collections",
  "outcomes",
  "integrations",
  "highlights",
  "columns",
  "captions",
  "chapters",
  "dossierItems",
  "showcaseItems",
  "social",
];

function injectListGuards(source) {
  const fnMatch = source.match(/export function \w+\(\{([^}]+)\}/);
  if (!fnMatch) return source;
  const params = fnMatch[1];
  const guards = [];
  for (const prop of LIST_PROPS) {
    if (!new RegExp(`\\b${prop}\\b`).test(params)) continue;
    guards.push(`if (!${prop}?.length) return null;`);
  }
  if (guards.length === 0) return source;
  const guardBlock = guards.join("\n  ");
  if (source.includes(guardBlock)) return source;
  return source.replace(
    /export function \w+\([^)]*\)\s*\{\s*/,
    (m) => `${m}  ${guardBlock}\n\n  `,
  );
}

function fixGalleryCaptions(source) {
  if (!source.includes("GALLERY_CAPTIONS")) return source;
  let result = source;
  result = result.replace(/\bGALLERY_CAPTIONS\.length\b/g, "(captions?.length ?? 0)");
  result = result.replace(/\bGALLERY_CAPTIONS\.map\(/g, "(captions ?? []).map(");
  result = result.replace(/\bGALLERY_CAPTIONS\[activeIndex\]/g, "captions?.[activeIndex]");
  if (!/captions\?:/.test(result) && /type \w+Props/.test(result)) {
    result = result.replace(
      /(type \w+Props = \{[\s\S]*?)(\};)/,
      (m, head, tail) => {
        if (head.includes("captions?:")) return m;
        return `${head}  captions?: string[];\n${tail}`;
      },
    );
  }
  if (!/\bcaptions\b/.test(result.match(/export function \w+\(\{([^}]+)\}/)?.[1] ?? "")) {
    result = result.replace(/export function (\w+)\(\{([^}]+)\}/, (m, name, params) => {
      if (params.includes("captions")) return m;
      return `export function ${name}({ ${params.trim() ? `${params.trim()}, ` : ""}captions`;
    });
  }
  return result;
}

function processFile(filePath) {
  const original = fs.readFileSync(filePath, "utf8");
  let result = original;
  result = removeDemoConstants(result);
  result = stripFunctionDefaults(result);
  result = fixGalleryCaptions(result);
  result = injectListGuards(result);
  if (result !== original) {
    fs.writeFileSync(filePath, result);
    return true;
  }
  return false;
}

const files = TARGET_DIRS.flatMap((dir) => (fs.existsSync(dir) ? walkTsx(dir) : []));
let changed = 0;
for (const file of files) {
  if (processFile(file)) {
    changed++;
    console.log("updated", path.relative(ROOT, file));
  }
}
console.log(`Done. ${changed} files updated.`);
