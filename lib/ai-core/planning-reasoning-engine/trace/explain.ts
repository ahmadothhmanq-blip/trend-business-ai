import type { PlanningReasoningTrace } from "@/lib/ai-core/planning-reasoning-engine/types";

/** Human-readable reasoning chain derived from structured PRE trace. */
export function explainPlanningTrace(trace: PlanningReasoningTrace): string[] {
  return trace.entries.map((entry) => {
    const prefix = `[${entry.phase}/${entry.ruleId}]`;
    const confidence =
      typeof entry.confidence === "number"
        ? ` (confidence=${entry.confidence.toFixed(2)})`
        : "";
    return `${prefix} ${entry.message}${confidence}`;
  });
}

/** Compact summary for progress logs and plan sources. */
export function summarizePlanningTrace(trace: PlanningReasoningTrace): string {
  const phaseSummary = trace.phases.join(" → ");
  return `${trace.summary} Phases: ${phaseSummary}. Entries: ${trace.entries.length}.`;
}
