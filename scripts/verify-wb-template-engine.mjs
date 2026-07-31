/**
 * Isolation checks for the Website Builder Template Engine.
 * Usage: node scripts/verify-wb-template-engine.mjs
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const engineRoot = join(root, "lib/website/template-engine");
const templatesRoot = join(root, "templates/website");

const VERIFY_MARKER = "__WB_TEMPLATE_VERIFY__";

const forbiddenImportPatterns = [
  /smart-templates/,
  /premium-templates/,
  /template-intelligence/,
  /template-marketplace/,
  /lib\/ai-core\/templates/,
  /builder\/structure-templates/,
  /template-preview-renderer/,
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

function relPath(filePath) {
  return filePath.replace(root + "\\", "").replace(root + "/", "");
}

function discoverPackageDirectories(dir) {
  if (!existsSync(dir)) {
    return [];
  }

  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => join(dir, entry.name))
    .sort((a, b) => a.localeCompare(b));
}

function runTemplatePackageVerification(templatesRootPath) {
  const validatePackagePath = join(
    root,
    "lib/website/template-engine/spec/validate-package.ts",
  );
  const loaderPath = join(root, "lib/website/template-engine/loader.ts");

  const runnerSource = `import { readdirSync } from "node:fs";
import { join, basename } from "node:path";
import { pathToFileURL } from "node:url";
import { validateWbTemplatePackage } from ${JSON.stringify(pathToFileURL(validatePackagePath).href)};
import { loadWbTemplatePackages } from ${JSON.stringify(pathToFileURL(loaderPath).href)};

const templatesRoot = ${JSON.stringify(templatesRootPath)};
const discoveredDirectories = readdirSync(templatesRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
  .map((entry) => join(templatesRoot, entry.name))
  .sort((a, b) => a.localeCompare(b));

const packages = [];
const warnings = [];

for (const directory of discoveredDirectories) {
  const packageId = basename(directory);
  try {
    const validation = await validateWbTemplatePackage(directory);
    packages.push({
      directory,
      id: validation.packageId ?? packageId,
      version: validation.packageVersion ?? null,
      valid: validation.valid,
      issues: validation.issues ?? [],
    });
  } catch (error) {
    packages.push({
      directory,
      id: packageId,
      version: null,
      valid: false,
      issues: [
        {
          code: "package.load_failed",
          message: error instanceof Error ? error.message : String(error),
        },
      ],
    });
  }
}

const loadReport = await loadWbTemplatePackages({
  templatesRoot,
  clearRegistry: true,
});

const validated = packages.filter((pkg) => pkg.valid).length;
const loaded = loadReport.registered;
const failedPackages = packages.filter((pkg) => !pkg.valid);
const registrationFailures = loadReport.errors.length;
const passed = Math.min(validated, loaded);
const failed = Math.max(
  failedPackages.length,
  discoveredDirectories.length - loaded,
  registrationFailures,
);

if (discoveredDirectories.length === 0) {
  warnings.push("no template packages discovered under templates/website");
}

for (const error of loadReport.errors) {
  if (!failedPackages.some((pkg) => pkg.directory === error.directory)) {
    warnings.push(
      \`\${error.directory}: registration failed after validation (\${error.message})\`,
    );
  }
}

const payload = {
  discovered: discoveredDirectories.length,
  validated,
  loaded,
  passed,
  failed,
  warnings,
  packages,
  loadReport,
};

console.log(${JSON.stringify(VERIFY_MARKER)} + JSON.stringify(payload));
`;

  const runnerDir = mkdtempSync(join(tmpdir(), "wb-template-verify-"));
  const runnerPath = join(runnerDir, "runner.mts");

  try {
    writeFileSync(runnerPath, runnerSource, "utf8");

    const result =
      process.platform === "win32"
        ? spawnSync(`npx --yes tsx "${runnerPath.replaceAll('"', '\\"')}"`, {
            cwd: root,
            encoding: "utf8",
            env: process.env,
            shell: true,
          })
        : spawnSync("npx", ["--yes", "tsx", runnerPath], {
            cwd: root,
            encoding: "utf8",
            env: process.env,
          });

    if (result.error) {
      throw result.error;
    }

    const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
    const markerLine = output
      .split(/\r?\n/)
      .find((line) => line.startsWith(VERIFY_MARKER));

    if (!markerLine) {
      console.error(output.trim());
      throw new Error("template package verification runner did not return a result");
    }

    if (result.status !== 0) {
      console.error(output.trim());
      throw new Error(`template package verification runner exited with code ${result.status}`);
    }

    return JSON.parse(markerLine.slice(VERIFY_MARKER.length));
  } finally {
    rmSync(runnerDir, { recursive: true, force: true });
  }
}

function printPackageFailures(packages, loadReport) {
  for (const pkg of packages.filter((item) => !item.valid)) {
    console.error(`  ✗ ${pkg.id} (${pkg.directory})`);
    for (const issue of pkg.issues) {
      console.error(`      - ${issue.message}`);
    }
  }

  for (const error of loadReport.errors) {
    console.error(`  ✗ registration failed: ${error.directory}`);
    console.error(`      - ${error.message}`);
  }
}

const engineFiles = walkTsFiles(engineRoot);
assert.ok(engineFiles.length >= 8, "template-engine module files must exist");

for (const file of engineFiles) {
  const source = readFileSync(file, "utf8");
  for (const importPath of collectImportPaths(source)) {
    for (const pattern of forbiddenImportPatterns) {
      assert.ok(
        !pattern.test(importPath),
        `${relPath(file)} must not import legacy template system via "${importPath}"`,
      );
    }
  }
}

const constantsSource = readFileSync(join(engineRoot, "constants.ts"), "utf8");
assert.ok(
  !constantsSource.includes("node:path"),
  "client constants must not import node:path",
);

for (const file of ["index.ts", "types.ts", "manifest.ts", "spec/index.ts", "spec/constants.ts", "spec/types.ts", "spec/schema.ts"]) {
  const source = readFileSync(join(engineRoot, file), "utf8");
  assert.ok(!source.includes("node:fs"), `${file} must not import node:fs`);
  assert.ok(!source.includes("node:async_hooks"), `${file} must not import node:async_hooks`);
}
const clientIndexSource = readFileSync(join(engineRoot, "index.ts"), "utf8");
const serverIndexSource = readFileSync(join(engineRoot, "index.server.ts"), "utf8");

assert.ok(
  clientIndexSource.includes('export * from "@/lib/website/template-engine/spec"'),
  "client index must re-export template spec helpers",
);
assert.ok(
  clientIndexSource.includes("WB_TEMPLATE_ENGINE_VERSION"),
  "client index must export engine version constants",
);
assert.ok(
  !clientIndexSource.includes("loadWbTemplatePackages"),
  "client index must not export filesystem loader",
);
assert.ok(
  !clientIndexSource.includes("initializeWbTemplateEngine"),
  "client index must not export server engine runtime",
);
assert.ok(
  !clientIndexSource.includes("validateWbTemplatePackage"),
  "client index must not export filesystem package validator",
);

assert.ok(serverIndexSource.includes("WbTemplateEngine"), "server index export required");
assert.ok(serverIndexSource.includes("loadWbTemplatePackages"), "server loader export required");
assert.ok(serverIndexSource.includes("renderWbTemplate"), "server renderer export required");
assert.ok(serverIndexSource.includes("validateWbTemplatePackage"), "server package validator export required");
assert.ok(serverIndexSource.includes("initializeWbTemplateEngine"), "server engine initializer export required");

const specDoc = readFileSync(
  join(engineRoot, "spec/TEMPLATE_PACKAGE_SPEC.md"),
  "utf8",
);
assert.ok(specDoc.includes("Template Package Specification"), "package spec doc required");
assert.ok(specDoc.includes("2.0.0"), "package spec must be v2.0.0");
assert.ok(specDoc.includes("regions/"), "package spec must document regions directory");
assert.ok(!specDoc.includes("├── sections/"), "v1 sections directory must be removed from package layout");

const apiRoute = readFileSync(
  join(root, "app/api/website-builder/template-engine/route.ts"),
  "utf8",
);
assert.ok(
  apiRoute.includes("template-engine/index.server"),
  "template-engine API must use the server engine entry point",
);
for (const pattern of forbiddenImportPatterns) {
  for (const importPath of collectImportPaths(apiRoute)) {
    assert.ok(
      !pattern.test(importPath),
      `template-engine API must not import legacy systems via "${importPath}"`,
    );
  }
}

const discoveredDirectories = discoverPackageDirectories(templatesRoot);
const packageVerification = runTemplatePackageVerification(templatesRoot);

assert.equal(
  packageVerification.discovered,
  discoveredDirectories.length,
  "package discovery count must match filesystem scan",
);
assert.ok(
  packageVerification.discovered >= 1,
  "at least one template package must exist under templates/website",
);
assert.equal(
  packageVerification.validated,
  packageVerification.discovered,
  "every discovered template package must pass validation",
);
assert.equal(
  packageVerification.loaded,
  packageVerification.discovered,
  "every discovered template package must load and register",
);
assert.equal(packageVerification.failed, 0, "template package verification must not report failures");
assert.equal(
  packageVerification.loadReport.errors.length,
  0,
  "template package registration must not report errors",
);

const duplicateIds = packageVerification.packages
  .map((pkg) => pkg.id)
  .filter((id, index, ids) => ids.indexOf(id) !== index);
assert.equal(
  duplicateIds.length,
  0,
  `duplicate template package ids detected: ${duplicateIds.join(", ")}`,
);

if (packageVerification.failed > 0 || packageVerification.loadReport.errors.length > 0) {
  printPackageFailures(packageVerification.packages, packageVerification.loadReport);
  process.exit(1);
}

console.log("✓ Website Builder Template Engine isolation verified");
console.log(`  module files: ${engineFiles.length}`);
console.log("✓ Website Builder Template Package verification");
console.log(`  packages discovered: ${packageVerification.discovered}`);
console.log(`  packages validated:  ${packageVerification.validated}`);
console.log(`  packages loaded:     ${packageVerification.loaded}`);
console.log(`  passed:              ${packageVerification.passed}`);
console.log(`  failed:              ${packageVerification.failed}`);
console.log(`  warnings:            ${packageVerification.warnings.length}`);
for (const pkg of packageVerification.packages) {
  console.log(`    - ${pkg.id}@${pkg.version ?? "unknown"}`);
}
for (const warning of packageVerification.warnings) {
  console.log(`    ! ${warning}`);
}
