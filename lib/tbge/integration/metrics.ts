/**
 * TBGE integration metrics — time, LLM calls, output quality heuristics.
 */

import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { SiteComposition } from "@/lib/tbge/composer/types";
import type { WebsiteTbgeRouteMode } from "@/lib/tbge/integration/types";
import type { GenerationSpec } from "@/lib/tbge/spec/types";

export type ShadowComparisonMetrics = {
  legacyDurationMs: number;
  tbgeDurationMs: number;
  legacyFileCount: number;
  tbgeFileCount: number;
  tbgeLlmCalls: number;
  pathOverlapRatio: number;
  sharedPaths: string[];
  legacyOnlyPaths: string[];
  tbgeOnlyPaths: string[];
  legacyQualityScore: number;
  tbgeQualityScore: number;
  qualityDelta: number;
};

export type TbgeIntegrationMetrics = {
  route: WebsiteTbgeRouteMode;
  durationMs: number;
  llmCalls: number;
  fileCount: number;
  sectionCount?: number;
  qualityScore: number;
  shadow?: ShadowComparisonMetrics;
};

export function scoreOutputQuality(files: GeneratedProjectFile[]): number {
  if (!files.length) return 0;
  const nonEmpty = files.filter((file) => file.content.trim().length > 0).length;
  const pathScore = nonEmpty / files.length;
  const avgLength =
    files.reduce((sum, file) => sum + file.content.length, 0) / files.length;
  const lengthScore = Math.min(1, avgLength / 200);
  return Number(((pathScore * 0.7 + lengthScore * 0.3) * 100).toFixed(2));
}

export function compareFilePaths(
  legacyFiles: GeneratedProjectFile[],
  tbgeFiles: GeneratedProjectFile[],
): Pick<
  ShadowComparisonMetrics,
  "pathOverlapRatio" | "sharedPaths" | "legacyOnlyPaths" | "tbgeOnlyPaths"
> {
  const legacyPaths = new Set(legacyFiles.map((file) => file.path));
  const tbgePaths = new Set(tbgeFiles.map((file) => file.path));
  const sharedPaths = [...legacyPaths].filter((path) => tbgePaths.has(path));
  const legacyOnlyPaths = [...legacyPaths].filter((path) => !tbgePaths.has(path));
  const tbgeOnlyPaths = [...tbgePaths].filter((path) => !legacyPaths.has(path));
  const union = new Set([...legacyPaths, ...tbgePaths]);
  const pathOverlapRatio = union.size ? sharedPaths.length / union.size : 0;

  return {
    pathOverlapRatio: Number(pathOverlapRatio.toFixed(4)),
    sharedPaths,
    legacyOnlyPaths,
    tbgeOnlyPaths,
  };
}

export function buildTbgeMetrics(input: {
  route: WebsiteTbgeRouteMode;
  durationMs: number;
  llmCalls: number;
  files: GeneratedProjectFile[];
  composition?: SiteComposition;
  spec?: GenerationSpec;
  shadow?: ShadowComparisonMetrics;
}): TbgeIntegrationMetrics {
  const sectionCount =
    input.composition?.pages.reduce((sum, page) => sum + page.sections.length, 0) ??
    input.spec?.structure.pages.reduce((sum, page) => sum + page.sections.length, 0);

  return {
    route: input.route,
    durationMs: Number(input.durationMs.toFixed(2)),
    llmCalls: input.llmCalls,
    fileCount: input.files.length,
    sectionCount,
    qualityScore: scoreOutputQuality(input.files),
    shadow: input.shadow,
  };
}
