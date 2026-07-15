import { requireUser, parseJsonBody, parseUuidParam } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import type { Agent } from "@/types/agents";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data, error } = await auth.supabase
    .from("agents")
    .select("*")
    .eq("id", idParsed.id)
    .single();

  if (error) {
    if (error.code === "42P01") return NextResponse.json({ error: "Table not ready" }, { status: 503 });
    if (error.code === "PGRST116") return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    return databaseErrorResponse("agents.get", error);
  }
  return NextResponse.json({ agent: data as Agent });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<Record<string, unknown>>(request);
  if (body instanceof NextResponse) return body;

  const allowedFields = ["name", "description", "system_prompt", "tools", "capabilities", "temperature", "max_tokens", "is_active", "tags", "config"];
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of allowedFields) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  const { data, error } = await auth.supabase
    .from("agents")
    .update(updates)
    .eq("id", idParsed.id)
    .eq("user_id", auth.user!.id)
    .select("*")
    .single();

  if (error || !data) return NextResponse.json({ error: "Update failed" }, { status: 404 });
  return NextResponse.json({ agent: data as Agent, message: "Agent updated." });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { error } = await auth.supabase.from("agents").delete().eq("id", idParsed.id).eq("user_id", auth.user!.id);
  if (error) return databaseErrorResponse("agents.delete", error);
  return NextResponse.json({ message: "Agent deleted." });
}
