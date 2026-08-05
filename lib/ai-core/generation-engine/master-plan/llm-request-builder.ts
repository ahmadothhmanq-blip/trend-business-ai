import type { MasterPlan } from "@/lib/ai-core/generation-engine/master-plan/types";

export type MasterPlanContentLlmRequest = {
  systemPrompt: string;
  /** Structured Master Plan + copy tasks only — never raw user prompt. */
  userPrompt: string;
  schema: Record<string, unknown>;
  model?: string;
  temperature?: number;
};

/** Single copy field per block — builder does not consume LLM output; validation requires string values only. */
export const CONTENT_PROVIDER_RESPONSE_FIELD = "text";

const SYSTEM_PROMPT = `You are a content writer for Trend Business AI.
You receive a LOCKED Master Plan — the Single Source of Truth.

Write one concise marketing string per copyTasks blockId in fields.${CONTENT_PROVIDER_RESPONSE_FIELD}.
Match tone/voice and section type (hero, faq, cta, etc.).

YOU MUST NEVER:
- Add, remove, or rename pages or sections
- Change navigation, components, or business features
- Modify industry, language, conversion strategy, or architecture
- Return HTML, React, CSS, or markdown
- Make any planning decisions

Return ONLY valid JSON: {"masterPlanId":"<id>","content":[{"blockId":"<id>","fields":{"${CONTENT_PROVIDER_RESPONSE_FIELD}":"<copy>"}}]}.`;

/**
 * LLM Request Builder — Master Plan execution only.
 * LLMs write copy; they never make planning decisions.
 */
export function buildMasterPlanContentLlmRequest(plan: MasterPlan): MasterPlanContentLlmRequest {
  const copyTasks = plan.sections.flatMap((section) =>
    section.contentBlocks.map((blockId) => ({
      blockId,
      type: section.type,
    })),
  );

  const structuredContext = {
    locked: true,
    masterPlanId: plan.id,
    business: {
      name: plan.business.name,
      industry: plan.business.industry,
      audience: plan.audience,
      goals: plan.goals,
    },
    brand: plan.brand,
    localization: {
      language: plan.localization.language,
      direction: plan.localization.direction,
    },
    contentStrategy: {
      tone: plan.contentStrategy.tone,
      voice: plan.contentStrategy.voice,
      fields: [CONTENT_PROVIDER_RESPONSE_FIELD],
    },
    copyTasks,
  };

  return {
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: JSON.stringify(structuredContext),
    schema: STRUCTURED_CONTENT_SCHEMA,
    temperature: 0.3,
  };
}

export const STRUCTURED_CONTENT_SCHEMA: Record<string, unknown> = {
  type: "object",
  required: ["masterPlanId", "content"],
  properties: {
    masterPlanId: { type: "string" },
    content: {
      type: "array",
      items: {
        type: "object",
        required: ["blockId", "fields"],
        properties: {
          blockId: { type: "string" },
          fields: {
            type: "object",
            required: [CONTENT_PROVIDER_RESPONSE_FIELD],
            properties: {
              [CONTENT_PROVIDER_RESPONSE_FIELD]: { type: "string" },
            },
            additionalProperties: false,
          },
        },
      },
    },
  },
  additionalProperties: false,
};
