/**
 * V2 Preview Engine Integration QA — validates preview renders from project.files.
 * Usage: node scripts/qa-v2-preview-integration.mjs
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "scripts/benchmark-results/template-v2-comparison");
mkdirSync(outDir, { recursive: true });

const runnerDir = mkdtempSync(join(tmpdir(), "wb-v2-preview-qa-"));
const runnerPath = join(runnerDir, "runner.mts");
const runner = `
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { applyStructureTemplateToProject } from ${JSON.stringify(pathToFileURL(join(root, "lib/website/builder/apply-structure-template.ts")).href)};
import { buildStaticPreviewHtml } from ${JSON.stringify(pathToFileURL(join(root, "lib/website/build-static-preview.server.ts")).href)};

const baseProject = {
  projectKind: "website",
  title: "Maison Verdant",
  description: "Michelin-starred seasonal tasting menus",
  pages: ["home", "menu"],
  sections: [], colorPalette: [], typography: [], components: [], content: [], seo: [], roadmap: [],
  files: [
    { path: "app/page.tsx", content: "export default function Page(){return <main/>}", language: "tsx" },
    { path: "app/globals.css", content: "@tailwind base;@tailwind components;@tailwind utilities;", language: "css" },
    { path: "app/menu/page.tsx", content: "export default function Menu(){return <main>Menu</main>}", language: "tsx" },
  ],
  settings: {},
};

function previewInput(project, language = "English") {
  const settings = (project.settings ?? {}) as Record<string, unknown>;
  return {
    title: project.title,
    description: project.description,
    pages: project.pages,
    components: project.components,
    files: project.files,
    templateArchitectureVersion: settings.templateArchitectureVersion,
    templatePackageId: settings.templatePackageId,
    settings,
    language,
  };
}

const report = { checks: [] as Array<{ id: string; ok: boolean; detail?: string }> };
function check(id: string, ok: boolean, detail?: string) {
  report.checks.push({ id, ok, detail });
}

const applied = await applyStructureTemplateToProject({
  project: baseProject,
  templatePackageId: "restaurant-signature",
  language: "English",
});

const v2Html = buildStaticPreviewHtml(previewInput(applied.project, "English"));
const v2RtlHtml = buildStaticPreviewHtml(previewInput(applied.project, "Arabic"));

check("v2.render.version", v2Html.includes('data-v2-render="v2-files"'));
check("v2.package.marker", v2Html.includes('data-v2-package="restaurant-signature"'));
check("v2.layout.marker", v2Html.includes('data-v2-layout="sidebar-left"'));
check("v2.component.hero", v2Html.includes('data-v2-component="restaurant-signature-hero"'));
check("v2.component.nav", v2Html.includes("RestaurantSignatureNav") || v2Html.includes("restaurant-signature-nav"));
check("v2.no.theme.luxury", !v2Html.includes("ThemeLuxury"));
check("v2.no.theme.corporate", !v2Html.includes("ThemeCorporate"));
check("v2.no.theme.tech", !v2Html.includes("ThemeTech"));
check("v2.no.v1.preview", !v2Html.includes('data-ti-render="v5"'));
check("v2.tokens.primary", v2Html.includes("--color-primary: #1A3D32"));
check("v2.tailwind.cdn", v2Html.includes("cdn.tailwindcss.com"));
check("v2.rtl.dir", v2RtlHtml.includes('dir="rtl"'));

const modern = await applyStructureTemplateToProject({
  project: baseProject,
  templatePackageId: "modern-business",
  language: "English",
});
const modernHtml = buildStaticPreviewHtml(previewInput(modern.project, "English"));
check("v1.modern.still.theme", modernHtml.includes('data-ti-render="v5"'));
check("v1.modern.corporate", modernHtml.includes("ThemeCorporateNav"));
check("v1.modern.no.v2render", !modernHtml.includes('data-v2-render="v2-files"'));

const comparisonHtml = \`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Restaurant Signature — V2 Preview Before/After</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 0; background: #0a0a0a; color: #eee; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: #333; min-height: 100vh; }
  .panel { background: #111; padding: 1rem; overflow: auto; }
  h2 { margin: 0 0 0.75rem; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.12em; }
  .bad { color: #f87171; }
  .good { color: #4ade80; }
  pre { font-size: 11px; white-space: pre-wrap; background: #1a1a1a; padding: 12px; border-radius: 8px; }
  iframe { width: 100%; height: 70vh; border: 1px solid #333; border-radius: 8px; background: #fff; }
</style>
</head>
<body>
<h1 style="padding:1rem;margin:0;font-size:1rem;border-bottom:1px solid #333">V2 Preview Integration — Before vs After</h1>
<div class="grid">
  <div class="panel">
    <h2 class="bad">Before (legacy V1 theme preview path)</h2>
    <pre>Rendered components: ThemeLuxuryNav, ThemeLuxuryHero, ThemeLuxuryCta…
Markers: data-ti-render="v5", data-theme-scaffold
Missing: data-v2-package, RestaurantSignature* components
Colors: TI catalog (#1C1917) — not V2 tokens (#1A3D32)
Root cause: resolveThemePreviewContext(templateIntelligenceId) ignored project.files</pre>
  </div>
  <div class="panel">
    <h2 class="good">After (V2 project.files preview path)</h2>
    <pre>Rendered: RestaurantSignature* from app/page.tsx SSR
Markers: data-v2-render="v2-files", data-v2-package="restaurant-signature"
Tokens: --color-primary: #1A3D32 from globals.css
No ThemeLuxury / ThemeCorporate / ThemeTech in HTML</pre>
    <iframe srcdoc="\${v2Html.replace(/"/g, "&quot;")}"></iframe>
  </div>
</div>
</body>
</html>\`;

const outDir = ${JSON.stringify(outDir)};
writeFileSync(join(outDir, "restaurant-signature-v2-live-preview.html"), v2Html, "utf8");
writeFileSync(join(outDir, "restaurant-signature-v2-preview-before-after.html"), comparisonHtml, "utf8");
writeFileSync(
  join(outDir, "v2-preview-integration-report.json"),
  JSON.stringify({ checks: report.checks, generatedAt: new Date().toISOString() }, null, 2),
  "utf8",
);

report.ok = report.checks.every((c) => c.ok);
console.log("__V2_PREVIEW_QA__" + JSON.stringify(report));
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

const output = (result.stdout || "") + (result.stderr || "");
const marker = output.indexOf("__V2_PREVIEW_QA__");
if (marker >= 0) {
  const jsonRaw = output.slice(marker + "__V2_PREVIEW_QA__".length).trim();
  const jsonMatch = jsonRaw.match(/^\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("Failed to parse QA report JSON");
    process.exit(1);
  }
  const report = JSON.parse(jsonMatch[0]);
  console.log(JSON.stringify(report, null, 2));
  console.log(`\nArtifacts: ${outDir}`);
  process.exit(report.ok ? 0 : 1);
}

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
process.exit(result.status ?? 1);
