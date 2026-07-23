"use client";

import { useEffect, useState } from "react";
import type { MarketingAnalyticsSummary } from "@/lib/marketing/analytics";

export function AnalyticsDashboard() {
  const [summary, setSummary] = useState<MarketingAnalyticsSummary | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/marketing/analytics");
      const data = await res.json();
      if (res.ok) setSummary(data.summary);
    })();
  }, []);

  if (!summary) return <p className="text-sm text-white/30">Loading analytics…</p>;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[
        { label: "Conversions", value: summary.totalConversions },
        { label: "Leads", value: summary.totalLeads },
        { label: "Engagement", value: `${summary.avgEngagementRate}%` },
        { label: "ROI", value: `${summary.avgRoi}%` },
      ].map(({ label, value }) => (
        <div key={label} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="text-xs text-white/40">{label}</p>
          <p className="text-xl font-semibold text-white">{value}</p>
        </div>
      ))}
    </div>
  );
}
