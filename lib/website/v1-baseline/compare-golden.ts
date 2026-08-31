import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  WEBSITE_BUILDER_V1_MIN_MARKETPLACE_SCORE,
  WEBSITE_BUILDER_V1_MIN_VISUAL_OVERALL,
  type FrozenFlagshipPackageId,
} from "./manifest";

export type GoldenTemplateSnapshot = {
  marketplaceScore: number;
  visualOverall: number;
  imageCount: number;
  sectionCount: number;
  hasHeroImage: boolean;
  hasPlaceholder: boolean;
  v2Package: boolean;
  v2Hero: boolean;
  v2Render: boolean;
  previewSha256: string;
  imageValidationPassed: boolean;
  duplicateImages: number;
};

export type GoldenBaseline = {
  version: string;
  frozenAt: string;
  minimumMarketplaceScore: number;
  minimumVisualOverall: number;
  flagships: FrozenFlagshipPackageId[];
  templates: Record<FrozenFlagshipPackageId, GoldenTemplateSnapshot>;
};

export type FlagshipQaReport = {
  packageId: string;
  marketplaceScore?: number;
  passed95?: boolean;
  visual?: { overall?: number; responsiveLayout?: number };
  preview?: {
    imageCount?: number;
    hasHeroImage?: boolean;
    hasPlaceholder?: boolean;
    sectionCount?: number;
    duplicateImages?: number;
  };
  imageValidation?: { passed?: boolean };
  v2Markers?: { package?: boolean; hero?: boolean; render?: boolean };
};

export type GoldenCompareFailure = {
  packageId: string;
  field: string;
  expected: unknown;
  actual: unknown;
};

export type GoldenCompareResult = {
  passed: boolean;
  failures: GoldenCompareFailure[];
};

const GOLDEN_PATH = join(import.meta.dirname, "golden.json");
const GOLDEN_PREVIEW_ROOT = join(import.meta.dirname, "golden", "previews");

/** Normalize preview HTML before hashing (strip volatile timestamps). */
export function normalizePreviewHtml(html: string): string {
  return html
    .replace(/completedAt[^,]+/g, "")
    .replace(/\d{4}-\d{2}-\d{2}T[\d:.]+Z/g, "");
}

export function hashPreviewHtml(html: string): string {
  return createHash("sha256").update(normalizePreviewHtml(html)).digest("hex");
}

export function loadGoldenBaseline(): GoldenBaseline {
  const raw = readFileSync(GOLDEN_PATH, "utf8");
  return JSON.parse(raw) as GoldenBaseline;
}

export function goldenPreviewPath(packageId: string): string {
  return join(GOLDEN_PREVIEW_ROOT, packageId, "preview.html");
}

