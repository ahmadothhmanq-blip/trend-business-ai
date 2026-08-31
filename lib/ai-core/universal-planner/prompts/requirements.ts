import type { CoreBrief } from "@/lib/ai-core/layers/types";

export function universalPlannerRequirementsPrompt(
  brief: CoreBrief,
  conversationContext = "",
): string {
  return `You are the Universal AI Planner requirement analyzer.

Core brief:
${JSON.stringify(brief, null, 2)}

Conversation context:
${conversationContext || "N/A"}

Extract:
- user intent summary
- constraints and guardrails
- required capabilities (auth, data, assets, integrations)
- target service candidates
- missing requirements that require clarification

Return strict JSON only.`;
}
