/**
 * Regenerate section-shell components for all flagship skins (fixes ${p} prefix bug).
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FLAGSHIP_SKIN_MANIFEST } from "./visual-skin-catalog-manifest.mjs";
import { SKIN_LAYOUT_DNA } from "./layout-dna.mjs";
import { generateSectionShell } from "./layout-generators/section-shell.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

for (const entry of FLAGSHIP_SKIN_MANIFEST) {
  const dna = SKIN_LAYOUT_DNA[entry.skinId];
  if (!dna?.sectionShell) continue;
  const dir = path.join(root, "templates", "website", entry.packageId, "components");
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, `${entry.packageId}-section-shell.tsx`);
  const content = generateSectionShell(entry, dna.sectionShell);
  await writeFile(file, content, "utf8");
  console.log(`${entry.skinId} → ${dna.sectionShell}`);
}
