import { requireUser } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const isAdmin = auth.user!.app_metadata?.role === "admin";
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const stats: Record<string, number> = {};
  const tables = ["profiles", "business_ideas", "content_generations", "business_generations", "website_generations", "logo_generations", "video_generations"];

  for (const table of tables) {
    try {
      const { count } = await auth.supabase.from(table).select("*", { count: "exact", head: true });
      stats[table] = count ?? 0;
    } catch {
      stats[table] = 0;
    }
  }

  let featureFlags: unknown[] = [];
  try {
    const { data } = await auth.supabase.from("feature_flags").select("*").order("created_at", { ascending: false });
    featureFlags = data ?? [];
  } catch { /* table may not exist */ }

  return NextResponse.json({ stats, featureFlags, isAdmin: true });
}
