import type { SupabaseClient } from "@supabase/supabase-js";
import { getBillingAdapter } from "@/lib/billing/adapters";
import { getConfiguredBillingProviders, isBillingConfigured } from "@/lib/billing/config";
import { ensureCreditBalance, grantPurchasedCredits, grantSubscriptionCredits } from "@/lib/billing/credits";
import { getOptionalSiteUrl } from "@/lib/env";
import { logger } from "@/lib/logger";
import type {
  BillingCheckoutSession,
  BillingInterval,
  BillingInvoice,
  BillingProviderId,
  BillingStatusResponse,
  BillingSubscription,
  CreditPack,
} from "@/types/billing";
import type { SubscriptionPlan } from "@/types/platform";

function isMissingTable(error: { code?: string } | null | undefined) {
  return error?.code === "42P01";
}

function periodEnd(interval: BillingInterval, from = new Date()) {
  const end = new Date(from);
  if (interval === "yearly") end.setFullYear(end.getFullYear() + 1);
  else end.setMonth(end.getMonth() + 1);
  return end;
}

function invoiceNumber() {
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `INV-${stamp}-${rand}`;
}

export class BillingManager {
  constructor(private supabase: SupabaseClient) {}

  async getStatus(userId: string): Promise<BillingStatusResponse> {
    const providersConfigured = getConfiguredBillingProviders();
    const credits = await ensureCreditBalance(this.supabase, userId);

    const { data: subscription, error: subError } = await this.supabase
      .from("billing_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .in("status", ["active", "trialing", "past_due"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subError && !isMissingTable(subError)) {
      logger.error("Failed to load subscription", "billing.manager", { userId }, subError);
    }

    const { data: invoices, error: invError } = await this.supabase
      .from("billing_invoices")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(25);

    if (invError && !isMissingTable(invError)) {
      logger.error("Failed to load invoices", "billing.manager", { userId }, invError);
    }

    const { data: packs } = await this.supabase
      .from("credit_packs")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    const activeSub = (subscription as BillingSubscription | null) ?? null;

    return {
      currentPlanId: activeSub?.plan_id ?? "free",
      subscription: activeSub,
      credits,
      invoices: (invoices as BillingInvoice[] | null) ?? [],
      creditPacks: (packs as CreditPack[] | null) ?? defaultCreditPacks(),
      providersConfigured,
      billingConfigured: isBillingConfigured(),
    };
  }

  async createSubscriptionCheckout(params: {
    userId: string;
    planId: string;
    interval: BillingInterval;
    provider: BillingProviderId;
    email?: string | null;
  }) {
    if (params.planId === "free") {
      throw new Error("Free plan does not require checkout.");
    }

    const plan = await this.requirePlan(params.planId);
    const amountCents =
      params.interval === "monthly"
        ? Math.round(plan.price_monthly * 100)
        : Math.round(plan.price_yearly * 100);

    if (amountCents <= 0) {
      throw new Error("Selected plan has no payable price.");
    }

    const siteUrl = getOptionalSiteUrl();
    const sessionId = crypto.randomUUID();
    const adapter = getBillingAdapter(params.provider);

    const checkout = await adapter.createCheckout({
      purpose: "subscription",
      amountCents,
      currency: "USD",
      description: `${plan.name} (${params.interval})`,
      successUrl: `${siteUrl}/dashboard/billing?checkout=success&session=${sessionId}`,
      cancelUrl: `${siteUrl}/dashboard/billing?checkout=canceled&session=${sessionId}`,
      customId: sessionId,
      billingInterval: params.interval,
      preferCard: params.provider === "card",
    });

    const { data, error } = await this.supabase
      .from("billing_checkout_sessions")
      .insert({
        id: sessionId,
        user_id: params.userId,
        purpose: "subscription",
        provider: params.provider,
        status: "pending",
        plan_id: params.planId,
        billing_interval: params.interval,
        amount_cents: amountCents,
        currency: "USD",
        provider_order_id: checkout.providerSessionId,
        approval_url: checkout.approvalUrl,
        metadata: { email: params.email ?? null },
      })
      .select("*")
      .single();

    if (error) throw error;
    return data as BillingCheckoutSession;
  }

