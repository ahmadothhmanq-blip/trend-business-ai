/**
 * Verify all 20 visual skins apply as V2 flagship packages.
 * Usage: node scripts/verify-all-visual-skins.mjs
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { FLAGSHIP_SKIN_MANIFEST } from "./visual-skin-catalog-manifest.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const runnerDir = mkdtempSync(join(tmpdir(), "wb-verify-skins-"));
const runnerPath = join(runnerDir, "runner.mts");

const runner = `
import { applyVisualSkinFullRetheme } from ${JSON.stringify(pathToFileURL(join(root, "lib/website/visual-skin/retheme.ts")).href)};
import { resolveVisualSkinV2PackageId } from ${JSON.stringify(pathToFileURL(join(root, "lib/website/visual-skin/theme-bridge.ts")).href)};
import { applyTemplateV2ToProject } from ${JSON.stringify(pathToFileURL(join(root, "lib/website/template-v2/apply/apply-v2-template.ts")).href)};

const skins = ${JSON.stringify(FLAGSHIP_SKIN_MANIFEST.map((s) => s.skinId))};

const baseProject = {
  projectKind: "website",
  title: "Verify Co",
  description: "Skin verification",
  pages: [],
  sections: [],
  colorPalette: [],
  typography: [],
  components: [],
  content: [],
  seo: [],
  roadmap: [],
  files: [
    { path: "app/page.tsx", content: "export default function Page(){return null}", language: "tsx" },
    { path: "app/globals.css", content: ":root{}", language: "css" },
    { path: "lib/site-images.ts", content: "export const HERO_IMAGE = null;", language: "typescript" },
  ],
  businessProfile: { projectName: "Verify Co", industry: "general" },
  settings: { templateIntelligenceId: "ti-corporate-trust" },
};

const results = [];
for (const skinId of skins) {
  const packageId = resolveVisualSkinV2PackageId(skinId);
  let error = "";
  try {
    const { project } = await applyVisualSkinFullRetheme(baseProject, skinId, "English");
    const applied = await applyTemplateV2ToProject({
      project,
      templatePackageId: packageId!,
      language: "English",
      directPackageId: true,
    });
    const page = applied.project.files?.find((f) => f.path === "app/page.tsx")?.content ?? "";
    if (!page.includes(\`data-v2-package="\${packageId}"\`)) {
      error = "missing data-v2-package marker";
    }
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }
  results.push({ skinId, packageId, ok: !error, error: error || null });
}

const failed = results.filter((r) => !r.ok);
console.log("__VERIFY_SKINS__" + JSON.stringify({ total: results.length, passed: results.length - failed.length, failed }, null, 2));
if (failed.length) process.exit(1);
`;

writeFileSync(runnerPath, runner, "utf8");
const result = spawnSync(`npx --yes tsx "${runnerPath.replaceAll('"', '\\"')}"`, {
  cwd: root,
  encoding: "utf8",
  shell: true,
});
const output = (result.stdout || "") + (result.stderr || "");
const marker = output.indexOf("__VERIFY_SKINS__");
if (marker >= 0) {
  console.log(output.slice(marker + "__VERIFY_SKINS__".length).trim());
  process.exit(result.status ?? 0);
}
console.log(output);
process.exit(result.status ?? 1);
