import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/header";
import { HistoryList } from "@/components/dashboard/history-list";
import { loadUserHistoryItems } from "@/lib/db/history-items";

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const metadata = user?.user_metadata ?? {};
  const historyItems = user ? await loadUserHistoryItems(supabase, user.id) : [];

  return (
    <>
      <DashboardHeader
        title="History"
        description="Review and manage everything you have generated"
        userEmail={user?.email}
        userName={metadata.full_name as string | undefined}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        <HistoryList initialItems={historyItems} />
      </main>
    </>
  );
}
