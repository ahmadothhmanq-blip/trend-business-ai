import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/header";
import { MarketAnalysisTool } from "@/components/dashboard/market-analysis-tool";
import type { MarketAnalysis } from "@/types/database";

export default async function MarketAnalysisPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const metadata = user?.user_metadata ?? {};

  const { data, count } = await supabase
    .from("market_analyses")
    .select("*", { count: "exact" })
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .range(0, 9);

  return (
    <>
      <DashboardHeader
        title="Market Analysis"
        description="Deep-dive into industry trends and opportunities"
        userEmail={user?.email}
        userName={metadata.full_name as string | undefined}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        <MarketAnalysisTool
          initialAnalyses={(data ?? []) as MarketAnalysis[]}
          initialTotal={count ?? 0}
        />
      </main>
    </>
  );
}
