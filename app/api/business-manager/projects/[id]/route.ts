import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { getProject, updateProject, archiveProject } from "@/lib/business-manager";
import { NextResponse } from "next/server";
import { z } from "zod";

const patchSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["draft", "active", "on_hold", "completed", "archived"]).optional(),
  progress: z.number().min(0).max(100).optional(),
  ownerName: z.string().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  archive: z.boolean().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id } = await context.params;
  const { data, error } = await getProject(auth.supabase, auth.user!.id, id);
  if (error) return databaseErrorResponse("business-manager.projects.get", error);
  return NextResponse.json({ project: data });
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

  if (parsed.data.archive) {
    const { data, error } = await archiveProject(auth.supabase, auth.user!.id, id);
    if (error) return databaseErrorResponse("business-manager.projects.archive", error);
    return NextResponse.json({ project: data });
  }

  const patch: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) patch.name = parsed.data.name;
  if (parsed.data.description !== undefined) patch.description = parsed.data.description;
  if (parsed.data.status !== undefined) patch.status = parsed.data.status;
  if (parsed.data.progress !== undefined) patch.progress = parsed.data.progress;
  if (parsed.data.ownerName !== undefined) patch.owner_name = parsed.data.ownerName;
  if (parsed.data.startDate !== undefined) patch.start_date = parsed.data.startDate;
  if (parsed.data.endDate !== undefined) patch.end_date = parsed.data.endDate;

  const { data, error } = await updateProject(auth.supabase, auth.user!.id, id, patch);
  if (error) return databaseErrorResponse("business-manager.projects.update", error);
  return NextResponse.json({ project: data });
}
