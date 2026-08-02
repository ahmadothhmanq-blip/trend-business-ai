/**
 * Audit template package routes — every manifest page must exist, match paths, and preview.
 * Usage: node scripts/audit-template-routes.mjs
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const templatesRoot = join(root, "templates/website");
const MARKER = "__WB_ROUTE_AUDIT__";

function discoverIds() {
  return readdirSync(templatesRoot, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith("."))
    .map((e) => e.name)
    .sort();
}

function auditFilesystem(id) {
  const dir = join(templatesRoot, id);
  const issues = [];
  const manifest = JSON.parse(readFileSync(join(dir, "manifest.json"), "utf8"));
  const layoutPath = join(dir, "layouts/default.json");
  if (!existsSync(layoutPath)) {
    issues.push({ code: "layout.missing", message: "layouts/default.json missing" });
    return { manifest, issues };
  }
  const layout = JSON.parse(readFileSync(layoutPath, "utf8"));
  const layoutRegions = new Set(layout.regionOrder ?? []);
  const paths = new Map();

  for (const pageRef of manifest.pages) {
    const filePath = join(dir, pageRef.file);
    if (!existsSync(filePath)) {
      issues.push({
        code: "page.file.missing",
        pageId: pageRef.id,
        path: pageRef.path,
        file: pageRef.file,
      });
      continue;
    }
    const page = JSON.parse(readFileSync(filePath, "utf8"));
    if (page.id !== pageRef.id) {
      issues.push({
        code: "page.id.mismatch",
        pageId: pageRef.id,
        fileId: page.id,
        file: pageRef.file,
      });
    }
    if (page.path !== pageRef.path) {
      issues.push({
        code: "page.path.mismatch",
        pageId: pageRef.id,
        manifestPath: pageRef.path,
        filePath: page.path,
        file: pageRef.file,
      });
    }
    if (page.layoutId !== pageRef.layoutId) {
      issues.push({
        code: "page.layout.mismatch",
        pageId: pageRef.id,
        manifestLayout: pageRef.layoutId,
        fileLayout: page.layoutId,
      });
    }
    if (!page.path?.startsWith("/")) {
      issues.push({ code: "page.path.invalid", pageId: pageRef.id, path: page.path });
    }
    if (paths.has(page.path)) {
      issues.push({
        code: "page.path.duplicate",
        pageId: pageRef.id,
        path: page.path,
        other: paths.get(page.path),
      });
    } else {
      paths.set(page.path, pageRef.id);
    }
    for (const regionId of page.regions ?? []) {
      if (!layoutRegions.has(regionId)) {
        issues.push({
          code: "page.region.not_in_layout",
          pageId: pageRef.id,
          regionId,
          layoutRegions: [...layoutRegions],
        });
      }
    }
  }

  const manifestFiles = new Set(manifest.pages.map((p) => p.file.replace(/^pages\//, "")));
  for (const file of readdirSync(join(dir, "pages")).filter((f) => f.endsWith(".json"))) {
    if (!manifestFiles.has(file)) {
      issues.push({ code: "page.orphan_file", file: `pages/${file}` });
    }
  }

  const entryPath = join(dir, "package.entry.json");
  if (existsSync(entryPath)) {
    const entry = JSON.parse(readFileSync(entryPath, "utf8"));
    if (!manifest.pages.some((p) => p.id === entry.defaultPageId)) {
      issues.push({
        code: "entry.default_page.missing",
        defaultPageId: entry.defaultPageId,
      });
    }
  }

  return { manifest, issues };
}

function runPreviewAudit(ids) {
  const runnerDir = mkdtempSync(join(tmpdir(), "wb-route-audit-"));
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
    issues.push({ id, code: "engine.manifest.missing", message: "template not in engine" });
    continue;
  }
  for (const page of manifest.pages) {
    const preview = await engine.buildPreview(id, { pageId: page.id });
    if (!preview?.html) {
      issues.push({ id, code: "preview.empty", pageId: page.id, path: page.path });
      continue;
    }
    if (!preview.html.includes(\`data-page-id="\${page.id}"\`)) {
      issues.push({ id, code: "preview.page_marker", pageId: page.id, path: page.path });
    }
  }
  // Standard routes: every manifest page id must resolve to its declared path.
  const paths = new Set(manifest.pages.map((p) => p.path));
  const ids = new Set(manifest.pages.map((p) => p.id));
  for (const page of manifest.pages) {
    if (page.id === "home" && page.path !== "/") {
      issues.push({ id, code: "route.home.invalid", pageId: page.id, path: page.path });
    }
  }
  if (!ids.has("home") || !paths.has("/")) {
    issues.push({ id, code: "route.home.missing" });
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
    throw new Error("Preview audit runner failed");
  }
  return JSON.parse(line.slice(MARKER.length));
}

const ids = discoverIds();
const fsReport = [];
for (const id of ids) {
  const { issues } = auditFilesystem(id);
  if (issues.length) fsReport.push({ id, issues });
}

console.log("Filesystem audit:", JSON.stringify(fsReport, null, 2));
const previewIssues = runPreviewAudit(ids);
console.log("Preview audit:", JSON.stringify(previewIssues, null, 2));

if (fsReport.length > 0 || previewIssues.length > 0) {
  process.exit(1);
}

console.log(`\n✓ All ${ids.length} template packages passed route audit`);
