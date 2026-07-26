/**
 * Copilot Phase 5 — shared processor helpers (memory, review echo, thread).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { memoryTurnsToChatThread } from "@/lib/ai-core/copilot-kernel/memory";
import {
  loadCopilotSessionMemory,
  recordCopilotExchange,
} from "@/lib/ai-core/copilot-kernel/memory-service";
import type {
  CopilotChatTurn,
  CopilotMemoryTurn,
  CopilotReviewResult,
} from "@/lib/ai-core/copilot-kernel/types";

export const COPILOT_PRODUCT_WEBSITE = "website";
export const COPILOT_PRODUCT_APP = "webapp";

export function copilotMemoryEnabled(request: {
  sessionId?: string;
  useMemory?: boolean;
}): boolean {
  const sessionId = request.sessionId?.trim();
  return Boolean(sessionId) && request.useMemory !== false;
}

export async function loadCopilotMemoryTurns(
  supabase: SupabaseClient,
  params: {
    enabled: boolean;
    userId: string;
    productId: string;
    generationId: string;
    sessionId?: string;
  },
): Promise<CopilotMemoryTurn[]> {
  const sessionId = params.sessionId?.trim();
  if (!params.enabled || !sessionId) return [];

  return loadCopilotSessionMemory(supabase, {
    userId: params.userId,
    productId: params.productId,
    generationId: params.generationId,
    sessionId,
  });
}

export type CopilotPhase5Fields = {
  review?: CopilotReviewResult;
  memoryTurnCount?: number;
  thread?: CopilotChatTurn[];
};

export async function finalizeCopilotPhase5<T extends { summary: string; capability: string }>(
  supabase: SupabaseClient,
  params: {
    enabled: boolean;
    userId: string;
    productId: string;
    generationId: string;
    sessionId?: string;
    rawCommand: string;
    result: T;
    includeReview?: boolean;
    mutated?: boolean;
    runReview?: () => CopilotReviewResult;
  },
): Promise<T & CopilotPhase5Fields> {
  const sessionId = params.sessionId?.trim();
  let memoryTurns: CopilotMemoryTurn[] = [];

  if (params.enabled && sessionId) {
    memoryTurns = await recordCopilotExchange(supabase, {
      userId: params.userId,
      productId: params.productId,
      generationId: params.generationId,
      sessionId,
      command: params.rawCommand,
      summary: params.result.summary,
      capability: params.result.capability,
    });
  }

  const review =
    params.includeReview === true &&
    params.mutated === true &&
    params.runReview
      ? params.runReview()
      : undefined;

  return {
    ...params.result,
    ...(review ? { review } : {}),
    ...(params.enabled && sessionId
      ? {
          memoryTurnCount: memoryTurns.length,
          thread: memoryTurnsToChatThread(memoryTurns),
        }
      : {}),
  };
}

export async function echoCopilotThreadOnly(
  supabase: SupabaseClient,
  params: {
    enabled: boolean;
    userId: string;
    productId: string;
    generationId: string;
    sessionId?: string;
  },
): Promise<CopilotPhase5Fields> {
  const sessionId = params.sessionId?.trim();
  if (!params.enabled || !sessionId) return {};

  const memoryTurns = await loadCopilotSessionMemory(supabase, {
    userId: params.userId,
    productId: params.productId,
    generationId: params.generationId,
    sessionId,
  });

  return {
    memoryTurnCount: memoryTurns.length,
    thread: memoryTurnsToChatThread(memoryTurns),
  };
}
