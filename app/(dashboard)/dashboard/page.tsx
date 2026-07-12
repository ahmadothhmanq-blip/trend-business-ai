import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/header";
import { getDashboardHomeData } from "@/lib/db/dashboard-stats";
import { DashboardOverview } from "@/components/dashboard/overview";
import type { DashboardHomeData } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const metadata = user?.user_metadata ?? {};
  const userName = (metadata.full_name as string | undefined) ?? undefined;

  let avatarUrl: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_url, full_name")
      .eq("id", user.id)
      .maybeSingle();
    avatarUrl = profile?.avatar_url ?? null;
  }

  const homeData: DashboardHomeData = user
    ? await getDashboardHomeData(supabase, user.id)
    : {
        stats: {
          ideas: 0,
          analyses: 0,
          reports: 0,
          websites: 0,
          workspaces: 0,
          saved: 0,
        },
        recentActivity: [],
      };

  return (
    <>
      <DashboardHeader
        title="Dashboard"
        description="Your AI business workspace overview"
        userEmail={user?.email}
        userName={userName}
        avatarUrl={avatarUrl}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        <DashboardOverview data={homeData} userName={userName} />
      </main>
    </>
  );
}
