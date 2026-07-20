import type { ImageDesignModel } from "@/lib/ai-core/image-design-platform/types";
import type { ImageOutput } from "@/plugins/image-generator/types";

export type ImageQualityReport = {
  valid: boolean;
  score: number;
  issues: string[];
  warnings: string[];
};

export function validateImageOutput(output: ImageOutput): ImageQualityReport {
  const issues: string[] = [];
  const warnings: string[] = [];

  if (!output.title) issues.push("Missing title");
  if (!output.concepts.length) issues.push("No concepts generated");
  if (!output.concepts.some((c) => c.svgConcept?.trim() || c.prompt?.trim())) {
    warnings.push("Concepts lack SVG or prompt content");
  }

  const score = Math.max(0, Math.min(100, 100 - issues.length * 25 - warnings.length * 5));
  return { valid: issues.length === 0, score, issues, warnings };
}

export function validateImageModel(model: ImageDesignModel): ImageQualityReport {
  const report = validateImageOutput({
    title: model.title,
    description: model.description,
    imageType: model.imageType,
    style: model.style,
    concepts: model.concepts,
    colorDirection: model.colorDirection,
    moodBoard: model.moodBoard,
    promptLibrary: model.promptLibrary,
    files: model.files,
  });

  if (!model.rasterAssets.length) {
    report.warnings.push("No raster images generated — provider may be unconfigured");
  } else if (!model.rasterAssets.some((a) => a.status === "completed")) {
    report.warnings.push("Raster generation used fallback assets");
  }

  return report;
}

export function applyQualityToModel(model: ImageDesignModel): ImageDesignModel {
  const report = validateImageModel(model);
  return {
    ...model,
    qualityScore: report.score,
    qualityIssues: [...report.issues, ...report.warnings],
  };
}
