/**
 * Real Estate Prestige TBDP-native verification — consumption, visual parity, builder/export.
 * Usage: node scripts/qa-real-estate-prestige-tbdp-native.mjs
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "scripts/benchmark-results/template-v2-comparison");
mkdirSync(outDir, { recursive: true });

const runnerDir = mkdtempSync(join(tmpdir(), "wb-realestate-tbdp-"));
const runnerPath = join(runnerDir, "runner.mts");
const runner = `
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { applyStructureTemplateToProject } from ${JSON.stringify(pathToFileURL(join(root, "lib/website/builder/apply-structure-template.ts")).href)};
import { prepareWebsiteProjectForExport } from ${JSON.stringify(pathToFileURL(join(root, "lib/website/prepare-export.ts")).href)};
import { loadTemplateV2Package } from ${JSON.stringify(pathToFileURL(join(root, "lib/website/template-v2/loader/load-v2-package.ts")).href)};
import { MONOLITH_ESTATE_V2_TOKENS } from ${JSON.stringify(pathToFileURL(join(root, "lib/website/template-v2/tbdp/profiles/real-estate-prestige/monolith-estate.ts")).href)};
import { resolveWbTemplatesRoot } from ${JSON.stringify(pathToFileURL(join(root, "lib/website/template-engine/constants.server.ts")).href)};
import type { GeneratedWebsiteProject } from ${JSON.stringify(pathToFileURL(join(root, "plugins/website/types.ts")).href)};

const baseProject = {
  projectKind: "website",
  title: "Monolith Estate",
  description: "Ultra-premium luxury real estate advisory",
  pages: ["home", "listings", "neighborhoods", "contact"],
  sections: [], colorPalette: [], typography: [], components: [], content: [], seo: [], roadmap: [],
  files: [
    { path: "app/page.tsx", content: "export default function Page(){return <main/>}", language: "tsx" },
    { path: "app/globals.css", content: "@tailwind base;@tailwind components;@tailwind utilities;", language: "css" },
    { path: "app/layout.tsx", content: "export default function Layout({children}:{children:React.ReactNode}){return <html lang='en'><body>{children}</body></html>}", language: "tsx" },
    { path: "app/listings/page.tsx", content: "export default function Listings(){return <main>Listings</main>}", language: "tsx" },
  ],
  settings: {},
} satisfies GeneratedWebsiteProject;

const report = { checks: [] as Array<{ id: string; ok: boolean; detail?: string }> };
function check(id: string, ok: boolean, detail?: string) {
  report.checks.push({ id, ok, detail });
}

const packageDir = join(resolveWbTemplatesRoot(), "real-estate-prestige");
const loaded = await loadTemplateV2Package(packageDir);
check("load.tbdpNative", loaded.ok && Boolean(loaded.ok && loaded.bundle.tbdpNative?.enabled));
check("load.sectorDna", loaded.ok && loaded.bundle.tbdpNative?.sectorDnaId === "real-estate");
check(
  "load.monolithEstate.primary",
  loaded.ok && loaded.bundle.tokens.colors.primary === MONOLITH_ESTATE_V2_TOKENS.colors.primary,
);
check(
  "load.monolithEstate.brass",
  loaded.ok && loaded.bundle.tokens.colors.brass === MONOLITH_ESTATE_V2_TOKENS.colors.brass,
);

const applied = await applyStructureTemplateToProject({
  project: baseProject,
  templatePackageId: "real-estate-prestige",
  language: "English",
});

const page = applied.project.files?.find((f) => f.path === "app/page.tsx")?.content ?? "";
check("router.v2", (applied.project.settings as Record<string, unknown>)?.templateArchitectureVersion === "v2");
check("layout.sidebar.right", page.includes('data-v2-layout="sidebar-right"'));
check("component.hero", page.includes("RealEstatePrestigeHero"));
check("component.dossier", page.includes("RealEstatePrestigeDossierRail"));
check("component.collection", page.includes("RealEstatePrestigeCollection"));
check("no.theme.leak", !page.includes("ThemeCorporate") && !page.includes("ThemeLuxury") && !page.includes("ThemeBold"));
check("preserve.routes", Boolean(applied.project.files?.find((f) => f.path === "app/listings/page.tsx")));
check("component.files", (applied.project.files?.filter((f) => f.path.includes("real-estate-prestige"))?.length ?? 0) >= 10);

const globals = applied.project.files?.find((f) => f.path === "app/globals.css")?.content ?? "";
check("tbdp.authority", globals.includes("TBDP Native Consumption"));
check("tbdp.native.flag", globals.includes("--tbdp-native: 1"));
check("tbdp.sector", globals.includes('--tbdp-sector-dna: "real-estate"'));
check("visual.primary", globals.includes("--color-primary: #1C1917"));
check("visual.brass", globals.includes("--color-brass: #B8956B"));
check("visual.rep.utilities", globals.includes(".rep-headline"));
check(
  "tokens.language",
  globals.includes("Tajawal") ||
    globals.includes("Noto Sans Arabic") ||
    globals.includes('[dir="rtl"]'),
);

const exportReady = prepareWebsiteProjectForExport(applied.project.files ?? []);
check("export.shape", Array.isArray(exportReady.files) && exportReady.files.length > 0);
check("export.home", exportReady.files.some((f) => f.path === "app/page.tsx"));

const consumptionReport = {
  packageId: "real-estate-prestige",
  tbdpNative: loaded.ok ? loaded.bundle.tbdpNative : null,
  tokenSnapshot: loaded.ok ? loaded.bundle.tokens.colors : null,
  motionPreset: loaded.ok ? loaded.bundle.motion.preset : null,
  responsiveContainer: loaded.ok ? loaded.bundle.responsive.containerMaxWidth : null,
  globalsMarkers: {
    tbdpAuthority: globals.includes("TBDP Native Consumption"),
    primaryColor: globals.includes("#1C1917"),
    brassColor: globals.includes("#B8956B"),
  },
};

const outDir = ${JSON.stringify(outDir)};
writeFileSync(
  join(outDir, "real-estate-prestige-tbdp-consumption.json"),
  JSON.stringify(consumptionReport, null, 2),
  "utf8",
);

const previewHtml = \`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Real Estate Prestige TBDP Native Preview</title>
<style>\${globals}</style>
<script src="https://cdn.tailwindcss.com"></script>
</head>
<body style="margin:0;background:#F5F0EB;color:#1C1917">
<div data-preview="real-estate-prestige-tbdp" data-architecture="v2" data-tbdp-native="1">
<pre style="font:12px monospace;padding:12px;border-bottom:1px solid rgba(184,149,107,0.32)">Real Estate Prestige · TBDP Native · Monolith Estate · sidebar-right</pre>
<div style="padding:16px;font-family:Georgia,serif">\${page.replace(/import[^;]+;/g, "").slice(0, 4000)}</div>
</div>
</body>
</html>\`;

writeFileSync(join(outDir, "real-estate-prestige-tbdp-preview.html"), previewHtml, "utf8");

report.ok = report.checks.every((c) => c.ok);
console.log("__REALESTATE_TBDP_QA__" + JSON.stringify(report));
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
const marker = output.indexOf("__REALESTATE_TBDP_QA__");
if (marker >= 0) {
  const jsonRaw = output.slice(marker + "__REALESTATE_TBDP_QA__".length).trim();
  const jsonMatch = jsonRaw.match(/^\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("Failed to parse QA report JSON");
    process.exit(1);
  }
  const report = JSON.parse(jsonMatch[0]);
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.ok ? 0 : 1);
}

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
process.exit(result.status ?? 1);
