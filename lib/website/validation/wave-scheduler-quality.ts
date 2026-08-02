/**
 * Quality comparison utilities for Wave Scheduler validation (read-only).
 */

import { validateGeneratedProject } from "@/lib/ai/validator";
import type { ProjectCapabilityFlags } from "@/lib/ai/validator";
import { validateWebsiteGeneration } from "@/lib/ai-core/website-builder/generation-validation";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { AssetManifest } from "@/plugins/website/types";

export type ValidationComparisonScope = "full" | "isolated-file-stage";

export type ProjectQualitySnapshot = {
  fileCount: number;
  filePaths: string[];
  sectionComponents: string[];
  layoutFiles: string[];
  pageFiles: string[];
  hasLayout: boolean;
  hasHomePage: boolean;
  hasGlobalsCss: boolean;
  seoMetaCount: number;
  validationPassed: boolean;
  validationIssueCount: number;
  validationIssues: string[];
  projectValidationPassed: boolean;
  projectValidationIssues: string[];
  /** Unique regression-relevant import fingerprints (see collectImportRegressionFingerprints). */
  brokenImportCount: number;
  importRegressionFingerprints: string[];
};

export type QualityComparisonResult = {
  promptId: string;
  fileCountMatch: boolean;
  filePathJaccard: number;
  structureScore: number;
  validationPassedMatch: boolean;
  projectValidationMatch: boolean;
  legacy: ProjectQualitySnapshot;
  wave: ProjectQualitySnapshot;
  regressions: string[];
  passed: boolean;
};

const DEFAULT_FLAGS: ProjectCapabilityFlags = {
  requiresAuth: false,
  requiresDatabase: false,
  requiresDashboard: false,
  isEcommerce: false,
  isSaas: false,
  databaseProvider: "none",
};

