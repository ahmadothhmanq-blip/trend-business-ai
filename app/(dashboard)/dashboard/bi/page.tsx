import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/header";
import { BiWorkspace } from "@/components/dashboard/bi/bi-workspace";
import { getBiAnalytics, type BiAnalyticsSummary } from "@/lib/bi/analytics";
import { ensureDefaultMetrics } from "@/lib/bi/metrics";
import { ensureDefaultDashboard } from "@/lib/bi/dashboards";
import type { BiDashboard, BiDataSource, BiMetric, BiReport, BiScheduledReport, BiWidget } from "@/types/bi";

export const metadata: Metadata = { title: "Business Intelligence Platform" };

export default async function BiPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const userMeta = user.user_metadata ?? {};
  let analyticsSummary: BiAnalyticsSummary = {
    metrics: {
      revenue: 0,
      expenses: 0,
      profit: 0,
      conversionRate: 0,
      pipelineValue: 0,
      customerGrowth: 0,
      inventoryValue: 0,
      marketingRoi: 0,
      byPeriod: {} as Record<string, number>,
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
  let initialDashboards: BiDashboard[] = [];
  let initialWidgets: BiWidget[] = [];
  let initialDataSources: BiDataSource[] = [];
  let initialMetrics: BiMetric[] = [];
  let initialReports: BiReport[] = [];
  let initialScheduled: BiScheduledReport[] = [];

  try {
    await ensureDefaultMetrics(supabase, user.id);
    await ensureDefaultDashboard(supabase, user.id);
  } catch {
    // migration may not be applied
  }

  try {
    const { summary } = await getBiAnalytics(supabase, user.id);
    analyticsSummary = summary;
  } catch {
    // optional
  }

  const load = async <T,>(table: string): Promise<T[]> => {
    try {
      const { data } = await supabase.from(table).select("*").eq("user_id", user.id).order("updated_at", { ascending: false }).range(0, 49);
      return (data ?? []) as T[];
    } catch {
      return [];
    }
  };

  [initialDashboards, initialDataSources, initialMetrics, initialReports, initialScheduled] = await Promise.all([
    load<BiDashboard>("bi_dashboards"),
    load<BiDataSource>("bi_data_sources"),
    load<BiMetric>("bi_metrics"),
    load<BiReport>("bi_reports"),
    load<BiScheduledReport>("bi_scheduled_reports"),
  ]);

  if (initialDashboards[0]) {
    try {
      const { data } = await supabase
        .from("bi_widgets")
        .select("*")
        .eq("user_id", user.id)
        .eq("dashboard_id", initialDashboards[0].id)
        .order("created_at");
      initialWidgets = (data ?? []) as BiWidget[];
    } catch {
      // optional
    }
  }

  const { data: profile } = await supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).single();

  return (
    <>
      <DashboardHeader
        title="Business Intelligence"
        description="Analytics hub — dashboards, metrics, reports, and AI insights"
        userEmail={user.email}
        userName={(profile?.full_name as string | undefined) ?? (userMeta.full_name as string | undefined)}
        avatarUrl={profile?.avatar_url as string | undefined}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        <BiWorkspace
          analyticsSummary={analyticsSummary}
          initialDashboards={initialDashboards}
          initialWidgets={initialWidgets}
          initialDataSources={initialDataSources}
          initialMetrics={initialMetrics}
          initialReports={initialReports}
          initialScheduled={initialScheduled}
        />
      </main>
    </>
  );
}
