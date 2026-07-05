import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/header";
import { FavoritesList } from "@/components/dashboard/favorites-list";
import type { HistoryItem } from "@/types/database";

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

export default async function FavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const metadata = user?.user_metadata ?? {};

  const [ideas, analyses, reports, websites] = user
    ? await Promise.all([
        supabase
          .from("business_ideas")
          .select("id,title,description,industry,created_at")
          .eq("user_id", user.id)
          .eq("is_favorite", true)
          .order("created_at", { ascending: false }),
        supabase
          .from("market_analyses")
          .select("id,industry,region,summary,created_at")
          .eq("user_id", user.id)
          .eq("is_favorite", true)
          .order("created_at", { ascending: false }),
        supabase
          .from("reports")
          .select("id,title,report_type,topic,created_at")
          .eq("user_id", user.id)
          .eq("is_favorite", true)
          .order("created_at", { ascending: false }),
        supabase
          .from("website_generations")
          .select("id,project_name,website_type,business_description,created_at")
          .eq("user_id", user.id)
          .eq("is_favorite", true)
          .order("created_at", { ascending: false }),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }];

  const favoriteItems: HistoryItem[] = [
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
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <>
      <DashboardHeader
        title="Favorites"
        description="Review your saved ideas, analyses, reports, and website blueprints"
        userEmail={user?.email}
        userName={metadata.full_name as string | undefined}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        <FavoritesList initialItems={favoriteItems} />
      </main>
    </>
  );
}
