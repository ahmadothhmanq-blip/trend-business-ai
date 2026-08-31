/**
 * Scaffold on-disk V2 packages for visual skin catalog entries.
 * Usage: node scripts/scaffold-visual-skin-catalog.mjs
 */
import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FLAGSHIP_SKIN_MANIFEST } from "./visual-skin-catalog-manifest.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const websiteRoot = path.join(__dirname, "..", "templates", "website");

function kebabToTitle(id) {
  return id
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function transformContent(content, filePath, entry, sourceId, sourcePascal) {
  const { packageId, pascal, cssPrefix, oldPrefix, tbdpIdentity, sectorDnaId, templateIntelligenceId } =
    entry;
  let out = content;
  out = out.replaceAll(sourceId, packageId);
  out = out.replaceAll(sourcePascal, pascal);
  if (/\.(tsx|json|css)$/i.test(filePath)) {
    out = out.replaceAll(`${oldPrefix}-`, `${cssPrefix}-`);
    out = out.replaceAll(`@${oldPrefix}-`, `@${cssPrefix}-`);
    out = out.replaceAll(`data-${oldPrefix}-`, `data-${cssPrefix}-`);
  }
  if (filePath.endsWith("tokens/tokens.json")) {
    return JSON.stringify(
      {
        tbdpNative: true,
        sectorDnaId,
        experienceProfiles: ["luxury", "executive", "corporate"],
        templateIdentity: tbdpIdentity,
        consumptionVersion: "1.0.0",
      },
      null,
      2,
    );
  }
  if (filePath.endsWith("presentation/presentation.json")) {
    const parsed = JSON.parse(out);
    parsed.packageId = packageId;
    parsed.templateIntelligenceHint = templateIntelligenceId;
    parsed.navigation = { ...parsed.navigation, componentId: `${packageId}-nav` };
    parsed.hero = { ...parsed.hero, componentId: `${packageId}-hero` };
    parsed.footer = { ...parsed.footer, componentId: `${packageId}-footer` };
    parsed.sectionShell = { ...parsed.sectionShell, componentId: `${packageId}-section-shell` };
    parsed.aiGeneration = {
      contentProfile: `${packageId}-gtm`,
      suggestedPages: ["platform", "pricing", "customers"],
    };
    const remap = (id) => id.replace(sourceId, packageId);
    parsed.homeFlow.regions.main = parsed.homeFlow.regions.main.map(remap);
    parsed.homeFlow.regions.utility = parsed.homeFlow.regions.utility.map(remap);
    parsed.homeFlow.regions.overlay = parsed.homeFlow.regions.overlay.map(remap);
    return JSON.stringify(parsed, null, 2);
  }
  if (filePath.endsWith("manifest.json")) {
    const parsed = JSON.parse(out);
    parsed.id = packageId;
    parsed.name = entry.label.split(" — ")[0] ?? kebabToTitle(packageId);
    parsed.description = entry.description;
    parsed.metadata = {
      ...parsed.metadata,
      category: sectorDnaId,
      industry: kebabToTitle(sectorDnaId),
      templateIntelligenceId,
      tags: [sectorDnaId, "premium", "global", "flagship"],
    };
    return JSON.stringify(parsed, null, 2);
  }
  return out;
}

async function walkCopy(src, dest, rel, entry, sourceId, sourcePascal) {
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });
  for (const item of entries) {
    const srcPath = path.join(src, item.name);
    const relPath = path.join(rel, item.name);
    const destPath = path.join(dest, item.name);
    if (item.isDirectory()) {
      await walkCopy(srcPath, destPath, relPath, entry, sourceId, sourcePascal);
    } else if (/\.(tsx?|json|css|svg|md)$/i.test(item.name)) {
      const raw = await readFile(srcPath, "utf8");
      await writeFile(destPath, transformContent(raw, relPath.replace(/\\/g, "/"), entry, sourceId, sourcePascal), "utf8");
    } else {
      await cp(srcPath, destPath);
    }
  }
}

async function renameComponents(packageId, sourceId) {
  const dir = path.join(websiteRoot, packageId, "components");
  const files = await readdir(dir);
  for (const file of files) {
    if (!file.startsWith(`${sourceId}-`) && file !== `${packageId}-hero.tsx`) continue;
    const target = file.replace(`${sourceId}-`, `${packageId}-`);
    const src = path.join(dir, file);
    const dest = path.join(dir, target);
    if (target === `${packageId}-hero.tsx`) {
      continue;
    }
    if (file.startsWith(`${sourceId}-`)) {
      if (target !== file) {
        await cp(src, dest);
        const { unlink } = await import("node:fs/promises");
        await unlink(src);
      }
    }
  }
}

async function main() {
  for (const entry of FLAGSHIP_SKIN_MANIFEST) {
    if (!entry.scaffold) continue;
    const sourceId = entry.sourcePackage;
    const sourcePascal = entry.sourcePascal;
    const sourceDir = path.join(websiteRoot, sourceId);
    const targetDir = path.join(websiteRoot, entry.packageId);
    console.log(`Scaffolding ${entry.packageId} from ${sourceId}…`);
    await walkCopy(sourceDir, targetDir, "", entry, sourceId, sourcePascal);
    await renameComponents(entry.packageId, sourceId);
    console.log(`  ✓ ${entry.packageId}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
