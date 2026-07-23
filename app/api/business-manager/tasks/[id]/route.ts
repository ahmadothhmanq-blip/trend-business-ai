import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { getTask, updateTask } from "@/lib/business-manager";
import { NextResponse } from "next/server";
import { z } from "zod";

const patchSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "review", "done", "blocked"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  assigneeName: z.string().optional(),
  assigneeEmail: z.string().optional(),
  dueDate: z.string().nullable().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id } = await context.params;
  const { data, error } = await getTask(auth.supabase, auth.user!.id, id);
  if (error) return databaseErrorResponse("business-manager.tasks.get", error);
  return NextResponse.json({ task: data });
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id } = await context.params;
  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) patch.title = parsed.data.title;
  if (parsed.data.description !== undefined) patch.description = parsed.data.description;
  if (parsed.data.status !== undefined) patch.status = parsed.data.status;
  if (parsed.data.priority !== undefined) patch.priority = parsed.data.priority;
  if (parsed.data.assigneeName !== undefined) patch.assignee_name = parsed.data.assigneeName;
  if (parsed.data.assigneeEmail !== undefined) patch.assignee_email = parsed.data.assigneeEmail;
  if (parsed.data.dueDate !== undefined) patch.due_date = parsed.data.dueDate;

  const { data, error } = await updateTask(auth.supabase, auth.user!.id, id, patch);
  if (error) return databaseErrorResponse("business-manager.tasks.update", error);
  return NextResponse.json({ task: data });
}
