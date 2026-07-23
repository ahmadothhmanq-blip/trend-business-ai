import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import { listApprovals, createApproval, updateApprovalStatus } from "@/lib/erp/procurement";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  companyId: z.string().uuid(),
  entityType: z.string().min(1),
  entityId: z.string().uuid(),
  title: z.string().min(1),
  requestedBy: z.string().optional(),
});

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const companyId = new URL(request.url).searchParams.get("companyId") ?? undefined;
  const { data, error } = await listApprovals(auth.supabase, auth.user!.id, companyId ?? undefined);
  if (error) {
    if (/relation/i.test(error.message ?? "")) return NextResponse.json({ approvals: [] });
    return databaseErrorResponse("erp.approvals.list", error);
  }
  return NextResponse.json({ approvals: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const rateLimited = enforceMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const patchBody = body as { action?: string; id?: string; status?: "approved" | "rejected"; reviewedBy?: string };
  if (patchBody.action === "review" && patchBody.id && patchBody.status) {
    const { data, error } = await updateApprovalStatus(
      auth.supabase,
      auth.user!.id,
      patchBody.id,
      patchBody.status,
      patchBody.reviewedBy ?? "admin",
    );
    if (error) return databaseErrorResponse("erp.approvals.update", error);
    return NextResponse.json({ approval: data });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const { data, error } = await createApproval(auth.supabase, {
    user_id: auth.user!.id,
    company_id: parsed.data.companyId,
    entity_type: parsed.data.entityType,
    entity_id: parsed.data.entityId,
    title: parsed.data.title,
    requested_by: parsed.data.requestedBy ?? "",
  });
  if (error) return databaseErrorResponse("erp.approvals.create", error);
  return NextResponse.json({ approval: data });
}
