"use client";

import { useState } from "react";
import {
  BarChart3,
  Database,
  LayoutDashboard,
  LineChart,
  Sparkles,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BiOverview } from "@/components/dashboard/bi/bi-overview";
import { DashboardBuilder } from "@/components/dashboard/bi/dashboard-builder";
import { DataSourcesPanel } from "@/components/dashboard/bi/data-sources-panel";
import { MetricsPanel } from "@/components/dashboard/bi/metrics-panel";
import { ReportsPanel } from "@/components/dashboard/bi/reports-panel";
import { BiAssistantPanel } from "@/components/dashboard/bi/assistant-panel";
import type { BiAnalyticsSummary } from "@/lib/bi/analytics";
import type { BiDashboard, BiDataSource, BiMetric, BiReport, BiScheduledReport, BiWidget } from "@/types/bi";

type Tab = "overview" | "dashboards" | "sources" | "metrics" | "reports" | "insights";

type Props = {
  analyticsSummary?: BiAnalyticsSummary;
  initialDashboards?: BiDashboard[];
  initialWidgets?: BiWidget[];
  initialDataSources?: BiDataSource[];
  initialMetrics?: BiMetric[];
  initialReports?: BiReport[];
  initialScheduled?: BiScheduledReport[];
};

export function BiWorkspace({
  analyticsSummary,
  initialDashboards = [],
  initialWidgets = [],
  initialDataSources = [],
  initialMetrics = [],
  initialReports = [],
  initialScheduled = [],
}: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const summary = analyticsSummary ?? {
    metrics: {
      revenue: 0,
      expenses: 0,
      profit: 0,
      conversionRate: 0,
      pipelineValue: 0,
      customerGrowth: 0,
      inventoryValue: 0,
      marketingRoi: 0,
      byPeriod: {},
    },
    integrations: {
      crm: { contacts: [], deals: [], leads: [], contactCount: 0, dealCount: 0, pipelineValueCents: 0, conversionRate: 0 },
      erp: { invoices: [], expenses: [], revenueCents: 0, expensesCents: 0, inventoryValueCents: 0 },
      marketing: { campaigns: [], campaignCount: 0, totalBudgetCents: 0, activeCampaigns: 0 },
      social: { analytics: [], totalImpressions: 0, totalEngagements: 0 },
      businessManager: { projects: [], tasks: [], kpis: [], completedTasks: 0, totalTasks: 0 },
      website: { events: [], pageViews: 0, eventCount: 0 },
      billing: { invoices: [], platformRevenueCents: 0, note: "" },
    },
    kpiCount: 0,
    dashboardCount: 0,
    reportCount: 0,
  };

  const tabs = [
    { key: "overview" as const, label: "Overview", icon: LayoutDashboard },
    { key: "dashboards" as const, label: "Dashboards", icon: BarChart3 },
    { key: "sources" as const, label: "Data Sources", icon: Database },
    { key: "metrics" as const, label: "Metrics", icon: LineChart },
    { key: "reports" as const, label: "Reports", icon: FileText },
    { key: "insights" as const, label: "AI Insights", icon: Sparkles },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium min-w-[90px]",
              tab === key ? "bg-premium-gold/15 text-premium-gold-light" : "text-white/40 hover:bg-white/5",
            )}
          >
            <Icon className="size-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {tab === "overview" && <BiOverview summary={summary} />}
      {tab === "dashboards" && (
        <DashboardBuilder
          initialDashboards={initialDashboards}
          initialWidgets={initialWidgets}
          metrics={summary.metrics}
        />
      )}
      {tab === "sources" && <DataSourcesPanel initialSources={initialDataSources} />}
      {tab === "metrics" && <MetricsPanel initialMetrics={initialMetrics} computed={summary.metrics} />}
      {tab === "reports" && <ReportsPanel initialReports={initialReports} initialScheduled={initialScheduled} />}
      {tab === "insights" && <BiAssistantPanel />}
    </div>
  );
}
