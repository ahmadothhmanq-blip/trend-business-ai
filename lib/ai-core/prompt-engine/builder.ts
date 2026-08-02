import { isPromptOptimizationEnabled } from "@/lib/ai-core/prompt-engine/flags";
import {
  compactAnalysisMetadata,
  compactBlueprintMetadata,
  compactDesignSystemMetadata,
  compactDynamicPlanMetadata,
  compactProjectTreeMetadata,
  compactStrategyMetadata,
  measureJsonChars,
} from "@/lib/ai-core/prompt-engine/compact-metadata";
import type {
  CompactedFilePromptPayload,
  FilePromptPayload,
  PromptCompactionStats,
  PromptProductId,
} from "@/lib/ai-core/prompt-engine/types";

function buildStats(
  before: Record<string, number>,
  after: Record<string, number>,
): PromptCompactionStats {
  const totalBefore = Object.values(before).reduce((sum, value) => sum + value, 0);
  const totalAfter = Object.values(after).reduce((sum, value) => sum + value, 0);
  const reduction =
    totalBefore > 0
      ? Math.round((1 - totalAfter / totalBefore) * 100)
      : 0;

  return {
    enabled: true,
    analysisCharsBefore: before.analysis,
    analysisCharsAfter: after.analysis,
    blueprintCharsBefore: before.blueprint,
    blueprintCharsAfter: after.blueprint,
    dynamicPlanCharsBefore: before.dynamicPlan,
    dynamicPlanCharsAfter: after.dynamicPlan,
    projectTreeCharsBefore: before.projectTree,
    projectTreeCharsAfter: after.projectTree,
    strategyCharsBefore: before.strategy,
    strategyCharsAfter: after.strategy,
    designSystemCharsBefore: before.designSystem,
    designSystemCharsAfter: after.designSystem,
    totalMetadataCharsBefore: totalBefore,
    totalMetadataCharsAfter: totalAfter,
    metadataReductionPercent: reduction,
  };
}

function emptyStats(payload: FilePromptPayload): PromptCompactionStats {
  const analysis = measureJsonChars(payload.analysis);
  const blueprint = measureJsonChars(payload.blueprint);
  const dynamicPlan = measureJsonChars(payload.dynamicPlan);
  const projectTree = measureJsonChars(payload.projectTree);
  const strategy = measureJsonChars(payload.strategy);
  const designSystem = measureJsonChars(payload.designSystem);
  const total =
    analysis + blueprint + dynamicPlan + projectTree + strategy + designSystem;

  return {
    enabled: false,
    analysisCharsBefore: analysis,
    analysisCharsAfter: analysis,
    blueprintCharsBefore: blueprint,
    blueprintCharsAfter: blueprint,
    dynamicPlanCharsBefore: dynamicPlan,
    dynamicPlanCharsAfter: dynamicPlan,
    projectTreeCharsBefore: projectTree,
    projectTreeCharsAfter: projectTree,
    strategyCharsBefore: strategy,
    strategyCharsAfter: strategy,
    designSystemCharsBefore: designSystem,
    designSystemCharsAfter: designSystem,
    totalMetadataCharsBefore: total,
    totalMetadataCharsAfter: total,
    metadataReductionPercent: 0,
  };
}

/**
 * Canonical metadata preparation for file-generation prompts.
 * Compacts metadata only — prompt templates and instructions are unchanged.
 */
export function prepareFilePromptPayload(
  payload: FilePromptPayload,
): CompactedFilePromptPayload {
  if (!isPromptOptimizationEnabled()) {
    return { ...payload, stats: emptyStats(payload) };
  }

  const filePath = payload.filePlan?.path;
  const category = payload.filePlan?.category;

  const before = {
    analysis: measureJsonChars(payload.analysis),
    blueprint: measureJsonChars(payload.blueprint),
    dynamicPlan: measureJsonChars(payload.dynamicPlan),
    projectTree: measureJsonChars(payload.projectTree),
    strategy: measureJsonChars(payload.strategy),
    designSystem: measureJsonChars(payload.designSystem),
  };

  const analysis = compactAnalysisMetadata(payload.analysis);
  const blueprint = compactBlueprintMetadata(payload.blueprint, analysis);
  const dynamicPlan = compactDynamicPlanMetadata(payload.dynamicPlan);
  const projectTree = compactProjectTreeMetadata(payload.projectTree);
  const strategy =
    payload.strategy !== undefined
      ? compactStrategyMetadata(payload.strategy, filePath)
      : undefined;
  const designSystem =
    payload.designSystem !== undefined
      ? compactDesignSystemMetadata(payload.designSystem, filePath, category)
      : undefined;

  const after = {
    analysis: measureJsonChars(analysis),
    blueprint: measureJsonChars(blueprint),
    dynamicPlan: measureJsonChars(dynamicPlan),
    projectTree: measureJsonChars(projectTree),
    strategy: measureJsonChars(strategy),
    designSystem: measureJsonChars(designSystem),
  };

  return {
    ...payload,
    analysis,
    blueprint,
    dynamicPlan,
    projectTree,
    strategy,
    designSystem,
    stats: buildStats(before, after),
  };
}

/** Product adapter entry point — same compaction rules across products. */
export function prepareProductFilePromptPayload(
  productId: PromptProductId,
  payload: FilePromptPayload,
): CompactedFilePromptPayload {
  return prepareFilePromptPayload({ ...payload, productId });
}

/**
 * Assemble a prompt string via an existing builder while tracking compaction stats.
 */
export function assemblePrompt<T extends FilePromptPayload>(
  payload: T,
  buildPrompt: (compacted: T) => string,
): { prompt: string; stats: PromptCompactionStats; assemblyDurationMs: number } {
  const started = performance.now();
  const prepared = prepareFilePromptPayload(payload);
  const compacted = {
    ...payload,
    analysis: prepared.analysis,
    blueprint: prepared.blueprint,
    dynamicPlan: prepared.dynamicPlan,
    projectTree: prepared.projectTree,
    strategy: prepared.strategy,
    designSystem: prepared.designSystem,
  } as T;

  return {
    prompt: buildPrompt(compacted),
    stats: prepared.stats,
    assemblyDurationMs: Math.round(performance.now() - started),
  };
}
