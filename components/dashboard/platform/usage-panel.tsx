"use client";

import { useCallback, useEffect, useState } from "react";
import { BarChart3, Cpu, Zap } from "lucide-react";
import { DashboardCard, DashboardCardContent, DashboardCardHeader, DashboardCardTitle, DashboardCardDescription, DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import { dashboardSelectClass } from "@/components/dashboard/ui/dashboard-styles";
import { useFormatter } from "@/lib/i18n/use-formatter";
import { useWorkspaceT } from "@/lib/i18n/use-scoped-t";
import { cn } from "@/lib/utils";

type Summary = { totalTokens: number; totalGenerations: number; byResource: Record<string, { tokens: number; generations: number }> };

export function UsagePanel() {
  const wt = useWorkspaceT("platform");
  const { formatNumber } = useFormatter();
  const [summary, setSummary] = useState<Summary>({ totalTokens: 0, totalGenerations: 0, byResource: {} });
  const [days, setDays] = useState("30");

  const fetchUsage = useCallback(async () => {
    try {
      const res = await fetch(`/api/platform/usage?days=${days}`);
      if (!res.ok) return;
      const d = await res.json();
      setSummary(d.summary ?? { totalTokens: 0, totalGenerations: 0, byResource: {} });
    } catch { /* ignore */ }
  }, [days]);

  useEffect(() => { fetchUsage(); }, [fetchUsage]);

  const resources = Object.entries(summary.byResource).sort((a, b) => b[1].generations - a[1].generations);
  const maxGen = Math.max(...resources.map(([, v]) => v.generations), 1);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardPanel className="flex flex-col items-center justify-center p-5">
          <Zap className="size-5 text-premium-gold-light" />
          <span className="mt-2 text-2xl font-black text-white">{formatNumber(summary.totalGenerations)}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">{wt("usage.generations")}</span>
        </DashboardPanel>
        <DashboardPanel className="flex flex-col items-center justify-center p-5">
          <Cpu className="size-5 text-premium-gold-light" />
          <span className="mt-2 text-2xl font-black text-white">{formatNumber(summary.totalTokens)}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">{wt("usage.tokensUsed")}</span>
        </DashboardPanel>
        <DashboardPanel className="flex flex-col items-center justify-center p-5">
          <BarChart3 className="size-5 text-premium-gold-light" />
          <span className="mt-2 text-2xl font-black text-white">{resources.length}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">{wt("usage.activeServices")}</span>
        </DashboardPanel>
      </div>

      <DashboardCard>
        <DashboardCardHeader>
          <div className="flex items-center justify-between">
            <div><DashboardCardTitle>{wt("usage.usageByService")}</DashboardCardTitle><DashboardCardDescription>{wt("usage.usageByServiceDescription")}</DashboardCardDescription></div>
            <select value={days} onChange={(e) => setDays(e.target.value)} className={cn(dashboardSelectClass, "w-32")}>
              <option value="7">{wt("usage.last7Days")}</option>
              <option value="30">{wt("usage.last30Days")}</option>
              <option value="90">{wt("usage.last90Days")}</option>
            </select>
          </div>
        </DashboardCardHeader>
        <DashboardCardContent>
          {resources.length === 0 ? (
            <DashboardPanel className="py-10 text-center"><BarChart3 className="mx-auto size-8 text-white/10" /><p className="mt-3 text-xs text-white/30">{wt("usage.noUsageData")}</p></DashboardPanel>
          ) : (
            <div className="space-y-3">
              {resources.map(([resource, data]) => (
                <div key={resource} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white/70">{resource}</span>
                    <span className="text-xs text-white/40">{wt("usage.serviceStats", { generations: data.generations, tokens: formatNumber(data.tokens) })}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full rounded-full bg-premium-gold/40 transition-all" style={{ width: `${(data.generations / maxGen) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardCardContent>
      </DashboardCard>
    </div>
  );
}
