import { createHash } from "node:crypto";
import { runTbge2PlanningPipeline } from "@/lib/ai-core/generation-engine/pipeline/run-pipeline";
import { buildMasterPlan } from "@/lib/ai-core/generation-engine/master-plan/build-master-plan";
import { buildMasterPlanContentLlmRequest } from "@/lib/ai-core/generation-engine/master-plan/llm-request-builder";
import {
  MASTER_PLAN_PHASE,
  MASTER_PLAN_SCHEMA_VERSION,
} from "@/lib/ai-core/generation-engine/master-plan/constants";
import type {
  MasterPlanInput,
  MasterPlanMeta,
  MasterPlanPipelineStage,
  MasterPlanResult,
} from "@/lib/ai-core/generation-engine/master-plan/types";
import { validateMasterPlan } from "@/lib/ai-core/generation-engine/master-plan/validate";

function hashPlan(parts: string[]): string {
  return createHash("sha256").update(parts.join("|")).digest("hex").slice(0, 16);
}

/**
 * Master Plan Pipeline
 *
 * User Prompt → TBGE Analysis → Master Plan Builder → Validation → Master Plan → LLM Request
 */
export async function runMasterPlanPipeline(
  input: MasterPlanInput,
): Promise<MasterPlanResult> {
  const stagesCompleted: MasterPlanPipelineStage[] = [];

  const tbgeResult = await runTbge2PlanningPipeline(input, { skipLlm: true });
  stagesCompleted.push("tbge_analysis");

  if (!tbgeResult.ok) {
    return {
      ok: false,
      errors: tbgeResult.errors,
      stage: "tbge_analysis",
    };
  }

  const masterPlan = buildMasterPlan(tbgeResult.plan, input);
  stagesCompleted.push("master_plan_build");

  const validation = validateMasterPlan(masterPlan);
  if (!validation.valid) {
    return {
      ok: false,
      errors: validation.errors,
      stage: "master_plan_validate",
    };
  }
  stagesCompleted.push("master_plan_validate");

  const llmRequest = buildMasterPlanContentLlmRequest(masterPlan);
  stagesCompleted.push("llm_request");

  const meta: MasterPlanMeta = {
    phase: MASTER_PLAN_PHASE,
    schemaVersion: MASTER_PLAN_SCHEMA_VERSION,
    resolvedAt: new Date().toISOString(),
    planHash: hashPlan([
      masterPlan.id,
      masterPlan.business.industryId,
      String(masterPlan.pages.length),
      String(masterPlan.sections.length),
      MASTER_PLAN_SCHEMA_VERSION,
    ]),
    stagesCompleted,
  };

  return {
    ok: true,
    masterPlan,
    llmRequest,
    meta,
  };
}
