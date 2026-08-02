/**
 * Parse Master Planner LLM output into a PlanDraft.
 */

import type { PlanDraft } from "@/lib/tbge/planning/plan-draft";
import { isPlanDraft } from "@/lib/tbge/planning/plan-draft";

export type ParsePlanDraftResult =
  | { ok: true; draft: PlanDraft }
  | { ok: false; errors: string[] };

function stripCodeFence(content: string): string {
  const trimmed = content.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}

export function parsePlanDraftFromLlm(content: string): ParsePlanDraftResult {
  const errors: string[] = [];

  if (!content.trim()) {
    return { ok: false, errors: ["LLM response is empty"] };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFence(content));
  } catch {
    return { ok: false, errors: ["LLM response is not valid JSON"] };
  }

  if (!isPlanDraft(parsed)) {
    errors.push("Parsed value is missing required PlanDraft fields");
    return { ok: false, errors };
  }

  return { ok: true, draft: parsed };
}
