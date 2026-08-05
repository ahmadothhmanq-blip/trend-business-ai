/**
 * Compare live flagship QA reports and previews against the v1 golden baseline.
 * Usage: npx tsx scripts/website-builder-v1-golden-compare.mts
 */
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const qaRoot = join(root, "scripts", "benchmark-results", "flagship-qa");
const previewRoot = join(root, "scripts", "benchmark-results", "flagship-previews");
const goldenJsonPath = join(root, "lib", "website", "v1-baseline", "golden.json");

const MIN_MARKETPLACE = 95;
const MIN_VISUAL = 90;

function normalizePreviewHtml(html) {
  return html.replace(/completedAt[^,]+/g, "").replace(/\d{4}-\d{2}-\d{2}T[\d:.]+Z/g, "");
}

function hashPreviewHtml(html) {
  return createHash("sha256").update(normalizePreviewHtml(html)).digest("hex");
}

const golden = JSON.parse(readFileSync(goldenJsonPath, "utf8"));
const failures = [];

console.log(`Website Builder v1 golden compare (baseline ${golden.version})`);

for (const packageId of golden.flagships) {
  const qaPath = join(qaRoot, `${packageId}.json`);
  if (!existsSync(qaPath)) {
    failures.push({ packageId, field: "qaReport", expected: qaPath, actual: "missing" });
    console.log(`FAIL ${packageId} — QA report missing`);
    continue;
  }

  const report = JSON.parse(readFileSync(qaPath, "utf8"));
  const expected = golden.templates[packageId];
  let ok = true;

  if ((report.marketplaceScore ?? 0) < MIN_MARKETPLACE) {
    failures.push({ packageId, field: "marketplaceScore", expected: `>= ${MIN_MARKETPLACE}`, actual: report.marketplaceScore });
    ok = false;
  }
  if ((report.visual?.overall ?? 0) < MIN_VISUAL) {
    failures.push({ packageId, field: "visualOverall", expected: `>= ${MIN_VISUAL}`, actual: report.visual?.overall });
    ok = false;
  }
  if (report.preview?.hasHeroImage !== true) {
    failures.push({ packageId, field: "hasHeroImage", expected: true, actual: report.preview?.hasHeroImage });
    ok = false;
  }
  if (report.preview?.hasPlaceholder !== false) {
    failures.push({ packageId, field: "hasPlaceholder", expected: false, actual: report.preview?.hasPlaceholder });
    ok = false;
  }
  if (report.imageValidation?.passed === false) {
    failures.push({ packageId, field: "imageValidationPassed", expected: true, actual: false });
    ok = false;
  }
  if ((report.preview?.duplicateImages ?? 0) !== (expected.duplicateImages ?? 0)) {
    failures.push({ packageId, field: "duplicateImages", expected: expected.duplicateImages ?? 0, actual: report.preview?.duplicateImages ?? 0 });
    ok = false;
  }
  if ((report.visual?.responsiveLayout ?? 0) < MIN_VISUAL) {
    failures.push({ packageId, field: "responsiveLayout", expected: `>= ${MIN_VISUAL}`, actual: report.visual?.responsiveLayout });
    ok = false;
  }

  const previewPath = join(previewRoot, packageId, "preview.html");
  if (!existsSync(previewPath)) {
    failures.push({ packageId, field: "previewFile", expected: previewPath, actual: "missing" });
    ok = false;
  } else {
    const hash = hashPreviewHtml(readFileSync(previewPath, "utf8"));
    if (hash !== expected.previewSha256) {
      failures.push({ packageId, field: "previewSha256", expected: expected.previewSha256, actual: hash });
      ok = false;
    }
  }

  console.log(`${ok ? "PASS" : "FAIL"} ${packageId} — ${report.marketplaceScore ?? 0}/100`);
}

if (failures.length > 0) {
  console.error("\nGolden baseline failures:");
  for (const f of failures) {
    console.error(`  ${f.packageId}.${f.field}: expected ${JSON.stringify(f.expected)}, got ${JSON.stringify(f.actual)}`);
  }
  process.exit(1);
}

console.log("\nAll golden checks passed.");
process.exit(0);
