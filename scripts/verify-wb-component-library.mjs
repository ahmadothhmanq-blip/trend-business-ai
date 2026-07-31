/**
 * Isolation checks for the Website Builder Component Library.
 * Usage: node scripts/verify-wb-component-library.mjs
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const libraryRoot = join(root, "lib/website/component-library");
const componentsRoot = join(root, "components/website");

const forbiddenImportPatterns = [
  /smart-templates/,
  /premium-templates/,
  /template-intelligence/,
  /template-marketplace/,
  /component-marketplace/,
  /lib\/ai-core\/templates/,
  /builder\/theme-catalog/,
  /builder\/theme-architecture/,
  /theme-preview/,
  /lib\/marketplace\/templates/,
];

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

const libraryFiles = walkTsFiles(libraryRoot);
assert.ok(libraryFiles.length >= 10, "component-library module files must exist");

for (const file of libraryFiles) {
  for (const importPath of collectImportPaths(readFileSync(file, "utf8"))) {
    for (const pattern of forbiddenImportPatterns) {
      assert.ok(
        !pattern.test(importPath),
        `${file.replace(root + "\\", "").replace(root + "/", "")} must not import legacy systems via "${importPath}"`,
      );
    }
  }
}

const indexSource = readFileSync(join(libraryRoot, "index.ts"), "utf8");
assert.ok(indexSource.includes("WbComponentRegistry"), "registry export required");
assert.ok(indexSource.includes("validateWbComponentPackage"), "validator export required");
assert.ok(indexSource.includes("validateComponentComposition"), "composition export required");
assert.ok(indexSource.includes("buildAbstractRenderTree"), "renderer contract export required");

const specDoc = readFileSync(
  join(libraryRoot, "spec/COMPONENT_SPEC.md"),
  "utf8",
);
assert.ok(specDoc.includes("Component Library Specification"), "component spec doc required");
assert.ok(specDoc.includes("capability"), "spec must document capabilities");
assert.ok(!specDoc.includes("Restaurant Hero"), "spec must not include business components");

const componentsEntries = readdirSync(componentsRoot).filter((name) => !name.startsWith("."));
assert.equal(componentsEntries.length, 0, "components/website must be empty");

console.log("✓ Website Builder Component Library isolation verified");
console.log(`  module files: ${libraryFiles.length}`);
console.log(`  installed components: ${componentsEntries.length}`);
