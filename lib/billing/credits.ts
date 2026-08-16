import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreditBalance, CreditLedgerReason } from "@/types/billing";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { isProductionRuntime } from "@/lib/seo/site";
import {
  getMemoryCreditBalance,
  isMemoryCreditHarnessEnabled,
  memoryConsumeCredits,
  memoryRefundCredits,
} from "@/lib/billing/credit-ledger-memory";

const DEFAULT_FREE_CREDITS = 50;
/** Development-only balance surfaced when real credits are depleted or unavailable. */
const DEV_FALLBACK_CREDIT_BALANCE = 1_000_000;

/** Local/test runs only — production always uses real billing. */
export function isDevelopmentCreditsFallback(): boolean {
  return process.env.NODE_ENV !== "production";
}

/**
 * When true, skip real credit writes (local DX).
 * Test harness forces real settlement semantics via in-memory ledger.
 */
export function shouldBypassCreditAccounting(): boolean {
  if (isMemoryCreditHarnessEnabled()) return false;
  return isDevelopmentCreditsFallback();
}

function developmentCreditBalance(userId: string): CreditBalance {
  return {
    user_id: userId,
    balance: DEV_FALLBACK_CREDIT_BALANCE,
    lifetime_purchased: 0,
    lifetime_used: 0,
    updated_at: new Date().toISOString(),
  };
}

function withDevelopmentCreditFallback(userId: string, balance: CreditBalance): CreditBalance {
  if (!isDevelopmentCreditsFallback()) return balance;
  if (balance.balance >= DEV_FALLBACK_CREDIT_BALANCE) return balance;
  return { ...balance, balance: DEV_FALLBACK_CREDIT_BALANCE };
}

function isMissingTable(error: { code?: string; message?: string } | null) {
  return error?.code === "42P01" || error?.code === "PGRST205";
}

function billingOptional() {
  return process.env.BILLING_OPTIONAL === "true" || !isProductionRuntime();
}

function writeClient(preferred?: SupabaseClient) {
  return createAdminClient() ?? preferred ?? null;
}

export async function ensureCreditBalance(
  supabase: SupabaseClient,
  userId: string,
  initialBalance = DEFAULT_FREE_CREDITS,
): Promise<CreditBalance> {
  const { data, error } = await supabase
    .from("credit_balances")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error && !isMissingTable(error)) {
    logger.error("Failed to load credit balance", "billing.credits", { userId }, error);
    throw error;
  }

  if (isMissingTable(error)) {
    if (!billingOptional()) {
      throw Object.assign(new Error("Billing tables missing."), { code: "42P01" });
    }
    return withDevelopmentCreditFallback(userId, {
      user_id: userId,
      balance: initialBalance,
      lifetime_purchased: 0,
      lifetime_used: 0,
      updated_at: new Date().toISOString(),
    });
  }

  if (data) return withDevelopmentCreditFallback(userId, data as CreditBalance);

  const writer = writeClient(supabase);
  if (!writer) {
    if (!billingOptional()) {
      throw new Error("Billing write client unavailable. Set SUPABASE_SERVICE_ROLE_KEY.");
    }
    return withDevelopmentCreditFallback(userId, {
      user_id: userId,
      balance: 0,
      lifetime_purchased: 0,
      lifetime_used: 0,
      updated_at: new Date().toISOString(),
    });
  }

  const { data: created, error: insertError } = await writer
    .from("credit_balances")
    .insert({
      user_id: userId,
      balance: initialBalance,
      lifetime_purchased: 0,
      lifetime_used: 0,
    })
    .select("*")
    .single();

  if (insertError) {
    if (isMissingTable(insertError)) {
      if (!billingOptional()) throw insertError;
      return withDevelopmentCreditFallback(userId, {
        user_id: userId,
        balance: initialBalance,
        lifetime_purchased: 0,
        lifetime_used: 0,
        updated_at: new Date().toISOString(),
      });
    }
    const { data: again } = await supabase
      .from("credit_balances")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (again) return withDevelopmentCreditFallback(userId, again as CreditBalance);
    throw insertError;
  }

  if (initialBalance > 0) {
    await writer.from("credit_ledger").insert({
      user_id: userId,
      delta: initialBalance,
      balance_after: initialBalance,
      reason: "bonus" satisfies CreditLedgerReason,
      resource: "signup",
      metadata: { source: "initial_grant" },
    });
  }

  return withDevelopmentCreditFallback(userId, created as CreditBalance);
}

