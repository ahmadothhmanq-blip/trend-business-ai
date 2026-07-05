import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/header";
import { WebsiteBuilderTool } from "@/components/dashboard/website-builder-tool";
import type { WebsiteGeneration } from "@/types/database";

export default async function WebsiteBuilderPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const metadata = user?.user_metadata ?? {};

  const { data } = user
    ? await supabase
        .from("website_generations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(0, 19)
    : { data: [] };

  return (
    <>
      <DashboardHeader
        title="Website Builder"
        description="Design and plan your website with AI"
        userEmail={user?.email}
        userName={metadata.full_name as string | undefined}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        <WebsiteBuilderTool initialGenerations={(data ?? []) as WebsiteGeneration[]} />
      </main>
    </>
  );
}
