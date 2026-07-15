import { requireUser, parseJsonBody, paginationParams } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import type { Notification } from "@/types/platform";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const { page, limit, from, to } = paginationParams(searchParams);
  const unreadOnly = searchParams.get("unread") === "true";

  let listQuery = auth.supabase
    .from("notifications")
    .select("*", { count: "exact" })
    .eq("user_id", auth.user!.id)
    .order("created_at", { ascending: false });

  if (unreadOnly) listQuery = listQuery.eq("is_read", false);

  const unreadQuery = auth.supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", auth.user!.id)
    .eq("is_read", false);

  const [listResult, unreadResult] = await Promise.all([
    listQuery.range(from, to),
    unreadQuery,
  ]);

  if (listResult.error) {
    if (listResult.error.code === "42P01") {
      return NextResponse.json({
        notifications: [],
        total: 0,
        unread: 0,
        page,
        limit,
        totalPages: 1,
      });
    }
    return databaseErrorResponse("notifications.list", listResult.error);
  }

  const total = listResult.count ?? 0;
  return NextResponse.json({
    notifications: listResult.data as Notification[],
    total,
    unread: unreadResult.count ?? 0,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  });
}

export async function PATCH(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const { action, ids } = body as { action?: string; ids?: string[] };

  if (action === "mark-all-read") {
    await auth.supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", auth.user!.id)
      .eq("is_read", false);
    return NextResponse.json({ message: "All notifications marked as read." });
  }

  if (action === "mark-read" && Array.isArray(ids) && ids.length > 0) {
    await auth.supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", auth.user!.id)
      .in("id", ids);
    return NextResponse.json({ message: "Notifications marked as read." });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