export async function applyCreditDelta(
  supabase: SupabaseClient,
  params: {
    userId: string;
    delta: number;
    reason: CreditLedgerReason;
    resource?: string;
    referenceId?: string;
    provider?: string;
    metadata?: Record<string, unknown>;
  },
): Promise<CreditBalance> {
  const writer = writeClient(supabase);
  if (!writer) {
    throw new Error("Billing write client unavailable. Set SUPABASE_SERVICE_ROLE_KEY.");
  }

  const current = await ensureCreditBalance(supabase, params.userId);
  const nextBalance = Math.max(0, current.balance + params.delta);

  const lifetime_purchased =
    params.delta > 0 && (params.reason === "purchase" || params.reason === "subscription_grant")
      ? current.lifetime_purchased + params.delta
      : current.lifetime_purchased;
  const lifetime_used =
    params.delta < 0 && params.reason === "usage"
      ? current.lifetime_used + Math.abs(params.delta)
      : current.lifetime_used;

  const { data, error } = await writer
    .from("credit_balances")
    .upsert(
      {
        user_id: params.userId,
        balance: nextBalance,
        lifetime_purchased,
        lifetime_used,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )
    .select("*")
    .single();

  if (error) {
    if (isMissingTable(error) && billingOptional()) {
      return { ...current, balance: nextBalance, lifetime_purchased, lifetime_used };
    }
    throw error;
  }

  await writer.from("credit_ledger").insert({
    user_id: params.userId,
    delta: params.delta,
    balance_after: nextBalance,
    reason: params.reason,
    resource: params.resource ?? null,
    reference_id: params.referenceId ?? null,
    provider: params.provider ?? null,
    metadata: params.metadata ?? {},
  });

  return data as CreditBalance;
}

export type ConsumeCreditsResult =
  | { ok: true; balance: CreditBalance; skipped?: boolean }
  | { ok: false; balance: CreditBalance; error: string; code: "INSUFFICIENT_CREDITS" | "UNAVAILABLE" };

export type RefundCreditsResult =
  | { ok: true; balance: CreditBalance; skipped?: boolean }
  | { ok: false; balance: CreditBalance; error: string; code: "UNAVAILABLE" };

function insufficientResult(
  userId: string,
  balance: CreditBalance,
): ConsumeCreditsResult {
  return {
    ok: false,
    balance,
    error: "Insufficient credits. Purchase credits or upgrade your plan.",
    code: "INSUFFICIENT_CREDITS",
  };
}

/**
 * Soft balance check — does not write the ledger.
 * Used to authorize AI work before generation; settlement happens only on success.
 */
export async function assertSufficientCredits(
  supabase: SupabaseClient,
  userId: string,
  amount = 1,
): Promise<ConsumeCreditsResult> {
  if (isMemoryCreditHarnessEnabled()) {
    const balance = getMemoryCreditBalance(userId);
    if (balance.balance < amount) return insufficientResult(userId, balance);
    return { ok: true, balance };
  }

  if (shouldBypassCreditAccounting()) {
    return {
      ok: true,
      skipped: true,
      balance: developmentCreditBalance(userId),
    };
  }

  try {
    const balance = await ensureCreditBalance(supabase, userId);
    if (balance.balance < amount) {
      return insufficientResult(userId, balance);
    }
    return { ok: true, balance };
  } catch (error) {
    logger.error("Credit balance check failed", "billing.credits", { userId }, error);
    return {
      ok: false,
      balance: {
        user_id: userId,
        balance: 0,
        lifetime_purchased: 0,
        lifetime_used: 0,
        updated_at: new Date().toISOString(),
      },
      error: "Credits unavailable.",
      code: "UNAVAILABLE",
    };
  }
}

/**
 * Final usage settlement. Idempotent when `referenceId` is provided:
 * repeating the same reference never double-charges.
 */
export async function consumeCreditsForUsage(
  supabase: SupabaseClient,
  userId: string,
  resource: string,
  amount = 1,
  referenceId: string | null = null,
): Promise<ConsumeCreditsResult> {
  if (isMemoryCreditHarnessEnabled()) {
    const result = memoryConsumeCredits({
      userId,
      amount,
      resource,
      referenceId,
    });
    if (!result.ok) return insufficientResult(userId, result.balance);
    return { ok: true, balance: result.balance };
  }

  if (shouldBypassCreditAccounting()) {
    return {
      ok: true,
      skipped: true,
      balance: developmentCreditBalance(userId),
    };
  }

  try {
    const rpcClient = writeClient(supabase) ?? supabase;
    const { data, error } = await rpcClient.rpc("consume_credits", {
      p_user_id: userId,
      p_amount: amount,
      p_resource: resource,
      p_reference_id: referenceId,
    });

    if (!error && data) {
      const row = Array.isArray(data) ? data[0] : data;
      return {
        ok: true,
        balance: {
          user_id: userId,
          balance: Number(row?.balance ?? 0),
          lifetime_purchased: 0,
          lifetime_used: Number(row?.lifetime_used ?? 0),
          updated_at: new Date().toISOString(),
        },
      };
    }

    const message = String(error?.message ?? "");
    if (message.includes("INSUFFICIENT_CREDITS")) {
      if (shouldBypassCreditAccounting()) {
        return {
          ok: true,
          skipped: true,
          balance: developmentCreditBalance(userId),
        };
      }
      const balance = await ensureCreditBalance(supabase, userId).catch(() => ({
        user_id: userId,
        balance: 0,
        lifetime_purchased: 0,
        lifetime_used: 0,
        updated_at: new Date().toISOString(),
      }));
      return insufficientResult(userId, balance);
    }

    // RPC missing — fall back carefully (still idempotent when referenceId set)
    if (error && (isMissingTable(error) || error.code === "PGRST202" || message.includes("consume_credits"))) {
      if (!billingOptional()) {
        return {
          ok: false,
          balance: {
            user_id: userId,
            balance: 0,
            lifetime_purchased: 0,
            lifetime_used: 0,
            updated_at: new Date().toISOString(),
          },
          error: "Credits unavailable.",
          code: "UNAVAILABLE",
        };
      }

      if (referenceId) {
        const writer = writeClient(supabase) ?? supabase;
        const { data: existing } = await writer
          .from("credit_ledger")
          .select("id")
          .eq("user_id", userId)
          .eq("reference_id", referenceId)
          .eq("reason", "usage")
          .maybeSingle();
        if (existing) {
          const balance = await ensureCreditBalance(supabase, userId);
          return { ok: true, balance, skipped: true };
        }
      }

      const balance = await ensureCreditBalance(supabase, userId);
      if (balance.balance < amount) {
        if (shouldBypassCreditAccounting()) {
          return {
            ok: true,
            skipped: true,
            balance: developmentCreditBalance(userId),
          };
        }
        return insufficientResult(userId, balance);
      }
      const next = await applyCreditDelta(supabase, {
        userId,
        delta: -amount,
        reason: "usage",
        resource,
        referenceId: referenceId ?? undefined,
        metadata: { amount, settlement: "final" },
      });
      return { ok: true, balance: next };
    }

    throw error;
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code === "42P01" && billingOptional()) {
      return {
        ok: true,
        skipped: true,
        balance: {
          user_id: userId,
          balance: DEFAULT_FREE_CREDITS,
          lifetime_purchased: 0,
          lifetime_used: 0,
          updated_at: new Date().toISOString(),
        },
      };
    }
    logger.error("Credit consumption failed", "billing.credits", { userId, resource }, error);
    return {
      ok: false,
      balance: {
        user_id: userId,
        balance: 0,
        lifetime_purchased: 0,
        lifetime_used: 0,
        updated_at: new Date().toISOString(),
      },
      error: "Credits unavailable.",
      code: "UNAVAILABLE",
    };
  }
}

