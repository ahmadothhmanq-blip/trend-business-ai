/**
 * Medical Premium V2 verification — apply, preview, export.
 * Usage: node scripts/qa-medical-premium-v2.mjs
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "scripts/benchmark-results/template-v2-comparison");
mkdirSync(outDir, { recursive: true });

const runnerDir = mkdtempSync(join(tmpdir(), "wb-medical-v2-"));
const runnerPath = join(runnerDir, "runner.mts");
const runner = `
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { applyStructureTemplateToProject } from ${JSON.stringify(pathToFileURL(join(root, "lib/website/builder/apply-structure-template.ts")).href)};
import { buildStaticPreviewHtml } from ${JSON.stringify(pathToFileURL(join(root, "lib/website/build-static-preview.server.ts")).href)};
import { prepareWebsiteProjectForExport } from ${JSON.stringify(pathToFileURL(join(root, "lib/website/prepare-export.ts")).href)};
import type { GeneratedWebsiteProject } from ${JSON.stringify(pathToFileURL(join(root, "plugins/website/types.ts")).href)};

const baseProject = {
  projectKind: "website",
  title: "Aether Medical",
  description: "Private healthcare network",
  pages: ["home", "services", "physicians", "appointments"],
  sections: [], colorPalette: [], typography: [], components: [], content: [], seo: [], roadmap: [],
  files: [
    { path: "app/page.tsx", content: "export default function Page(){return <main/>}", language: "tsx" },
    { path: "app/globals.css", content: "@tailwind base;@tailwind components;@tailwind utilities;", language: "css" },
    { path: "app/layout.tsx", content: "export default function Layout({children}:{children:React.ReactNode}){return <html lang='en'><body>{children}</body></html>}", language: "tsx" },
    { path: "app/services/page.tsx", content: "export default function Services(){return <main>Services</main>}", language: "tsx" },
  ],
  settings: {},
} satisfies GeneratedWebsiteProject;

const report = { checks: [] as Array<{ id: string; ok: boolean; detail?: string }> };
function check(id: string, ok: boolean, detail?: string) {
  report.checks.push({ id, ok, detail });
}

const applied = await applyStructureTemplateToProject({
  project: baseProject,
  templatePackageId: "medical-premium",
  language: "English",
});

const page = applied.project.files?.find((f) => f.path === "app/page.tsx")?.content ?? "";
check("router.v2", (applied.project.settings as Record<string, unknown>)?.templateArchitectureVersion === "v2");
check("layout.full.bleed", page.includes('data-v2-layout="full-bleed"'));
check("component.trust.hero", page.includes("MedicalPremiumTrustHero"));
check("component.appointment", page.includes("MedicalPremiumAppointmentBand"));
check("component.specialties", page.includes("MedicalPremiumSpecialties"));
check("no.theme.leak", !page.includes("ThemeMinimal") && !page.includes("ThemeCorporate") && !page.includes("ThemeLuxury"));
check("preserve.routes", Boolean(applied.project.files?.find((f) => f.path === "app/services/page.tsx")));
check("component.files", (applied.project.files?.filter((f) => f.path.includes("medical-premium"))?.length ?? 0) >= 10);

const globals = applied.project.files?.find((f) => f.path === "app/globals.css")?.content ?? "";
check("tokens.primary", globals.includes("--color-primary: #0F4C4C"));
check(
  "tokens.language",
  globals.includes("El Messiri") || globals.includes("Noto Sans Arabic") || globals.includes("language profile"),
);
check("design.system", globals.includes(".mp-headline"));

const settings = applied.project.settings as Record<string, unknown>;
const previewInput = {
  title: applied.project.title,
  description: applied.project.description,
  pages: applied.project.pages,
  components: applied.project.components,
  files: applied.project.files,
  templateArchitectureVersion: settings.templateArchitectureVersion,
  templatePackageId: settings.templatePackageId,
  settings,
  language: "English",
};
const v2Html = buildStaticPreviewHtml(previewInput);
const v2RtlHtml = buildStaticPreviewHtml({ ...previewInput, language: "Arabic" });

check("preview.v2", v2Html.includes('data-v2-render="v2-files"'));
check("preview.hero", v2Html.includes('data-v2-component="medical-premium-trust-hero"'));
check("preview.full.bleed", v2Html.includes('data-v2-layout="full-bleed"'));
check("preview.no.theme", !v2Html.includes("ThemeMinimal"));
check("preview.rtl", v2RtlHtml.includes('dir="rtl"'));

const exportReady = prepareWebsiteProjectForExport(applied.project.files ?? []);
check("export.shape", Array.isArray(exportReady.files) && exportReady.files.length > 0);

const comparisonHtml = \`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Medical Premium — V2 Before/After</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 0; background: #0a0a0a; color: #eee; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: #333; min-height: 100vh; }
  .panel { background: #111; padding: 1rem; overflow: auto; }
  h2 { margin: 0 0 0.75rem; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.12em; }
  .bad { color: #f87171; }
  .good { color: #4ade80; }
  iframe { width: 100%; height: 70vh; border: 1px solid #333; background: #fff; }
  pre { font-size: 0.75rem; color: #aaa; white-space: pre-wrap; }
</style>
</head>
<body>
<div class="grid">
  <div class="panel">
    <h2 class="bad">Before (V1 ThemeMinimal fallback)</h2>
    <pre>ThemeMinimalNav, ThemeMinimalHero
Generic minimal theme — no package components
No full-bleed 5-region layout
No mp-* design system</pre>
  </div>
  <div class="panel">
    <h2 class="good">After (Serenity Clinical V2 rebuild)</h2>
    <pre>Palette: #F7FAF9 pearl / #0F4C4C clinical teal
Typography: Source Serif 4 + Inter (WCAG AA)
Layout: full-bleed 5-region (overlay + utility + main)
11 independent MedicalPremium* components</pre>
    <iframe srcdoc="\${v2Html.replace(/"/g, "&quot;")}"></iframe>
  </div>
</div>
</body>
</html>\`;

const outDir = ${JSON.stringify(outDir)};
writeFileSync(join(outDir, "medical-premium-v2-live-preview.html"), v2Html, "utf8");
writeFileSync(join(outDir, "medical-premium-v2-preview-before-after.html"), comparisonHtml, "utf8");
writeFileSync(
  join(outDir, "medical-premium-v2-save-shape.json"),
  JSON.stringify({ title: applied.project.title, fileCount: applied.project.files?.length, settings: applied.project.settings }, null, 2),
  "utf8",
);

report.ok = report.checks.every((c) => c.ok);
console.log("__MEDICAL_V2_QA__" + JSON.stringify(report));
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
const marker = output.indexOf("__MEDICAL_V2_QA__");
if (marker >= 0) {
  const jsonRaw = output.slice(marker + "__MEDICAL_V2_QA__".length).trim();
  const jsonMatch = jsonRaw.match(/^\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("Failed to parse QA report JSON");
    process.exit(1);
  }
  const report = JSON.parse(jsonMatch[0]);
  console.log(JSON.stringify(report, null, 2));
  console.log("\\nArtifacts:", outDir);
  process.exit(report.ok ? 0 : 1);
}

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
process.exit(result.status ?? 1);
