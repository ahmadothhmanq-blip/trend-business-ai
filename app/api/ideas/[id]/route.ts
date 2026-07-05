import { syncFavorite } from "@/lib/db/favorites";
import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { favoriteSchema } from "@/lib/validations/common";
import { ideaUpdateSchema } from "@/lib/validations/ideas";
import type { BusinessIdea } from "@/types/database";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = ideaUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { data, error } = await auth.supabase
    .from("business_ideas")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Idea not found" }, { status: 404 });
  }

  return NextResponse.json({
    idea: data as BusinessIdea,
    message: "Idea updated successfully.",
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = favoriteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "is_favorite boolean is required" }, { status: 400 });
  }

  const { is_favorite } = parsed.data;

  const { data, error } = await auth.supabase
    .from("business_ideas")
    .update({ is_favorite, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Idea not found" }, { status: 404 });
  }

  await syncFavorite(
    auth.supabase,
    auth.user!.id,
    "business_idea",
    id,
    is_favorite,
  );

  return NextResponse.json({
    idea: data as BusinessIdea,
    message: is_favorite ? "Idea added to favorites." : "Idea removed from favorites.",
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const auth = await requireUser();
  if (auth.response) return auth.response;

  await syncFavorite(auth.supabase, auth.user!.id, "business_idea", id, false);

  const { error } = await auth.supabase
    .from("business_ideas")
    .delete()
    .eq("id", id)
    .eq("user_id", auth.user!.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Idea deleted successfully." });
}
