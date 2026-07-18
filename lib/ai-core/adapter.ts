import type { GenerationContext, TokenUsage } from "@/lib/ai/types";
import type {
  CoreAssetManifest,
  CoreBrief,
  CoreBusinessProfile,
  CoreDesignSystem,
  CoreLayerArtifacts,
  CoreLayerFlags,
  CoreProductStrategy,
  CoreQualityReport,
  CoreRunMode,
} from "@/lib/ai-core/layers/types";

/**
 * Thin product bridge into the AI Core LayerRunner.
 * Phase 0: interface only — products are not migrated yet.
 */
export type ProductEngineAdapter<TGeneration = unknown, TFinal = unknown> = {
  /** Stable product id (e.g. "website-builder", "landing-page-builder") */
  productId: string;
  /** Human-readable label for logs/UI */
  label: string;
  /** Which Core layers this product participates in */
  layers: CoreLayerFlags;

  /** Optional: Idea layer */
  runIdea?(
    brief: CoreBrief,
    ctx: GenerationContext,
    prior?: CoreLayerArtifacts,
  ): Promise<CoreBusinessProfile>;

  /** Optional: Strategy layer */
  runStrategy?(
    brief: CoreBrief,
    profile: CoreBusinessProfile,
    ctx: GenerationContext,
    prior?: CoreLayerArtifacts,
  ): Promise<CoreProductStrategy>;

  /** Optional: Design layer */
  runDesign?(
    brief: CoreBrief,
    profile: CoreBusinessProfile,
    strategy: CoreProductStrategy,
    ctx: GenerationContext,
    prior?: CoreLayerArtifacts,
  ): Promise<CoreDesignSystem>;

  /** Optional: Assets layer */
  runAssets?(
    brief: CoreBrief,
    artifacts: CoreLayerArtifacts,
    ctx: GenerationContext,
  ): Promise<CoreAssetManifest>;

  /** Required: product generation (existing AIPlugin / specialized generator) */
  runGeneration(
    brief: CoreBrief,
    artifacts: CoreLayerArtifacts,
    ctx: GenerationContext,
  ): Promise<TGeneration>;

  /** Optional: quality check over generation output */
  runQuality?(
    brief: CoreBrief,
    artifacts: CoreLayerArtifacts,
    generation: TGeneration,
    ctx: GenerationContext,
  ): Promise<CoreQualityReport>;

  /** Optional: map generation → delivery payload (persist shape, export, etc.) */
  finalize?(
    brief: CoreBrief,
    artifacts: CoreLayerArtifacts,
    generation: TGeneration,
    ctx: GenerationContext,
  ): Promise<TFinal>;
};

export type LayerRunnerInput = {
  brief: CoreBrief;
  mode?: CoreRunMode;
  continueInstruction?: string;
  /** Prior artifacts when continuing / regenerating */
  priorArtifacts?: Partial<CoreLayerArtifacts>;
  userId?: string;
  parentRunId?: string;
};

export type LayerRunnerResult<TGeneration = unknown, TFinal = unknown> = {
  artifacts: CoreLayerArtifacts;
  generation: TGeneration;
  finalOutput?: TFinal;
  progressEvents: string[];
  layersExecuted: string[];
  usage: TokenUsage;
  generationTimeMs: number;
  provider: string;
};
