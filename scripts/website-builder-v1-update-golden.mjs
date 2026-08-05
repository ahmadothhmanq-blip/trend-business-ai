/**
 * Update v1 golden baseline from current flagship QA + preview outputs.
 * Use only after intentional, approved visual or QA changes.
 * Usage: node scripts/website-builder-v1-update-golden.mjs
 */
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const qaRoot = join(root, "scripts", "benchmark-results", "flagship-qa");
const previewRoot = join(root, "scripts", "benchmark-results", "flagship-previews");
const goldenPreviewRoot = join(root, "lib", "website", "v1-baseline", "golden", "previews");
const goldenJsonPath = join(root, "lib", "website", "v1-baseline", "golden.json");

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
];

function normalizePreviewHtml(html) {
  return html.replace(/completedAt[^,]+/g, "").replace(/\d{4}-\d{2}-\d{2}T[\d:.]+Z/g, "");
}

function hashPreviewHtml(html) {
  return createHash("sha256").update(normalizePreviewHtml(html)).digest("hex");
}

const golden = JSON.parse(readFileSync(goldenJsonPath, "utf8"));
const templates = {};

for (const packageId of FLAGSHIPS) {
  const qaPath = join(qaRoot, `${packageId}.json`);
  const previewPath = join(previewRoot, packageId, "preview.html");
  if (!existsSync(qaPath) || !existsSync(previewPath)) {
    console.error(`Missing QA or preview for ${packageId}. Run flagship QA first.`);
    process.exit(1);
  }

  const report = JSON.parse(readFileSync(qaPath, "utf8"));
  const html = readFileSync(previewPath, "utf8");
  const destDir = join(goldenPreviewRoot, packageId);
  mkdirSync(destDir, { recursive: true });
  copyFileSync(previewPath, join(destDir, "preview.html"));

  templates[packageId] = {
    marketplaceScore: report.marketplaceScore ?? 0,
    visualOverall: report.visual?.overall ?? 0,
    imageCount: report.preview?.imageCount ?? 0,
    sectionCount: report.preview?.sectionCount ?? 0,
    hasHeroImage: report.preview?.hasHeroImage === true,
    hasPlaceholder: report.preview?.hasPlaceholder === false ? false : true,
    v2Package: report.v2Markers?.package === true,
    v2Hero: report.v2Markers?.hero === true,
    v2Render: report.v2Markers?.render === true,
    previewSha256: hashPreviewHtml(html),
    imageValidationPassed: report.imageValidation?.passed !== false,
    duplicateImages: report.preview?.duplicateImages ?? 0,
  };

  console.log(`Updated golden: ${packageId} (${report.marketplaceScore}/100)`);
}

const updated = {
  version: golden.version,
  frozenAt: golden.frozenAt,
  minimumMarketplaceScore: golden.minimumMarketplaceScore,
  minimumVisualOverall: golden.minimumVisualOverall,
  flagships: FLAGSHIPS,
  templates,
};

writeFileSync(goldenJsonPath, JSON.stringify(updated, null, 2) + "\n", "utf8");
console.log(`\nWrote ${goldenJsonPath}`);
console.log("Bump WEBSITE_BUILDER_V1_VERSION in manifest.ts if this is a major baseline change.");
