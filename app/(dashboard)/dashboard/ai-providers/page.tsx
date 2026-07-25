import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LocalizedDashboardHeader } from "@/components/dashboard/localized-header";
import { AIProvidersSettings } from "@/components/dashboard/ai-providers-settings";
import { dashboardPageMetadata } from "@/lib/i18n/dashboard-metadata";

export async function generateMetadata() {
  return dashboardPageMetadata("aiProviders");
}

export default async function AIProvidersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <>
      <LocalizedDashboardHeader pageId="aiProviders"
        userEmail={user.email}
        userName={profile?.full_name as string | undefined}
        avatarUrl={profile?.avatar_url as string | undefined}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        <AIProvidersSettings />
      </main>
    </>
  );
}
