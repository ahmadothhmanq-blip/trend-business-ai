import { createClient } from "@/lib/supabase/server";

import { LocalizedDashboardHeader } from "@/components/dashboard/localized-header";

import { TemplateMarketplace } from "@/components/dashboard/template-marketplace/template-marketplace";

import { dashboardPageMetadata } from "@/lib/i18n/dashboard-metadata";



export async function generateMetadata() {

  return dashboardPageMetadata("websiteBuilder");

}



export default async function WebsiteBuilderMarketplacePage() {

  const supabase = await createClient();

  const {

    data: { user },

  } = await supabase.auth.getUser();

  const metadata = user?.user_metadata ?? {};



  return (

    <>

      <LocalizedDashboardHeader

        pageId="websiteBuilder"

        userEmail={user?.email}

        userName={metadata.full_name as string | undefined}

      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">

        <TemplateMarketplace />

      </main>

    </>

  );

}