export function compareQaReportToGolden(
  report: FlagshipQaReport,
  golden: GoldenBaseline = loadGoldenBaseline(),
): GoldenCompareResult {
  const failures: GoldenCompareFailure[] = [];
  const packageId = report.packageId as FrozenFlagshipPackageId;
  const expected = (golden.templates as Record<string, GoldenTemplateSnapshot>)[packageId];

  if (!expected) {
    failures.push({
      packageId,
      field: "packageId",
      expected: golden.flagships,
      actual: packageId,
    });
    return { passed: false, failures };
  }

  const checks: Array<{
    field: string;
    expected: unknown;
    actual: unknown;
  }> = [
    {
      field: "marketplaceScore",
      expected: `>= ${WEBSITE_BUILDER_V1_MIN_MARKETPLACE_SCORE}`,
      actual: report.marketplaceScore ?? 0,
    },
    {
      field: "visualOverall",
      expected: `>= ${WEBSITE_BUILDER_V1_MIN_VISUAL_OVERALL}`,
      actual: report.visual?.overall ?? 0,
    },
    {
      field: "hasHeroImage",
      expected: expected.hasHeroImage,
      actual: report.preview?.hasHeroImage ?? false,
    },
    {
      field: "hasPlaceholder",
      expected: expected.hasPlaceholder,
      actual: report.preview?.hasPlaceholder ?? true,
    },
    {
      field: "v2Package",
      expected: expected.v2Package,
      actual: report.v2Markers?.package ?? false,
    },
    {
      field: "v2Hero",
      expected: expected.v2Hero,
      actual: report.v2Markers?.hero ?? false,
    },
    {
      field: "v2Render",
      expected: expected.v2Render,
      actual: report.v2Markers?.render ?? false,
    },
    {
      field: "imageValidationPassed",
      expected: expected.imageValidationPassed,
      actual: report.imageValidation?.passed !== false,
    },
  ];

  for (const check of checks) {
    let ok = check.actual === check.expected;
    if (check.field === "marketplaceScore") {
      ok = (report.marketplaceScore ?? 0) >= WEBSITE_BUILDER_V1_MIN_MARKETPLACE_SCORE;
    }
    if (check.field === "visualOverall") {
      ok = (report.visual?.overall ?? 0) >= WEBSITE_BUILDER_V1_MIN_VISUAL_OVERALL;
    }
    if (!ok) {
      failures.push({
        packageId,
        field: check.field,
        expected: check.expected,
        actual: check.actual,
      });
    }
  }

  if ((report.preview?.duplicateImages ?? 0) !== (expected.duplicateImages ?? 0)) {
    failures.push({
      packageId,
      field: "duplicateImages",
      expected: expected.duplicateImages ?? 0,
      actual: report.preview?.duplicateImages ?? 0,
    });
  }

  if ((report.visual?.responsiveLayout ?? 0) < WEBSITE_BUILDER_V1_MIN_VISUAL_OVERALL) {
    failures.push({
      packageId,
      field: "responsiveLayout",
      expected: `>= ${WEBSITE_BUILDER_V1_MIN_VISUAL_OVERALL}`,
      actual: report.visual?.responsiveLayout ?? 0,
    });
  }

  return { passed: failures.length === 0, failures };
}

export function comparePreviewHtmlToGolden(
  packageId: string,
  html: string,
  golden: GoldenBaseline = loadGoldenBaseline(),
): GoldenCompareResult {
  const expected = (golden.templates as Record<string, GoldenTemplateSnapshot>)[packageId];
  if (!expected) {
    return {
      passed: false,
      failures: [
        {
          packageId,
          field: "packageId",
          expected: golden.flagships,
          actual: packageId,
        },
      ],
    };
  }

  const actualHash = hashPreviewHtml(html);
  if (actualHash !== expected.previewSha256) {
    return {
      passed: false,
      failures: [
        {
          packageId,
          field: "previewSha256",
          expected: expected.previewSha256,
          actual: actualHash,
        },
      ],
    };
  }

  return { passed: true, failures: [] };
}

export function compareAllGoldenPreviews(
  previewRoot: string,
  golden: GoldenBaseline = loadGoldenBaseline(),
): GoldenCompareResult {
  const failures: GoldenCompareFailure[] = [];

  for (const packageId of golden.flagships) {
    const livePath = join(previewRoot, packageId, "preview.html");
    if (!existsSync(livePath)) {
      failures.push({
        packageId,
        field: "previewFile",
        expected: livePath,
        actual: "missing",
      });
      continue;
    }

    const html = readFileSync(livePath, "utf8");
    const result = comparePreviewHtmlToGolden(packageId, html, golden);
    failures.push(...result.failures);
  }

  return { passed: failures.length === 0, failures };
}

export function formatGoldenFailures(failures: GoldenCompareFailure[]): string {
  return failures
    .map(
      (f) =>
        `  ${f.packageId}.${f.field}: expected ${JSON.stringify(f.expected)}, got ${JSON.stringify(f.actual)}`,
    )
    .join("\n");
}
