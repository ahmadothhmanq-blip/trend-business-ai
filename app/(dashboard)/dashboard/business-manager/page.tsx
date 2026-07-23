import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/header";
import { BusinessManagerWorkspace } from "@/components/dashboard/business-manager/business-manager-workspace";
import { getBusinessAnalytics } from "@/lib/business-manager/analytics";
import type {
  Organization,
  Team,
  Role,
  BusinessProject,
  Task,
  Milestone,
  Workflow,
  Approval,
  KPI,
} from "@/types/business-manager";
import type { WorkspaceGeneration } from "@/types/database";

export const metadata: Metadata = { title: "AI Business Operations Platform" };

export default async function BusinessManagerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const userMeta = user.user_metadata ?? {};

  let initialOrganizations: Organization[] = [];
  let initialTeams: Team[] = [];
  let initialRoles: Role[] = [];
  let initialProjects: BusinessProject[] = [];
  let initialTasks: Task[] = [];
  let initialMilestones: Milestone[] = [];
  let initialWorkflows: Workflow[] = [];
  let initialApprovals: Approval[] = [];
  let initialKpis: KPI[] = [];
  let initialGenerations: WorkspaceGeneration[] = [];
  let analyticsSummary = {
    totalProjects: 0,
    activeProjects: 0,
    archivedProjects: 0,
    avgProjectProgress: 0,
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    taskCompletionRate: 0,
    totalTeams: 0,
    totalOrganizations: 0,
    pendingApprovals: 0,
    activeWorkflows: 0,
    kpiOnTrack: 0,
    kpiOffTrack: 0,
  };

  try {
    const { data } = await supabase
      .from("business_organizations")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .range(0, 19);
    initialOrganizations = (data ?? []) as Organization[];
  } catch {
    // migration may not be applied
  }

  try {
    const { data } = await supabase
      .from("business_teams")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .range(0, 19);
    initialTeams = (data ?? []) as Team[];
  } catch {
    // optional
  }

  try {
    const { data } = await supabase
      .from("business_roles")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(0, 19);
    initialRoles = (data ?? []) as Role[];
  } catch {
    // optional
  }

  try {
    const { data } = await supabase
      .from("business_projects")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .range(0, 49);
    initialProjects = (data ?? []) as BusinessProject[];
  } catch {
    // optional
  }

  try {
    const { data } = await supabase
      .from("business_tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .range(0, 99);
    initialTasks = (data ?? []) as Task[];
  } catch {
    // optional
  }

  try {
    const { data } = await supabase
      .from("business_milestones")
      .select("*")
      .eq("user_id", user.id)
      .order("target_date", { ascending: true })
      .range(0, 49);
    initialMilestones = (data ?? []) as Milestone[];
  } catch {
    // optional
  }

  try {
    const { data } = await supabase
      .from("business_workflows")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .range(0, 19);
    initialWorkflows = (data ?? []) as Workflow[];
  } catch {
    // optional
  }

  try {
    const { data } = await supabase
      .from("business_approvals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(0, 19);
    initialApprovals = (data ?? []) as Approval[];
  } catch {
    // optional
  }

  try {
    const { data } = await supabase
      .from("business_kpis")
      .select("*")
      .eq("user_id", user.id)
      .order("recorded_at", { ascending: false })
      .range(0, 19);
    initialKpis = (data ?? []) as KPI[];
  } catch {
    // optional
  }

  try {
    const { data } = await supabase
      .from("workspace_generations")
      .select("*")
      .eq("user_id", user.id)
      .eq("workspace_type", "manager")
      .order("created_at", { ascending: false })
      .range(0, 19);
    initialGenerations = (data ?? []) as WorkspaceGeneration[];
  } catch {
    // legacy workspace
  }

  try {
    const { summary } = await getBusinessAnalytics(supabase, user.id);
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
        title="AI Business Operations"
        description="Organizations, teams, projects, tasks, workflows, KPIs, and AI strategy"
        userEmail={user.email}
        userName={(profile?.full_name as string | undefined) ?? (userMeta.full_name as string | undefined)}
        avatarUrl={profile?.avatar_url as string | undefined}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        <BusinessManagerWorkspace
          initialOrganizations={initialOrganizations}
          initialTeams={initialTeams}
          initialRoles={initialRoles}
          initialProjects={initialProjects}
          initialTasks={initialTasks}
          initialMilestones={initialMilestones}
          initialWorkflows={initialWorkflows}
          initialApprovals={initialApprovals}
          initialKpis={initialKpis}
          initialGenerations={initialGenerations}
          analyticsSummary={analyticsSummary}
        />
      </main>
    </>
  );
}
