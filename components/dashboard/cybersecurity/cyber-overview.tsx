"use client";

import type { CyberAnalyticsSummary } from "@/types/cyber";

type Props = { summary: CyberAnalyticsSummary };

export function CyberOverview({ summary }: Props) {
  const cards = [
    { label: "Risk Score", value: String(summary.riskScore), color: summary.riskScore > 70 ? "text-rose-400" : summary.riskScore > 40 ? "text-amber-400" : "text-emerald-400" },
    { label: "Active Threats", value: String(summary.activeThreats) },
    { label: "Open Vulnerabilities", value: String(summary.openVulnerabilities) },
    { label: "Open Incidents", value: String(summary.openIncidents) },
    { label: "Open Alerts", value: String(summary.openAlerts) },
    { label: "Assets", value: String(summary.assetCount) },
    { label: "Alerts (24h)", value: String(summary.alertVolume24h) },
    { label: "Critical Findings", value: String(summary.criticalFindings) },
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
