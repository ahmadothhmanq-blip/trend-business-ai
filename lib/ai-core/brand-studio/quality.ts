/**
 * Brand identity quality validation.
 */

import type { BrandIdentityModel } from "@/lib/ai-core/brand-studio/types";
import type { BrandOutput } from "@/plugins/brand-identity/types";

export type BrandQualityReport = {
  valid: boolean;
  score: number;
  issues: string[];
  warnings: string[];
};

const REQUIRED_COLOR_ROLES = ["primary", "brand"];
const MIN_COLORS = 3;
const MIN_VALUES = 2;

export function validateBrandOutput(output: BrandOutput): BrandQualityReport {
  const issues: string[] = [];
  const warnings: string[] = [];

  if (!output.title?.trim()) issues.push("Missing brand name");
  if (!output.mission?.trim() && !output.vision?.trim()) {
    issues.push("Missing mission and vision");
  }
  if (!output.colorPalette?.length) issues.push("Missing color palette");
  else if (output.colorPalette.length < MIN_COLORS) {
    warnings.push(`Color palette has fewer than ${MIN_COLORS} colors`);
  }
  if (!output.values?.length) issues.push("Missing brand values");
  else if (output.values.length < MIN_VALUES) {
    warnings.push("Consider adding more core values");
  }
  if (!output.voiceTone?.tone) warnings.push("Voice tone not defined");
  if (!output.typography?.primary) warnings.push("Primary typography not defined");

  const hasPrimary = output.colorPalette?.some(
    (c) =>
      REQUIRED_COLOR_ROLES.some((r) => c.role.toLowerCase().includes(r)) ||
      c.name.toLowerCase().includes("primary"),
  );
  if (output.colorPalette?.length && !hasPrimary) {
    warnings.push("No explicit primary color role detected");
  }

  const score = computeScore(issues, warnings, output);
  return {
    valid: issues.length === 0,
    score,
    issues,
    warnings,
  };
}

export function validateBrandModel(model: BrandIdentityModel): BrandQualityReport {
  const output: BrandOutput = {
    title: model.brandName,
    description: model.description,
    brandType: model.brandType,
    mission: model.strategy.mission,
    vision: model.strategy.vision,
    values: model.strategy.values,
    voiceTone: model.voice,
    colorPalette: model.colors,
    typography: model.typography,
    logoGuidelines: model.logoDirection.guidelinesDocument,
    brandStory: "",
    brandStrategy: model.strategy.document,
    assets: model.assets,
    files: model.files,
  };
  const report = validateBrandOutput(output);
  if (!model.positioning.tagline && !model.voice.tagline) {
    report.warnings.push("Missing tagline");
  }
  if (!model.logoVariants.length && !model.logos.length) {
    report.warnings.push("No logo assets generated yet");
  }
  return report;
}

function computeScore(issues: string[], warnings: string[], output: BrandOutput): number {
  let score = 100;
  score -= issues.length * 20;
  score -= warnings.length * 5;
  if (output.brandStrategy) score += 5;
  if (output.brandStory) score += 5;
  if (output.logoGuidelines) score += 5;
  if (output.assets.length > 0) score += 5;
  return Math.max(0, Math.min(100, score));
}

export function applyQualityToModel(model: BrandIdentityModel): BrandIdentityModel {
  const report = validateBrandModel(model);
  return {
    ...model,
    qualityScore: report.score,
    qualityIssues: [...report.issues, ...report.warnings],
  };
}
