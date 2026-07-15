import { requireUser, paginationParams } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import type { ActivityLogEntry } from "@/types/platform";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const { page, limit, from, to } = paginationParams(searchParams);

  const { data, error, count } = await auth.supabase
    .from("activity_log")
    .select("*", { count: "exact" })
    .eq("user_id", auth.user!.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    if (error.code === "42P01") return NextResponse.json({ entries: [], total: 0, page, limit, totalPages: 1 });
    return databaseErrorResponse("activity.list", error);
  }

  const total = count ?? 0;
  return NextResponse.json({ entries: data as ActivityLogEntry[], total, page, limit, totalPages: Math.ceil(total / limit) || 1 });
}
