/**
 * Strip hardcoded demo defaults from template/flagship components (safe v2).
 * - Removes demo const blocks
 * - Replaces const references with prop names
 * - Strips only safe parameter defaults (strings, demo identifiers, []/{})
 * Run: node scripts/strip-template-demo-defaults-v2.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const TARGET_DIRS = [
  path.join(ROOT, "templates", "website"),
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

const CONST_TO_PROP = {
  DEFAULT_ITEMS: "items",
  DEFAULT_DISHES: "items",
  DEFAULT_COURSES: "items",
  DEFAULT_EXPERIENCES: "items",
  DEFAULT_SUITES: "items",
  DEFAULT_PROPERTIES: "items",
  DEFAULT_TESTIMONIALS: "items",
  DEFAULT_SPECIALTIES: "items",
  DEFAULT_OUTCOMES: "items",
  DEFAULT_FEATURES: "items",
  DEFAULT_FAQ: "items",
  DEFAULT_TIERS: "tiers",
  DEFAULT_PRODUCTS: "products",
  DEFAULT_COLLECTIONS: "items",
  DEFAULT_INTEGRATIONS: "logos",
  DEFAULT_PILLARS: "pillars",
  DEFAULT_LINKS: "links",
  DEFAULT_METRICS: "metrics",
  DEFAULT_STATS: "stats",
  TRUST_BRANDS: "trustBrands",
  TRUST_BADGES: "trustBadges",
  HERO_STATS: "stats",
  PILLARS: "pillars",
  FEATURED: "items",
  CASES: "items",
  ADVISORS: "advisors",
  NEIGHBORHOODS: "neighborhoods",
  GALLERY_CAPTIONS: "captions",
  CAPTIONS: "captions",
  FOOTER_LINKS: "links",
  CHAPTERS: "chapters",
  DOSSIER_ITEMS: "links",
  STEPS: "steps",
  CAPABILITIES: "items",
  SHOWCASE_ITEMS: "items",
  HIGHLIGHTS: "highlights",
  PHYSICIANS: "physicians",
  FEATURES: "features",
  SOCIAL: "social",
  EXPLORE_LINKS: "exploreLinks",
  LEGAL_LINKS: "legalLinks",
};

const LIST_PROPS = new Set([
  "items",
  "links",
  "tiers",
  "metrics",
  "stats",
  "products",
  "pillars",
  "logos",
  "trustBrands",
  "trustBadges",
  "advisors",
  "neighborhoods",
  "captions",
  "chapters",
  "steps",
  "physicians",
  "highlights",
  "exploreLinks",
  "legalLinks",
  "social",
  "columns",
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
    const eq = result.indexOf("=", idx);
    if (eq === -1) break;
    let i = eq + 1;
    while (i < result.length && /\s/.test(result[i])) i++;
    const open = result[i];
    if (open !== "[" && open !== "{") {
      idx += marker.length;
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
  for (const name of [...names].sort((a, b) => b.length - a.length)) {
    result = removeConstDeclaration(result, name);
  }
  return result;
}

function replaceConstReferences(source) {
  let result = source;
  for (const [constName, prop] of Object.entries(CONST_TO_PROP)) {
    result = result.replaceAll(`${constName}.`, `${prop}.`);
    result = result.replaceAll(`${constName}[`, `${prop}[`);
    result = result.replaceAll(`${constName}.map`, `${prop}.map`);
    result = result.replaceAll(`${constName}.slice`, `${prop}.slice`);
    result = result.replaceAll(`[...${constName},`, `[...${prop},`);
    result = result.replaceAll(`...${constName}]`, `...${prop}]`);
    result = result.replaceAll(`?? ${constName}`, `?? ${prop}`);
    result = result.replaceAll(`(constName)`, prop); // noop safety
    result = result.replace(new RegExp(`\\b${constName}\\b`, "g"), prop);
  }
  result = result.replace(/typeof DEFAULT_PROPERTIES/g, "Array<{ name: string; location?: string; price?: string; beds?: number; sqft?: string; imageIndex?: number }>");
  return result;
}

function stripDestructuringDefaults(source) {
  return source.replace(
    /export function (\w+)\(\{([\s\S]*?)\}(\s*:\s*[^)]+)?\)\s*\{/g,
    (match, fnName, params, typeAnn = "") => {
      let p = params;
      p = p.replace(/(\w+)\s*=\s*"((?:\\.|[^"\\])*)"\s*(,|\n)/g, "$1$3");
      p = p.replace(/(\w+)\s*=\s*'((?:\\.|[^'\\])*)'\s*(,|\n)/g, "$1$3");
      p = p.replace(/(\w+)\s*=\s*"((?:\\.|[^"\\])*)"\s*(?=\s*[,}])/g, "$1");
      p = p.replace(/(\w+)\s*=\s*'((?:\\.|[^'\\])*)'\s*(?=\s*[,}])/g, "$1");
      p = p.replace(/(\w+)\s*=\s*\[\]\s*(,|\n)/g, "$1$2");
      p = p.replace(/(\w+)\s*=\s*\{\}\s*(,|\n)/g, "$1$2");
      for (const name of [...DEMO_CONST_NAMES, ...Object.keys(CONST_TO_PROP)]) {
        p = p.replace(new RegExp(`(\\w+)\\s*=\\s*${name}\\s*(,|\\n)`, "g"), "$1$2");
      }
      p = p.replace(/(\w+)\s*=\s*DEFAULT_\w+\s*(,|\n)/g, "$1$2");
      p = p.replace(/(\w+)\s*=\s*(\w+)\s*(,|\n)/g, (m, name, val, sep) => (name === val ? `${name}${sep}` : m));
      p = p.replace(/,\s*,/g, ",");
      p = p.replace(/\{\s*,/g, "{ ");
      p = p.replace(/,\s*\}/g, " }");
      return `export function ${fnName}({ ${p.trim()} }${typeAnn}) {`;
    },
  );
}

function ensurePropsInTypes(source) {
  const needed = new Set();
  for (const prop of LIST_PROPS) {
    if (new RegExp(`\\b${prop}\\b`).test(source) && !new RegExp(`${prop}\\??:`).test(source)) {
      needed.add(prop);
    }
  }
  if (needed.size === 0) return source;
  return source.replace(/(type \w+Props = \{[\s\S]*?)(\n\};)/, (m, head, tail) => {
    let additions = "";
    for (const prop of needed) {
      if (head.includes(`${prop}?:`) || head.includes(`${prop}:`)) continue;
      additions += `  ${prop}?: unknown[];\n`;
    }
    return additions ? `${head}${additions}${tail}` : m;
  });
}

function injectListGuards(source) {
  const fn = source.match(/export function \w+\(\{([^}]+)\}/);
  if (!fn) return source;
  const params = fn[1];
  const guards = [];
  for (const prop of LIST_PROPS) {
    if (!new RegExp(`\\b${prop}\\b`).test(params)) continue;
    if (prop === "metrics" && /Hero/.test(source)) continue;
    if (prop === "stats" && /Hero/.test(source)) continue;
    const guard = `if (!${prop}?.length) return null;`;
    if (source.includes(guard)) continue;
    guards.push(guard);
  }
  if (!guards.length) return source;
  return source.replace(
    /export function \w+\([^)]*\)\s*\{\s*/,
    (m) => `${m}  ${guards.join("\n  ")}\n\n  `,
  );
}

function removeHardcodedTrustSections(source) {
  return source
    .replace(
      /\s*<div className="mt-12 border-t[\s\S]*?Trusted by[\s\S]*?<\/div>\s*<\/div>/g,
      "",
    )
    .replace(
      /\s*<div className="mt-10 border-t[\s\S]*?Trusted by[\s\S]*?<\/div>\s*<\/div>/g,
      "",
    )
    .replace(
      /\s*\{trustBrands\?\.length \? \([\s\S]*?\) : null\}/g,
      (block) => (block.includes("trustBrands.map") ? block : ""),
    );
}

function processFile(filePath) {
  const original = fs.readFileSync(filePath, "utf8");
  let result = original;
  result = removeDemoConstants(result);
  result = replaceConstReferences(result);
  result = stripDestructuringDefaults(result);
  result = ensurePropsInTypes(result);
  result = injectListGuards(result);
  result = removeHardcodedTrustSections(result);
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
