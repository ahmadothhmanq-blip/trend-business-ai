export {
  contextEngineFlags,
  isSmartContextEnabled,
  resolveContextCharBudget,
  resolveContextCharLimit,
} from "@/lib/ai-core/context-engine/flags";
export {
  buildComponentGraph,
  buildLayoutGraph,
  buildRouteGraph,
  buildStructuralContextGraph,
  collectCategoryAnchors,
  collectUpstreamDeps,
} from "@/lib/ai-core/context-engine/graphs";
export {
  buildImportGraphEdges,
  collectForwardImportDeps,
  collectDirectImportDeps,
  extractImportPaths,
  fileImportsPath,
  resolveProjectImport,
} from "@/lib/ai-core/context-engine/import-graph";
export {
  mapFilesForPromptContext,
  resolvePromptContext,
  resolveSmartContextFiles,
} from "@/lib/ai-core/context-engine/resolver";
export type {
  ContextGraphEdge,
  ContextResolutionOptions,
  ContextResolutionResult,
  ContextResolutionStats,
  PromptContextFile,
} from "@/lib/ai-core/context-engine/types";
