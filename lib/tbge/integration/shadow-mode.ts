/**
 * TBGE shadow mode — run legacy + TBGE in parallel, compare metrics.
 */

import { emptyTokenUsage } from "@/lib/ai/usage";
import type { AIProviderName } from "@/lib/ai/types";
import {
  buildTbgeMetrics,
  compareFilePaths,
  scoreOutputQuality,
  type ShadowComparisonMetrics,
} from "@/lib/tbge/integration/metrics";
import { runTbgeWebsiteGeneration } from "@/lib/tbge/integration/run-website-generation";
import type {
  LegacyWebsiteGenerationRunner,
  TbgeWebsiteGenerationOptions,
} from "@/lib/tbge/integration/types";
import type { WebsiteGenerationInput } from "@/lib/website/types";

export type ShadowModeResult = {
  /** Legacy result is always returned to the user. */
  legacy: Awaited<ReturnType<LegacyWebsiteGenerationRunner>>;
  shadowMetrics?: ShadowComparisonMetrics;
  tbgeError?: string;
};

export async function runWebsiteGenerationWithShadowMode(input: {
  pluginInput: WebsiteGenerationInput;
  providerName: AIProviderName;
  runLegacy: LegacyWebsiteGenerationRunner;
  options?: TbgeWebsiteGenerationOptions;
}): Promise<ShadowModeResult> {
  const legacyStarted = performance.now();

  const legacyPromise = input.runLegacy();
  const tbgePromise = runTbgeWebsiteGeneration({
    pluginInput: input.pluginInput,
    providerName: input.providerName,
    options: {
      ...input.options,
      onProgress: (event) => {
        input.options?.onProgress?.(`[tbge-shadow] ${event}`);
      },
    },
  }).catch((error) => ({
    error: error instanceof Error ? error.message : String(error),
  }));

  const [legacyResult, tbgeOutcome] = await Promise.all([legacyPromise, tbgePromise]);

  const legacyDurationMs = performance.now() - legacyStarted;

  if ("error" in tbgeOutcome) {
    return {
      legacy: legacyResult,
      tbgeError: tbgeOutcome.error,
      shadowMetrics: {
        legacyDurationMs: Number(legacyDurationMs.toFixed(2)),
        tbgeDurationMs: 0,
        legacyFileCount: legacyResult.files.length,
        tbgeFileCount: 0,
        tbgeLlmCalls: 0,
        pathOverlapRatio: 0,
        sharedPaths: [],
        legacyOnlyPaths: legacyResult.files.map((file) => file.path),
        tbgeOnlyPaths: [],
        legacyQualityScore: scoreOutputQuality(legacyResult.files),
        tbgeQualityScore: 0,
        qualityDelta: scoreOutputQuality(legacyResult.files),
      },
    };
  }

  const pathComparison = compareFilePaths(legacyResult.files, tbgeOutcome.files);
  const legacyQualityScore = scoreOutputQuality(legacyResult.files);
  const tbgeQualityScore = tbgeOutcome.tbgeIntegration?.qualityScore ?? 0;

  const shadowMetrics: ShadowComparisonMetrics = {
    legacyDurationMs: Number(legacyDurationMs.toFixed(2)),
    tbgeDurationMs: tbgeOutcome.generationTimeMs,
    legacyFileCount: legacyResult.files.length,
    tbgeFileCount: tbgeOutcome.files.length,
    tbgeLlmCalls: tbgeOutcome.tbgeIntegration?.llmCalls ?? 0,
    legacyQualityScore,
    tbgeQualityScore,
    qualityDelta: Number((tbgeQualityScore - legacyQualityScore).toFixed(2)),
    ...pathComparison,
  };

  tbgeOutcome.tbgeIntegration = buildTbgeMetrics({
    route: "shadow",
    durationMs: tbgeOutcome.generationTimeMs,
    llmCalls: tbgeOutcome.tbgeIntegration?.llmCalls ?? 0,
    files: tbgeOutcome.files,
    composition: tbgeOutcome.tbgeComposition,
    spec: tbgeOutcome.tbgeSpec,
    shadow: shadowMetrics,
  });

  console.info("[tbge-shadow] comparison", JSON.stringify(shadowMetrics));

  return {
    legacy: legacyResult,
    shadowMetrics,
    tbgeError: undefined,
  };
}

export function attachShadowMetricsToLegacyResult(
  legacy: Awaited<ReturnType<LegacyWebsiteGenerationRunner>>,
  shadow?: ShadowComparisonMetrics,
) {
  if (!shadow) return legacy;
  return {
    ...legacy,
    usage: legacy.usage ?? emptyTokenUsage(),
  };
}
