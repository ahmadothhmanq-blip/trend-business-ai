import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LocalizedDashboardHeader } from "@/components/dashboard/localized-header";
import { WebAppBuilderTool } from "@/components/dashboard/webapp-builder/webapp-builder-tool";
import type { WebAppGeneration } from "@/types/webapp";
import { dashboardPageMetadata } from "@/lib/i18n/dashboard-metadata";

export async function generateMetadata() {
  return dashboardPageMetadata("appBuilder");
}

export default async function AppBuilderPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const metadata = user.user_metadata ?? {};

  let initialGenerations: WebAppGeneration[] = [];
  try {
    const { data } = await supabase
      .from("webapp_generations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(0, 11);
    initialGenerations = (data ?? []) as WebAppGeneration[];
  } catch {
    // Table may not exist yet
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <>
      <LocalizedDashboardHeader pageId="appBuilder"
        userEmail={user.email}
        userName={(profile?.full_name as string | undefined) ?? (metadata.full_name as string | undefined)}
        avatarUrl={profile?.avatar_url as string | undefined}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        <WebAppBuilderTool initialGenerations={initialGenerations} />
      </main>
    </>
  );
}
