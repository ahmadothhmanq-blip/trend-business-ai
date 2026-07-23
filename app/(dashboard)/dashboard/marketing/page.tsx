import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/header";
import { MarketingWorkspace } from "@/components/dashboard/marketing/marketing-workspace";
import { getMarketingAnalytics } from "@/lib/marketing/analytics";
import { getMergedCalendar } from "@/lib/marketing/calendar";
import type { MarketingCampaign, CustomerPersona, MarketingCalendarEvent } from "@/types/marketing";
import type { WorkspaceGeneration } from "@/types/database";

export const metadata: Metadata = { title: "AI Marketing Intelligence Platform" };

export default async function MarketingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const userMeta = user.user_metadata ?? {};

  let initialCampaigns: MarketingCampaign[] = [];
  let initialPersonas: CustomerPersona[] = [];
  let initialCalendar: MarketingCalendarEvent[] = [];
  let initialGenerations: WorkspaceGeneration[] = [];
  let analyticsSummary = {
    totalImpressions: 0,
    totalClicks: 0,
    totalConversions: 0,
    totalLeads: 0,
    totalRevenue: 0,
    totalSpend: 0,
    avgRoi: 0,
    avgEngagementRate: 0,
    recordCount: 0,
    byChannel: {} as Record<string, import("@/lib/marketing/analytics").MarketingAnalyticsSummary>,
  };

  try {
    const { data } = await supabase
      .from("marketing_campaigns")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .range(0, 49);
    initialCampaigns = (data ?? []) as MarketingCampaign[];
  } catch {
    // migration may not be applied
  }

  try {
    const { data } = await supabase
      .from("marketing_personas")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .range(0, 19);
    initialPersonas = (data ?? []) as CustomerPersona[];
  } catch {
    // optional
  }

  try {
    const { events } = await getMergedCalendar(supabase, user.id);
    initialCalendar = events as MarketingCalendarEvent[];
  } catch {
    // optional
  }

  try {
    const { data } = await supabase
      .from("workspace_generations")
      .select("*")
      .eq("user_id", user.id)
      .eq("workspace_type", "marketing")
      .order("created_at", { ascending: false })
      .range(0, 19);
    initialGenerations = (data ?? []) as WorkspaceGeneration[];
  } catch {
    // legacy workspace
  }

  try {
    const { summary } = await getMarketingAnalytics(supabase, user.id);
    analyticsSummary = summary;
  } catch {
    // optional
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <>
      <DashboardHeader
        title="AI Marketing Intelligence"
        description="Campaign planning, personas, analytics, email & ads foundation"
        userEmail={user.email}
        userName={(profile?.full_name as string | undefined) ?? (userMeta.full_name as string | undefined)}
        avatarUrl={profile?.avatar_url as string | undefined}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        <MarketingWorkspace
          initialCampaigns={initialCampaigns}
          initialPersonas={initialPersonas}
          initialCalendar={initialCalendar}
          initialGenerations={initialGenerations}
          analyticsSummary={analyticsSummary}
        />
      </main>
    </>
  );
}
