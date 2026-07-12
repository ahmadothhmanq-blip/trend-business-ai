import type { Metadata } from "next";
import { Search } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import { createClient } from "@/lib/supabase/server";
import { buildMultiColumnIlikeOrFilter } from "@/lib/api/search-filters";

export const metadata: Metadata = { title: "Search" };

type SearchResult = {
  id: string;
  type: string;
  title: string;
  description: string;
  createdAt: string;
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const metadata = user?.user_metadata ?? {};
  const results: SearchResult[] = [];

  if (user && query) {
    const [ideas, analyses, reports, projects] = await Promise.all([
      supabase
        .from("business_ideas")
        .select("id,title,description,industry,created_at")
        .eq("user_id", user.id)
        .or(buildMultiColumnIlikeOrFilter(["title", "description", "industry"], query) ?? "id.eq.__none__")
        .limit(8),
      supabase
        .from("market_analyses")
        .select("id,industry,region,summary,created_at")
        .eq("user_id", user.id)
        .or(buildMultiColumnIlikeOrFilter(["industry", "region", "summary"], query) ?? "id.eq.__none__")
        .limit(8),
      supabase
        .from("reports")
        .select("id,title,topic,report_type,created_at")
        .eq("user_id", user.id)
        .or(buildMultiColumnIlikeOrFilter(["title", "topic", "content"], query) ?? "id.eq.__none__")
        .limit(8),
      supabase
        .from("website_generations")
        .select("id,project_name,website_type,business_description,created_at")
        .eq("user_id", user.id)
        .or(buildMultiColumnIlikeOrFilter(["project_name", "website_type", "business_description"], query) ?? "id.eq.__none__")
        .limit(8),
    ]);

    results.push(
      ...((ideas.data ?? []).map((item) => ({
        id: item.id,
        type: "Idea",
        title: item.title,
        description: item.description ?? item.industry,
        createdAt: item.created_at,
      })) satisfies SearchResult[]),
      ...((analyses.data ?? []).map((item) => ({
        id: item.id,
        type: "Market Analysis",
        title: `${item.industry} in ${item.region}`,
        description: item.summary ?? "Market analysis",
        createdAt: item.created_at,
      })) satisfies SearchResult[]),
      ...((reports.data ?? []).map((item) => ({
        id: item.id,
        type: "Report",
        title: item.title,
        description: item.topic ?? item.report_type,
        createdAt: item.created_at,
      })) satisfies SearchResult[]),
      ...((projects.data ?? []).map((item) => ({
        id: item.id,
        type: "Project",
        title: item.project_name,
        description: item.business_description ?? item.website_type,
        createdAt: item.created_at,
      })) satisfies SearchResult[]),
    );
  }

  const sortedResults = results.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <>
      <DashboardHeader
        title="Search"
        description="Search across projects, history, favorites and generated assets."
        userEmail={user?.email}
        userName={metadata.full_name as string | undefined}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        <DashboardPanel gold>
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-premium-gold/20 bg-premium-gold/10 p-3 text-premium-gold">
              <Search className="size-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">
                {query ? `Results for "${query}"` : "Search your AI workspace"}
              </h2>
              <p className="mt-2 text-sm leading-7 text-white/50">
                Use the top search field to find generated ideas, market analyses,
                reports and website/app projects.
              </p>
            </div>
          </div>
        </DashboardPanel>

        <div className="mt-6 grid gap-3">
          {sortedResults.map((result) => (
            <DashboardPanel key={`${result.type}-${result.id}`}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold tracking-wide text-premium-gold-light uppercase">
                    {result.type}
                  </p>
                  <h3 className="mt-1 font-bold text-white">{result.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-7 text-white/45">
                    {result.description}
                  </p>
                </div>
                <p className="shrink-0 text-[12px] text-white/35">
                  {new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(result.createdAt))}
                </p>
              </div>
            </DashboardPanel>
          ))}
        </div>

        {query && sortedResults.length === 0 && (
          <DashboardPanel className="mt-6 border-dashed text-center">
            <Search className="mx-auto size-10 text-premium-gold" />
            <h3 className="mt-4 font-bold text-white">No results found</h3>
            <p className="mt-2 text-sm text-white/45">
              Try a project name, report topic, industry, region or saved asset description.
            </p>
          </DashboardPanel>
        )}
      </main>
    </>
  );
}
