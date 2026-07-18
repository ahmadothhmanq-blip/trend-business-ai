/**
 * Auto Quality Engine — combine structure, design, SEO, and performance into one report.
 */

import type {
  CoreAssetManifest,
  CoreBusinessProfile,
  CoreDesignSystem,
  CoreProductStrategy,
  CoreQualityDimension,
  CoreQualityReport,
} from "@/lib/ai-core/layers/types";
import type { CorePerformanceReport } from "@/lib/ai-core/performance/types";
import type { CoreSeoPackage } from "@/lib/ai-core/seo/types";
import { checkSeoReadiness } from "@/lib/ai-core/seo/check";
import type { CoreAutoQualityReport } from "@/lib/ai-core/quality/types";

export type QualityCheckFile = {
  path: string;
  content: string;
};

export type BuildAutoQualityReportInput = {
  files?: QualityCheckFile[];
  strategy?: CoreProductStrategy;
  designSystem?: CoreDesignSystem;
  assetManifest?: CoreAssetManifest;
  profile?: CoreBusinessProfile;
  /** Existing product quality report (e.g. website heuristic check) */
  baseReport?: CoreQualityReport;
  seoPackage?: CoreSeoPackage;
  performanceReport?: CorePerformanceReport;
  improveApplied?: boolean;
  improveNotes?: string[];
};

function allContent(files: QualityCheckFile[]): string {
  return files.map((f) => f.content).join("\n");
}

function checkRequiredSections(params: {
  files: QualityCheckFile[];
  strategy?: CoreProductStrategy;
  profile?: CoreBusinessProfile;
}): CoreQualityDimension {
  const content = allContent(params.files).toLowerCase();
  const required = [
    ...(params.profile?.requiredSections ?? []),
    ...(params.strategy?.contentStructure ?? []),
  ].slice(0, 8);
  const issues: string[] = [];
  for (const section of required) {
    if (!section) continue;
    const needle = section.toLowerCase().slice(0, 12);
    if (needle && !content.includes(needle)) {
      issues.push(`Required section weakly covered: ${section}`);
    }
  }
  return {
    name: "structure",
    passed: issues.length === 0,
    issues,
  };
}

function checkDesignConsistency(params: {
  files: QualityCheckFile[];
  designSystem?: CoreDesignSystem;
}): CoreQualityDimension {
  const { files, designSystem } = params;
  const issues: string[] = [];
  if (!designSystem) {
    return { name: "brand", passed: true, issues: [] };
  }
  const content = allContent(files);
  const primary = designSystem.colors.primary;
  if (
    primary &&
    !content.includes(primary) &&
    !content.includes("--color-primary") &&
    !content.includes("primary")
  ) {
    issues.push("Primary design color token not detected in generated output");
  }
  if (
    designSystem.typography.headingFont &&
    !content.toLowerCase().includes(designSystem.typography.headingFont.toLowerCase().slice(0, 8)) &&
    !/font-|next\/font/i.test(content)
  ) {
    issues.push("Heading font from design system may not be applied");
  }
  if (designSystem.stylePreset && !content.toLowerCase().includes(designSystem.stylePreset)) {
    // Soft signal only — style preset rarely appears as a string
  }
  if (
    designSystem.spacingSystem?.unit &&
    !content.includes(designSystem.spacingSystem.unit) &&
    !/p-|m-|gap-|space-/i.test(content)
  ) {
    issues.push("Spacing system utilities not detected");
  }

  return {
    name: "brand",
    passed: issues.length <= 1,
    issues,
  };
}

function mergeDimensions(
  base: CoreQualityDimension[],
  extras: CoreQualityDimension[],
): CoreQualityDimension[] {
  const map = new Map<string, CoreQualityDimension>();
  for (const d of base) map.set(d.name, d);
  for (const d of extras) {
    const prev = map.get(d.name);
    if (!prev) {
      map.set(d.name, d);
      continue;
    }
    map.set(d.name, {
      name: d.name,
      passed: prev.passed && d.passed,
      issues: Array.from(new Set([...prev.issues, ...d.issues])),
    });
  }
  return Array.from(map.values()) as CoreQualityDimension[];
}

function dimensionScore(dimensions: CoreQualityDimension[]): number {
  if (!dimensions.length) return 100;
  const passed = dimensions.filter((d) => d.passed).length;
  return Math.round((passed / dimensions.length) * 100);
}

/**
 * Build Auto Quality Report before publish.
 * Validates sections, design consistency, SEO readiness, and performance score.
 */
