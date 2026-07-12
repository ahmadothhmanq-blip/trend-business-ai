import type { SupabaseClient } from "@supabase/supabase-js";
import { mapWorkspaceToHistoryItem } from "@/lib/workspace/history";
import type { HistoryItem, WorkspaceType } from "@/types/database";

const HISTORY_LIMIT = 100;

type IdeaRow = {
  id: string;
  title: string;
  description: string;
  industry: string;
  created_at: string;
};

type AnalysisRow = {
  id: string;
  industry: string;
  region: string;
  summary: string;
  created_at: string;
};

type ReportRow = {
  id: string;
  title: string;
  report_type: string;
  topic: string;
  created_at: string;
};

type WebsiteRow = {
  id: string;
  project_name: string;
  website_type: string;
  business_description: string;
  created_at: string;
};

type WorkspaceRow = {
  id: string;
  workspace_type: WorkspaceType;
  title: string;
  brief: string;
  output: { summary?: string };
  created_at: string;
};

export async function loadUserHistoryItems(
  supabase: SupabaseClient,
  userId: string,
  options: { favoritesOnly?: boolean } = {},
): Promise<HistoryItem[]> {
  const favoritesOnly = options.favoritesOnly ?? false;
  const favoriteFilter = favoritesOnly ? { is_favorite: true } : {};

  const [ideas, analyses, reports, websites, workspaces] = await Promise.all([
    supabase
      .from("business_ideas")
      .select("id,title,description,industry,created_at")
      .eq("user_id", userId)
      .match(favoriteFilter)
      .order("created_at", { ascending: false })
      .limit(HISTORY_LIMIT),
    supabase
      .from("market_analyses")
      .select("id,industry,region,summary,created_at")
      .eq("user_id", userId)
      .match(favoriteFilter)
      .order("created_at", { ascending: false })
      .limit(HISTORY_LIMIT),
    supabase
      .from("reports")
      .select("id,title,report_type,topic,created_at")
      .eq("user_id", userId)
      .match(favoriteFilter)
      .order("created_at", { ascending: false })
      .limit(HISTORY_LIMIT),
    supabase
      .from("website_generations")
      .select("id,project_name,website_type,business_description,created_at")
      .eq("user_id", userId)
      .match(favoriteFilter)
      .order("created_at", { ascending: false })
      .limit(HISTORY_LIMIT),
    supabase
      .from("workspace_generations")
      .select("id,workspace_type,title,brief,output,created_at")
      .eq("user_id", userId)
      .match(favoriteFilter)
      .order("created_at", { ascending: false })
      .limit(HISTORY_LIMIT),
  ]);

  const historyItems: HistoryItem[] = [
    ...((ideas.data ?? []) as IdeaRow[]).map((idea) => ({
      id: idea.id,
      type: "idea" as const,
      title: idea.title,
      description: idea.description,
      detail: idea.industry,
      href: "/dashboard/ideas",
      createdAt: idea.created_at,
    })),
    ...((analyses.data ?? []) as AnalysisRow[]).map((analysis) => ({
      id: analysis.id,
      type: "analysis" as const,
      title: analysis.industry,
      description: analysis.summary,
      detail: analysis.region,
      href: "/dashboard/market-analysis",
      createdAt: analysis.created_at,
    })),
    ...((reports.data ?? []) as ReportRow[]).map((report) => ({
      id: report.id,
      type: "report" as const,
      title: report.title,
      description: report.topic,
      detail: report.report_type,
      href: "/dashboard/reports",
      createdAt: report.created_at,
    })),
    ...((websites.data ?? []) as WebsiteRow[]).map((website) => ({
      id: website.id,
      type: "website" as const,
      title: website.project_name,
      description: website.business_description,
      detail: website.website_type,
      href: "/dashboard/website-builder",
      createdAt: website.created_at,
    })),
    ...((workspaces.data ?? []) as WorkspaceRow[]).map((workspace) =>
      mapWorkspaceToHistoryItem(workspace),
    ),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return historyItems.slice(0, HISTORY_LIMIT);
}
