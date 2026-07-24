"use client";

import Link from "next/link";
import type { BiAnalyticsSummary } from "@/lib/bi/analytics";
import { KpiCard } from "@/components/dashboard/bi/chart-widgets";
import { useWorkspaceT } from "@/lib/i18n/use-scoped-t";

type Props = {
  summary: BiAnalyticsSummary;
};

export function BiOverview({ summary }: Props) {
  const wt = useWorkspaceT("bi");
  const m = summary.metrics;
  const money = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-premium-gold/20 bg-premium-gold/5 p-4">
        <div>
          <p className="text-sm font-medium text-premium-gold-light">{wt("overview.legacySuite")}</p>
          <p className="text-xs text-white/50">{wt("overview.legacySuiteDescription")}</p>
        </div>
        <Link
          href="/dashboard/business-intelligence"
          className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15"
        >
          {wt("overview.openBusinessSuite")}
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label={wt("overview.metrics.revenue")} value={money(m.revenue)} />
        <KpiCard label={wt("overview.metrics.expenses")} value={money(m.expenses)} />
        <KpiCard label={wt("overview.metrics.profit")} value={money(m.profit)} trend={m.profit >= 0 ? 5 : -3} />
        <KpiCard label={wt("overview.metrics.marketingRoi")} value={String(m.marketingRoi)} unit="%" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label={wt("overview.metrics.pipeline")} value={money(m.pipelineValue)} />
        <KpiCard label={wt("overview.metrics.conversion")} value={m.conversionRate.toFixed(1)} unit="%" />
        <KpiCard label={wt("overview.metrics.customers")} value={String(m.customerGrowth)} />
        <KpiCard label={wt("overview.metrics.inventory")} value={money(m.inventoryValue)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="text-xs uppercase text-white/40">{wt("overview.platformStats")}</p>
          <p className="mt-2 text-sm text-white/60">{wt("overview.dashboards")}: {summary.dashboardCount}</p>
          <p className="text-sm text-white/60">{wt("overview.kpisTracked")}: {summary.kpiCount}</p>
          <p className="text-sm text-white/60">{wt("overview.reports")}: {summary.reportCount}</p>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="text-xs uppercase text-white/40">{wt("overview.crmIntegration")}</p>
          <p className="mt-2 text-sm text-white/60">{wt("overview.contacts")}: {summary.integrations.crm.contactCount}</p>
          <p className="text-sm text-white/60">{wt("overview.deals")}: {summary.integrations.crm.dealCount}</p>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="text-xs uppercase text-white/40">{wt("overview.connectedSources")}</p>
          <p className="text-sm text-white/60">{wt("overview.campaigns")}: {summary.integrations.marketing.campaignCount}</p>
          <p className="text-sm text-white/60">{wt("overview.socialImpressions")}: {summary.integrations.social.totalImpressions.toLocaleString()}</p>
          <p className="text-sm text-white/60">{wt("overview.websiteEvents")}: {summary.integrations.website.eventCount}</p>
        </div>
      </div>
    </div>
  );
}