/**
 * Refund a previously settled usage reference.
 * Idempotent: repeating the same reference never double-refunds.
 * No-op (ok, skipped) when no usage row exists for the reference.
 */
export async function refundCreditsForUsage(
  supabase: SupabaseClient,
  userId: string,
  resource: string,
  amount = 1,
  referenceId: string,
): Promise<RefundCreditsResult> {
  const ref = referenceId.trim();
  if (!ref) {
    return {
      ok: false,
      balance: {
        user_id: userId,
        balance: 0,
        lifetime_purchased: 0,
        lifetime_used: 0,
        updated_at: new Date().toISOString(),
      },
      error: "Refund reference_id required.",
      code: "UNAVAILABLE",
    };
  }

  if (isMemoryCreditHarnessEnabled()) {
    const result = memoryRefundCredits({
      userId,
      amount,
      resource,
      referenceId: ref,
    });
    return { ok: true, balance: result.balance, skipped: result.skipped };
  }

  if (shouldBypassCreditAccounting()) {
    return {
      ok: true,
      skipped: true,
      balance: developmentCreditBalance(userId),
    };
  }

  try {
    const rpcClient = writeClient(supabase) ?? supabase;
    const { data, error } = await rpcClient.rpc("refund_credits", {
      p_user_id: userId,
      p_amount: amount,
      p_resource: resource,
      p_reference_id: ref,
    });

    if (!error && data) {
      const row = Array.isArray(data) ? data[0] : data;
      return {
        ok: true,
        balance: {
          user_id: userId,
          balance: Number(row?.balance ?? 0),
          lifetime_purchased: 0,
          lifetime_used: Number(row?.lifetime_used ?? 0),
          updated_at: new Date().toISOString(),
        },
      };
    }

    const message = String(error?.message ?? "");
    if (error && (isMissingTable(error) || error.code === "PGRST202" || message.includes("refund_credits"))) {
      if (!billingOptional()) {
        return {
          ok: false,
          balance: {
            user_id: userId,
            balance: 0,
            lifetime_purchased: 0,
            lifetime_used: 0,
            updated_at: new Date().toISOString(),
          },
          error: "Credits unavailable.",
          code: "UNAVAILABLE",
        };
      }

      const writer = writeClient(supabase) ?? supabase;
      const { data: existingRefund } = await writer
        .from("credit_ledger")
        .select("id")
        .eq("user_id", userId)
        .eq("reference_id", ref)
        .eq("reason", "refund")
        .maybeSingle();
      if (existingRefund) {
        const balance = await ensureCreditBalance(supabase, userId);
        return { ok: true, balance, skipped: true };
      }

      const { data: usageRow } = await writer
        .from("credit_ledger")
        .select("delta")
        .eq("user_id", userId)
        .eq("reference_id", ref)
        .eq("reason", "usage")
        .maybeSingle();

      if (!usageRow) {
        const balance = await ensureCreditBalance(supabase, userId);
        return { ok: true, balance, skipped: true };
      }

      const usageDelta = Number((usageRow as { delta?: number }).delta ?? 0);
      const refundAmount = Math.min(amount, Math.abs(usageDelta));
      const next = await applyCreditDelta(supabase, {
        userId,
        delta: refundAmount,
        reason: "refund",
        resource,
        referenceId: ref,
        metadata: {
          amount: refundAmount,
          settlement: "refund",
          usage_delta: usageDelta,
        },
      });
      return { ok: true, balance: next };
    }

    throw error;
  } catch (error) {
    logger.error("Credit refund failed", "billing.credits", { userId, resource, referenceId: ref }, error);
    return {
      ok: false,
      balance: {
        user_id: userId,
        balance: 0,
        lifetime_purchased: 0,
        lifetime_used: 0,
        updated_at: new Date().toISOString(),
      },
      error: "Credits unavailable.",
      code: "UNAVAILABLE",
    };
  }
}

export async function grantSubscriptionCredits(
  supabase: SupabaseClient,
  userId: string,
  credits: number,
  planId: string,
  referenceId?: string,
) {
  if (credits <= 0) return ensureCreditBalance(supabase, userId);
  return applyCreditDelta(supabase, {
    userId,
    delta: credits,
    reason: "subscription_grant",
    resource: planId,
    referenceId,
    metadata: { planId },
  });
}

export async function grantPurchasedCredits(
  supabase: SupabaseClient,
  userId: string,
  credits: number,
  packId: string,
  provider?: string,
  referenceId?: string,
) {
  return applyCreditDelta(supabase, {
    userId,
    delta: credits,
    reason: "purchase",
    resource: packId,
    referenceId,
    provider,
    metadata: { packId },
  });
}
