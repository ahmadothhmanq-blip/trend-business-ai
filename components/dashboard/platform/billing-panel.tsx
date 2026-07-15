"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, CreditCard, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardCard, DashboardCardContent, DashboardCardHeader, DashboardCardTitle, DashboardCardDescription, DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import { cn } from "@/lib/utils";
import type { SubscriptionPlan } from "@/types/platform";

export function BillingPanel() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const currentPlan = "free";

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch("/api/platform/plans");
      if (!res.ok) return;
      const d = await res.json();
      setPlans(d.plans ?? []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  return (
    <div className="space-y-6">
      <DashboardPanel className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <CreditCard className="size-5 text-premium-gold-light" />
          <div>
            <p className="text-sm font-bold text-white">Current Plan: <span className="text-premium-gold-light">Free</span></p>
            <p className="text-xs text-white/40">Upgrade to unlock more features and higher limits</p>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.02] p-0.5">
          {(["monthly", "yearly"] as const).map((b) => (
            <button key={b} onClick={() => setBilling(b)} className={cn("rounded-md px-3 py-1 text-xs font-medium transition-all", billing === b ? "bg-premium-gold/15 text-premium-gold-light" : "text-white/40 hover:text-white/60")}>
              {b === "monthly" ? "Monthly" : "Yearly"}{b === "yearly" && <span className="ml-1 text-green-400">-17%</span>}
            </button>
          ))}
        </div>
      </DashboardPanel>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          const price = billing === "monthly" ? plan.price_monthly : Math.round(plan.price_yearly / 12);

          return (
            <DashboardPanel key={plan.id} className={cn("flex flex-col p-5", isCurrent && "border-premium-gold/30 ring-1 ring-premium-gold/20")}>
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
              <Button className={cn("mt-5 w-full rounded-xl font-bold", isCurrent ? "border border-white/10 bg-transparent text-white/50" : "btn-gold text-luxury-black")} disabled={isCurrent}>
                {isCurrent ? "Current Plan" : `Upgrade to ${plan.name}`}
              </Button>
            </DashboardPanel>
          );
        })}
      </div>
    </div>
  );
}
