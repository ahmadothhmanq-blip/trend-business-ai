import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { getMergedCalendar, createCalendarEvent } from "@/lib/marketing";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().trim().min(1),
  eventType: z.enum(["campaign", "content", "launch", "task", "email", "social", "ads"]).default("task"),
  scheduledAt: z.string(),
  endAt: z.string().nullable().optional(),
  campaignId: z.string().uuid().nullable().optional(),
  status: z.string().default("pending"),
});

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;

  const { events, error } = await getMergedCalendar(auth.supabase, auth.user!.id, from && to ? { from, to } : undefined);

  if (error) {
    if (/relation/i.test(error.message ?? "")) return NextResponse.json({ events: [] });
    return databaseErrorResponse("marketing.calendar.list", error);
  }

  return NextResponse.json({ events });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { data, error } = await createCalendarEvent(auth.supabase, {
    user_id: auth.user!.id,
    campaign_id: parsed.data.campaignId ?? null,
    title: parsed.data.title,
    event_type: parsed.data.eventType,
    scheduled_at: parsed.data.scheduledAt,
    end_at: parsed.data.endAt ?? null,
    status: parsed.data.status,
    source: "marketing",
  });

  if (error) return databaseErrorResponse("marketing.calendar.insert", error);
  return NextResponse.json({ event: data });
}
