/**
 * Full QA sweep — apply + TI brand presets for all 30 installed templates.
 * Usage: node scripts/qa-template-library-full.mjs
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const MARKER = "__WB_TEMPLATE_QA_FULL__";
const VALID_PRESETS = new Set([
  "luxury-brand",
  "technology-brand",
  "corporate-brand",
  "creative-brand",
  "minimal-brand",
  "premium-saas-brand",
]);

function discoverIds() {
  return readdirSync(join(root, "templates/website"), { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith("."))
    .map((e) => e.name)
    .sort();
}

function run() {
  const ids = discoverIds();
  const runnerDir = mkdtempSync(join(tmpdir(), "wb-qa-full-"));
  const runnerPath = join(runnerDir, "runner.mts");
  const runner = `
import { applyStructureTemplateToProject } from ${JSON.stringify(pathToFileURL(join(root, "lib/website/builder/apply-structure-template.ts")).href)};
import { resolveStructureTemplateIntelligenceId } from ${JSON.stringify(pathToFileURL(join(root, "lib/website/builder/template-package-ti-mapping.ts")).href)};
import { getTemplateIntelligence } from ${JSON.stringify(pathToFileURL(join(root, "lib/ai-core/template-intelligence/catalog.ts")).href)};
import { initializeWbTemplateEngine } from ${JSON.stringify(pathToFileURL(join(root, "lib/website/template-engine/index.server.ts")).href)};
import { getBrandPreset } from ${JSON.stringify(pathToFileURL(join(root, "lib/ai-core/brand-identity/presets.ts")).href)};
import type { GeneratedWebsiteProject } from ${JSON.stringify(pathToFileURL(join(root, "plugins/website/types.ts")).href)};

const ids = ${JSON.stringify(ids)};
const VALID = new Set(${JSON.stringify([...VALID_PRESETS])});
const baseProject = {
  projectKind: "website",
  title: "QA Test Site",
  description: "Template QA sweep",
  pages: [{ id: "home", title: "Home", path: "/" }],
  sections: [], colorPalette: [], typography: [], components: [], content: [], seo: [], roadmap: [],
  files: [
    { path: "app/page.tsx", content: "export default function Page(){return <main/>}", language: "tsx" },
    { path: "app/globals.css", content: ":root{--color-primary:#000}", language: "css" },
  ],
} satisfies GeneratedWebsiteProject;

const engine = await initializeWbTemplateEngine();
await engine.ensureLoaded();
const report = { pass: [], fail: [] };

for (const id of ids) {
  const issues = [];
  const tiId = resolveStructureTemplateIntelligenceId(id);
  const ti = getTemplateIntelligence(tiId);
  if (!ti) issues.push({ code: "ti.missing", message: \`TI "\${tiId}" not in catalog\` });
  else if (!VALID.has(ti.brandPresetId)) issues.push({ code: "ti.invalid_preset", message: \`invalid brandPresetId "\${ti.brandPresetId}"\` });
  else if (!getBrandPreset(ti.brandPresetId)) issues.push({ code: "ti.preset_lookup", message: \`getBrandPreset failed for "\${ti.brandPresetId}"\` });

  const preview = await engine.buildPreview(id, { pageId: "home" });
  if (!preview?.html) issues.push({ code: "preview.empty", message: "buildPreview returned empty HTML" });
  else if (!preview.html.includes(\`data-template-id="\${id}"\`)) issues.push({ code: "preview.marker", message: "missing data-template-id in preview HTML" });

  try {
    applyStructureTemplateToProject({ project: baseProject, templatePackageId: id, language: "English" });
  } catch (error) {
    issues.push({ code: "apply.failed", message: error instanceof Error ? error.message : String(error) });
  }

  if (issues.length) report.fail.push({ id, issues });
  else report.pass.push(id);
}

console.log(${JSON.stringify(MARKER)} + JSON.stringify(report));
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
    throw new Error("QA runner failed");
  }
  return JSON.parse(line.slice(MARKER.length));
}

const report = run();
console.log(JSON.stringify(report, null, 2));
process.exit(report.fail.length ? 1 : 0);
