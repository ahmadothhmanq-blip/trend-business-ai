/**
 * Generate live-preview HTML for flagship templates and report typography tokens.
 * Usage: node scripts/inspect-flagship-templates.mjs
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "scripts/benchmark-results/flagship-inspect");
mkdirSync(outDir, { recursive: true });

const runnerDir = mkdtempSync(join(tmpdir(), "wb-flagship-inspect-"));
const runnerPath = join(runnerDir, "runner.mts");
const runner = `
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { applyStructureTemplateToProject } from ${JSON.stringify(pathToFileURL(join(root, "lib/website/builder/apply-structure-template.ts")).href)};
import { buildStaticPreviewHtml } from ${JSON.stringify(pathToFileURL(join(root, "lib/website/build-static-preview.server.ts")).href)};

const baseProject = {
  projectKind: "website",
  title: "Inspect Co",
  description: "Template inspection",
  pages: ["home"],
  sections: [], colorPalette: [], typography: [], components: [], content: [], seo: [], roadmap: [],
  files: [
    { path: "app/page.tsx", content: "export default function Page(){return <main/>}", language: "tsx" },
    { path: "app/globals.css", content: "@tailwind base;@tailwind components;@tailwind utilities;", language: "css" },
    { path: "app/layout.tsx", content: "export default function Layout({children}:{children:React.ReactNode}){return <html lang='en'><body>{children}</body></html>}", language: "tsx" },
  ],
  settings: {},
};

const templates = [
  { id: "ai-startup-signal", hero: "ai-startup-signal-hero", label: "Signal" },
  { id: "creative-agency-premium", hero: "creative-agency-premium-hero", label: "Volt" },
  { id: "finance-premium", hero: "finance-premium-hero", label: "Ledger" },
  { id: "corporate-business", hero: "corporate-business-hero", label: "Atlas" },
  { id: "real-estate-prestige", hero: "real-estate-prestige-hero", label: "Monolith" },
  { id: "medical-premium", hero: "medical-premium-hero", label: "Serenity" },
  { id: "hotel-resort-premium", hero: "hotel-resort-premium-hero", label: "Haven" },
  { id: "restaurant-premium", hero: "restaurant-premium-hero", label: "Ember" },
  { id: "education-premium", hero: "education-premium-hero", label: "Heritage" },
  { id: "ecommerce-premium", hero: "ecommerce-premium-hero", label: "Atelier" },
  { id: "saas-enterprise", hero: "saas-enterprise-hero", label: "Nexus" },
  { id: "creative-portfolio", hero: "creative-portfolio-hero", label: "Kinetic" },
  { id: "real-estate-premium", hero: "real-estate-premium-hero", label: "Estates" },
  { id: "restaurant-signature", hero: "restaurant-signature-hero", label: "Forest" },
  { id: "prism-aurora", hero: "prism-aurora-hero", label: "Prism" },
  { id: "obsidian-noir", hero: "obsidian-noir-hero", label: "Obsidian" },
  { id: "pulse-fintech", hero: "pulse-fintech-hero", label: "Pulse" },
  { id: "forge-industrial", hero: "forge-industrial-hero", label: "Forge" },
  { id: "citadel-trust", hero: "citadel-trust-hero", label: "Citadel" },
  { id: "lumina-wellness", hero: "lumina-wellness-hero", label: "Lumina" },
];

const report = { templates: [] as Array<Record<string, unknown>> };

for (const tpl of templates) {
  const applied = await applyStructureTemplateToProject({
    project: { ...baseProject, title: tpl.label },
    templatePackageId: tpl.id,
    language: "English",
  });

  const globals = applied.project.files?.find((f) => f.path === "app/globals.css")?.content ?? "";
  const page = applied.project.files?.find((f) => f.path === "app/page.tsx")?.content ?? "";
  const settings = applied.project.settings as Record<string, unknown>;

  const displayMatch = globals.match(/--df-text-display:\\s*([^;]+)/);
  const sectionYMatch = globals.match(/--(?:se|cb)-section-y:\\s*([^;]+)/);
  const headlineCss = globals.match(/\\.(?:se|cb)-headline\\s*\\{[^}]*font-size:\\s*([^;]+)/);

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

  let previewHtml = "";
  let previewError = "";
  try {
    previewHtml = buildStaticPreviewHtml(previewInput);
  } catch (e) {
    previewError = e instanceof Error ? e.message : String(e);
  }

  const outName = \`\${tpl.id}-inspect-preview.html\`;
  if (previewHtml) {
    writeFileSync(join(${JSON.stringify(outDir)}, outName), previewHtml, "utf8");
  }

  report.templates.push({
    id: tpl.id,
    label: tpl.label,
    v2: settings.templateArchitectureVersion === "v2",
    fileCount: applied.project.files?.length ?? 0,
    hasHero: page.includes(tpl.hero),
    displayToken: displayMatch?.[1]?.trim() ?? null,
    sectionY: sectionYMatch?.[1]?.trim() ?? null,
    headlineFallback: headlineCss?.[1]?.trim() ?? null,
    previewBytes: previewHtml.length,
    previewError: previewError || null,
    previewOk: previewHtml.includes(\`data-v2-component="\${tpl.hero}"\`),
    artifact: outName,
  });
}

console.log("__FLAGSHIP_INSPECT__" + JSON.stringify(report, null, 2));
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
const marker = output.indexOf("__FLAGSHIP_INSPECT__");
if (marker >= 0) {
  const jsonRaw = output.slice(marker + "__FLAGSHIP_INSPECT__".length).trim();
  console.log(jsonRaw);
  console.log("\\nArtifacts:", outDir);
  process.exit(result.status ?? 0);
}

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
process.exit(result.status ?? 1);
