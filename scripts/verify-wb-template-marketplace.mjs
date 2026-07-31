/**
 * Isolation checks for the Website Builder Template Marketplace.
 * Usage: node scripts/verify-wb-template-marketplace.mjs
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const marketplaceRoot = join(root, "lib/website/template-marketplace");
const engineRoot = join(root, "lib/website/template-engine");
const apiRoute = readFileSync(
  join(root, "app/api/website-builder/template-marketplace/route.ts"),
  "utf8",
);
const pkg = readFileSync(join(root, "package.json"), "utf8");

const marketplaceForbiddenImports = [
  /builder\/template-catalog/,
  /builder\/structure-templates/,
  /builder\/use-template-runtime/,
  /template-intelligence/,
  /smart-templates/,
  /premium-templates/,
  /lib\/ai-core\/template-marketplace/,
  /lib\/marketplace\/templates/,
  /components\/dashboard/,
];

const clientMarketplaceForbiddenImports = [
  /template-engine\/index\.server/,
  /template-engine\/loader/,
  /template-engine\/engine/,
  /template-engine\/registry/,
  /template-engine\/preview/,
  /template-engine\/renderer/,
];

const engineForbiddenImports = [/template-marketplace/];

function walkTsFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkTsFiles(full));
    else if (/\.tsx?$/.test(entry.name)) files.push(full);
  }
  return files;
}

function collectImportPaths(source) {
  const paths = [];
  for (const match of source.matchAll(/from\s+["']([^"']+)["']/g)) {
    paths.push(match[1]);
  }
  return paths;
}

function relPath(filePath) {
  return filePath.replace(root + "\\", "").replace(root + "/", "");
}

for (const file of walkTsFiles(marketplaceRoot)) {
  const source = readFileSync(file, "utf8");
  const patterns = /[/\\]index\.ts$/.test(file) && !/index\.server\.ts$/.test(file)
    ? [...marketplaceForbiddenImports, ...clientMarketplaceForbiddenImports]
    : marketplaceForbiddenImports;

  for (const importPath of collectImportPaths(source)) {
    for (const pattern of patterns) {
      assert.ok(
        !pattern.test(importPath),
        `${relPath(file)} must not import "${importPath}" via ${pattern}`,
      );
    }
  }
}

const clientMarketplaceIndex = readFileSync(
  join(marketplaceRoot, "index.ts"),
  "utf8",
);
assert.ok(
  !clientMarketplaceIndex.includes("initializeWbTemplateMarketplace"),
  "client marketplace index must not export server registry",
);
assert.ok(
  readFileSync(join(marketplaceRoot, "index.server.ts"), "utf8").includes(
    "initializeWbTemplateMarketplace",
  ),
  "server marketplace index must export registry",
);

for (const file of walkTsFiles(engineRoot)) {
  const source = readFileSync(file, "utf8");
  for (const importPath of collectImportPaths(source)) {
    for (const pattern of engineForbiddenImports) {
      assert.ok(
        !pattern.test(importPath),
        `${relPath(file)} must remain isolated from template-marketplace (${importPath})`,
      );
    }
  }
}

assert.ok(
  apiRoute.includes("template-marketplace/index.server"),
  "template-marketplace API must use server entry point",
);
assert.ok(
  apiRoute.includes("getTemplateMarketplaceListing"),
  "template-marketplace API must support single listing lookup",
);
assert.ok(
  apiRoute.includes("searchTemplateMarketplaceCatalog"),
  "template-marketplace API must support search",
);
assert.ok(
  pkg.includes("test:template-marketplace"),
  "package.json must register template marketplace tests",
);
assert.ok(
  pkg.includes("verify:wb-template-marketplace"),
  "package.json must register template marketplace verify script",
);

console.log("✓ Website Builder Template Marketplace foundation verified");
