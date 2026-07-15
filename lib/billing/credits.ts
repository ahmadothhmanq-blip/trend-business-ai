import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreditBalance, CreditLedgerReason } from "@/types/billing";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { isProductionRuntime } from "@/lib/seo/site";

const DEFAULT_FREE_CREDITS = 50;

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
    return {
      user_id: userId,
      balance: initialBalance,
      lifetime_purchased: 0,
      lifetime_used: 0,
      updated_at: new Date().toISOString(),
    };
  }

  if (data) return data as CreditBalance;

  const writer = writeClient(supabase);
  if (!writer) {
    return {
      user_id: userId,
      balance: 0,
      lifetime_purchased: 0,
      lifetime_used: 0,
      updated_at: new Date().toISOString(),
    };
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
      return {
        user_id: userId,
        balance: initialBalance,
        lifetime_purchased: 0,
        lifetime_used: 0,
        updated_at: new Date().toISOString(),
      };
    }
    const { data: again } = await supabase
      .from("credit_balances")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (again) return again as CreditBalance;
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

  return created as CreditBalance;
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

/**
 * Usage-based credit update via SECURITY DEFINER RPC when available.
 * Fails closed in production when billing is misconfigured.
 */
export async function consumeCreditsForUsage(
  supabase: SupabaseClient,
  userId: string,
  resource: string,
  amount = 1,
): Promise<ConsumeCreditsResult> {
  try {
    const { data, error } = await supabase.rpc("consume_credits", {
      p_user_id: userId,
      p_amount: amount,
      p_resource: resource,
      p_reference_id: null,
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
      const balance = await ensureCreditBalance(supabase, userId).catch(() => ({
        user_id: userId,
        balance: 0,
        lifetime_purchased: 0,
        lifetime_used: 0,
        updated_at: new Date().toISOString(),
      }));
      return {
        ok: false,
        balance,
        error: "Insufficient credits. Purchase credits or upgrade your plan.",
        code: "INSUFFICIENT_CREDITS",
      };
    }

    // RPC missing — fall back carefully
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

      const balance = await ensureCreditBalance(supabase, userId);
      if (balance.balance < amount) {
        return {
          ok: false,
          balance,
          error: "Insufficient credits. Purchase credits or upgrade your plan.",
          code: "INSUFFICIENT_CREDITS",
        };
      }
      const next = await applyCreditDelta(supabase, {
        userId,
        delta: -amount,
        reason: "usage",
        resource,
        metadata: { amount },
      });
      return { ok: true, balance: next, skipped: true };
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
