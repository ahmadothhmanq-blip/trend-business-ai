import { TBGE2_SPEC_VERSION } from "@/lib/ai-core/generation-engine/constants";
import type { Tbge2PlanningPlan, Tbge2StructuredPlan } from "@/lib/ai-core/generation-engine/core/types";
import type { Tbge2LlmResponse, Tbge2StructuredOutputResult } from "@/lib/ai-core/generation-engine/llm/types";

/**
 * Structured Output — LLM returns JSON only. Never HTML, React, or CSS.
 */
export function planToStructuredOutput(plan: Tbge2PlanningPlan): Tbge2StructuredPlan {
  return {
    version: TBGE2_SPEC_VERSION,
    intent: plan.intent,
    business: plan.business,
    requirements: plan.requirements,
    website: plan.website,
    pages: plan.pages,
    sections: plan.sections,
    content: plan.content,
  };
}

export function parseStructuredOutput(response: Tbge2LlmResponse): Tbge2StructuredOutputResult | null {
  try {
    const cleaned = response.content
      .replace(/^```json\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    const data = JSON.parse(cleaned) as Tbge2StructuredPlan;
    if (!isStructuredPlan(data)) return null;
    return { data, model: response.model, raw: response.content };
  } catch {
    return null;
  }
}

export function isStructuredPlan(value: unknown): value is Tbge2StructuredPlan {
  if (!value || typeof value !== "object") return false;
  const row = value as Partial<Tbge2StructuredPlan>;
  return (
    row.version === TBGE2_SPEC_VERSION &&
    Boolean(row.intent?.category) &&
    Boolean(row.business?.industry) &&
    Array.isArray(row.pages) &&
    row.pages.length > 0 &&
    Array.isArray(row.sections) &&
    Boolean(row.content)
  );
}

/** Reject any LLM output that contains markup. */
export function containsForbiddenMarkup(content: string): boolean {
  const forbidden = [
    /<html/i,
    /<div/i,
    /<section/i,
    /import\s+React/i,
    /className=/,
    /\.css\b/,
    /```html/i,
    /```jsx/i,
    /```tsx/i,
  ];
  return forbidden.some((pattern) => pattern.test(content));
}
