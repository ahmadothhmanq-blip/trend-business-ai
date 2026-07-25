"use client";

import { useEffect, useState } from "react";
import { useFormatter } from "@/lib/i18n/use-formatter";
import { useProductT } from "@/lib/i18n/use-scoped-t";
import type { AgentAnalyticsSummary } from "@/types/agents-platform";

export function AnalyticsPanel({ initialSummary }: { initialSummary?: AgentAnalyticsSummary }) {
  const pt = useProductT("aiAgents");
  const { formatNumber, formatCurrencyMajor } = useFormatter();
  const [summary, setSummary] = useState(initialSummary ?? null);

  useEffect(() => {
    void fetch("/api/ai-agents/analytics").then((r) => r.json()).then((d) => d.summary && setSummary(d.summary)).catch(() => undefined);
  }, []);

  if (!summary) return <p className="text-sm text-white/30">{pt("panels.analytics.loading")}</p>;

  const cards = [
    { label: pt("panels.analytics.totalRuns"), value: formatNumber(summary.totalRuns) },
    { label: pt("panels.analytics.successRate"), value: `${summary.successRate}%` },
    { label: pt("panels.analytics.failures"), value: formatNumber(summary.failureCount) },
    { label: pt("panels.analytics.avgLatency"), value: `${formatNumber(summary.avgLatencyMs)}ms` },
    { label: pt("panels.analytics.tokens"), value: formatNumber(summary.totalTokens) },
    { label: pt("panels.analytics.estCost"), value: formatCurrencyMajor(summary.estimatedCostCents / 100) },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map(({ label, value }) => (
        <div key={label} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="text-xs uppercase text-white/40">{label}</p>
          <p className="mt-1 text-xl font-semibold text-white">{value}</p>
        </div>
      ))}
    </div>
  );
}
