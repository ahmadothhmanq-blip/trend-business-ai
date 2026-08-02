export {
  isPromptOptimizationEnabled,
  promptEngineFlags,
} from "@/lib/ai-core/prompt-engine/flags";
export {
  assemblePrompt,
  prepareFilePromptPayload,
  prepareProductFilePromptPayload,
} from "@/lib/ai-core/prompt-engine/builder";
export {
  compactAnalysisMetadata,
  compactBlueprintMetadata,
  compactDesignSystemMetadata,
  compactDynamicPlanMetadata,
  compactMergedProjectMetadata,
  compactProjectTreeMetadata,
  compactStrategyMetadata,
  measureJsonChars,
} from "@/lib/ai-core/prompt-engine/compact-metadata";
export {
  getPromptFragment,
  getPromptFragmentContent,
  listPromptFragments,
} from "@/lib/ai-core/prompt-engine/fragment-registry";
export type {
  CompactedFilePromptPayload,
  FilePromptPayload,
  FilePromptPlan,
  MetadataLayerEntry,
  PromptAssemblyStats,
  PromptCompactionStats,
  PromptFragment,
  PromptFragmentId,
  PromptProductId,
} from "@/lib/ai-core/prompt-engine/types";
