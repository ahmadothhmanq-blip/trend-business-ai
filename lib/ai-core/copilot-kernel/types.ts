/**
 * Copilot runtime kernel — shared types (Phase 4).
 */

export type CopilotCostTier = "free" | "ai-standard";

export type CopilotCostHint = {
  costTier: CopilotCostTier;
  creditCost: number;
  capability: string;
  label: string;
};

export type CopilotRoutingMeta = {
  classifierUsed?: boolean;
  splitCommands?: string[];
  executedCommandIndex?: number;
  executedCommandCount?: number;
};

export type CopilotStreamSend = (
  event: "progress" | "complete" | "error",
  data: Record<string, unknown>,
) => boolean;

export const COPILOT_KERNEL_UNDO_MAX_DEPTH = 5;
export const COPILOT_MEMORY_MAX_TURNS = 10;

export const COPILOT_COST_LABELS: Record<CopilotCostTier, string> = {
  free: "Free — no credits",
  "ai-standard": "AI — 1 credit",
};

export type CopilotMemoryRole = "user" | "assistant";

export type CopilotMemoryTurn = {
  role: CopilotMemoryRole;
  command?: string;
  summary: string;
  capability?: string;
  createdAt: string;
};

export type CopilotChatTurn = {
  id: string;
  role: CopilotMemoryRole;
  content: string;
  capability?: string;
  at: string;
};

export type CopilotReviewResult = {
  score: number;
  grade: string;
  summary: string;
  recommendations: string[];
};

export type CopilotCrossProductSplit = {
  websiteCommand?: string;
  appCommand?: string;
  linkedGenerationId?: string;
};
