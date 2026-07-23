"use client";

import type { MarketingCampaign, CustomerPersona } from "@/types/marketing";
import type { MarketingAnalyticsSummary } from "@/lib/marketing/analytics";

type Props = {
  campaigns: MarketingCampaign[];
  summary: MarketingAnalyticsSummary;
};

export function MarketingDashboard({ campaigns, summary }: Props) {
  const active = campaigns.filter((c) => c.status === "active").length;
  const planned = campaigns.filter((c) => c.status === "planned" || c.status === "draft").length;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Campaigns", value: campaigns.length },
          { label: "Active", value: active },
          { label: "Planned / Draft", value: planned },
          { label: "Leads", value: summary.totalLeads },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <p className="text-xs uppercase tracking-wide text-white/40">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <p className="text-xs uppercase tracking-wide text-white/40">Marketing analytics</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Impressions", value: summary.totalImpressions },
            { label: "Clicks", value: summary.totalClicks },
            { label: "Conversions", value: summary.totalConversions },
            { label: "Revenue", value: `$${summary.totalRevenue}` },
            { label: "Spend", value: `$${summary.totalSpend}` },
            { label: "Avg ROI", value: `${summary.avgRoi}%` },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-white/40">{label}</p>
              <p className="text-lg font-medium text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export type { MarketingAnalyticsSummary as MarketingDashboardSummary };
