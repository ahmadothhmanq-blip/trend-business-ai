import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import { listAccounts, createAccount, updateAccount } from "@/lib/crm/accounts";
import { logCrmAudit } from "@/lib/crm/audit";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1),
  industry: z.string().default(""),
  size: z.string().default(""),
  website: z.string().default(""),
  notes: z.string().default(""),
});

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { data, error } = await listAccounts(auth.supabase, auth.user!.id);
  if (error) {
    if (/relation/i.test(error.message ?? "")) return NextResponse.json({ accounts: [] });
    return databaseErrorResponse("crm.accounts.list", error);
  }
  return NextResponse.json({ accounts: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const rateLimited = enforceMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid" }, { status: 400 });
  }

  const { data, error } = await createAccount(auth.supabase, {
    user_id: auth.user!.id,
    ...parsed.data,
  });
  if (error) return databaseErrorResponse("crm.accounts.create", error);
  await logCrmAudit(auth.supabase, {
    user_id: auth.user!.id,
    action: "account.create",
    entity_type: "account",
    entity_id: data.id,
  });
  return NextResponse.json({ account: data });
}

export async function PATCH(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const body = await parseJsonBody<{ id?: string; name?: string; industry?: string; notes?: string }>(request);
  if (body instanceof NextResponse) return body;
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const { data, error } = await updateAccount(auth.supabase, auth.user!.id, body.id, body);
  if (error) return databaseErrorResponse("crm.accounts.update", error);
  return NextResponse.json({ account: data });
}
