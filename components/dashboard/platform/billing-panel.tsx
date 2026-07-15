"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, CreditCard, Crown, FileText, Loader2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
  DashboardPanel,
} from "@/components/dashboard/ui/dashboard-card";
import { cn } from "@/lib/utils";
import type { SubscriptionPlan } from "@/types/platform";
import type {
  BillingInvoice,
  BillingProviderId,
  BillingStatusResponse,
  CreditPack,
} from "@/types/billing";

function formatMoney(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function redirectToCheckout(approvalUrl: string) {
  // Navigate via assign so React Compiler immutability lint allows the redirect.
  window.location.assign(approvalUrl);
}

export function BillingPanel() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [provider, setProvider] = useState<BillingProviderId>("paypal");
  const [status, setStatus] = useState<BillingStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionKey, setActionKey] = useState<string | null>(null);

  const currentPlan = status?.currentPlanId ?? "free";

  const refreshBilling = useCallback(async () => {
    const [plansRes, statusRes] = await Promise.all([
      fetch("/api/platform/plans"),
      fetch("/api/platform/billing"),
    ]);

    if (plansRes.ok) {
      const d = await plansRes.json();
      setPlans(d.plans ?? []);
    }

    if (statusRes.ok) {
      const d = (await statusRes.json()) as BillingStatusResponse;
      setStatus(d);
      if (d.providersConfigured?.length) {
        setProvider((prev) => (d.providersConfigured.includes(prev) ? prev : d.providersConfigured[0]));
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        await refreshBilling();

        const params = new URLSearchParams(window.location.search);
        const checkout = params.get("checkout");
        const sessionId = params.get("session");
        if (checkout === "success" && sessionId) {
          const res = await fetch("/api/platform/billing/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          });
          const data = await res.json();
          if (!cancelled) {
            if (!res.ok) {
              toast.error(data.error ?? "Could not complete payment.");
            } else {
              toast.success(data.alreadyCompleted ? "Payment already recorded." : "Payment completed.");
              if (data.status) setStatus(data.status);
              else await refreshBilling();
            }
            const url = new URL(window.location.href);
            url.searchParams.delete("checkout");
            url.searchParams.delete("session");
            window.history.replaceState({}, "", url.pathname);
          }
        }
      } catch {
        if (!cancelled) toast.error("Could not load billing.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshBilling]);

  async function startSubscriptionCheckout(planId: string) {
    setActionKey(`plan:${planId}`);
    try {
      const res = await fetch("/api/platform/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, interval: billing, provider }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Checkout failed.");
        return;
      }
      if (data.approvalUrl) {
        redirectToCheckout(data.approvalUrl);
        return;
      }
      toast.error("No payment approval URL returned.");
    } catch {
      toast.error("Checkout failed.");
    } finally {
      setActionKey(null);
    }
  }

  async function startCreditsCheckout(pack: CreditPack) {
    setActionKey(`pack:${pack.id}`);
    try {
      const res = await fetch("/api/platform/billing/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId: pack.id, provider }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Credits checkout failed.");
        return;
      }
      if (data.approvalUrl) {
        redirectToCheckout(data.approvalUrl);
        return;
      }
      toast.error("No payment approval URL returned.");
    } catch {
      toast.error("Credits checkout failed.");
    } finally {
      setActionKey(null);
    }
  }

  async function cancelSubscription() {
    setActionKey("cancel");
    try {
      const res = await fetch("/api/platform/billing/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ immediately: false }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not cancel subscription.");
        return;
      }
      toast.success("Subscription will end at the current period.");
      await refreshBilling();
    } catch {
      toast.error("Could not cancel subscription.");
    } finally {
      setActionKey(null);
    }
  }

  const invoices: BillingInvoice[] = status?.invoices ?? [];
  const packs: CreditPack[] = status?.creditPacks ?? [];
  const subscription = status?.subscription ?? null;
  const providers = status?.providersConfigured ?? [];

  return (
    <div className="space-y-6">
      <DashboardPanel className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <CreditCard className="size-5 text-premium-gold-light" />
          <div>
            <p className="text-sm font-bold text-white">
              Current Plan:{" "}
              <span className="text-premium-gold-light capitalize">
                {loading ? "…" : currentPlan}
              </span>
            </p>
            <p className="text-xs text-white/40">
              {subscription
                ? `${subscription.billing_interval} · renews ${formatDate(subscription.current_period_end)}${
                    subscription.cancel_at_period_end ? " · canceling" : ""
                  }`
                : "Upgrade to unlock more features and higher limits"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.02] p-0.5">
            {(["monthly", "yearly"] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition-all",
                  billing === b ? "bg-premium-gold/15 text-premium-gold-light" : "text-white/40 hover:text-white/60",
                )}
              >
                {b === "monthly" ? "Monthly" : "Yearly"}
                {b === "yearly" && <span className="ml-1 text-green-400">-17%</span>}
              </button>
            ))}
          </div>
          {providers.length > 0 && (
            <div className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.02] p-0.5">
              {providers.map((p) => (
                <button
                  key={p}
                  onClick={() => setProvider(p)}
                  className={cn(
                    "rounded-md px-3 py-1 text-xs font-medium transition-all capitalize",
                    provider === p ? "bg-premium-gold/15 text-premium-gold-light" : "text-white/40 hover:text-white/60",
                  )}
                >
                  {p === "card" ? "Card" : "PayPal"}
                </button>
              ))}
            </div>
          )}
        </div>
      </DashboardPanel>

      {!status?.billingConfigured && !loading && (
        <DashboardPanel className="border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-100/80">
          Payment providers are not configured yet. Set <code className="text-amber-50">PAYPAL_CLIENT_ID</code> and{" "}
          <code className="text-amber-50">PAYPAL_CLIENT_SECRET</code> to enable checkout.
        </DashboardPanel>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          const price = billing === "monthly" ? plan.price_monthly : Math.round(plan.price_yearly / 12);
          const busy = actionKey === `plan:${plan.id}`;

          return (
            <DashboardPanel
              key={plan.id}
              className={cn("flex flex-col p-5", isCurrent && "border-premium-gold/30 ring-1 ring-premium-gold/20")}
            >
              {plan.id === "pro" && (
                <div className="mb-3 flex items-center gap-1 self-start rounded-full bg-premium-gold/15 px-2 py-0.5 text-[10px] font-bold text-premium-gold-light">
                  <Crown className="size-3" /> Most Popular
                </div>
              )}
              <h3 className="text-lg font-black text-white">{plan.name}</h3>
              <p className="mt-1 text-xs text-white/40">{plan.description}</p>
              <div className="mt-4">
                <span className="text-3xl font-black text-white">${price}</span>
                <span className="text-xs text-white/30">/mo</span>
              </div>
              <ul className="mt-4 flex-1 space-y-2">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-white/60">
                    <Check className="mt-0.5 size-3 flex-shrink-0 text-premium-gold-light" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className={cn(
                  "mt-5 w-full rounded-xl font-bold",
                  isCurrent ? "border border-white/10 bg-transparent text-white/50" : "btn-gold text-luxury-black",
                )}
                disabled={isCurrent || plan.id === "free" || busy || !status?.billingConfigured}
                onClick={() => startSubscriptionCheckout(plan.id)}
              >
                {busy ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : isCurrent ? (
                  "Current Plan"
                ) : (
                  `Upgrade to ${plan.name}`
                )}
              </Button>
            </DashboardPanel>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <Wallet className="size-4 text-premium-gold-light" /> Credits
            </DashboardCardTitle>
            <DashboardCardDescription>
              Balance: <span className="text-white">{status?.credits.balance ?? 0}</span> · Used:{" "}
              {status?.credits.lifetime_used ?? 0}
            </DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-3">
            {packs.length === 0 && (
              <p className="text-xs text-white/40">Credit packs will appear after billing migration is applied.</p>
            )}
            {packs.map((pack) => {
              const busy = actionKey === `pack:${pack.id}`;
              return (
                <div
                  key={pack.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{pack.name}</p>
                    <p className="text-xs text-white/40">{formatMoney(pack.price_cents, pack.currency)}</p>
                  </div>
                  <Button
                    size="sm"
                    className="btn-gold rounded-lg text-luxury-black"
                    disabled={busy || !status?.billingConfigured}
                    onClick={() => startCreditsCheckout(pack)}
                  >
                    {busy ? <Loader2 className="size-3.5 animate-spin" /> : "Buy"}
                  </Button>
                </div>
              );
            })}
            {subscription && !subscription.cancel_at_period_end && (
              <Button
                variant="outline"
                className="mt-2 w-full border-white/10 text-white/70"
                disabled={actionKey === "cancel"}
                onClick={cancelSubscription}
              >
                {actionKey === "cancel" ? <Loader2 className="size-4 animate-spin" /> : "Cancel subscription at period end"}
              </Button>
            )}
          </DashboardCardContent>
        </DashboardCard>

        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <FileText className="size-4 text-premium-gold-light" /> Billing history
            </DashboardCardTitle>
            <DashboardCardDescription>Paid invoices and receipts</DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-2">
            {invoices.length === 0 && (
              <p className="text-xs text-white/40">No invoices yet. Completed payments appear here.</p>
            )}
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{invoice.description || invoice.invoice_number}</p>
                  <p className="text-xs text-white/40">
                    {invoice.invoice_number} · {formatDate(invoice.paid_at ?? invoice.created_at)} ·{" "}
                    <span className="capitalize">{invoice.status}</span>
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-premium-gold-light">
                  {formatMoney(invoice.amount_cents, invoice.currency)}
                </p>
              </div>
            ))}
          </DashboardCardContent>
        </DashboardCard>
      </div>
    </div>
  );
}
