"use client";

import Link from "next/link";
import type { BiAnalyticsSummary } from "@/lib/bi/analytics";
import { KpiCard } from "@/components/dashboard/bi/chart-widgets";

type Props = {
  summary: BiAnalyticsSummary;
};

export function BiOverview({ summary }: Props) {
  const m = summary.metrics;
  const money = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-premium-gold/20 bg-premium-gold/5 p-4">
        <div>
          <p className="text-sm font-medium text-premium-gold-light">Legacy AI Business Suite</p>
          <p className="text-xs text-white/50">AI strategy reports and business_generations remain available.</p>
        </div>
        <Link
          href="/dashboard/business-intelligence"
          className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15"
        >
          Open Business Suite
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Revenue" value={money(m.revenue)} />
        <KpiCard label="Expenses" value={money(m.expenses)} />
        <KpiCard label="Profit" value={money(m.profit)} trend={m.profit >= 0 ? 5 : -3} />
        <KpiCard label="Marketing ROI" value={String(m.marketingRoi)} unit="%" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Pipeline" value={money(m.pipelineValue)} />
        <KpiCard label="Conversion" value={m.conversionRate.toFixed(1)} unit="%" />
        <KpiCard label="Customers" value={String(m.customerGrowth)} />
        <KpiCard label="Inventory" value={money(m.inventoryValue)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="text-xs uppercase text-white/40">Platform stats</p>
          <p className="mt-2 text-sm text-white/60">Dashboards: {summary.dashboardCount}</p>
          <p className="text-sm text-white/60">KPIs tracked: {summary.kpiCount}</p>
          <p className="text-sm text-white/60">Reports: {summary.reportCount}</p>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="text-xs uppercase text-white/40">CRM integration</p>
          <p className="mt-2 text-sm text-white/60">Contacts: {summary.integrations.crm.contactCount}</p>
          <p className="text-sm text-white/60">Deals: {summary.integrations.crm.dealCount}</p>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="text-xs uppercase text-white/40">Connected sources</p>
          <p className="mt-2 text-sm text-white/60">Campaigns: {summary.integrations.marketing.campaignCount}</p>
          <p className="text-sm text-white/60">Social impressions: {summary.integrations.social.totalImpressions.toLocaleString()}</p>
          <p className="text-sm text-white/60">Website events: {summary.integrations.website.eventCount}</p>
        </div>
      </div>
    </div>
  );
}