export function buildAutoQualityReport(
  input: BuildAutoQualityReportInput,
): CoreAutoQualityReport {
  const files = input.files ?? [];
  const base = input.baseReport;
  const extras: CoreQualityDimension[] = [];

  if (files.length > 0) {
    extras.push(
      checkRequiredSections({
        files,
        strategy: input.strategy,
        profile: input.profile,
      }),
    );
    extras.push(
      checkDesignConsistency({
        files,
        designSystem: input.designSystem,
      }),
    );
  }

  if (input.seoPackage || files.length > 0) {
    const readiness =
      input.seoPackage?.readiness ??
      checkSeoReadiness({
        files,
        strategy: input.strategy,
        seoPackage: input.seoPackage,
      });
    extras.push({
      name: "seo",
      passed: readiness.passed,
      issues: readiness.issues,
    });
  }

  if (input.performanceReport) {
    extras.push({
      name: "performance",
      passed: input.performanceReport.passed,
      issues: input.performanceReport.issues.slice(0, 8),
    });
  }

  if (input.assetManifest) {
    const mediaIssues: string[] = [];
    const hero = input.assetManifest.items.find((a) => a.role === "hero");
    if (hero && !hero.url) {
      mediaIssues.push("Hero asset missing URL");
    }
    extras.push({
      name: "media",
      passed: mediaIssues.length === 0,
      issues: mediaIssues,
    });
  }

  const dimensions = mergeDimensions(base?.dimensions ?? [], extras);
  const issues = Array.from(
    new Set([
      ...(base?.issues ?? []),
      ...dimensions.flatMap((d) => d.issues),
    ]),
  );
  const weakSections = Array.from(
    new Set([
      ...(base?.weakSections ?? []),
      ...issues
        .filter((i) => i.toLowerCase().includes("section") || i.toLowerCase().includes("thin"))
        .slice(0, 8),
    ]),
  );

  const structureFailed = dimensions.some(
    (d) =>
      d.name === "structure" &&
      d.issues.some(
        (i) => i.startsWith("Missing app page") || i.startsWith("Missing layout"),
      ),
  );

  const seoScore =
    input.seoPackage?.readiness.score ??
    (dimensions.find((d) => d.name === "seo")?.passed ? 80 : 50);
  const performanceScore = input.performanceReport?.score;
  const designConsistencyPassed =
    dimensions.find((d) => d.name === "brand")?.passed ?? true;

  let score = dimensionScore(dimensions);
  if (typeof performanceScore === "number") {
    score = Math.round(score * 0.7 + performanceScore * 0.3);
  }
  if (typeof seoScore === "number" && input.seoPackage) {
    score = Math.round(score * 0.85 + seoScore * 0.15);
  }

  const publishReady =
    !structureFailed &&
    score >= 60 &&
    (base?.passed ?? true) &&
    (input.performanceReport ? input.performanceReport.score >= 55 : true) &&
    (input.seoPackage ? input.seoPackage.readiness.score >= 50 : true);

  return {
    passed: !structureFailed && (base?.passed ?? dimensions.every((d) => d.passed || d.name !== "structure")),
    dimensions,
    weakSections,
    improveApplied: input.improveApplied ?? base?.improveApplied ?? false,
    improveNotes: input.improveNotes ?? base?.improveNotes,
    issues,
    score,
    publishReady,
    seoReadinessScore: seoScore,
    performanceScore,
    designConsistencyPassed,
  };
}

/** Finalize quality after SEO + Performance layers for publish gate. */
export function finalizeQualityForPublish(params: {
  qualityReport: CoreQualityReport | CoreAutoQualityReport;
  seoPackage?: CoreSeoPackage;
  performanceReport?: CorePerformanceReport;
  files?: QualityCheckFile[];
  strategy?: CoreProductStrategy;
  designSystem?: CoreDesignSystem;
  assetManifest?: CoreAssetManifest;
  profile?: CoreBusinessProfile;
}): CoreAutoQualityReport {
  return buildAutoQualityReport({
    baseReport: params.qualityReport,
    seoPackage: params.seoPackage,
    performanceReport: params.performanceReport,
    files: params.files,
    strategy: params.strategy,
    designSystem: params.designSystem,
    assetManifest: params.assetManifest,
    profile: params.profile,
    improveApplied:
      "improveApplied" in params.qualityReport
        ? params.qualityReport.improveApplied
        : false,
    improveNotes:
      "improveNotes" in params.qualityReport
        ? params.qualityReport.improveNotes
        : undefined,
  });
}
