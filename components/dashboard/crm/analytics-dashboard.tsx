"use client";

import { useEffect, useState } from "react";
import type { CrmAnalyticsSummary } from "@/lib/crm/analytics";

export function AnalyticsDashboard({ initialSummary }: { initialSummary?: CrmAnalyticsSummary }) {
  const [summary, setSummary] = useState(initialSummary ?? null);

  useEffect(() => {
    void fetch("/api/crm/analytics")
      .then((r) => r.json())
      .then((d) => d.summary && setSummary(d.summary))
      .catch(() => undefined);
  }, []);

  if (!summary) return <p className="text-sm text-white/30">Loading analytics…</p>;

  const money = (c: number) => `$${(c / 100).toLocaleString()}`;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Pipeline", value: money(summary.pipelineValueCents) },
          { label: "Won revenue", value: money(summary.wonValueCents) },
          { label: "Forecast", value: money(summary.forecastCents) },
          { label: "Win rate", value: `${summary.winRate}%` },
          { label: "Conversion", value: `${summary.conversionRate}%` },
          { label: "Avg sales cycle", value: `${summary.avgSalesCycleDays} days` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <p className="text-xs uppercase text-white/40">{label}</p>
            <p className="mt-1 text-xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <p className="text-xs uppercase text-white/40">Pipeline by stage</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {Object.entries(summary.byStage).map(([stage, v]) => (
            <div key={stage} className="text-sm text-white/70">
              <span className="capitalize">{stage}</span>: {v.count} deals · {money(v.valueCents)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
