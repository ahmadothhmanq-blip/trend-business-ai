"use client";

import type { CyberAnalyticsSummary } from "@/types/cyber";
import { useWorkspaceT } from "@/lib/i18n/use-scoped-t";

type Props = { summary: CyberAnalyticsSummary };

export function CyberOverview({ summary }: Props) {
  const wt = useWorkspaceT("cyber");
  const cards = [
    { label: wt("overview.metrics.riskScore"), value: String(summary.riskScore), color: summary.riskScore > 70 ? "text-rose-400" : summary.riskScore > 40 ? "text-amber-400" : "text-emerald-400" },
    { label: wt("overview.metrics.activeThreats"), value: String(summary.activeThreats) },
    { label: wt("overview.metrics.openVulnerabilities"), value: String(summary.openVulnerabilities) },
    { label: wt("overview.metrics.openIncidents"), value: String(summary.openIncidents) },
    { label: wt("overview.metrics.openAlerts"), value: String(summary.openAlerts) },
    { label: wt("overview.metrics.assets"), value: String(summary.assetCount) },
    { label: wt("overview.metrics.alerts24h"), value: String(summary.alertVolume24h) },
    { label: wt("overview.metrics.criticalFindings"), value: String(summary.criticalFindings) },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ label, value, color }) => (
        <div key={label} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="text-xs uppercase text-white/40">{label}</p>
          <p className={`mt-1 text-2xl font-semibold ${color ?? "text-white"}`}>{value}</p>
        </div>
      ))}
    </div>
  );
}
