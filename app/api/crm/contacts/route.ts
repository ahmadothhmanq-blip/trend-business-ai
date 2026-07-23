import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import { listContacts, createContact, updateContact, mergeContacts } from "@/lib/crm/contacts";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  email: z.string().email(),
  firstName: z.string().default(""),
  lastName: z.string().default(""),
  phone: z.string().default(""),
  title: z.string().default(""),
  accountId: z.string().uuid().nullable().optional(),
  lifecycleStage: z
    .enum(["subscriber", "lead", "mql", "sql", "opportunity", "customer", "churned"])
    .optional(),
  tags: z.array(z.string()).optional(),
  customFields: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const accountId = new URL(request.url).searchParams.get("accountId") ?? undefined;
  const { data, error } = await listContacts(auth.supabase, auth.user!.id, accountId);
  if (error) {
    if (/relation/i.test(error.message ?? "")) return NextResponse.json({ contacts: [] });
    return databaseErrorResponse("crm.contacts.list", error);
  }
  return NextResponse.json({ contacts: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const rateLimited = enforceMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const mergeBody = body as { action?: string; primaryId?: string; secondaryId?: string };
  if (mergeBody.action === "merge" && mergeBody.primaryId && mergeBody.secondaryId) {
    const { data, error } = await mergeContacts(
      auth.supabase,
      auth.user!.id,
      mergeBody.primaryId,
      mergeBody.secondaryId,
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ contact: data });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid" }, { status: 400 });
  }

  const { data, error } = await createContact(auth.supabase, {
    user_id: auth.user!.id,
    email: parsed.data.email,
    first_name: parsed.data.firstName,
    last_name: parsed.data.lastName,
    phone: parsed.data.phone,
    title: parsed.data.title,
    account_id: parsed.data.accountId ?? null,
    lifecycle_stage: parsed.data.lifecycleStage,
    tags: parsed.data.tags,
    custom_fields: parsed.data.customFields,
  });
  if (error) return databaseErrorResponse("crm.contacts.create", error);
  return NextResponse.json({ contact: data });
}

export async function PATCH(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const body = await parseJsonBody<{ id?: string } & Record<string, unknown>>(request);
  if (body instanceof NextResponse) return body;
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const patch: Record<string, unknown> = {};
  if (body.firstName !== undefined) patch.first_name = body.firstName;
  if (body.lastName !== undefined) patch.last_name = body.lastName;
  if (body.lifecycleStage !== undefined) patch.lifecycle_stage = body.lifecycleStage;
  if (body.tags !== undefined) patch.tags = body.tags;
  if (body.customFields !== undefined) patch.custom_fields = body.customFields;
  const { data, error } = await updateContact(auth.supabase, auth.user!.id, body.id, patch);
  if (error) return databaseErrorResponse("crm.contacts.update", error);
  return NextResponse.json({ contact: data });
}
