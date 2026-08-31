/**
 * Post-process templates after strip-template-demo-defaults-v2.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TARGET = path.join(ROOT, "templates", "website");

function walkTsx(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walkTsx(p, out);
    else if (entry.name.endsWith(".tsx")) out.push(p);
  }
  return out;
}

function fixFile(source) {
  let result = source;

  // Remove erroneous type lines from codemod
  result = result.replace(/\s*items\?: unknown\[\];\r?\n/g, "");
  result = result.replace(/\s*trustBrands\?: unknown\[\];\r?\n/g, "\n  trustBrands?: string[];\n");
  result = result.replace(/\s*captions\?: unknown\[\];\r?\n/g, "\n  captions?: string[];\n");
  result = result.replace(/\s*pillars\?: unknown\[\];\r?\n/g, "\n  pillars?: Array<{ title: string; body: string }>;\n");
  result = result.replace(/\s*advisors\?: unknown\[\];\r?\n/g, "\n  advisors?: Array<{ name: string; role: string; market?: string; imageIndex: number }>;\n");
  result = result.replace(/\s*steps\?: unknown\[\];\r?\n/g, "\n  steps?: Array<{ title: string; body: string }>;\n");
  result = result.replace(/\s*physicians\?: unknown\[\];\r?\n/g, "\n  physicians?: Array<{ name: string; role: string; specialty?: string; imageIndex?: number }>;\n");
  result = result.replace(/\s*highlights\?: unknown\[\];\r?\n/g, "\n  highlights?: string[];\n");
  result = result.replace(/\s*chapters\?: unknown\[\];\r?\n/g, "\n  chapters?: Array<{ href: string; label: string }>;\n");
  result = result.replace(/\s*links\?: unknown\[\];\r?\n/g, "\n  links?: Array<{ href: string; label: string }>;\n");
  result = result.replace(/\s*social\?: unknown\[\];\r?\n/g, "\n  social?: Array<{ href: string; label: string }>;\n");
  result = result.replace(/\s*exploreLinks\?: unknown\[\];\r?\n/g, "\n  exploreLinks?: Array<{ href: string; label: string }>;\n");
  result = result.replace(/\s*legalLinks\?: unknown\[\];\r?\n/g, "\n  legalLinks?: Array<{ href: string; label: string }>;\n");
  result = result.replace(/\s*stats\?: unknown\[\];\r?\n/g, "\n  stats?: Array<{ label: string; value: string; detail?: string }>;\n");
  result = result.replace(/\s*trustBadges\?: unknown\[\];\r?\n/g, "\n  trustBadges?: string[];\n");

  // Safe optional chaining for list maps
  result = result.replace(/\{metrics\.map\(/g, "{metrics?.map(");
  result = result.replace(/\{trustBrands\.map\(/g, "{trustBrands?.map(");
  result = result.replace(/\{pillars\.map\(/g, "{pillars?.map(");
  result = result.replace(/\{stats\.map\(/g, "{stats?.map(");
  result = result.replace(/\{steps\.map\(/g, "{steps?.map(");
  result = result.replace(/\{highlights\.map\(/g, "{highlights?.map(");
  result = result.replace(/\{physicians\.map\(/g, "{physicians?.map(");
  result = result.replace(/\{advisors\.map\(/g, "{advisors?.map(");
  result = result.replace(/\{neighborhoods\.map\(/g, "{neighborhoods?.map(");
  result = result.replace(/\{captions\.map\(/g, "{captions?.map(");
  result = result.replace(/\{items\.map\(/g, "{items?.map(");

  // Add pillars to destructuring when used but missing
  result = result.replace(
    /export function (\w+)\(\{([^}]*)\}(\s*:\s*[^)]+)?\)\s*\{([\s\S]*?)pillars\?\.map/,
    (m, name, params, typeAnn = "", body) => {
      if (/\bpillars\b/.test(params)) return m;
      const trimmed = params.trim();
      const nextParams = trimmed ? `${trimmed},\n  pillars` : "pillars";
      return `export function ${name}({ ${nextParams} }${typeAnn}) {${body}pillars?.map`;
    },
  );

  // Add trustBrands to hero destructuring
  result = result.replace(
    /export function (\w+Hero)\(\{([^}]*)\}(\s*:\s*[^)]+)?\)\s*\{([\s\S]*?)trustBrands\?\.map/,
    (m, name, params, typeAnn = "", body) => {
      if (/\btrustBrands\b/.test(params)) return m;
      const trimmed = params.trim();
      const nextParams = trimmed ? `${trimmed},\n  trustBrands` : "trustBrands";
      return `export function ${name}({ ${nextParams} }${typeAnn}) {${body}trustBrands?.map`;
    },
  );

  // Remove hardcoded demo chrome / badges
  result = result.replace(
    /\s*<span className="se-font-mono ms-2[\s\S]*?app\.northline\.io\/dashboard[\s\S]*?<\/span>/g,
    "",
  );
  result = result.replace(
    /\s*<div[\s\S]*?Michelin selected[\s\S]*?<\/div>/g,
    "",
  );
  result = result.replace(
    /\s*<div\s+className="absolute -bottom-6 -end-6 hidden[\s\S]*?Michelin[\s\S]*?<\/div>/g,
    "",
  );
  result = result.replace(
    /\s*<p className="[^"]*">\s*Private villas · Ocean spa · Michelin dining\s*<\/p>/g,
    "",
  );

  // Wrap metrics dl only when metrics exist
  result = result.replace(
    /<dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">\s*\{metrics\?\.map/,
    "{metrics?.length ? (\n            <dl className=\"mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4\">\n              {metrics.map",
  );

  return result;
}

let changed = 0;
for (const file of walkTsx(TARGET)) {
  const original = fs.readFileSync(file, "utf8");
  const next = fixFile(original);
  if (next !== original) {
    fs.writeFileSync(file, next);
    changed++;
  }
}
console.log(`Post-processed ${changed} files.`);
