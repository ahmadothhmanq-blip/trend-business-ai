import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/header";
import { CrmWorkspace } from "@/components/dashboard/crm/crm-workspace";
import { getCrmAnalytics } from "@/lib/crm/analytics";
import type {
  CRMAccount,
  CRMActivity,
  CRMContact,
  CRMDeal,
  CRMLead,
  CRMTask,
} from "@/types/crm";

export const metadata: Metadata = { title: "AI CRM Platform" };

export default async function CrmPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const userMeta = user.user_metadata ?? {};

  let initialAccounts: CRMAccount[] = [];
  let initialContacts: CRMContact[] = [];
  let initialLeads: CRMLead[] = [];
  let initialDeals: CRMDeal[] = [];
  let initialTasks: CRMTask[] = [];
  let initialActivities: CRMActivity[] = [];
  let analyticsSummary = {
    pipelineValueCents: 0,
    wonValueCents: 0,
    openDeals: 0,
    totalLeads: 0,
    convertedLeads: 0,
    conversionRate: 0,
    winRate: 0,
    avgSalesCycleDays: 0,
    forecastCents: 0,
    byStage: {} as Record<string, { count: number; valueCents: number }>,
  };

  try {
    const { data } = await supabase
      .from("crm_accounts")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .range(0, 49);
    initialAccounts = (data ?? []) as CRMAccount[];
  } catch {
    // migration may not be applied
  }

  try {
    const { data } = await supabase
      .from("crm_contacts")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .range(0, 99);
    initialContacts = (data ?? []) as CRMContact[];
  } catch {
    // optional
  }

  try {
    const { data } = await supabase
      .from("crm_leads")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .range(0, 99);
    initialLeads = (data ?? []) as CRMLead[];
  } catch {
    // optional
  }

  try {
    const { data } = await supabase
      .from("crm_deals")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .range(0, 99);
    initialDeals = (data ?? []) as CRMDeal[];
  } catch {
    // optional
  }

  try {
    const { data } = await supabase
      .from("crm_tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .range(0, 99);
    initialTasks = (data ?? []) as CRMTask[];
  } catch {
    // optional
  }

  try {
    const { data } = await supabase
      .from("crm_activities")
      .select("*")
      .eq("user_id", user.id)
      .order("occurred_at", { ascending: false })
      .range(0, 99);
    initialActivities = (data ?? []) as CRMActivity[];
  } catch {
    // optional
  }

  try {
    const { summary } = await getCrmAnalytics(supabase, user.id);
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
        title="AI CRM Platform"
        description="Accounts, contacts, leads, pipeline, tasks, activities, and AI sales assistant"
        userEmail={user.email}
        userName={(profile?.full_name as string | undefined) ?? (userMeta.full_name as string | undefined)}
        avatarUrl={profile?.avatar_url as string | undefined}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        <CrmWorkspace
          initialAccounts={initialAccounts}
          initialContacts={initialContacts}
          initialLeads={initialLeads}
          initialDeals={initialDeals}
          initialTasks={initialTasks}
          initialActivities={initialActivities}
          analyticsSummary={analyticsSummary}
        />
      </main>
    </>
  );
}
