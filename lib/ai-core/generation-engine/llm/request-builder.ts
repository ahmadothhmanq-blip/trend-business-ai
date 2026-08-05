import { TBGE2_SPEC_VERSION } from "@/lib/ai-core/generation-engine/constants";
import type { Tbge2PlanningPlan } from "@/lib/ai-core/generation-engine/core/types";
import type { Tbge2LlmRequest } from "@/lib/ai-core/generation-engine/llm/types";

const SYSTEM_PROMPT = `You are the Trend Business AI Generation Engine planning assistant.
You receive structured planning context only — never raw user prompts.
Your task is to refine and validate the planning output.

RULES:
- Return ONLY valid JSON matching the provided schema
- Never return HTML, React, CSS, or markdown
- Never invent pages or sections not in the plan
- Preserve all industry, language, and requirement decisions
- Improve copy suggestions only within the content plan blocks`;

/**
 * LLM Request Builder — constructs structured prompts for provider calls.
 * Raw user prompts are NEVER passed to the LLM.
 */
export function buildLlmRequest(plan: Tbge2PlanningPlan): Tbge2LlmRequest {
  const structuredContext = {
    version: TBGE2_SPEC_VERSION,
    instruction: "Refine and validate this planning output. Return JSON only.",
    intent: plan.intent,
    business: plan.business,
    requirements: plan.requirements,
    website: plan.website,
    pages: plan.pages,
    sections: plan.sections,
    content: {
      tone: plan.content.tone,
      voice: plan.content.voice,
      localizationStrategy: plan.content.localizationStrategy,
      seoPriority: plan.content.seoPriority,
      blockCount: plan.content.blocks.length,
    },
  };

  return {
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: JSON.stringify(structuredContext, null, 2),
    schema: STRUCTURED_PLAN_SCHEMA,
    temperature: 0.2,
  };
}

export const STRUCTURED_PLAN_SCHEMA: Record<string, unknown> = {
  type: "object",
  required: ["version", "intent", "business", "requirements", "website", "pages", "sections", "content"],
  properties: {
    version: { type: "string" },
    intent: { type: "object" },
    business: { type: "object" },
    requirements: { type: "object" },
    website: { type: "object" },
    pages: { type: "array" },
    sections: { type: "array" },
    content: { type: "object" },
  },
  additionalProperties: false,
};
