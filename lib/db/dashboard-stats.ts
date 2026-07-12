import type { SupabaseClient } from "@supabase/supabase-js";
import type { DashboardActivityItem, DashboardHomeData, DashboardStats } from "@/types/database";
import { getWorkspaceDefinition } from "@/lib/workspace/registry";
import type { WorkspaceType } from "@/lib/workspace/types";

export async function getDashboardStats(
  supabase: SupabaseClient,
  userId: string,
): Promise<DashboardStats> {
  const [ideas, analyses, reports, websites, workspaces, favorites] = await Promise.all([
    supabase
      .from("business_ideas")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("market_analyses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("website_generations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("workspace_generations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("favorites")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
  ]);

  return {
    ideas: ideas.count ?? 0,
    analyses: analyses.count ?? 0,
    reports: reports.count ?? 0,
    websites: websites.count ?? 0,
    workspaces: workspaces.count ?? 0,
    saved: favorites.count ?? 0,
  };
}

type IdeaActivityRow = {
  id: string;
  title: string;
  industry: string;
  created_at: string;
};

type AnalysisActivityRow = {
  id: string;
  industry: string;
  region: string;
  created_at: string;
};

type ReportActivityRow = {
  id: string;
  title: string;
  report_type: string;
  created_at: string;
};

type WebsiteActivityRow = {
  id: string;
  project_name: string;
  website_type: string;
  created_at: string;
};

type WorkspaceActivityRow = {
  id: string;
  workspace_type: WorkspaceType;
  title: string;
  output: { summary?: string };
  created_at: string;
};

function sortRecentActivity(items: DashboardActivityItem[]) {
  return items
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 6);
}

export async function getDashboardHomeData(
  supabase: SupabaseClient,
  userId: string,
): Promise<DashboardHomeData> {
  const [stats, ideas, analyses, reports, websites, workspaceRows] = await Promise.all([
    getDashboardStats(supabase, userId),
    supabase
      .from("business_ideas")
      .select("id,title,industry,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("market_analyses")
      .select("id,industry,region,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("reports")
      .select("id,title,report_type,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("website_generations")
      .select("id,project_name,website_type,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("workspace_generations")
      .select("id,workspace_type,title,output,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const activity = [
    ...((ideas.data ?? []) as IdeaActivityRow[]).map((idea) => ({
      id: idea.id,
      type: "idea" as const,
      title: idea.title,
      description: `Business idea · ${idea.industry}`,
      href: "/dashboard/ideas",
      createdAt: idea.created_at,
    })),
    ...((analyses.data ?? []) as AnalysisActivityRow[]).map((analysis) => ({
      id: analysis.id,
      type: "analysis" as const,
      title: analysis.industry,
      description: `Market analysis · ${analysis.region}`,
      href: "/dashboard/market-analysis",
      createdAt: analysis.created_at,
    })),
    ...((reports.data ?? []) as ReportActivityRow[]).map((report) => ({
      id: report.id,
      type: "report" as const,
      title: report.title,
      description: `AI report · ${report.report_type}`,
      href: "/dashboard/reports",
      createdAt: report.created_at,
    })),
    ...((websites.data ?? []) as WebsiteActivityRow[]).map((website) => ({
      id: website.id,
      type: "website" as const,
      title: website.project_name,
      description: `Website blueprint · ${website.website_type}`,
      href: "/dashboard/website-builder",
      createdAt: website.created_at,
    })),
    ...((workspaceRows.data ?? []) as WorkspaceActivityRow[]).map((workspace) => ({
      id: workspace.id,
      type: "workspace" as const,
      title: workspace.title,
      description:
        workspace.output?.summary ??
        `${getWorkspaceDefinition(workspace.workspace_type).metadata.label} project`,
      href: getWorkspaceDefinition(workspace.workspace_type).metadata.dashboardHref,
      createdAt: workspace.created_at,
    })),
  ];

  return {
    stats,
    recentActivity: sortRecentActivity(activity),
  };
}
