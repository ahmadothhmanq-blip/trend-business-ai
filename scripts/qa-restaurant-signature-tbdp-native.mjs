/**
 * Restaurant Signature TBDP-native verification — consumption, visual parity, builder/export.
 * Usage: node scripts/qa-restaurant-signature-tbdp-native.mjs
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "scripts/benchmark-results/template-v2-comparison");
mkdirSync(outDir, { recursive: true });

const runnerDir = mkdtempSync(join(tmpdir(), "wb-restaurant-tbdp-"));
const runnerPath = join(runnerDir, "runner.mts");
const runner = `
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { applyStructureTemplateToProject } from ${JSON.stringify(pathToFileURL(join(root, "lib/website/builder/apply-structure-template.ts")).href)};
import { prepareWebsiteProjectForExport } from ${JSON.stringify(pathToFileURL(join(root, "lib/website/prepare-export.ts")).href)};
import { loadTemplateV2Package } from ${JSON.stringify(pathToFileURL(join(root, "lib/website/template-v2/loader/load-v2-package.ts")).href)};
import { FOREST_TABLE_V2_TOKENS } from ${JSON.stringify(pathToFileURL(join(root, "lib/website/template-v2/tbdp/profiles/restaurant-signature/forest-table.ts")).href)};
import { resolveWbTemplatesRoot } from ${JSON.stringify(pathToFileURL(join(root, "lib/website/template-engine/constants.server.ts")).href)};
import type { GeneratedWebsiteProject } from ${JSON.stringify(pathToFileURL(join(root, "plugins/website/types.ts")).href)};

const baseProject = {
  projectKind: "website",
  title: "Maison Verdant",
  description: "Michelin-starred seasonal tasting menus",
  pages: ["home", "menu", "gallery", "reserve"],
  sections: [], colorPalette: [], typography: [], components: [], content: [], seo: [], roadmap: [],
  files: [
    { path: "app/page.tsx", content: "export default function Page(){return <main/>}", language: "tsx" },
    { path: "app/globals.css", content: ":root{--color-primary:#1B3D2F}", language: "css" },
    { path: "app/layout.tsx", content: "export default function Layout({children}:{children:React.ReactNode}){return <html lang='en'><body>{children}</body></html>}", language: "tsx" },
    { path: "app/menu/page.tsx", content: "export default function Menu(){return <main>Menu</main>}", language: "tsx" },
  ],
  settings: {},
} satisfies GeneratedWebsiteProject;

const report = { checks: [] as Array<{ id: string; ok: boolean; detail?: string }> };

function check(id: string, ok: boolean, detail?: string) {
  report.checks.push({ id, ok, detail });
}

const packageDir = join(resolveWbTemplatesRoot(), "restaurant-signature");
const loaded = await loadTemplateV2Package(packageDir);
check("load.tbdpNative", loaded.ok && Boolean(loaded.ok && loaded.bundle.tbdpNative?.enabled));
check(
  "load.sectorDna",
  loaded.ok && loaded.bundle.tbdpNative?.sectorDnaId === "restaurant",
);
check(
  "load.forestTable.primary",
  loaded.ok && loaded.bundle.tokens.colors.primary === FOREST_TABLE_V2_TOKENS.colors.primary,
);
check(
  "load.forestTable.copper",
  loaded.ok && loaded.bundle.tokens.colors.copper === FOREST_TABLE_V2_TOKENS.colors.copper,
);

const applied = await applyStructureTemplateToProject({
  project: baseProject,
  templatePackageId: "restaurant-signature",
  language: "English",
});

const page = applied.project.files?.find((f) => f.path === "app/page.tsx")?.content ?? "";
check("router.v2", (applied.project.settings as Record<string, unknown>)?.templateArchitectureVersion === "v2");
check("layout.sidebar", page.includes('data-v2-layout="sidebar-left"'));
check("component.hero", page.includes("RestaurantSignatureHero"));
check("component.sidebar", page.includes("RestaurantSignatureSidebarRail"));
check("no.theme.leak", !page.includes("ThemeBold") && !page.includes("ThemeEditorial") && !page.includes("ThemeCorporate"));
check("preserve.routes", Boolean(applied.project.files?.find((f) => f.path === "app/menu/page.tsx")));
check("component.files", (applied.project.files?.filter((f) => f.path.includes("restaurant-signature"))?.length ?? 0) >= 10);

const globals = applied.project.files?.find((f) => f.path === "app/globals.css")?.content ?? "";
check("tbdp.authority", globals.includes("TBDP Native Consumption"));
check("tbdp.native.flag", globals.includes("--tbdp-native: 1"));
check("tbdp.sector", globals.includes('--tbdp-sector-dna: "restaurant"'));
check("visual.primary", globals.includes("--color-primary: #1A3D32"));
check("visual.copper", globals.includes("--color-copper: #D4A574"));
check("visual.rs.utilities", globals.includes(".rs-headline"));
check(
  "tokens.language",
  globals.includes("Noto Sans Arabic") ||
    globals.includes('[dir="rtl"]') ||
    globals.includes("language profile"),
);

const exportReady = prepareWebsiteProjectForExport(applied.project.files ?? []);
check("export.shape", Array.isArray(exportReady.files) && exportReady.files.length > 0);
check("export.home", exportReady.files.some((f) => f.path === "app/page.tsx"));

const consumptionReport = {
  packageId: "restaurant-signature",
  tbdpNative: loaded.ok ? loaded.bundle.tbdpNative : null,
  tokenSnapshot: loaded.ok ? loaded.bundle.tokens.colors : null,
  motionPreset: loaded.ok ? loaded.bundle.motion.preset : null,
  responsiveContainer: loaded.ok ? loaded.bundle.responsive.containerMaxWidth : null,
  globalsMarkers: {
    tbdpAuthority: globals.includes("TBDP Native Consumption"),
    primaryColor: globals.includes("#1A3D32"),
    copperColor: globals.includes("#D4A574"),
  },
};

const outDir = ${JSON.stringify(outDir)};
writeFileSync(
  join(outDir, "restaurant-signature-tbdp-consumption.json"),
  JSON.stringify(consumptionReport, null, 2),
  "utf8",
);

const previewHtml = \`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Restaurant Signature TBDP Native Preview</title>
<style>\${globals}</style>
<script src="https://cdn.tailwindcss.com"></script>
</head>
<body style="margin:0;background:#0F1A14;color:#F6F1EA">
<div data-preview="restaurant-signature-tbdp" data-architecture="v2" data-tbdp-native="1">
<pre style="font:12px monospace;padding:12px;border-bottom:1px solid rgba(184,115,51,0.3)">Restaurant Signature · TBDP Native · Forest Table · sidebar-left</pre>
<div style="padding:16px;font-family:Georgia,serif">\${page.replace(/import[^;]+;/g, "").slice(0, 4000)}</div>
</div>
</body>
</html>\`;

writeFileSync(join(outDir, "restaurant-signature-tbdp-preview.html"), previewHtml, "utf8");

report.ok = report.checks.every((c) => c.ok);
console.log("__RESTAURANT_TBDP_QA__" + JSON.stringify(report));
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
const marker = output.indexOf("__RESTAURANT_TBDP_QA__");
if (marker >= 0) {
  const jsonRaw = output.slice(marker + "__RESTAURANT_TBDP_QA__".length).trim();
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
