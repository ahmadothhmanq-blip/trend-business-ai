import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LocalizedDashboardHeader } from "@/components/dashboard/localized-header";
import { LandingPageBuilderTool } from "@/components/dashboard/landing-page-builder/landing-page-builder-tool";
import type { LandingPageGeneration } from "@/types/landing-page";
import { dashboardPageMetadata } from "@/lib/i18n/dashboard-metadata";

export async function generateMetadata() {
  return dashboardPageMetadata("landingPageBuilder");
}

export default async function LandingPageBuilderPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const userMeta = user.user_metadata ?? {};

  let initialGenerations: LandingPageGeneration[] = [];
  try {
    const { data } = await supabase
      .from("landing_page_generations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(0, 11);
    initialGenerations = (data ?? []) as LandingPageGeneration[];
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
      <LocalizedDashboardHeader pageId="landingPageBuilder"
        userEmail={user.email}
        userName={(profile?.full_name as string | undefined) ?? (userMeta.full_name as string | undefined)}
        avatarUrl={profile?.avatar_url as string | undefined}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        <LandingPageBuilderTool initialGenerations={initialGenerations} />
      </main>
    </>
  );
}
