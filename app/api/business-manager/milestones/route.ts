import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { listMilestones, createMilestone, updateMilestone } from "@/lib/business-manager";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().trim().min(1),
  description: z.string().default(""),
  targetDate: z.string().nullable().optional(),
  status: z.enum(["pending", "in_progress", "completed", "missed"]).default("pending"),
});

const patchSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "in_progress", "completed", "missed"]).optional(),
  title: z.string().optional(),
  targetDate: z.string().nullable().optional(),
});

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const projectId = new URL(request.url).searchParams.get("projectId") ?? undefined;
  const { data, error } = await listMilestones(auth.supabase, auth.user!.id, projectId);
  if (error) {
    if (/relation/i.test(error.message ?? "")) return NextResponse.json({ milestones: [] });
    return databaseErrorResponse("business-manager.milestones.list", error);
  }
  return NextResponse.json({ milestones: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const patchParsed = patchSchema.safeParse(body);
  if (patchParsed.success && patchParsed.data.id) {
    const patch: Record<string, unknown> = {};
    if (patchParsed.data.status) patch.status = patchParsed.data.status;
    if (patchParsed.data.title) patch.title = patchParsed.data.title;
    if (patchParsed.data.targetDate !== undefined) patch.target_date = patchParsed.data.targetDate;
    const { data, error } = await updateMilestone(
      auth.supabase,
      auth.user!.id,
      patchParsed.data.id,
      patch,
    );
    if (error) return databaseErrorResponse("business-manager.milestones.update", error);
    return NextResponse.json({ milestone: data });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { data, error } = await createMilestone(auth.supabase, {
    user_id: auth.user!.id,
    project_id: parsed.data.projectId,
    title: parsed.data.title,
    description: parsed.data.description,
    target_date: parsed.data.targetDate ?? null,
    status: parsed.data.status,
  });
  if (error) return databaseErrorResponse("business-manager.milestones.create", error);
  return NextResponse.json({ milestone: data });
}
