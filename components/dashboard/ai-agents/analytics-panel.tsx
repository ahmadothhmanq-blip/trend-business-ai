"use client";

import { useEffect, useState } from "react";
import type { AgentAnalyticsSummary } from "@/types/agents-platform";

export function AnalyticsPanel({ initialSummary }: { initialSummary?: AgentAnalyticsSummary }) {
  const [summary, setSummary] = useState(initialSummary ?? null);

  useEffect(() => {
    void fetch("/api/ai-agents/analytics").then((r) => r.json()).then((d) => d.summary && setSummary(d.summary)).catch(() => undefined);
  }, []);

  if (!summary) return <p className="text-sm text-white/30">Loading analytics…</p>;

  const cards = [
    { label: "Total Runs", value: String(summary.totalRuns) },
    { label: "Success Rate", value: `${summary.successRate}%` },
    { label: "Failures", value: String(summary.failureCount) },
    { label: "Avg Latency", value: `${summary.avgLatencyMs}ms` },
    { label: "Tokens", value: summary.totalTokens.toLocaleString() },
    { label: "Est. Cost", value: `$${(summary.estimatedCostCents / 100).toFixed(2)}` },
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