function countSeoMeta(files: GeneratedProjectFile[]): number {
  let count = 0;
  for (const file of files) {
    if (/metadata\s*[=:{]|title:\s*['"]|description:\s*['"]/i.test(file.content)) {
      count += 1;
    }
  }
  return count;
}

/** npm dep warnings are fixture noise when package.json is intentionally omitted. */
export function isNpmPackageImportIssue(issue: string): boolean {
  return /imports ".+" but package\.json is missing/.test(issue);
}

/** Fingerprints for unresolved project/relative imports only. */
export function importRegressionFingerprint(issue: string): string | null {
  if (issue.includes("missing project import")) return issue;
  if (issue.includes("missing relative import")) return issue;
  if (issue.includes("Unresolved import")) return issue;
  return null;
}

export function collectImportRegressionFingerprints(
  issues: string[],
  files: GeneratedProjectFile[],
  scope: ValidationComparisonScope = "full",
): Set<string> {
  const hasPackageJson = files.some((file) => file.path === "package.json");
  const fingerprints = new Set<string>();

  for (const issue of issues) {
    if (
      scope === "isolated-file-stage" &&
      !hasPackageJson &&
      isNpmPackageImportIssue(issue)
    ) {
      continue;
    }

    const fingerprint = importRegressionFingerprint(issue);
    if (fingerprint) {
      fingerprints.add(fingerprint);
    }
  }

  return fingerprints;
}

function brokenImportFingerprintCount(
  files: GeneratedProjectFile[],
  scope: ValidationComparisonScope,
): { count: number; fingerprints: string[] } {
  const projectValidation = validateGeneratedProject(files, DEFAULT_FLAGS);
  const fingerprints = collectImportRegressionFingerprints(
    projectValidation.issues,
    files,
    scope,
  );
  return {
    count: fingerprints.size,
    fingerprints: [...fingerprints].sort((a, b) => a.localeCompare(b)),
  };
}

export function snapshotProjectQuality(params: {
  files: GeneratedProjectFile[];
  prompt: string;
  language: string;
  assetManifest?: AssetManifest | null;
  expectedPages?: string[];
  scope?: ValidationComparisonScope;
}): ProjectQualitySnapshot {
  const files = params.files;
  const scope = params.scope ?? "full";
  const paths = files.map((file) => file.path).sort((a, b) => a.localeCompare(b));
  const validation = validateWebsiteGeneration({
    prompt: params.prompt,
    language: params.language,
    files,
    assetManifest: params.assetManifest ?? null,
    expectedPages: params.expectedPages,
  });
  const projectValidation = validateGeneratedProject(files, DEFAULT_FLAGS);
  const importFingerprints = brokenImportFingerprintCount(files, scope);

  return {
    fileCount: files.length,
    filePaths: paths,
    sectionComponents: paths.filter((path) =>
      path.startsWith("components/sections/"),
    ),
    layoutFiles: paths.filter((path) => path.includes("layout")),
    pageFiles: paths.filter((path) => path.includes("page.tsx")),
    hasLayout: paths.some((path) => path === "app/layout.tsx"),
    hasHomePage: paths.some((path) => path === "app/page.tsx"),
    hasGlobalsCss: paths.some((path) => path === "app/globals.css"),
    seoMetaCount: countSeoMeta(files),
    validationPassed: validation.passed,
    validationIssueCount: validation.issues.length,
    validationIssues: validation.issues.map((issue) => issue.message),
    projectValidationPassed: projectValidation.valid,
    projectValidationIssues: projectValidation.issues,
    brokenImportCount: importFingerprints.count,
    importRegressionFingerprints: importFingerprints.fingerprints,
  };
}

function jaccardSimilarity(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = [...setA].filter((value) => setB.has(value)).length;
  const union = new Set([...setA, ...setB]).size;
  if (union === 0) return 1;
  return intersection / union;
}

function computeStructureScore(
  legacy: ProjectQualitySnapshot,
  wave: ProjectQualitySnapshot,
): number {
  const checks = [
    legacy.hasLayout === wave.hasLayout,
    legacy.hasHomePage === wave.hasHomePage,
    legacy.hasGlobalsCss === wave.hasGlobalsCss,
    legacy.sectionComponents.length === wave.sectionComponents.length,
    legacy.pageFiles.length === wave.pageFiles.length,
    Math.abs(legacy.seoMetaCount - wave.seoMetaCount) <= 1,
  ];
  const passed = checks.filter(Boolean).length;
  return Math.round((passed / checks.length) * 100);
}

export function compareGenerationQuality(params: {
  promptId: string;
  prompt: string;
  language: string;
  legacyFiles: GeneratedProjectFile[];
  waveFiles: GeneratedProjectFile[];
  scope?: ValidationComparisonScope;
}): QualityComparisonResult {
  const scope = params.scope ?? "full";
  const legacy = snapshotProjectQuality({
    files: params.legacyFiles,
    prompt: params.prompt,
    language: params.language,
    scope,
  });
  const wave = snapshotProjectQuality({
    files: params.waveFiles,
    prompt: params.prompt,
    language: params.language,
    scope,
  });

  const regressions: string[] = [];

  if (!wave.projectValidationPassed && legacy.projectValidationPassed) {
    regressions.push("Wave mode project validation failed while legacy passed");
  }
  if (!wave.validationPassed && legacy.validationPassed) {
    regressions.push("Wave mode generation validation failed while legacy passed");
  }

  const legacyImportFps = new Set(legacy.importRegressionFingerprints);
  const netNewImportRegressions = wave.importRegressionFingerprints.filter(
    (fingerprint) => !legacyImportFps.has(fingerprint),
  );
  if (netNewImportRegressions.length > 0) {
    regressions.push(
      `Wave mode introduced import regressions: ${netNewImportRegressions.join("; ")}`,
    );
  }
  if (!wave.hasHomePage && legacy.hasHomePage) {
    regressions.push("Wave mode missing home page");
  }
  if (!wave.hasLayout && legacy.hasLayout) {
    regressions.push("Wave mode missing root layout");
  }
  if (wave.fileCount < legacy.fileCount * 0.85) {
    regressions.push(
      `Wave mode file count significantly lower (${wave.fileCount} vs ${legacy.fileCount})`,
    );
  }

  const filePathJaccard = jaccardSimilarity(legacy.filePaths, wave.filePaths);
  const structureScore = computeStructureScore(legacy, wave);

  const passed =
    regressions.length === 0 &&
    structureScore >= 80 &&
    filePathJaccard >= 0.75;

  return {
    promptId: params.promptId,
    fileCountMatch: legacy.fileCount === wave.fileCount,
    filePathJaccard: Math.round(filePathJaccard * 1000) / 1000,
    structureScore,
    validationPassedMatch: legacy.validationPassed === wave.validationPassed,
    projectValidationMatch:
      legacy.projectValidationPassed === wave.projectValidationPassed,
    legacy,
    wave,
    regressions,
    passed,
  };
}
