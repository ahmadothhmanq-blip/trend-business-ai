/**
 * Fix broken FLAGSHIP_UI imports in template components.
 * Usage: node scripts/fix-flagship-ui-imports.mjs
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const templatesRoot = path.join(root, "templates", "website");

const importLine =
  'import { resolveFlagshipUiForPackage } from "@/lib/website/template-v2/flagship/themes";';
const constLine = (pkg) =>
  `const FLAGSHIP_UI = resolveFlagshipUiForPackage(${JSON.stringify(pkg)});`;

async function walkComponents(dir, out = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walkComponents(full, out);
    else if (entry.name.endsWith(".tsx")) out.push(full);
  }
  return out;
}

let fixed = 0;
const packages = await readdir(templatesRoot, { withFileTypes: true });

for (const pkgDir of packages) {
  if (!pkgDir.isDirectory()) continue;
  const packageId = pkgDir.name;
  const componentsDir = path.join(templatesRoot, packageId, "components");
  let files = [];
  try {
    files = await walkComponents(componentsDir);
  } catch {
    continue;
  }

  for (const file of files) {
    const content = await readFile(file, "utf8");
    if (!content.includes("FLAGSHIP_UI")) continue;

    let next = content
      .replace(/^import \{[^}]+\} from "@\/lib\/website\/template-v2\/flagship\/themes";\n?/m, "")
      .replace(/\nconst FLAGSHIP_UI = resolveFlagshipUiForPackage\([^)]+\);\n?/g, "\n");

    if (!next.includes("ui={FLAGSHIP_UI}") && !content.match(/ui=\{[A-Z_]+FLAGSHIP_UI\}/)) {
      continue;
    }

    next = next.replace(/ui=\{[A-Z_]+FLAGSHIP_UI\}/g, "ui={FLAGSHIP_UI}");

    if (!next.includes(importLine)) {
      const insertAt = next.indexOf("\n", next.indexOf('"use client";') + 12) + 1;
      next = `${next.slice(0, insertAt)}${importLine}\n${constLine(packageId)}\n${next.slice(insertAt)}`;
    } else if (!next.includes("const FLAGSHIP_UI = resolveFlagshipUiForPackage")) {
      const insertAt = next.indexOf(importLine) + importLine.length + 1;
      next = `${next.slice(0, insertAt)}${constLine(packageId)}\n${next.slice(insertAt)}`;
    }

    if (next !== content) {
      await writeFile(file, next, "utf8");
      fixed += 1;
    }
  }
}

console.log(`Fixed FLAGSHIP_UI imports in ${fixed} files`);
