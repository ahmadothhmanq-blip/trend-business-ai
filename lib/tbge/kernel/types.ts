/**
 * TBGE kernel types — orchestrator input/output contracts.
 */

import type { TbgeProductAdapter } from "@/lib/tbge/adapters/types";
import type { TbgeFeatureFlags } from "@/lib/tbge/flags";
import type { TbgePhase } from "@/lib/tbge/kernel/phases";
import type { MasterPlanner } from "@/lib/tbge/planning/types";
import type {
  GenerationSpec,
  TbgeGenerationProfile,
  TbgeProductId,
  TbgeRunMode,
} from "@/lib/tbge/spec/types";

export type TbgeBrief = {
  prompt: string;
  productId: TbgeProductId;
  language?: string;
  theme?: string;
  features?: string[];
  metadata?: Record<string, unknown>;
};

export type TbgeProgressEvent = {
  phase: TbgePhase;
  message: string;
  timestamp: string;
};

export type TbgeRunInput = {
  brief: TbgeBrief;
  mode?: TbgeRunMode;
  profile?: TbgeGenerationProfile;
  /** Pre-locked spec for assembly-only runs (future integration). */
  spec?: GenerationSpec;
  flags?: Partial<TbgeFeatureFlags>;
  userId?: string;
  parentRunId?: string;
  onProgress?: (event: TbgeProgressEvent) => void;
};

export type TbgeArtifactFile = {
  path: string;
  content: string;
  language?: string;
};

export type TbgeRunTrace = {
  runId: string;
  phases: TbgePhase[];
  llmCalls: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
};

export type TbgeRunResult = {
  status: "completed" | "not_enabled" | "failed";
  spec?: GenerationSpec;
  files: TbgeArtifactFile[];
  trace: TbgeRunTrace;
  message?: string;
};

export type TbgeOrchestratorDeps = {
  assemblyEngine: {
    assemble(
      spec: import("@/lib/tbge/spec/types").GenerationSpec,
      ctx?: import("@/lib/tbge/assembly/types").AssemblyContext,
    ): Promise<{ files: TbgeArtifactFile[]; stats: { tasksRun: number } }>;
  };
  masterPlanner?: MasterPlanner;
  resolveAdapter?: (productId: TbgeProductId) => TbgeProductAdapter | undefined;
};
