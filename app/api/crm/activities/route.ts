import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { listActivities, recordActivity } from "@/lib/crm/activities";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  activityType: z.enum(["call", "meeting", "email", "note", "task", "system"]),
  subject: z.string().default(""),
  body: z.string().default(""),
  contactId: z.string().uuid().nullable().optional(),
  dealId: z.string().uuid().nullable().optional(),
  leadId: z.string().uuid().nullable().optional(),
  durationMinutes: z.number().int().nullable().optional(),
});

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const url = new URL(request.url);
  const { data, error } = await listActivities(auth.supabase, auth.user!.id, {
    contactId: url.searchParams.get("contactId") ?? undefined,
    dealId: url.searchParams.get("dealId") ?? undefined,
    leadId: url.searchParams.get("leadId") ?? undefined,
  });
  if (error) {
    if (/relation/i.test(error.message ?? "")) return NextResponse.json({ activities: [] });
    return databaseErrorResponse("crm.activities.list", error);
  }
  return NextResponse.json({ activities: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid" }, { status: 400 });
  }
  const { data, error } = await recordActivity(auth.supabase, {
    user_id: auth.user!.id,
    activity_type: parsed.data.activityType,
    subject: parsed.data.subject,
    body: parsed.data.body,
    contact_id: parsed.data.contactId ?? null,
    deal_id: parsed.data.dealId ?? null,
    lead_id: parsed.data.leadId ?? null,
    duration_minutes: parsed.data.durationMinutes ?? null,
  });
  if (error) return databaseErrorResponse("crm.activities.create", error);
  return NextResponse.json({ activity: data });
}
