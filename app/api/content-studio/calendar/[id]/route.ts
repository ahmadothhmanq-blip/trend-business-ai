import { requireUser, parseJsonBody, parseUuidParam } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import type { CalendarEntry } from "@/types/content";
import { NextResponse } from "next/server";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  content_type: z.string().trim().optional(),
  description: z.string().trim().optional(),
  scheduled_date: z.string().trim().optional(),
  scheduled_time: z.string().trim().nullable().optional(),
  status: z.enum(["draft", "scheduled", "published", "archived"]).optional(),
  category: z.string().trim().optional(),
  tags: z.array(z.string().trim()).optional(),
  platform: z.string().trim().optional(),
  generation_id: z.string().uuid().nullable().optional(),
  notes: z.string().trim().optional(),
});

export async function PATCH(request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid update" }, { status: 400 });

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const [key, value] of Object.entries(parsed.data)) {
    if (value !== undefined) updates[key] = value;
  }

  const { data, error } = await auth.supabase
    .from("content_calendar")
    .update(updates)
    .eq("id", idParsed.id).eq("user_id", auth.user!.id)
    .select("*").single();

  if (error || !data) return NextResponse.json({ error: "Calendar entry not found" }, { status: 404 });
  return NextResponse.json({ entry: data as CalendarEntry, message: "Updated." });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data, error } = await auth.supabase
    .from("content_calendar")
    .delete()
    .eq("id", idParsed.id).eq("user_id", auth.user!.id)
    .select("id").single();

  if (error || !data) return NextResponse.json({ error: "Calendar entry not found" }, { status: 404 });
  return NextResponse.json({ message: "Calendar entry deleted." });
}
