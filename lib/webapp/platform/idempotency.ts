/**
 * Idempotent webapp commit replay store.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { WebAppIdempotencyCachedResponse } from "@/lib/webapp/platform/types";

export const WEBAPP_COMMIT_IDEMPOTENCY_TTL_DAYS = 7;

function isMissingTableError(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return (
    error.code === "42P01" ||
    (typeof error.message === "string" &&
      (error.message.includes("relation") ||
        error.message.includes("does not exist")))
  );
}

function isMissingColumnError(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return (
    error.code === "42703" ||
    (typeof error.message === "string" && error.message.includes("expires_at"))
  );
}

export async function purgeExpiredWebappIdempotentCommits(
  supabase: SupabaseClient,
): Promise<number> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("webapp_commit_idempotency")
    .delete()
    .lt("expires_at", now)
    .select("id");

  if (error) {
    if (isMissingTableError(error) || isMissingColumnError(error)) return 0;
    throw new Error(error.message);
  }

  return data?.length ?? 0;
}

export async function findWebappIdempotentCommit(
  supabase: SupabaseClient,
  params: {
    userId: string;
    generationId: string;
    idempotencyKey: string;
  },
): Promise<WebAppIdempotencyCachedResponse | null> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("webapp_commit_idempotency")
    .select("response, ai_run_id, expires_at")
    .eq("user_id", params.userId)
    .eq("generation_id", params.generationId)
    .eq("idempotency_key", params.idempotencyKey)
    .maybeSingle();

  if (error) {
    if (isMissingTableError(error)) return null;
    if (isMissingColumnError(error)) {
      const legacy = await supabase
        .from("webapp_commit_idempotency")
        .select("response, ai_run_id")
        .eq("user_id", params.userId)
        .eq("generation_id", params.generationId)
        .eq("idempotency_key", params.idempotencyKey)
        .maybeSingle();
      if (legacy.error) {
        if (isMissingTableError(legacy.error)) return null;
        throw new Error(legacy.error.message);
      }
      if (!legacy.data?.response || typeof legacy.data.response !== "object") {
        return null;
      }
      return {
        response: legacy.data.response as Record<string, unknown>,
        aiRunId: (legacy.data.ai_run_id as string | null) ?? null,
      };
    }
    throw new Error(error.message);
  }

  if (!data?.response || typeof data.response !== "object") return null;
  if (
    data.expires_at &&
    typeof data.expires_at === "string" &&
    data.expires_at <= now
  ) {
    return null;
  }

  return {
    response: data.response as Record<string, unknown>,
    aiRunId: (data.ai_run_id as string | null) ?? null,
  };
}

export async function storeWebappIdempotentCommit(
  supabase: SupabaseClient,
  params: {
    userId: string;
    generationId: string;
    idempotencyKey: string;
    operation: string;
    response: Record<string, unknown>;
    aiRunId: string | null;
  },
): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + WEBAPP_COMMIT_IDEMPOTENCY_TTL_DAYS);

  const { error } = await supabase.from("webapp_commit_idempotency").insert({
    user_id: params.userId,
    generation_id: params.generationId,
    idempotency_key: params.idempotencyKey,
    operation: params.operation,
    response: params.response,
    ai_run_id: params.aiRunId,
    expires_at: expiresAt.toISOString(),
  });

  if (error && !isMissingTableError(error)) {
    if (error.code === "23505") return;
    if (isMissingColumnError(error)) {
      const { error: legacyError } = await supabase
        .from("webapp_commit_idempotency")
        .insert({
          user_id: params.userId,
          generation_id: params.generationId,
          idempotency_key: params.idempotencyKey,
          operation: params.operation,
          response: params.response,
          ai_run_id: params.aiRunId,
        });
      if (legacyError && legacyError.code !== "23505" && !isMissingTableError(legacyError)) {
        throw new Error(legacyError.message);
      }
      return;
    }
    throw new Error(error.message);
  }

  try {
    await purgeExpiredWebappIdempotentCommits(supabase);
  } catch {
    // Non-fatal cleanup.
  }
}
