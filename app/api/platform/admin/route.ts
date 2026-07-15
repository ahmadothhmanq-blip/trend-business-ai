import { requireUser } from "@/lib/api/helpers";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const isAdmin = auth.user!.app_metadata?.role === "admin";
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const tables = [
    "profiles",
    "business_ideas",
    "content_generations",
    "business_generations",
    "website_generations",
    "logo_generations",
    "video_generations",
  ] as const;

  const countResults = await Promise.all(
    tables.map(async (table) => {
      try {
        const { count } = await auth.supabase
          .from(table)
          .select("*", { count: "exact", head: true });
        return [table, count ?? 0] as const;
      } catch {
        return [table, 0] as const;
      }
    }),
  );

  const stats: Record<string, number> = Object.fromEntries(countResults);

  let featureFlags: unknown[] = [];
  try {
    const { data } = await auth.supabase
      .from("feature_flags")
      .select("*")
      .order("created_at", { ascending: false });
    featureFlags = data ?? [];
  } catch {
    /* table may not exist */
  }

  return NextResponse.json({ stats, featureFlags, isAdmin: true });
}
