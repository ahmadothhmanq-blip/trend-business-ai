/**
 * Creative Portfolio TBDP-native verification — consumption, visual parity, builder/export.
 * Usage: node scripts/qa-creative-portfolio-tbdp-native.mjs
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "scripts/benchmark-results/template-v2-comparison");
mkdirSync(outDir, { recursive: true });

const runnerDir = mkdtempSync(join(tmpdir(), "wb-creative-tbdp-"));
const runnerPath = join(runnerDir, "runner.mts");
const runner = `
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { applyStructureTemplateToProject } from ${JSON.stringify(pathToFileURL(join(root, "lib/website/builder/apply-structure-template.ts")).href)};
import { prepareWebsiteProjectForExport } from ${JSON.stringify(pathToFileURL(join(root, "lib/website/prepare-export.ts")).href)};
import { loadTemplateV2Package } from ${JSON.stringify(pathToFileURL(join(root, "lib/website/template-v2/loader/load-v2-package.ts")).href)};
import { KINETIC_ATELIER_V2_TOKENS } from ${JSON.stringify(pathToFileURL(join(root, "lib/website/template-v2/tbdp/profiles/creative-portfolio/kinetic-atelier.ts")).href)};
import { resolveWbTemplatesRoot } from ${JSON.stringify(pathToFileURL(join(root, "lib/website/template-engine/constants.server.ts")).href)};
import type { GeneratedWebsiteProject } from ${JSON.stringify(pathToFileURL(join(root, "plugins/website/types.ts")).href)};

const baseProject = {
  projectKind: "website",
  title: "Kinetic Atelier",
  description: "Elite creative studio",
  pages: ["home", "work", "studio", "contact"],
  sections: [], colorPalette: [], typography: [], components: [], content: [], seo: [], roadmap: [],
  files: [
    { path: "app/page.tsx", content: "export default function Page(){return <main/>}", language: "tsx" },
    { path: "app/globals.css", content: "@tailwind base;@tailwind components;@tailwind utilities;", language: "css" },
    { path: "app/layout.tsx", content: "export default function Layout({children}:{children:React.ReactNode}){return <html lang='en'><body>{children}</body></html>}", language: "tsx" },
    { path: "app/work/page.tsx", content: "export default function Work(){return <main>Work</main>}", language: "tsx" },
  ],
  settings: {},
} satisfies GeneratedWebsiteProject;

const report = { checks: [] as Array<{ id: string; ok: boolean; detail?: string }> };
function check(id: string, ok: boolean, detail?: string) {
  report.checks.push({ id, ok, detail });
}

const packageDir = join(resolveWbTemplatesRoot(), "creative-portfolio");
const loaded = await loadTemplateV2Package(packageDir);
check("load.tbdpNative", loaded.ok && Boolean(loaded.ok && loaded.bundle.tbdpNative?.enabled));
check("load.sectorDna", loaded.ok && loaded.bundle.tbdpNative?.sectorDnaId === "creative-studio");
check(
  "load.kineticAtelier.primary",
  loaded.ok && loaded.bundle.tokens.colors.primary === KINETIC_ATELIER_V2_TOKENS.colors.primary,
);
check(
  "load.kineticAtelier.volt",
  loaded.ok && loaded.bundle.tokens.colors.volt === KINETIC_ATELIER_V2_TOKENS.colors.volt,
);

const applied = await applyStructureTemplateToProject({
  project: baseProject,
  templatePackageId: "creative-portfolio",
  language: "English",
});

const page = applied.project.files?.find((f) => f.path === "app/page.tsx")?.content ?? "";
check("router.v2", (applied.project.settings as Record<string, unknown>)?.templateArchitectureVersion === "v2");
check("layout.editorial", page.includes('data-v2-layout="editorial-reveal"'));
check("component.hero", page.includes("CreativePortfolioHero"));
check("component.overlay", page.includes("CreativePortfolioOverlayShowcase"));
check("component.work", page.includes("CreativePortfolioSelectedWork"));
check("no.theme.leak", !page.includes("ThemeCreative") && !page.includes("ThemeMinimal") && !page.includes("ThemeLuxury"));
check("preserve.routes", Boolean(applied.project.files?.find((f) => f.path === "app/work/page.tsx")));
check("component.files", (applied.project.files?.filter((f) => f.path.includes("creative-portfolio"))?.length ?? 0) >= 10);

const globals = applied.project.files?.find((f) => f.path === "app/globals.css")?.content ?? "";
check("tbdp.authority", globals.includes("TBDP Native Consumption"));
check("tbdp.native.flag", globals.includes("--tbdp-native: 1"));
check("tbdp.sector", globals.includes('--tbdp-sector-dna: "creative-studio"'));
check("visual.primary", globals.includes("--color-primary: #09090B"));
check("visual.volt", globals.includes("--color-volt: #E8FF47"));
check("visual.cp.utilities", globals.includes(".cp-display"));
check(
  "tokens.language",
  globals.includes("Alexandria") ||
    globals.includes("Noto Sans Arabic") ||
    globals.includes('[dir="rtl"]'),
);

const exportReady = prepareWebsiteProjectForExport(applied.project.files ?? []);
check("export.shape", Array.isArray(exportReady.files) && exportReady.files.length > 0);
check("export.home", exportReady.files.some((f) => f.path === "app/page.tsx"));

const consumptionReport = {
  packageId: "creative-portfolio",
  tbdpNative: loaded.ok ? loaded.bundle.tbdpNative : null,
  tokenSnapshot: loaded.ok ? loaded.bundle.tokens.colors : null,
  motionPreset: loaded.ok ? loaded.bundle.motion.preset : null,
  responsiveContainer: loaded.ok ? loaded.bundle.responsive.containerMaxWidth : null,
  globalsMarkers: {
    tbdpAuthority: globals.includes("TBDP Native Consumption"),
    primaryColor: globals.includes("#09090B"),
    voltColor: globals.includes("#E8FF47"),
  },
};

const outDir = ${JSON.stringify(outDir)};
writeFileSync(
  join(outDir, "creative-portfolio-tbdp-consumption.json"),
  JSON.stringify(consumptionReport, null, 2),
  "utf8",
);

report.ok = report.checks.every((c) => c.ok);
console.log("__CREATIVE_TBDP_QA__" + JSON.stringify(report));
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
const marker = output.indexOf("__CREATIVE_TBDP_QA__");
if (marker >= 0) {
  const jsonRaw = output.slice(marker + "__CREATIVE_TBDP_QA__".length).trim();
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
