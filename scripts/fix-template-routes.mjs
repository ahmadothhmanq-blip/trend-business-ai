/**
 * Fix template package routing — register orphan pages, remove stale files, sync registry.
 * Usage: node scripts/fix-template-routes.mjs [--dry-run]
 */
import { spawnSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
  readdirSync,
  writeFileSync,
  unlinkSync,
  mkdtempSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { PREMIUM_TEMPLATE_LIBRARY } from "./premium-template-definitions.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dryRun = process.argv.includes("--dry-run");
const TARGETS = [
  join(root, "templates/website"),
  join(root, "templates/website-registry"),
];
const MARKER = "__WB_ROUTE_FIX__";

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, data) {
  if (dryRun) return;
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function discoverIds(dir) {
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith("."))
    .map((e) => e.name)
    .sort();
}

function pageRefFromFile(page, fileName) {
  return {
    id: page.id,
    title: page.title,
    path: page.path,
    layoutId: page.layoutId,
    file: `pages/${fileName}`,
    description: `${page.title} — premium page blueprint.`,
  };
}

function collectFixes(templateId, templatesRoot) {
  const fixes = [];
  const dir = join(templatesRoot, templateId);
  const manifestPath = join(dir, "manifest.json");
  if (!existsSync(manifestPath)) return fixes;

  const manifest = readJson(manifestPath);
  const def = PREMIUM_TEMPLATE_LIBRARY.find((item) => item.id === templateId);
  const manifestFiles = new Set(
    manifest.pages.map((p) => p.file.replace(/^pages\//, "")),
  );

  for (const file of readdirSync(join(dir, "pages")).filter((f) => f.endsWith(".json"))) {
    if (manifestFiles.has(file)) continue;

    const pagePath = join(dir, "pages", file);
    const page = readJson(pagePath);
    const inDefs = def?.pageDefs?.some((pd) => pd.id === page.id && pd.path === page.path);

    if (inDefs) {
      fixes.push({
        templateId,
        action: "register_orphan",
        pageId: page.id,
        path: page.path,
        file: `pages/${file}`,
      });
      manifest.pages.push(pageRefFromFile(page, file));
      manifestFiles.add(file);
      continue;
    }

    fixes.push({
      templateId,
      action: "remove_stale_orphan",
      pageId: page.id,
      path: page.path,
      file: `pages/${file}`,
      reason: "not declared in premium pageDefs",
    });
    if (!dryRun) unlinkSync(pagePath);
  }

  if (fixes.some((f) => f.action === "register_orphan")) {
    writeJson(manifestPath, manifest);
  }

  return fixes;
}

function runValidation(ids) {
  const runnerDir = mkdtempSync(join(tmpdir(), "wb-route-fix-"));
  const runnerPath = join(runnerDir, "runner.mts");
  const runner = `
import { initializeWbTemplateEngine } from ${JSON.stringify(pathToFileURL(join(root, "lib/website/template-engine/index.server.ts")).href)};

const ids = ${JSON.stringify(ids)};
const engine = await initializeWbTemplateEngine();
await engine.ensureLoaded();
const issues = [];

for (const id of ids) {
  const manifest = await engine.getManifest(id);
  if (!manifest) {
    issues.push({ id, code: "engine.manifest.missing" });
    continue;
  }
  const paths = new Set();
  for (const page of manifest.pages) {
    if (!page.path?.startsWith("/")) {
      issues.push({ id, code: "path.invalid", pageId: page.id, path: page.path });
    }
    if (paths.has(page.path)) {
      issues.push({ id, code: "path.duplicate", pageId: page.id, path: page.path });
    }
    paths.add(page.path);
    const preview = await engine.buildPreview(id, { pageId: page.id });
    if (!preview?.html?.includes(\`data-page-id="\${page.id}"\`)) {
      issues.push({ id, code: "preview.failed", pageId: page.id, path: page.path });
    }
  }
}

console.log(${JSON.stringify(MARKER)} + JSON.stringify(issues));
`;
  writeFileSync(runnerPath, runner, "utf8");
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
  rmSync(runnerDir, { recursive: true, force: true });
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  const line = output.split(/\r?\n/).find((l) => l.startsWith(MARKER));
  if (!line) {
    console.error(output);
    throw new Error("Validation runner failed");
  }
  return JSON.parse(line.slice(MARKER.length));
}

const ids = discoverIds(TARGETS[0]);
const allFixes = [];

for (const templateId of ids) {
  for (const targetRoot of TARGETS) {
    allFixes.push(...collectFixes(templateId, targetRoot));
  }
}

const validationIssues = dryRun ? [] : runValidation(ids);

const report = {
  dryRun,
  templatesAudited: ids.length,
  fixes: allFixes,
  validationIssues,
};

console.log(JSON.stringify(report, null, 2));

if (!dryRun && validationIssues.length > 0) {
  process.exit(1);
}
