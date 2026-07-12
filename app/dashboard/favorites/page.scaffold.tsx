import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/header";
import { FavoritesList } from "@/components/dashboard/favorites-list";
import { loadUserHistoryItems } from "@/lib/db/history-items";

export default async function FavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const metadata = user?.user_metadata ?? {};
  const favoriteItems = user
    ? await loadUserHistoryItems(supabase, user.id, { favoritesOnly: true })
    : [];

  return (
    <>
      <DashboardHeader
        title="Saved Projects"
        description="Review favorite ideas, analyses, reports, websites and AI workspace projects"
        userEmail={user?.email}
        userName={metadata.full_name as string | undefined}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        <FavoritesList initialItems={favoriteItems} />
      </main>
    </>
  );
}
