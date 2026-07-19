import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/header";
import { CreatorMarketplace } from "@/components/dashboard/creator-marketplace/creator-marketplace";

export const metadata: Metadata = {
  title: "Template Marketplace",
  description:
    "Browse, favorite, and use creator website templates — upload, version, and share with the Trend Business AI marketplace.",
};

export default async function TemplatesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const metadata = user?.user_metadata ?? {};

  return (
    <>
      <DashboardHeader
        title="Template Marketplace"
        description="Discover creator templates, live preview, favorite, and duplicate into Website Builder"
        userEmail={user?.email}
        userName={metadata.full_name as string | undefined}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        <CreatorMarketplace />
      </main>
    </>
  );
}
