/**
 * Sync flagship V2 template structure packages to website-registry (marketplace install).
 * Copies manifest, layout, region, page, canvas, and preview assets — not component source.
 *
 * Run: node scripts/sync-flagship-registry.mjs
 * Check: node scripts/sync-flagship-registry.mjs --check
 */
import { cp, mkdir, readFile, readdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const websiteRoot = path.join(root, "templates", "website");
const registryRoot = path.join(root, "templates", "website-registry");
const checkOnly = process.argv.includes("--check");

const FLAGSHIPS = [
  "saas-enterprise",
  "corporate-business",
  "restaurant-premium",
  "ecommerce-premium",
  "medical-premium",
  "real-estate-premium",
  "creative-agency-premium",
  "education-premium",
  "finance-premium",
  "hotel-resort-premium",
  "ai-startup-signal",
];

const STRUCTURE_PATHS = [
  "manifest.json",
  "package.entry.json",
  "canvas.json",
  "placement-rules.json",
  "layouts",
  "regions",
  "pages",
  "assets",
];

async function checkPackage(packageId) {
  const src = path.join(websiteRoot, packageId);
  const dest = path.join(registryRoot, packageId);
  if (!existsSync(src) || !existsSync(dest)) {
    throw new Error(`registry paths missing for ${packageId}`);
  }
  for (const rel of STRUCTURE_PATHS) {
    const from = path.join(src, rel);
    const to = path.join(dest, rel);
    if (!existsSync(from)) {
      throw new Error(`source missing ${packageId}/${rel}`);
    }
    if (!existsSync(to)) {
      throw new Error(`registry out of sync: missing ${packageId}/${rel}`);
    }
    if (rel.endsWith(".json")) {
      const [a, b] = await Promise.all([readFile(from, "utf8"), readFile(to, "utf8")]);
      if (a !== b) {
        throw new Error(`registry out of sync: ${packageId}/${rel} differs`);
      }
    }
  }
  console.log(`ok ${packageId}`);
}

async function syncPackage(packageId) {
  const src = path.join(websiteRoot, packageId);
  const dest = path.join(registryRoot, packageId);
  await mkdir(dest, { recursive: true });

  for (const rel of STRUCTURE_PATHS) {
    const from = path.join(src, rel);
    const to = path.join(dest, rel);
    await cp(from, to, { recursive: true, force: true });
  }
  console.log(`synced ${packageId} -> website-registry`);
}

if (checkOnly) {
  let failed = false;
  for (const id of FLAGSHIPS) {
    try {
      await checkPackage(id);
    } catch (err) {
      failed = true;
      console.error(`FAIL ${id}: ${err.message}`);
    }
  }
  if (failed) process.exit(1);
  console.log("flagship registry check passed:", FLAGSHIPS.join(", "));
} else {
  for (const id of FLAGSHIPS) {
    await syncPackage(id);
  }

  const entries = await readdir(registryRoot, { withFileTypes: true });
  const allowed = new Set(FLAGSHIPS);
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith(".")) continue;
    if (!allowed.has(entry.name)) {
      await rm(path.join(registryRoot, entry.name), { recursive: true, force: true });
      console.log(`pruned legacy registry package: ${entry.name}`);
    }
  }

  console.log("flagship registry sync complete:", FLAGSHIPS.join(", "));
}
