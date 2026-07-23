import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import { listLeads, createLead, updateLead, convertLead } from "@/lib/crm/leads";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  email: z.string().email(),
  name: z.string().default(""),
  company: z.string().default(""),
  phone: z.string().default(""),
  source: z.string().default("manual"),
  message: z.string().default(""),
  assigneeName: z.string().default(""),
  assigneeEmail: z.string().default(""),
});

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const status = new URL(request.url).searchParams.get("status") ?? undefined;
  const { data, error } = await listLeads(auth.supabase, auth.user!.id, status);
  if (error) {
    if (/relation/i.test(error.message ?? "")) return NextResponse.json({ leads: [] });
    return databaseErrorResponse("crm.leads.list", error);
  }
  return NextResponse.json({ leads: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const rateLimited = enforceMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const convertBody = body as { action?: string; leadId?: string; createDeal?: boolean };
  if (convertBody.action === "convert" && convertBody.leadId) {
    const { contact, deal, error } = await convertLead(
      auth.supabase,
      auth.user!.id,
      convertBody.leadId,
      { createDeal: convertBody.createDeal },
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ contact, deal });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid" }, { status: 400 });
  }

  const { data, error } = await createLead(auth.supabase, {
    user_id: auth.user!.id,
    email: parsed.data.email,
    name: parsed.data.name,
    company: parsed.data.company,
    phone: parsed.data.phone,
    source: parsed.data.source,
    message: parsed.data.message,
    assignee_name: parsed.data.assigneeName,
    assignee_email: parsed.data.assigneeEmail,
  });
  if (error) return databaseErrorResponse("crm.leads.create", error);
  return NextResponse.json({ lead: data });
}

export async function PATCH(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const body = await parseJsonBody<{ id?: string; status?: string; assigneeName?: string }>(request);
  if (body instanceof NextResponse) return body;
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const patch: Record<string, unknown> = {};
  if (body.status) patch.status = body.status;
  if (body.assigneeName) patch.assignee_name = body.assigneeName;
  const { data, error } = await updateLead(auth.supabase, auth.user!.id, body.id, patch);
  if (error) return databaseErrorResponse("crm.leads.update", error);
  return NextResponse.json({ lead: data });
}
