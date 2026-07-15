import { requireUser, parseUuidParam } from "@/lib/api/helpers";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data, error } = await auth.supabase.from("webhooks").delete().eq("id", idParsed.id).eq("user_id", auth.user!.id).select("id").single();
  if (error || !data) return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
  return NextResponse.json({ message: "Webhook deleted." });
}

export async function PATCH(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data: existing } = await auth.supabase.from("webhooks").select("is_active").eq("id", idParsed.id).eq("user_id", auth.user!.id).single();
  if (!existing) return NextResponse.json({ error: "Webhook not found" }, { status: 404 });

  const { data } = await auth.supabase.from("webhooks").update({ is_active: !existing.is_active, updated_at: new Date().toISOString() }).eq("id", idParsed.id).eq("user_id", auth.user!.id).select("*").single();
  return NextResponse.json({ webhook: data, message: data?.is_active ? "Webhook activated." : "Webhook deactivated." });
}