  async createCreditsCheckout(params: {
    userId: string;
    packId: string;
    provider: BillingProviderId;
    email?: string | null;
  }) {
    const pack = await this.requireCreditPack(params.packId);
    const siteUrl = getOptionalSiteUrl();
    const sessionId = crypto.randomUUID();
    const adapter = getBillingAdapter(params.provider);

    const checkout = await adapter.createCheckout({
      purpose: "credits",
      amountCents: pack.price_cents,
      currency: pack.currency || "USD",
      description: pack.name,
      successUrl: `${siteUrl}/dashboard/billing?checkout=success&session=${sessionId}`,
      cancelUrl: `${siteUrl}/dashboard/billing?checkout=canceled&session=${sessionId}`,
      customId: sessionId,
      preferCard: params.provider === "card",
    });

    const { data, error } = await this.supabase
      .from("billing_checkout_sessions")
      .insert({
        id: sessionId,
        user_id: params.userId,
        purpose: "credits",
        provider: params.provider,
        status: "pending",
        credit_pack_id: params.packId,
        amount_cents: pack.price_cents,
        currency: pack.currency || "USD",
        provider_order_id: checkout.providerSessionId,
        approval_url: checkout.approvalUrl,
        metadata: { email: params.email ?? null, credits: pack.credits },
      })
      .select("*")
      .single();

    if (error) throw error;
    return data as BillingCheckoutSession;
  }

  async completeCheckoutSession(sessionId: string, userId?: string) {
    const { data: session, error } = await this.supabase
      .from("billing_checkout_sessions")
      .select("*")
      .eq("id", sessionId)
      .maybeSingle();

    if (error) throw error;
    if (!session) throw new Error("Checkout session not found.");
    if (userId && session.user_id !== userId) throw new Error("Checkout session mismatch.");

    const typed = session as BillingCheckoutSession;
    if (typed.status === "completed") {
      return { alreadyCompleted: true as const, session: typed };
    }

    if (!typed.provider_order_id) throw new Error("Checkout session has no provider order.");

    const adapter = getBillingAdapter(typed.provider);
    const capture = await adapter.capturePayment(typed.provider_order_id);

    if (capture.status !== "COMPLETED" && capture.status !== "APPROVED") {
      throw new Error(`Payment not completed (status: ${capture.status}).`);
    }

    await this.fulfillSession(typed, capture.providerPaymentId);
    return { alreadyCompleted: false as const, session: typed };
  }

  async fulfillByProviderOrder(providerOrderId: string, providerPaymentId?: string) {
    const { data: session, error } = await this.supabase
      .from("billing_checkout_sessions")
      .select("*")
      .eq("provider_order_id", providerOrderId)
      .maybeSingle();

    if (error) throw error;
    if (!session) {
      logger.warn("No checkout session for provider order", "billing.manager", { providerOrderId });
      return null;
    }

    const typed = session as BillingCheckoutSession;
    if (typed.status === "completed") return typed;
    await this.fulfillSession(typed, providerPaymentId ?? providerOrderId);
    return typed;
  }

  private async fulfillSession(session: BillingCheckoutSession, providerPaymentId: string) {
    if (session.purpose === "subscription") {
      await this.activateSubscription(session, providerPaymentId);
    } else {
      await this.deliverCredits(session, providerPaymentId);
    }

    await this.supabase
      .from("billing_checkout_sessions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", session.id);
  }

