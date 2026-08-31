/**
 * Ensure integrations component is in homeFlow for all flagship templates.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FLAGSHIP_SKIN_MANIFEST } from "./visual-skin-catalog-manifest.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

for (const skin of FLAGSHIP_SKIN_MANIFEST) {
  const presentationPath = path.join(
    root,
    "templates",
    "website",
    skin.packageId,
    "presentation",
    "presentation.json",
  );
  const raw = await readFile(presentationPath, "utf8");
  const json = JSON.parse(raw);
  const integrationsId = `${skin.packageId}-integrations`;
  const main = json.homeFlow?.regions?.main ?? [];
  if (!main.includes(integrationsId) && main.includes(`${skin.packageId}-features`)) {
    const featuresIdx = main.indexOf(`${skin.packageId}-features`);
    main.splice(featuresIdx + 1, 0, integrationsId);
    json.homeFlow.regions.main = main;
    await writeFile(presentationPath, `${JSON.stringify(json, null, 2)}\n`, "utf8");
    console.log(`updated ${skin.skinId}: added ${integrationsId}`);
  }
}
