/**
 * AI usage credit lease: authorize before work, settle only after success.
 *
 * Flow:
 *   beginAiUsage → (generate) → lease.settle() on success
 *                              → lease.release() on failure (refund if charged)
 *
 * Settlement is idempotent per operationId. Release is a no-op when nothing
 * was settled (settle-after-success model), and an idempotent refund if a
 * charge already exists for the same reference.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import {
  assertSufficientCredits,
  consumeCreditsForUsage,
  refundCreditsForUsage,
  type ConsumeCreditsResult,
  type RefundCreditsResult,
} from "@/lib/billing/credits";
import { logger } from "@/lib/logger";

export const AI_USAGE_CREDIT_AMOUNT = 1;

export type AiUsageLease = {
  operationId: string;
  userId: string;
  resource: string;
  amount: number;
  /** Final charge — safe to call more than once for the same lease. */
  settle: (client?: SupabaseClient) => Promise<ConsumeCreditsResult>;
  /**
   * Failure path. Refunds a settled charge for this operationId if present;
   * no-ops when settle never ran. Safe to call more than once.
   */
  release: (client?: SupabaseClient) => Promise<RefundCreditsResult>;
};

export type BeginAiUsageResult =
  | { ok: false; response: NextResponse }
  | { ok: true; lease: AiUsageLease };

function creditBlockedResponse(credits: ConsumeCreditsResult & { ok: false }) {
  const status = credits.code === "INSUFFICIENT_CREDITS" ? 402 : 503;
  return NextResponse.json(
    {
      error: credits.error,
      code: credits.code,
      balance: credits.balance.balance,
    },
    { status },
  );
}

export function createAiUsageLease(params: {
  supabase: SupabaseClient;
  userId: string;
  resource: string;
  amount?: number;
  operationId?: string;
}): AiUsageLease {
  const amount = params.amount ?? AI_USAGE_CREDIT_AMOUNT;
  const operationId = params.operationId?.trim() || randomUUID();
  let settled = false;

  return {
    operationId,
    userId: params.userId,
    resource: params.resource,
    amount,
    async settle(client = params.supabase) {
      const result = await consumeCreditsForUsage(
        client,
        params.userId,
        params.resource,
        amount,
        operationId,
      );
      if (result.ok) {
        settled = true;
      } else {
        logger.error(
          "AI usage settle failed",
          "billing.ai-usage",
          {
            userId: params.userId,
            resource: params.resource,
            operationId,
            code: result.code,
          },
        );
      }
      return result;
    },
    async release(client = params.supabase) {
      // Settle-after-success: nothing charged yet → auditable no-op.
      if (!settled) {
        return {
          ok: true as const,
          skipped: true,
          balance: {
            user_id: params.userId,
            balance: 0,
            lifetime_purchased: 0,
            lifetime_used: 0,
            updated_at: new Date().toISOString(),
          },
        };
      }

      const result = await refundCreditsForUsage(
        client,
        params.userId,
        params.resource,
        amount,
        operationId,
      );
      if (!result.ok) {
        logger.error(
          "AI usage release/refund failed",
          "billing.ai-usage",
          {
            userId: params.userId,
            resource: params.resource,
            operationId,
          },
        );
      }
      return result;
    },
  };
}

/**
 * Authorize AI work: caller must still pass rate-limit separately or use
 * beginAiUsage from rate-limit.ts which combines both.
 */
export async function authorizeAiUsageCredits(
  supabase: SupabaseClient,
  userId: string,
  resource: string,
  amount = AI_USAGE_CREDIT_AMOUNT,
  operationId?: string,
): Promise<BeginAiUsageResult> {
  const credits = await assertSufficientCredits(supabase, userId, amount);
  if (!credits.ok) {
    return { ok: false, response: creditBlockedResponse(credits) };
  }

  return {
    ok: true,
    lease: createAiUsageLease({
      supabase,
      userId,
      resource,
      amount,
      operationId,
    }),
  };
}