  private async activateSubscription(session: BillingCheckoutSession, providerPaymentId: string) {
    if (!session.plan_id || !session.billing_interval) {
      throw new Error("Subscription checkout missing plan or interval.");
    }

    const plan = await this.requirePlan(session.plan_id);
    const start = new Date();
    const end = periodEnd(session.billing_interval, start);

    // Cancel prior active subscriptions for this user
    await this.supabase
      .from("billing_subscriptions")
      .update({
        status: "canceled",
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", session.user_id)
      .in("status", ["active", "trialing", "past_due"]);

    const { data: subscription, error } = await this.supabase
      .from("billing_subscriptions")
      .insert({
        user_id: session.user_id,
        plan_id: session.plan_id,
        billing_interval: session.billing_interval,
        status: "active",
        provider: session.provider,
        provider_subscription_id: session.provider_order_id,
        amount_cents: session.amount_cents,
        currency: session.currency,
        current_period_start: start.toISOString(),
        current_period_end: end.toISOString(),
        metadata: { checkout_session_id: session.id },
      })
      .select("*")
      .single();

    if (error) throw error;

    await this.createPaidInvoice({
      userId: session.user_id,
      subscriptionId: (subscription as BillingSubscription).id,
      provider: session.provider,
      amountCents: session.amount_cents,
      currency: session.currency,
      description: `${plan.name} subscription (${session.billing_interval})`,
      providerPaymentId,
      lineItems: [
        {
          description: `${plan.name} — ${session.billing_interval}`,
          amount_cents: session.amount_cents,
          quantity: 1,
        },
      ],
    });

    const monthlyCredits = Number(plan.limits?.credits_monthly ?? 0);
    if (monthlyCredits > 0) {
      await grantSubscriptionCredits(
        this.supabase,
        session.user_id,
        monthlyCredits,
        session.plan_id,
        (subscription as BillingSubscription).id,
      );
    }

    await this.supabase.from("billing_customers").upsert(
      {
        user_id: session.user_id,
        email: (session.metadata?.email as string | null) ?? null,
        default_provider: session.provider,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
  }

  private async deliverCredits(session: BillingCheckoutSession, providerPaymentId: string) {
    if (!session.credit_pack_id) throw new Error("Credits checkout missing pack id.");
    const pack = await this.requireCreditPack(session.credit_pack_id);

    await grantPurchasedCredits(
      this.supabase,
      session.user_id,
      pack.credits,
      pack.id,
      session.provider,
      session.id,
    );

    await this.createPaidInvoice({
      userId: session.user_id,
      subscriptionId: null,
      provider: session.provider,
      amountCents: session.amount_cents,
      currency: session.currency,
      description: `Credit pack: ${pack.name}`,
      providerPaymentId,
      lineItems: [
        {
          description: pack.name,
          amount_cents: session.amount_cents,
          quantity: 1,
        },
      ],
    });
  }

  private async createPaidInvoice(params: {
    userId: string;
    subscriptionId: string | null;
    provider: BillingProviderId;
    amountCents: number;
    currency: string;
    description: string;
    providerPaymentId: string;
    lineItems: BillingInvoice["line_items"];
  }) {
    const { error } = await this.supabase.from("billing_invoices").insert({
      user_id: params.userId,
      subscription_id: params.subscriptionId,
      invoice_number: invoiceNumber(),
      status: "paid",
      description: params.description,
      amount_cents: params.amountCents,
      currency: params.currency,
      provider: params.provider,
      provider_payment_id: params.providerPaymentId,
      line_items: params.lineItems,
      paid_at: new Date().toISOString(),
    });

    if (error && !isMissingTable(error)) throw error;
  }

  async cancelSubscription(userId: string, immediately = false) {
    const { data: subscription, error } = await this.supabase
      .from("billing_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .in("status", ["active", "trialing", "past_due"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!subscription) throw new Error("No active subscription to cancel.");

    const typed = subscription as BillingSubscription;
    const updates = immediately
      ? {
          status: "canceled" as const,
          cancel_at_period_end: false,
          canceled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      : {
          cancel_at_period_end: true,
          canceled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

    const { data, error: updateError } = await this.supabase
      .from("billing_subscriptions")
      .update(updates)
      .eq("id", typed.id)
      .select("*")
      .single();

    if (updateError) throw updateError;
    return data as BillingSubscription;
  }

  private async requirePlan(planId: string) {
    const { data, error } = await this.supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error(`Plan not found: ${planId}`);
    return data as SubscriptionPlan;
  }

  private async requireCreditPack(packId: string) {
    const { data, error } = await this.supabase
      .from("credit_packs")
      .select("*")
      .eq("id", packId)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      if (isMissingTable(error)) {
        const fallback = defaultCreditPacks().find((p) => p.id === packId);
        if (fallback) return fallback;
      }
      throw error;
    }
    if (!data) throw new Error(`Credit pack not found: ${packId}`);
    return data as CreditPack;
  }
}

function defaultCreditPacks(): CreditPack[] {
  return [
    { id: "credits_100", name: "100 Credits", credits: 100, price_cents: 900, currency: "USD", is_active: true, sort_order: 1 },
    { id: "credits_500", name: "500 Credits", credits: 500, price_cents: 3900, currency: "USD", is_active: true, sort_order: 2 },
    { id: "credits_2000", name: "2,000 Credits", credits: 2000, price_cents: 9900, currency: "USD", is_active: true, sort_order: 3 },
  ];
}

export function createBillingManager(supabase: SupabaseClient) {
  return new BillingManager(supabase);
}
