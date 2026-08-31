/**
 * Apply abstract template brand names to manifests and generated catalogs.
 * Run: node scripts/sync-template-brand-names.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TEMPLATE_BRAND_NAMES } from "./template-brand-names.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

async function patchManifest(manifestPath, brand) {
  const raw = await readFile(manifestPath, "utf8");
  const manifest = JSON.parse(raw);
  const previous = manifest.name;
  manifest.name = brand.name;
  manifest.metadata ??= {};
  manifest.metadata.localizedNames = {
    ...(manifest.metadata.localizedNames ?? {}),
    ar: brand.nameAr,
  };

  if (Array.isArray(manifest.regions)) {
    for (const region of manifest.regions) {
      if (region.description?.includes(previous)) {
        region.description = region.description.replaceAll(previous, brand.name);
      }
    }
  }
  if (Array.isArray(manifest.layouts)) {
    for (const layout of manifest.layouts) {
      if (layout.description?.includes(previous)) {
        layout.description = layout.description.replaceAll(previous, brand.name);
      }
    }
  }

  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

async function patchRemoteCatalog() {
  const catalogPath = path.join(
    root,
    "lib/website/template-marketplace/premium-remote-catalog.generated.ts",
  );
  let content = await readFile(catalogPath, "utf8");
  for (const [id, brand] of Object.entries(TEMPLATE_BRAND_NAMES)) {
    const blockRe = new RegExp(
      `(\\{\\s*"id":\\s*"${id}"[\\s\\S]*?"name":\\s*)"[^"]*"`,
      "m",
    );
    if (!blockRe.test(content)) {
      console.warn(`⚠ No remote catalog entry for ${id}`);
      continue;
    }
    content = content.replace(blockRe, `$1"${brand.name}"`);

    const localizedRe = new RegExp(
      `(\\{\\s*"id":\\s*"${id}"[\\s\\S]*?"metadata":\\s*\\{[\\s\\S]*?)(\\n\\s*\\},\\s*\\n\\s*"remote")`,
      "m",
    );
    if (localizedRe.test(content) && !content.includes(`"id": "${id}"`)) {
      continue;
    }
    content = content.replace(localizedRe, (match, prefix, suffix) => {
      if (prefix.includes('"localizedNames"')) {
        return match.replace(
          /"localizedNames":\s*\{[^}]*\}/,
          `"localizedNames": { "ar": "${brand.nameAr}" }`,
        );
      }
      return `${prefix},\n      "localizedNames": { "ar": "${brand.nameAr}" }${suffix}`;
    });
  }
  await writeFile(catalogPath, content);
}

async function patchPremiumIndustryExtensions() {
  const filePath = path.join(
    root,
    "lib/ai-core/template-intelligence/premium-industry-extensions.ts",
  );
  let content = await readFile(filePath, "utf8");
  for (const [id, brand] of Object.entries(TEMPLATE_BRAND_NAMES)) {
    if (!id.startsWith("ti-")) continue;
    const blockRe = new RegExp(
      `(id:\\s*"${id}"[\\s\\S]*?name:\\s*)"[^"]*"`,
      "m",
    );
    if (!blockRe.test(content)) continue;
    content = content.replace(blockRe, `$1"${brand.name}"`);
  }
  await writeFile(filePath, content);
}

async function patchTemplateIntelligenceCatalog() {
  const catalogPath = path.join(
    root,
    "lib/ai-core/template-intelligence/catalog.ts",
  );
  let content = await readFile(catalogPath, "utf8");
  for (const [id, brand] of Object.entries(TEMPLATE_BRAND_NAMES)) {
    if (!id.startsWith("ti-")) continue;
    const blockRe = new RegExp(
      `(id:\\s*"${id}"[\\s\\S]*?name:\\s*)"[^"]*"`,
      "m",
    );
    if (!blockRe.test(content)) {
      console.warn(`⚠ No TI catalog entry for ${id}`);
      continue;
    }
    content = content.replace(blockRe, `$1"${brand.name}"`);
  }
  await writeFile(catalogPath, content);
}

async function main() {
  for (const [id, brand] of Object.entries(TEMPLATE_BRAND_NAMES)) {
    const websiteManifest = path.join(root, "templates/website", id, "manifest.json");
    const registryManifest = path.join(
      root,
      "templates/website-registry",
      id,
      "manifest.json",
    );
    try {
      await patchManifest(websiteManifest, brand);
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
        // V1-only / alias packages have no on-disk manifest.
      } else {
        throw error;
      }
    }
    try {
      await patchManifest(registryManifest, brand);
    } catch (error) {
      if (!(error && typeof error === "object" && "code" in error && error.code === "ENOENT")) {
        throw error;
      }
    }
    console.log(`✓ ${id} → ${brand.name}`);
  }

  await patchRemoteCatalog();
  console.log("✓ Updated premium-remote-catalog.generated.ts");
  await patchTemplateIntelligenceCatalog();
  console.log("✓ Updated template-intelligence catalog.ts");
  await patchPremiumIndustryExtensions();
  console.log("✓ Updated premium-industry-extensions.ts");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
