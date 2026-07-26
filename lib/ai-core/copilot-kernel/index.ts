/**
 * Copilot runtime kernel — public exports (Phase 4 + Phase 5).
 */

export type {
  CopilotCostTier,
  CopilotCostHint,
  CopilotRoutingMeta,
  CopilotStreamSend,
  CopilotMemoryRole,
  CopilotMemoryTurn,
  CopilotChatTurn,
  CopilotReviewResult,
  CopilotCrossProductSplit,
} from "@/lib/ai-core/copilot-kernel/types";

export {
  COPILOT_KERNEL_UNDO_MAX_DEPTH,
  COPILOT_MEMORY_MAX_TURNS,
  COPILOT_COST_LABELS,
} from "@/lib/ai-core/copilot-kernel/types";

export { attachCostHint, attachRoutingMeta } from "@/lib/ai-core/copilot-kernel/meta";
export {
  runCopilotStreamLoop,
  type CopilotStreamStepResult,
} from "@/lib/ai-core/copilot-kernel/stream-loop";
export {
  enrichCommandWithMemory,
  buildMemoryPromptPrefix,
  truncateMemoryTurns,
  memoryTurnsToChatThread,
} from "@/lib/ai-core/copilot-kernel/memory";
export {
  loadCopilotSessionMemory,
  appendCopilotSessionMemory,
  recordCopilotExchange,
} from "@/lib/ai-core/copilot-kernel/memory-service";
export { buildCopilotReviewResult } from "@/lib/ai-core/copilot-kernel/review";
export {
  detectCrossProductCommand,
  crossProductAdvisorySummary,
  type CrossProductDetection,
} from "@/lib/ai-core/copilot-kernel/cross-product";
export {
  COPILOT_PRODUCT_WEBSITE,
  COPILOT_PRODUCT_APP,
  copilotMemoryEnabled,
  loadCopilotMemoryTurns,
  finalizeCopilotPhase5,
  echoCopilotThreadOnly,
  type CopilotPhase5Fields,
} from "@/lib/ai-core/copilot-kernel/phase5";
