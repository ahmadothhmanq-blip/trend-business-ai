import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import { listCompanies, createCompany, ensureDefaultCompany } from "@/lib/erp/companies";
import { ensureDefaultChartOfAccounts } from "@/lib/erp/accounting";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({ name: z.string().min(1), legalName: z.string().optional(), currency: z.string().optional() });

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { data, error } = await listCompanies(auth.supabase, auth.user!.id);
  if (error) {
    if (/relation/i.test(error.message ?? "")) return NextResponse.json({ companies: [] });
    return databaseErrorResponse("erp.companies.list", error);
  }
  return NextResponse.json({ companies: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const rateLimited = enforceMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const initBody = body as { action?: string };
  if (initBody.action === "ensure-default") {
    const { companyId } = await ensureDefaultCompany(auth.supabase, auth.user!.id);
    await ensureDefaultChartOfAccounts(auth.supabase, auth.user!.id, companyId);
    return NextResponse.json({ companyId });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const { data, error } = await createCompany(auth.supabase, {
    user_id: auth.user!.id,
    name: parsed.data.name,
    legal_name: parsed.data.legalName,
    currency: parsed.data.currency,
  });
  if (error) return databaseErrorResponse("erp.companies.create", error);
  if (data) await ensureDefaultChartOfAccounts(auth.supabase, auth.user!.id, data.id);
  return NextResponse.json({ company: data });
}
