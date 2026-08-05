/**
 * Transform copied template packages into corporate-business and restaurant-premium.
 * Run: node scripts/transform-flagship-templates.mjs
 */
import { readdir, readFile, writeFile, rename, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const TRANSFORMS = [
  {
    dir: "corporate-business",
    fromId: "saas-enterprise",
    toId: "corporate-business",
    fromPascal: "SaasEnterprise",
    toPascal: "CorporateBusiness",
    fromPrefix: "se-",
    toPrefix: "cb-",
    fromData: "se-",
    toData: "cb-",
    name: "Corporate Business",
    description:
      "Executive-grade corporate presence — trust-first hierarchy, boardroom typography, and conversion-optimized enterprise layouts.",
    category: "corporate",
    industry: "Corporate",
    tiId: "ti-corporate-trust",
    templateIdentity: "executive-atlas",
    sectorDnaId: "corporate",
    experienceProfiles: ["corporate", "executive", "trust"],
    motionPreset: "atlas-reveal",
  },
  {
    dir: "restaurant-premium",
    fromId: "restaurant-signature",
    toId: "restaurant-premium",
    fromPascal: "RestaurantSignature",
    toPascal: "RestaurantPremium",
    fromPrefix: "rs-",
    toPrefix: "rp-",
    fromData: "rs-",
    toData: "rp-",
    name: "Restaurant Premium",
    description:
      "World-class fine dining — cinematic hero, chef-led storytelling, reservations, and hospitality-grade conversion paths.",
    category: "restaurant",
    industry: "Restaurant",
    tiId: "ti-restaurant-dining",
    templateIdentity: "ember-table",
    sectorDnaId: "restaurant",
    experienceProfiles: ["hospitality", "luxury", "editorial"],
    motionPreset: "ember-table-reveal",
  },
];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

function applyReplacements(content, t) {
  return content
    .replaceAll(t.fromId, t.toId)
    .replaceAll(t.fromPascal, t.toPascal)
    .replaceAll(t.fromPrefix, t.toPrefix)
    .replaceAll(`data-v2-component="${t.fromData}`, `data-v2-component="${t.toData}`)
    .replaceAll(`"${t.name}"`, `"${t.name}"`);
}

async function transformPackage(t) {
  const pkgDir = path.join(root, "templates", "website", t.dir);
  const files = await walk(pkgDir);

  for (const file of files) {
    let content = await readFile(file, "utf8");
    content = applyReplacements(content, t);

    if (file.endsWith("manifest.json")) {
      const manifest = JSON.parse(content);
      manifest.id = t.toId;
      manifest.name = t.name;
      manifest.description = t.description;
      manifest.metadata.category = t.category;
      manifest.metadata.industry = t.industry;
      manifest.metadata.templateIntelligenceId = t.tiId;
      content = JSON.stringify(manifest, null, 2) + "\n";
    }

    if (file.endsWith("tokens.json")) {
      const tokens = JSON.parse(content);
      tokens.templateIdentity = t.templateIdentity;
      tokens.sectorDnaId = t.sectorDnaId;
      tokens.experienceProfiles = t.experienceProfiles;
      content = JSON.stringify(tokens, null, 2) + "\n";
    }

    if (file.endsWith("motion.json")) {
      const motion = JSON.parse(content);
      if (motion.presetBinding) motion.presetBinding = t.motionPreset;
      content = JSON.stringify(motion, null, 2) + "\n";
    }

    const newName = path.basename(file).replaceAll(t.fromId, t.toId);
    const newPath = path.join(path.dirname(file), newName);
    if (newPath !== file) {
      await writeFile(newPath, content, "utf8");
      await unlink(file);
    } else {
      await writeFile(file, content, "utf8");
    }
  }

  console.log(`Transformed ${t.dir}`);
}

for (const t of TRANSFORMS) {
  await transformPackage(t);
}

console.log("Done.");
