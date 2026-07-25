"use client";

import { useCallback, useEffect, useState } from "react";
import { Database, Gauge, ShieldCheck, ToggleLeft } from "lucide-react";
import { DashboardCard, DashboardCardContent, DashboardCardHeader, DashboardCardTitle, DashboardCardDescription, DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import { useWorkspaceT } from "@/lib/i18n/use-scoped-t";
import type { FeatureFlag } from "@/types/platform";

export function AdminPanel() {
  const wt = useWorkspaceT("platform");
  const [stats, setStats] = useState<Record<string, number>>({});
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchAdmin = useCallback(async () => {
    try {
      const res = await fetch("/api/platform/admin");
      if (res.status === 403) { setError(wt("admin.accessRequired")); return; }
      if (!res.ok) return;
      const d = await res.json();
      setStats(d.stats ?? {});
      setFeatureFlags(d.featureFlags ?? []);
    } catch { setError(wt("admin.loadFailed")); }
  }, [wt]);

  useEffect(() => { fetchAdmin(); }, [fetchAdmin]);

  if (error) {
    return (
      <DashboardPanel className="py-12 text-center">
        <ShieldCheck className="mx-auto size-10 text-red-400/30" />
        <p className="mt-4 text-sm font-bold text-white/60">{error}</p>
        <p className="mt-1 text-xs text-white/30">{wt("admin.accessDenied")}</p>
      </DashboardPanel>
    );
  }

  const statEntries = Object.entries(stats);

  return (
    <div className="space-y-6">
      <DashboardCard>
        <DashboardCardHeader>
          <div className="flex items-center gap-2"><Database className="size-5 text-premium-gold-light" /><DashboardCardTitle>{wt("admin.systemOverview")}</DashboardCardTitle></div>
          <DashboardCardDescription>{wt("admin.systemOverviewDescription")}</DashboardCardDescription>
        </DashboardCardHeader>
        <DashboardCardContent>
          {statEntries.length === 0 ? (
            <DashboardPanel className="py-10 text-center"><Gauge className="mx-auto size-8 text-white/10" /><p className="mt-3 text-xs text-white/30">{wt("admin.loadingStats")}</p></DashboardPanel>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {statEntries.map(([table, count]) => (
                <DashboardPanel key={table} className="flex flex-col items-center p-4">
                  <span className="text-xl font-black text-white">{count}</span>
                  <span className="mt-1 text-[10px] font-medium text-white/30">{table.replace(/_/g, " ")}</span>
                </DashboardPanel>
              ))}
            </div>
          )}
        </DashboardCardContent>
      </DashboardCard>

      <DashboardCard>
        <DashboardCardHeader>
          <div className="flex items-center gap-2"><ToggleLeft className="size-5 text-premium-gold-light" /><DashboardCardTitle>{wt("admin.featureFlags")}</DashboardCardTitle></div>
          <DashboardCardDescription>{wt("admin.featureFlagsDescription")}</DashboardCardDescription>
        </DashboardCardHeader>
        <DashboardCardContent>
          {featureFlags.length === 0 ? (
            <DashboardPanel className="py-10 text-center"><ToggleLeft className="mx-auto size-8 text-white/10" /><p className="mt-3 text-xs text-white/30">{wt("admin.noFeatureFlags")}</p></DashboardPanel>
          ) : (
            <div className="space-y-2">
              {featureFlags.map((flag) => (
                <DashboardPanel key={flag.id} className="flex items-center gap-3 p-3">
                  <div className={`size-2 rounded-full ${flag.is_enabled ? "bg-green-400" : "bg-white/20"}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-white/80">{flag.name}</p>
                    <p className="text-[10px] text-white/30">{wt("admin.flagPlans", { key: flag.key, plans: flag.target_plans.join(", ") })}</p>
                  </div>
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${flag.is_enabled ? "bg-green-500/15 text-green-400" : "bg-white/5 text-white/30"}`}>
                    {flag.is_enabled ? wt("common.active") : wt("common.disabled")}
                  </span>
                </DashboardPanel>
              ))}
            </div>
          )}
        </DashboardCardContent>
      </DashboardCard>
    </div>
  );
}
