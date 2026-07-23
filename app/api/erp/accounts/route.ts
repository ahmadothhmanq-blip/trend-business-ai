import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import { listAccounts, createAccount, createJournalEntry, createTransaction } from "@/lib/erp/accounting";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const companyId = new URL(request.url).searchParams.get("companyId") ?? undefined;
  const { data, error } = await listAccounts(auth.supabase, auth.user!.id, companyId ?? undefined);
  if (error) {
    if (/relation/i.test(error.message ?? "")) return NextResponse.json({ accounts: [] });
    return databaseErrorResponse("erp.accounts.list", error);
  }
  return NextResponse.json({ accounts: data ?? [] });
}

const createSchema = z.object({
  companyId: z.string().uuid(),
  code: z.string().min(1),
  name: z.string().min(1),
  accountType: z.enum(["asset", "liability", "equity", "revenue", "expense"]),
});

const journalSchema = z.object({
  action: z.literal("journal"),
  companyId: z.string().uuid(),
  description: z.string().min(1),
  lines: z.array(z.object({
    accountId: z.string().uuid(),
    debitCents: z.number().int().min(0).default(0),
    creditCents: z.number().int().min(0).default(0),
  })).min(2),
});

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const rateLimited = enforceMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const journal = journalSchema.safeParse(body);
  if (journal.success) {
    const { data: entry, error } = await createJournalEntry(auth.supabase, {
      user_id: auth.user!.id,
      company_id: journal.data.companyId,
      description: journal.data.description,
      status: "posted",
      posted_at: new Date().toISOString(),
    });
    if (error) return databaseErrorResponse("erp.journal.create", error);
    for (const line of journal.data.lines) {
      await createTransaction(auth.supabase, {
        user_id: auth.user!.id,
        company_id: journal.data.companyId,
        account_id: line.accountId,
        journal_entry_id: entry?.id,
        debit_cents: line.debitCents,
        credit_cents: line.creditCents,
      });
    }
    return NextResponse.json({ entry });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const { data, error } = await createAccount(auth.supabase, {
    user_id: auth.user!.id,
    company_id: parsed.data.companyId,
    code: parsed.data.code,
    name: parsed.data.name,
    account_type: parsed.data.accountType,
  });
  if (error) return databaseErrorResponse("erp.accounts.create", error);
  return NextResponse.json({ account: data });
}
