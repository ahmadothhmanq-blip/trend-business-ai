/**
 * Work on one visual skin / template package at a time.
 *
 * Usage:
 *   node scripts/skin-workflow.mjs list
 *   node scripts/skin-workflow.mjs info signal
 *   node scripts/skin-workflow.mjs regenerate volt
 *   node scripts/skin-workflow.mjs verify ledger
 *   node scripts/skin-workflow.mjs preview atlas [--open]
 *   node scripts/skin-workflow.mjs path pulse
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { FLAGSHIP_SKIN_MANIFEST } from "./visual-skin-catalog-manifest.mjs";
import { SKIN_LAYOUT_DNA } from "./layout-dna.mjs";
import { resolveHarnessBaseUrl } from "./lib/dev-base-url.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const websiteRoot = path.join(root, "templates", "website");
const previewOutDir = path.join(root, "scripts", "benchmark-results", "skin-previews");

const LEGACY_ALIASES = { sovereign: "signal", prestige: "volt" };

function resolveSkinId(input) {
  const key = String(input ?? "").trim().toLowerCase();
  if (!key) return null;
  const alias = LEGACY_ALIASES[key];
  if (alias) return alias;
  const found = FLAGSHIP_SKIN_MANIFEST.find((s) => s.skinId === key);
  return found?.skinId ?? null;
}

function getEntry(skinId) {
  return FLAGSHIP_SKIN_MANIFEST.find((s) => s.skinId === skinId) ?? null;
}

function packageDir(entry) {
  return path.join(websiteRoot, entry.packageId);
}

function componentsDir(entry) {
  return path.join(packageDir(entry), "components");
}

function countComponents(entry) {
  try {
    return readdirSync(componentsDir(entry)).filter((f) => f.endsWith(".tsx")).length;
  } catch {
    return 0;
  }
}

function printList() {
  console.log("\nVisual skins — work one at a time:\n");
  console.log("SKIN ID      LABEL              PACKAGE");
  console.log("────────     ────────────────   ─────────────────────────");
  for (const entry of FLAGSHIP_SKIN_MANIFEST) {
    const label = entry.label.split(" — ")[0]?.padEnd(16) ?? entry.skinId.padEnd(16);
    console.log(`${entry.skinId.padEnd(12)} ${label}  ${entry.packageId}`);
  }
  console.log("\nExamples:");
  console.log("  node scripts/skin-workflow.mjs info signal");
  console.log("  node scripts/skin-workflow.mjs preview volt --open");
  console.log("  node scripts/skin-workflow.mjs regenerate pulse");
  console.log("  npm run skin:preview -- citadel --open\n");
}

function printInfo(skinId) {
  const entry = getEntry(skinId);
  if (!entry) {
    console.error(`Unknown skin: ${skinId}`);
    process.exit(1);
  }
  const dna = SKIN_LAYOUT_DNA[skinId];
  const dir = packageDir(entry);
  const comps = countComponents(entry);

  console.log(JSON.stringify({
    skinId: entry.skinId,
    label: entry.label,
    packageId: entry.packageId,
    pascal: entry.pascal,
    cssPrefix: entry.cssPrefix,
    tbdpIdentity: entry.tbdpIdentity,
    paths: {
      package: dir,
      components: componentsDir(entry),
      manifest: path.join(dir, "manifest.json"),
      presentation: path.join(dir, "presentation", "presentation.json"),
    },
    componentCount: comps,
    layoutDna: dna ?? null,
    hero: entry.hero,
  }, null, 2));
}

async function runRegenerate(skinId) {
  const { regenerateSkin } = await import("./write-distinct-template-layouts.mjs");
  await regenerateSkin(skinId);
}

function runVerify(skinId) {
  const runnerPath = path.join(tmpdir(), `skin-verify-${skinId}.mts`);
  const runner = `
import { applyVisualSkinFullRetheme } from ${JSON.stringify(pathToFileURL(path.join(root, "lib/website/visual-skin/retheme.ts")).href)};
import { resolveVisualSkinV2PackageId } from ${JSON.stringify(pathToFileURL(path.join(root, "lib/website/visual-skin/theme-bridge.ts")).href)};
import { applyTemplateV2ToProject } from ${JSON.stringify(pathToFileURL(path.join(root, "lib/website/template-v2/apply/apply-v2-template.ts")).href)};

const skinId = ${JSON.stringify(skinId)};
const packageId = resolveVisualSkinV2PackageId(skinId);
const baseProject = {
  projectKind: "website",
  title: "Skin Verify",
  description: "Single skin verification",
  pages: [], sections: [], colorPalette: [], typography: [], components: [], content: [], seo: [], roadmap: [],
  files: [
    { path: "app/page.tsx", content: "export default function Page(){return null}", language: "tsx" },
    { path: "app/globals.css", content: ":root{}", language: "css" },
    { path: "lib/site-images.ts", content: "export const HERO_IMAGE = null;", language: "typescript" },
  ],
  businessProfile: { projectName: "Verify", industry: "general" },
  settings: { templateIntelligenceId: "ti-corporate-trust" },
};

try {
  const { project } = await applyVisualSkinFullRetheme(baseProject, skinId, "English");
  const applied = await applyTemplateV2ToProject({ project, templatePackageId: packageId!, language: "English", directPackageId: true });
  const page = applied.project.files?.find((f) => f.path === "app/page.tsx")?.content ?? "";
  if (!page.includes(\`data-v2-package="\${packageId}"\`)) throw new Error("missing data-v2-package marker");
  console.log("__SKIN_VERIFY_OK__" + JSON.stringify({ skinId, packageId, ok: true }));
} catch (e) {
  console.log("__SKIN_VERIFY_OK__" + JSON.stringify({ skinId, packageId, ok: false, error: e instanceof Error ? e.message : String(e) }));
  process.exit(1);
}
`;
  writeFileSync(runnerPath, runner, "utf8");
  const result = spawnSync(`npx --yes tsx "${runnerPath.replaceAll('"', '\\"')}"`, {
    cwd: root,
    encoding: "utf8",
    shell: true,
  });
  const output = (result.stdout || "") + (result.stderr || "");
  const marker = output.indexOf("__SKIN_VERIFY_OK__");
  if (marker >= 0) {
    console.log(output.slice(marker + "__SKIN_VERIFY_OK__".length).trim().split(/\r?\n/)[0] ?? "");
    process.exit(result.status ?? 0);
  }
  console.error(output || "Verify failed");
  process.exit(result.status ?? 1);
}

function runPreview(skinId, openBrowser) {
  const entry = getEntry(skinId);
  if (!entry) {
    console.error(`Unknown skin: ${skinId}`);
    process.exit(1);
  }

  mkdirSync(previewOutDir, { recursive: true });
  const runnerPath = path.join(tmpdir(), `skin-preview-${skinId}.mts`);
  const outFile = path.join(previewOutDir, `${entry.packageId}-preview.html`);

  const runner = `
import { writeFileSync } from "node:fs";
import { applyStructureTemplateToProject } from ${JSON.stringify(pathToFileURL(path.join(root, "lib/website/builder/apply-structure-template.ts")).href)};
import { buildStaticPreviewHtml } from ${JSON.stringify(pathToFileURL(path.join(root, "lib/website/build-static-preview.server.ts")).href)};

const packageId = ${JSON.stringify(entry.packageId)};
const heroId = ${JSON.stringify(`${entry.packageId}-hero`)};

const baseProject = {
  projectKind: "website",
  title: ${JSON.stringify(entry.label.split(" — ")[0] ?? entry.skinId)},
  description: "Single skin preview",
  pages: ["home"],
  sections: [], colorPalette: [], typography: [], components: [], content: [], seo: [], roadmap: [],
  files: [
    { path: "app/page.tsx", content: "export default function Page(){return <main/>}", language: "tsx" },
    { path: "app/globals.css", content: "@tailwind base;@tailwind components;@tailwind utilities;", language: "css" },
    { path: "app/layout.tsx", content: "export default function Layout({children}:{children:React.ReactNode}){return <html lang='en'><body>{children}</body></html>}", language: "tsx" },
  ],
  settings: {},
};

const applied = await applyStructureTemplateToProject({ project: baseProject, templatePackageId: packageId, language: "English" });
const settings = applied.project.settings as Record<string, unknown>;
const previewHtml = buildStaticPreviewHtml({
  title: applied.project.title,
  description: applied.project.description,
  pages: applied.project.pages,
  components: applied.project.components,
  files: applied.project.files,
  templateArchitectureVersion: settings.templateArchitectureVersion,
  templatePackageId: settings.templatePackageId,
  settings,
  language: "English",
});

writeFileSync(${JSON.stringify(outFile)}, previewHtml, "utf8");
console.log("__SKIN_PREVIEW__" + JSON.stringify({
  skinId: ${JSON.stringify(skinId)},
  packageId,
  heroId,
  bytes: previewHtml.length,
  hasHero: previewHtml.includes(\`data-v2-component="\${heroId}"\`),
  file: ${JSON.stringify(outFile)},
}));
`;

  writeFileSync(runnerPath, runner, "utf8");
  const result = spawnSync(`npx --yes tsx "${runnerPath.replaceAll('"', '\\"')}"`, {
    cwd: root,
    encoding: "utf8",
    shell: true,
  });
  const output = (result.stdout || "") + (result.stderr || "");
  const marker = output.indexOf("__SKIN_PREVIEW__");
  if (marker < 0) {
    console.error(output || "Preview failed");
    process.exit(result.status ?? 1);
  }

  const raw = output.slice(marker + "__SKIN_PREVIEW__".length).trim();
  const jsonLine = raw.split(/\r?\n/)[0] ?? raw;
  const info = JSON.parse(jsonLine);
  const devPreviewUrl = `${resolveHarnessBaseUrl()}/api/dev/skin-preview?skin=${encodeURIComponent(skinId)}`;
  console.log(JSON.stringify({ ...info, devPreviewUrl }, null, 2));

  if (openBrowser) {
    const openTarget = devPreviewUrl || info.file;
    if (!openTarget) return;
    const openCmd = process.platform === "win32"
      ? `start "" "${openTarget}"`
      : process.platform === "darwin"
        ? `open "${openTarget}"`
        : `xdg-open "${openTarget}"`;
    spawnSync(openCmd, { shell: true, stdio: "ignore" });
  }

  process.exit(result.status ?? 0);
}

function printPath(skinId) {
  const entry = getEntry(skinId);
  if (!entry) {
    console.error(`Unknown skin: ${skinId}`);
    process.exit(1);
  }
  console.log(packageDir(entry));
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] ?? "list";
  const skinArg = args[1];
  const openFlag = args.includes("--open");

  if (command === "list") {
    printList();
    return;
  }

  const skinId = resolveSkinId(skinArg);
  if (!skinId) {
    console.error(`Usage: node scripts/skin-workflow.mjs <command> <skinId>\n`);
    printList();
    process.exit(1);
  }

  switch (command) {
    case "info":
      printInfo(skinId);
      break;
    case "regenerate":
    case "gen":
      await runRegenerate(skinId);
      break;
    case "verify":
      runVerify(skinId);
      break;
    case "preview":
      runPreview(skinId, openFlag);
      break;
    case "path":
    case "dir":
      printPath(skinId);
      break;
    default:
      console.error(`Unknown command: ${command}\n`);
      printList();
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
