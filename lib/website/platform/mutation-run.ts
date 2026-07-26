/**
 * Record lightweight ai_runs ledger entries for website blueprint mutations.
 * Does not invoke LayerRunner — audit trail only.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AiRun } from "@/types/database";
import type {
  WebsiteMutationOperation,
  WebsiteCommitInput,
} from "@/lib/website/platform/types";

function isMissingTableError(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return (
    error.code === "42P01" ||
    (typeof error.message === "string" && error.message.includes("relation"))
  );
}

export async function recordWebsiteMutationRun(
  supabase: SupabaseClient,
  params: {
    userId: string;
    generationId: string;
    operation: WebsiteMutationOperation;
    revisionBefore: number;
    revisionAfter: number;
    input: WebsiteCommitInput;
    mutationMeta?: Record<string, unknown>;
    provider?: string | null;
    tokenUsage?: Record<string, number> | null;
    generationTimeMs?: number | null;
  },
): Promise<string | null> {
  const { data, error } = await supabase
    .from("ai_runs")
    .insert({
      user_id: params.userId,
      product_id: params.input.productId ?? "website-builder",
      status: "completed",
      mode: params.input.mode ?? "continue",
      parent_run_id: null,
      brief: {
        mutationType: "website-blueprint-commit",
        operation: params.operation,
        generationId: params.generationId,
        revisionBefore: params.revisionBefore,
        revisionAfter: params.revisionAfter,
        continueInstruction: params.input.continueInstruction ?? null,
        ...params.mutationMeta,
      },
      artifacts: {
        generationId: params.generationId,
        revision: params.revisionAfter,
        parentRevision: params.revisionBefore,
      },
      layers_executed: ["mutation"],
      provider: params.provider ?? null,
      token_usage: params.tokenUsage ?? null,
      generation_time_ms: params.generationTimeMs ?? null,
      error_message: null,
      continue_instruction: params.input.continueInstruction ?? null,
    })
    .select("id")
    .single();

  if (error) {
    if (isMissingTableError(error)) return null;
    console.warn("[website-platform] ai_runs insert failed:", error.message);
    return null;
  }

  return (data as AiRun | null)?.id ?? null;
}
