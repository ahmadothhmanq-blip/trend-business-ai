"use client";

import { useEffect, useState } from "react";
import type { BusinessAnalyticsSummary } from "@/lib/business-manager/analytics";

type Props = { initialSummary?: BusinessAnalyticsSummary };

export function AnalyticsDashboard({ initialSummary }: Props) {
  const [summary, setSummary] = useState<BusinessAnalyticsSummary | null>(initialSummary ?? null);
  const [integrations, setIntegrations] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const [analyticsRes, intRes] = await Promise.all([
          fetch("/api/business-manager/analytics"),
          fetch("/api/business-manager/integrations"),
        ]);
        const analytics = await analyticsRes.json();
        const bridges = await intRes.json();
        if (analytics.summary) setSummary(analytics.summary);
        if (bridges.bridges) setIntegrations(bridges.bridges);
      } catch {
        // optional refresh
      }
    })();
  }, []);

  if (!summary) {
    return <p className="text-sm text-white/30">Loading analytics…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Projects", value: summary.totalProjects },
          { label: "Tasks done", value: `${summary.completedTasks}/${summary.totalTasks}` },
          { label: "KPIs on track", value: summary.kpiOnTrack },
          { label: "KPIs off track", value: summary.kpiOffTrack },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <p className="text-xs uppercase text-white/40">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      {integrations && (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="text-xs uppercase text-white/40">Integration bridges (read-only)</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5 text-sm text-white/60">
            <div>CRM contacts: {(integrations.crm as { contacts?: number })?.contacts ?? 0}</div>
            <div>ERP invoices: {(integrations.erp as { invoices?: number })?.invoices ?? 0}</div>
            <div>Marketing campaigns: {(integrations.marketing as { campaigns?: number })?.campaigns ?? 0}</div>
            <div>Social posts: {(integrations.social as { posts?: number })?.posts ?? 0}</div>
            <div>Calendar events: {Array.isArray(integrations.calendar) ? integrations.calendar.length : 0}</div>
          </div>
        </div>
      )}
    </div>
  );
}
