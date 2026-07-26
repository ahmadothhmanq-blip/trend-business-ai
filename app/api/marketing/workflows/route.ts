import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { databaseErrorResponse } from "@/lib/api/errors";
import { listWorkflows, createWorkflow } from "@/lib/marketing";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().trim().min(1),
  campaignId: z.string().uuid().nullable().optional(),
  triggerType: z.string().default("manual"),
  steps: z.array(z.record(z.string(), z.unknown())).default([]),
});

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const campaignId = new URL(request.url).searchParams.get("campaignId") ?? undefined;
  const { data, error } = await listWorkflows(auth.supabase, auth.user!.id, campaignId);

  if (error) {
    if (/relation/i.test(error.message ?? "")) return NextResponse.json({ workflows: [] });
    return databaseErrorResponse("marketing.workflows.list", error);
  }

  return NextResponse.json({ workflows: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }

  const { data, error } = await createWorkflow(auth.supabase, {
    user_id: auth.user!.id,
    campaign_id: parsed.data.campaignId ?? null,
    name: parsed.data.name,
    status: "draft",
    trigger_type: parsed.data.triggerType,
    steps: parsed.data.steps,
  });

  if (error) return databaseErrorResponse("marketing.workflows.insert", error);
  return NextResponse.json({ workflow: data });
}
