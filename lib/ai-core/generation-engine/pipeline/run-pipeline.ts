import { createHash } from "node:crypto";
import {
  TBGE2_PHASE,
  TBGE2_SPEC_VERSION,
} from "@/lib/ai-core/generation-engine/constants";
import { analyzeBusiness } from "@/lib/ai-core/generation-engine/analyzers/business-analyzer";
import { analyzeIntent } from "@/lib/ai-core/generation-engine/analyzers/intent-analyzer";
import { analyzeRequirements } from "@/lib/ai-core/generation-engine/analyzers/requirements-analyzer";
import type {
  Tbge2PipelineStage,
  Tbge2PlanningInput,
  Tbge2PlanningMeta,
  Tbge2PlanningPlan,
  Tbge2PlanningResult,
} from "@/lib/ai-core/generation-engine/core/types";
import { buildLlmRequest } from "@/lib/ai-core/generation-engine/llm/request-builder";
import {
  containsForbiddenMarkup,
  parseStructuredOutput,
  planToStructuredOutput,
} from "@/lib/ai-core/generation-engine/llm/structured-output";
import type { Tbge2LlmClient } from "@/lib/ai-core/generation-engine/llm/types";
import { planContent } from "@/lib/ai-core/generation-engine/planners/content-planner";
import { planPages } from "@/lib/ai-core/generation-engine/planners/page-planner";
import { planSections } from "@/lib/ai-core/generation-engine/planners/section-planner";
import { planWebsite } from "@/lib/ai-core/generation-engine/planners/website-planner";
import { validatePlanningPlan, validatePlanningInput } from "@/lib/ai-core/generation-engine/validation/validate";

export type Tbge2PipelineOptions = {
  llmClient?: Tbge2LlmClient;
  skipLlm?: boolean;
};

function hashPlan(parts: string[]): string {
  return createHash("sha256").update(parts.join("|")).digest("hex").slice(0, 16);
}

/**
 * TBGE2 Planning Pipeline — thinks before calling any LLM.
 *
 * User Prompt → Intent → Business → Requirements → Website → Pages → Sections → Content → LLM Request → Structured Output
 */
export async function runTbge2PlanningPipeline(
  input: Tbge2PlanningInput,
  options: Tbge2PipelineOptions = {},
): Promise<Tbge2PlanningResult> {
  const stagesCompleted: Tbge2PipelineStage[] = [];

  const inputValidation = validatePlanningInput(input);
  if (!inputValidation.valid) {
    return { ok: false, errors: inputValidation.errors, stage: "intent" };
  }

  const intent = analyzeIntent(input);
  stagesCompleted.push("intent");

  const business = analyzeBusiness(input, intent);
  stagesCompleted.push("business");

  const requirements = analyzeRequirements(input, intent);
  stagesCompleted.push("requirements");

  const website = planWebsite(intent, business, requirements);
  stagesCompleted.push("website");

  const pages = planPages(intent, requirements, website.primaryCta);
  stagesCompleted.push("pages");

  const sections = planSections(pages, intent, requirements);
  stagesCompleted.push("sections");

  const content = planContent(sections, business, requirements);
  stagesCompleted.push("content");

  const plan: Tbge2PlanningPlan = {
    intent,
    business,
    requirements,
    website,
    pages,
    sections,
    content,
  };

  const planValidation = validatePlanningPlan(plan);
  if (!planValidation.valid) {
    return { ok: false, errors: planValidation.errors, stage: "validate" };
  }

  const structured = planToStructuredOutput(plan);
  const llmRequest = buildLlmRequest(plan);
  stagesCompleted.push("llm_request");

  let structuredOutput;
  if (options.llmClient && !options.skipLlm) {
    const response = await options.llmClient.complete(llmRequest);
    if (containsForbiddenMarkup(response.content)) {
      return {
        ok: false,
        errors: ["LLM returned forbidden markup — only JSON is allowed"],
        stage: "structured_output",
      };
    }
    const parsed = parseStructuredOutput(response);
    if (!parsed) {
      return {
        ok: false,
        errors: ["Failed to parse structured LLM output as valid plan JSON"],
        stage: "structured_output",
      };
    }
    structuredOutput = parsed;
    stagesCompleted.push("structured_output");
  }

  const meta: Tbge2PlanningMeta = {
    platformPhase: TBGE2_PHASE,
    platformVersion: TBGE2_SPEC_VERSION,
    resolvedAt: new Date().toISOString(),
    planHash: hashPlan([
      intent.category,
      business.industryId,
      String(pages.length),
      String(sections.length),
      TBGE2_SPEC_VERSION,
    ]),
    stagesCompleted,
  };

  return {
    ok: true,
    plan,
    structured,
    llmRequest,
    meta,
    structuredOutput,
  };
}
