import { createClient } from "@/lib/supabase/server";
import { LocalizedDashboardHeader } from "@/components/dashboard/localized-header";
import { CreatorMarketplace } from "@/components/dashboard/creator-marketplace/creator-marketplace";
import { dashboardPageMetadata } from "@/lib/i18n/dashboard-metadata";

export async function generateMetadata() {
  return dashboardPageMetadata("templates");
}

export default async function TemplatesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const metadata = user?.user_metadata ?? {};

  return (
    <>
      <LocalizedDashboardHeader pageId="templates"
        userEmail={user?.email}
        userName={metadata.full_name as string | undefined}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        <CreatorMarketplace />
      </main>
    </>
  );
}
