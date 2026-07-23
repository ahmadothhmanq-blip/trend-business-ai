import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { listTasks, createTask } from "@/lib/crm/tasks";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().default(""),
  contactId: z.string().uuid().nullable().optional(),
  dealId: z.string().uuid().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  reminderAt: z.string().nullable().optional(),
  assigneeName: z.string().default(""),
  priority: z.string().default("medium"),
});

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { data, error } = await listTasks(auth.supabase, auth.user!.id);
  if (error) {
    if (/relation/i.test(error.message ?? "")) return NextResponse.json({ tasks: [] });
    return databaseErrorResponse("crm.tasks.list", error);
  }
  return NextResponse.json({ tasks: data ?? [] });
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
  const { data, error } = await createTask(auth.supabase, {
    user_id: auth.user!.id,
    title: parsed.data.title,
    description: parsed.data.description,
    contact_id: parsed.data.contactId ?? null,
    deal_id: parsed.data.dealId ?? null,
    due_date: parsed.data.dueDate ?? null,
    reminder_at: parsed.data.reminderAt ?? null,
    assignee_name: parsed.data.assigneeName,
    priority: parsed.data.priority,
  });
  if (error) return databaseErrorResponse("crm.tasks.create", error);
  return NextResponse.json({ task: data });
}
