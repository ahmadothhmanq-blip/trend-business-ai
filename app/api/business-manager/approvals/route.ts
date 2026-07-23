import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { listApprovals, createApproval, updateApproval } from "@/lib/business-manager";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().default(""),
  workflowId: z.string().uuid().nullable().optional(),
  projectId: z.string().uuid().nullable().optional(),
  requesterName: z.string().default(""),
  reviewerName: z.string().default(""),
  reviewerEmail: z.string().default(""),
});

const patchSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "approved", "rejected", "cancelled"]),
  notes: z.string().optional(),
});

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const status = new URL(request.url).searchParams.get("status") ?? undefined;
  const { data, error } = await listApprovals(auth.supabase, auth.user!.id, { status });
  if (error) {
    if (/relation/i.test(error.message ?? "")) return NextResponse.json({ approvals: [] });
    return databaseErrorResponse("business-manager.approvals.list", error);
  }
  return NextResponse.json({ approvals: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const patchParsed = patchSchema.safeParse(body);
  if (patchParsed.success) {
    const { data, error } = await updateApproval(auth.supabase, auth.user!.id, patchParsed.data.id, {
      status: patchParsed.data.status,
      notes: patchParsed.data.notes ?? "",
    });
    if (error) return databaseErrorResponse("business-manager.approvals.update", error);
    return NextResponse.json({ approval: data });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { data, error } = await createApproval(auth.supabase, {
    user_id: auth.user!.id,
    title: parsed.data.title,
    description: parsed.data.description,
    workflow_id: parsed.data.workflowId ?? null,
    project_id: parsed.data.projectId ?? null,
    requester_name: parsed.data.requesterName,
    reviewer_name: parsed.data.reviewerName,
    reviewer_email: parsed.data.reviewerEmail,
  });
  if (error) return databaseErrorResponse("business-manager.approvals.create", error);
  return NextResponse.json({ approval: data });
}
