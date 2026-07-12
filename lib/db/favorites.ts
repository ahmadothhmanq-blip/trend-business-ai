import type { SupabaseClient } from "@supabase/supabase-js";
import type { FavoriteItemType } from "@/types/database";

export async function syncFavorite(
  supabase: SupabaseClient,
  userId: string,
  itemType: FavoriteItemType,
  itemId: string,
  isFavorite: boolean,
): Promise<{ error: Error | null }> {
  if (isFavorite) {
    const { error } = await supabase.from("favorites").upsert(
      { user_id: userId, item_type: itemType, item_id: itemId },
      { onConflict: "user_id,item_type,item_id", ignoreDuplicates: true },
    );
    return { error: error ? new Error(error.message) : null };
  }

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("item_type", itemType)
    .eq("item_id", itemId);
  return { error: error ? new Error(error.message) : null };
}
