"use client";

import { useEffect, useState } from "react";
import type { CrmAnalyticsSummary } from "@/lib/crm/analytics";
import { useWorkspaceT } from "@/lib/i18n/use-scoped-t";

export function AnalyticsDashboard({ initialSummary }: { initialSummary?: CrmAnalyticsSummary }) {
  const wt = useWorkspaceT("crm");
  const [summary, setSummary] = useState(initialSummary ?? null);

  useEffect(() => {
    void fetch("/api/crm/analytics")
      .then((r) => r.json())
      .then((d) => d.summary && setSummary(d.summary))
      .catch(() => undefined);
  }, []);

  if (!summary) return <p className="text-sm text-white/30">{wt("panels.analytics.loading")}</p>;

  const money = (c: number) => `$${(c / 100).toLocaleString()}`;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: wt("panels.analytics.pipeline"), value: money(summary.pipelineValueCents) },
          { label: wt("overview.metrics.wonValue"), value: money(summary.wonValueCents) },
          { label: wt("overview.metrics.forecast"), value: money(summary.forecastCents) },
          { label: wt("overview.metrics.winRate"), value: `${summary.winRate}%` },
          { label: wt("overview.metrics.conversionRate"), value: `${summary.conversionRate}%` },
          { label: wt("overview.metrics.avgSalesCycle"), value: wt("panels.analytics.avgSalesCycleDays", { days: summary.avgSalesCycleDays }) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <p className="text-xs uppercase text-white/40">{label}</p>
            <p className="mt-1 text-xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <p className="text-xs uppercase text-white/40">{wt("panels.analytics.pipelineByStage")}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {Object.entries(summary.byStage).map(([stage, v]) => (
            <div key={stage} className="text-sm text-white/70">
              <span className="capitalize">{wt(`stages.${stage}`)}</span>: {wt("panels.analytics.dealsSummary", { count: v.count, value: money(v.valueCents) })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
