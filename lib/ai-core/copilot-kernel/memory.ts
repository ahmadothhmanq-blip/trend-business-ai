/**
 * Copilot Memory Engine — turn formatting and command enrichment (Phase 5).
 */

import {
  COPILOT_MEMORY_MAX_TURNS,
  type CopilotMemoryTurn,
} from "@/lib/ai-core/copilot-kernel/types";

export function truncateMemoryTurns(
  turns: CopilotMemoryTurn[],
  max = COPILOT_MEMORY_MAX_TURNS,
): CopilotMemoryTurn[] {
  return turns.slice(-max);
}

/**
 * Build a concise memory prefix for LLM/routing enrichment.
 */
export function buildMemoryPromptPrefix(turns: CopilotMemoryTurn[]): string {
  const recent = truncateMemoryTurns(turns);
  if (!recent.length) return "";

  const lines = recent.map((turn) => {
    const label = turn.role === "user" ? "User" : "Copilot";
    const text = turn.command?.trim() || turn.summary;
    return `${label}: ${text}`;
  });

  return `Prior conversation context:\n${lines.join("\n")}\n\nCurrent request:`;
}

/**
 * Enrich a command with prior session memory when available.
 */
export function enrichCommandWithMemory(
  command: string,
  turns: CopilotMemoryTurn[],
): string {
  const trimmed = command.trim();
  if (!trimmed || !turns.length) return trimmed;

  const prefix = buildMemoryPromptPrefix(turns);
  if (!prefix) return trimmed;

  return `${prefix}\n${trimmed}`;
}

export function memoryTurnsToChatThread(
  turns: CopilotMemoryTurn[],
): Array<{
  id: string;
  role: CopilotMemoryTurn["role"];
  content: string;
  capability?: string;
  at: string;
}> {
  return turns.map((turn, index) => ({
    id: `${turn.createdAt}-${index}`,
    role: turn.role,
    content: turn.role === "user" ? turn.command || turn.summary : turn.summary,
    capability: turn.capability,
    at: turn.createdAt,
  }));
}
