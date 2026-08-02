/**
 * TBGE planning pipeline — normalize → prompt → LLM → parse → validate → build → lock.
 */

import { buildGenerationSpecFromDraft } from "@/lib/tbge/planning/build-spec";
import { parsePlanDraftFromLlm } from "@/lib/tbge/planning/parse";
import {
  buildMasterPlannerSystemPrompt,
  buildMasterPlannerUserPrompt,
} from "@/lib/tbge/planning/prompts";
import type {
  MasterPlannerDeps,
  PlannerStage,
  PlanningPipelineInput,
  PlanningPipelineResult,
} from "@/lib/tbge/planning/types";
import { validatePlanDraft } from "@/lib/tbge/planning/validate";
import { recordTbgeLlmCall } from "@/lib/tbge/kernel/run-budget";
import { lockSpec } from "@/lib/tbge/spec/lock";
import { assertValidGenerationSpec } from "@/lib/tbge/spec/validator";

function fail(stage: PlannerStage, errors: string[]): PlanningPipelineResult {
  return { ok: false, stage, errors };
}

export async function runPlanningPipeline(
  deps: MasterPlannerDeps,
  input: PlanningPipelineInput,
): Promise<PlanningPipelineResult> {
  const brief = input.adapter.normalizeBrief
    ? input.adapter.normalizeBrief(input.brief)
    : input.brief;

  input.onProgress?.({
    phase: "planning",
    message: "[tbge] normalizing brief",
    timestamp: new Date().toISOString(),
  });

  const systemPrompt = buildMasterPlannerSystemPrompt(input.adapter);
  const userPrompt = buildMasterPlannerUserPrompt({
    brief,
    mode: input.mode,
    profile: input.profile,
  });

  input.onProgress?.({
    phase: "planning",
    message: "[tbge] invoking master planner",
    timestamp: new Date().toISOString(),
  });

  let llmResponse;
  try {
    recordTbgeLlmCall(input.budget, 1);
    llmResponse = await deps.llmClient.complete({ systemPrompt, userPrompt });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return fail("llm", [`Master planner LLM call failed: ${message}`]);
  }

  const parsed = parsePlanDraftFromLlm(llmResponse.content);
  if (!parsed.ok) {
    return fail("parse", parsed.errors);
  }

  const validation = validatePlanDraft(parsed.draft);
  if (!validation.valid) {
    return fail("validate", validation.errors);
  }

  let spec;
  try {
    spec = buildGenerationSpecFromDraft({
      draft: parsed.draft,
      adapter: input.adapter,
      productId: input.adapter.productId,
      profile: input.profile,
      mode: input.mode,
      prompt: brief.prompt,
      plannerModel: llmResponse.model,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return fail("build", [`Failed to build GenerationSpec: ${message}`]);
  }

  try {
    spec = input.adapter.extendSpec(spec);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return fail("extend", [`Adapter extendSpec failed: ${message}`]);
  }

  try {
    spec = lockSpec(spec, brief.prompt).spec;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return fail("lock", [`Failed to lock GenerationSpec: ${message}`]);
  }

  try {
    assertValidGenerationSpec(spec);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return fail("spec_validate", [message]);
  }

  return {
    ok: true,
    spec,
    planDraft: parsed.draft,
    plannerModel: llmResponse.model,
  };
}
