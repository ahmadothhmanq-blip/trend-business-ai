/**
 * Trend Business AI Generation Engine (TBGE) — public API.
 * Sprint 1: foundation only. Not wired to Website Builder.
 */

// Flags
export {
  isTbgeEnabled,
  isTbgeLegacyFull,
  resolveTbgeFlags,
  shouldRunTbgePlanning,
  shouldRunTbgeComposer,
  shouldBypassLegacyWebsitePipeline,
  shouldUseTbgeOrchestrator,
  type TbgeFeatureFlags,
} from "@/lib/tbge/flags";
export {
  resolveTbgeProfileLimits,
  type TbgeProfileLimits,
} from "@/lib/tbge/flags/resolve-profile";

// Spec
export {
  GENERATION_SPEC_VERSION,
  type ContentModel,
  type FileGraphNode,
  type GenerationSpec,
  type GeneratorId,
  type SpecValidationResult,
  type TbgeProductId,
  type TbgeRunMode,
  type TbgeGenerationProfile,
} from "@/lib/tbge/spec/types";
export { validateGenerationSpec, assertValidGenerationSpec } from "@/lib/tbge/spec/validator";
export { hashPrompt, isSpecLocked, lockSpec } from "@/lib/tbge/spec/lock";
export {
  createSpecDelta,
  requiresFullReplan,
  type SpecDelta,
} from "@/lib/tbge/spec/versioning";
export {
  isWebsiteStructure,
  type WebsiteStructure,
  type WebsitePageSpec,
} from "@/lib/tbge/spec/website-structure";

// Kernel
export { createTbgeOrchestrator, type TbgeOrchestrator } from "@/lib/tbge/kernel/orchestrator";
export {
  createTbgeRunContext,
  transitionPhase,
  type TbgeRunContext,
} from "@/lib/tbge/kernel/run-context";
export {
  createTbgeRunBudget,
  recordTbgeLlmCall,
  remainingTbgeLlmCalls,
} from "@/lib/tbge/kernel/run-budget";
export { canTransition, nextPhase, type TbgePhase } from "@/lib/tbge/kernel/phases";
export type {
  TbgeBrief,
  TbgeRunInput,
  TbgeRunResult,
  TbgeRunTrace,
  TbgeArtifactFile,
  TbgeProgressEvent,
} from "@/lib/tbge/kernel/types";

// Assembly
export {
  createAssemblyEngine,
  defaultAssemblyEngine,
  assemblyEngineSkeleton,
} from "@/lib/tbge/assembly/engine";
export type {
  AssemblyEngine,
  AssemblyEngineDeps,
  AssemblyResult,
  AssemblyContext,
  AssemblyStats,
} from "@/lib/tbge/assembly/types";
export { createGeneratorRegistry } from "@/lib/tbge/assembly/registry";
export { runAssemblyRuntime } from "@/lib/tbge/assembly/runtime";
export { validateDependencyGraph } from "@/lib/tbge/assembly/dependency-graph";
export { validateAssemblyOutput } from "@/lib/tbge/assembly/validate";
export { mapParallel, DEFAULT_ASSEMBLY_CONCURRENCY } from "@/lib/tbge/assembly/parallel";
export type {
  GeneratorPlugin,
  GeneratorContext,
  GeneratorRegistry,
} from "@/lib/tbge/assembly/generators/types";

// Adapters
export {
  createPassthroughProductAdapter,
  type TbgeProductAdapter,
  type AssemblyProfile,
} from "@/lib/tbge/adapters/types";
export { websiteBuilderTbgeAdapter } from "@/lib/tbge/adapters/website-adapter";
export {
  listTbgeProductAdapters,
  registerTbgeProductAdapter,
  resolveTbgeProductAdapter,
} from "@/lib/tbge/adapters/registry";

// Planning
export { createMasterPlanner, createUnconfiguredPlannerLlmClient } from "@/lib/tbge/planning/master-planner";
export { runPlanningPipeline } from "@/lib/tbge/planning/pipeline";
export { parsePlanDraftFromLlm } from "@/lib/tbge/planning/parse";
export { validatePlanDraft, assertValidPlanDraft } from "@/lib/tbge/planning/validate";
export { buildGenerationSpecFromDraft } from "@/lib/tbge/planning/build-spec";
export { resolveFileGraphForAdapter } from "@/lib/tbge/planning/file-graph";
export {
  buildMasterPlannerSystemPrompt,
  buildMasterPlannerUserPrompt,
} from "@/lib/tbge/planning/prompts";
export type {
  MasterPlanner,
  MasterPlannerInput,
  MasterPlannerResult,
  PlannerLlmClient,
  PlannerLlmRequest,
  PlannerLlmResponse,
  PlannerStage,
  PlanValidationResult,
} from "@/lib/tbge/planning/types";
export type { PlanDraft } from "@/lib/tbge/planning/plan-draft";

// DI
export { TBGE_TOKENS } from "@/lib/tbge/di/tokens";
export { createTbgeContainer, registerTbgeDefaults } from "@/lib/tbge/di/container";
export { getDefaultTbgeContainer, resetDefaultTbgeContainer } from "@/lib/tbge/di/bootstrap";
export type { TbgeContainer } from "@/lib/tbge/di/types";

// Integration (Sprint 5)
export {
  resolveWebsiteTbgeRoute,
  shouldRouteWebsiteToTbgePrimary,
  shouldRunTbgeShadowMode,
  runTbgeWebsiteGeneration,
  runWebsiteGenerationWithShadowMode,
  createPlannerLlmClientFromProvider,
  type TbgeIntegrationMetrics,
  type ShadowComparisonMetrics,
} from "@/lib/tbge/integration";

// Composer
export {
  createComponentComposer,
  defaultComponentComposer,
  createComponentRegistry,
  composeTheme,
  composeResponsiveLayout,
  composePage,
  composeSectionsForPage,
  resolveComponentVariant,
  validateSiteComposition,
  type ComponentComposer,
  type SiteComposition,
  type ComposedPage,
  type ComposedSection,
  type ComposerResult,
} from "@/lib/tbge/composer";
