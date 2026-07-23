import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { listTasks, createTask } from "@/lib/business-manager";
import type { Task } from "@/types/business-manager";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().default(""),
  projectId: z.string().uuid().nullable().optional(),
  organizationId: z.string().uuid().nullable().optional(),
  status: z.enum(["todo", "in_progress", "review", "done", "blocked"]).default("todo"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  assigneeName: z.string().default(""),
  assigneeEmail: z.string().default(""),
  dueDate: z.string().nullable().optional(),
});

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId") ?? undefined;
  const status = searchParams.get("status") ?? undefined;

  const { data, error } = await listTasks(auth.supabase, auth.user!.id, { projectId, status });
  if (error) {
    if (/relation/i.test(error.message ?? "")) return NextResponse.json({ tasks: [] });
    return databaseErrorResponse("business-manager.tasks.list", error);
  }
  return NextResponse.json({ tasks: data as Task[] });
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

  const { data, error } = await createTask(auth.supabase, {
    user_id: auth.user!.id,
    title: parsed.data.title,
    description: parsed.data.description,
    project_id: parsed.data.projectId ?? null,
    organization_id: parsed.data.organizationId ?? null,
    status: parsed.data.status,
    priority: parsed.data.priority,
    assignee_name: parsed.data.assigneeName,
    assignee_email: parsed.data.assigneeEmail,
    due_date: parsed.data.dueDate ?? null,
  });
  if (error) return databaseErrorResponse("business-manager.tasks.create", error);
  return NextResponse.json({ task: data });
}
