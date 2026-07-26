/**
 * Copilot session memory persistence (Phase 5).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  truncateMemoryTurns,
} from "@/lib/ai-core/copilot-kernel/memory";
import type {
  CopilotMemoryRole,
  CopilotMemoryTurn,
} from "@/lib/ai-core/copilot-kernel/types";

function isMissingTableError(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return (
    error.code === "42P01" ||
    (typeof error.message === "string" &&
      (error.message.includes("relation") ||
        error.message.includes("does not exist")))
  );
}

export async function loadCopilotSessionMemory(
  supabase: SupabaseClient,
  params: {
    userId: string;
    productId: string;
    generationId: string;
    sessionId: string;
  },
): Promise<CopilotMemoryTurn[]> {
  const { data, error } = await supabase
    .from("copilot_session_memory")
    .select("role, command, summary, capability, created_at")
    .eq("user_id", params.userId)
    .eq("product_id", params.productId)
    .eq("generation_id", params.generationId)
    .eq("session_id", params.sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    if (isMissingTableError(error)) return [];
    throw new Error(error.message);
  }

  return truncateMemoryTurns(
    (data ?? []).map((row) => ({
      role: row.role as CopilotMemoryRole,
      command: (row.command as string | null) ?? undefined,
      summary: (row.summary as string) || "",
      capability: (row.capability as string | null) ?? undefined,
      createdAt: row.created_at as string,
    })),
  );
}

export async function appendCopilotSessionMemory(
  supabase: SupabaseClient,
  params: {
    userId: string;
    productId: string;
    generationId: string;
    sessionId: string;
    role: CopilotMemoryRole;
    command?: string;
    summary: string;
    capability?: string;
  },
): Promise<void> {
  const { error } = await supabase.from("copilot_session_memory").insert({
    user_id: params.userId,
    product_id: params.productId,
    generation_id: params.generationId,
    session_id: params.sessionId,
    role: params.role,
    command: params.command ?? null,
    summary: params.summary,
    capability: params.capability ?? null,
  });

  if (error && !isMissingTableError(error)) {
    throw new Error(error.message);
  }
}

export async function recordCopilotExchange(
  supabase: SupabaseClient,
  params: {
    userId: string;
    productId: string;
    generationId: string;
    sessionId: string;
    command: string;
    summary: string;
    capability?: string;
  },
): Promise<CopilotMemoryTurn[]> {
  await appendCopilotSessionMemory(supabase, {
    ...params,
    role: "user",
    command: params.command,
    summary: params.command,
  });
  await appendCopilotSessionMemory(supabase, {
    ...params,
    role: "assistant",
    summary: params.summary,
    capability: params.capability,
  });

  return loadCopilotSessionMemory(supabase, params);
}
