/**
 * TBGE Master Planner contracts — Sprint 2.
 * LLM is used only inside PlannerLlmClient.complete().
 */

import type { TbgeProductAdapter } from "@/lib/tbge/adapters/types";
import type { TbgeRunBudget } from "@/lib/tbge/kernel/run-budget";
import type { TbgeBrief, TbgeProgressEvent } from "@/lib/tbge/kernel/types";
import type { GenerationSpec, TbgeGenerationProfile, TbgeRunMode } from "@/lib/tbge/spec/types";
import type { PlanDraft } from "@/lib/tbge/planning/plan-draft";

export type PlannerLlmRequest = {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
};

export type PlannerLlmResponse = {
  content: string;
  model: string;
};

/** Injectable LLM boundary — the only place planning may call an LLM. */
export type PlannerLlmClient = {
  complete(request: PlannerLlmRequest): Promise<PlannerLlmResponse>;
};

export type MasterPlannerInput = {
  brief: TbgeBrief;
  mode: TbgeRunMode;
  profile: TbgeGenerationProfile;
  adapter: TbgeProductAdapter;
  budget: TbgeRunBudget;
  onProgress?: (event: TbgeProgressEvent) => void;
};

export type MasterPlannerResult =
  | { ok: true; spec: GenerationSpec; planDraft: PlanDraft; plannerModel: string }
  | { ok: false; errors: string[]; stage: PlannerStage };

export type PlannerStage =
  | "normalize"
  | "prompt"
  | "llm"
  | "parse"
  | "validate"
  | "build"
  | "extend"
  | "lock"
  | "spec_validate";

export type PlanValidationResult =
  | { valid: true }
  | { valid: false; errors: string[] };

export type MasterPlanner = {
  plan(input: MasterPlannerInput): Promise<MasterPlannerResult>;
};

export type MasterPlannerDeps = {
  llmClient: PlannerLlmClient;
};

export type PlanningPipelineInput = MasterPlannerInput;

export type PlanningPipelineResult = MasterPlannerResult;
