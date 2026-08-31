import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { databaseErrorResponse } from "@/lib/api/errors";
import { beginAiUsage } from "@/lib/api/rate-limit";
import type { AiUsageLease } from "@/lib/billing/ai-usage-settlement";
import {
  listOrganizations,
  createOrganization,
  listDepartments,
  createDepartment,
  generateBusinessPlan,
} from "@/lib/business-manager";
import type { Organization } from "@/types/business-manager";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestAiLanguage } from "@/lib/i18n/api";

const createSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().default(""),
  industry: z.string().default(""),
  brief: z.string().optional(),
  generate: z.boolean().default(false),
  language: z.string().trim().optional(),
  country: z.string().trim().optional(),
});

const deptSchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string().trim().min(1),
  description: z.string().default(""),
});

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data, error } = await listOrganizations(auth.supabase, auth.user!.id);
  if (error) {
    if (/relation/i.test(error.message ?? "")) return NextResponse.json({ organizations: [] });
    return databaseErrorResponse("business-manager.organizations.list", error);
  }
  return NextResponse.json({ organizations: data as Organization[] });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const deptParsed = deptSchema.safeParse(body);
  if (deptParsed.success) {
    const { data, error } = await createDepartment(auth.supabase, {
      user_id: auth.user!.id,
      organization_id: deptParsed.data.organizationId,
      name: deptParsed.data.name,
      description: deptParsed.data.description,
    });
    if (error) return databaseErrorResponse("business-manager.departments.create", error);
    return NextResponse.json({ department: data });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }

  let metadata: Record<string, unknown> = {};
  let creditLease: AiUsageLease | null = null;
  if (parsed.data.generate && parsed.data.brief) {
    const usage = await beginAiUsage(auth.supabase, auth.user!.id, "workspace");
    if (!usage.ok) return usage.response;
    creditLease = usage.lease;
    const language = getRequestAiLanguage(request, parsed.data.language, parsed.data.country);
    const plan = await generateBusinessPlan({
      brief: parsed.data.brief,
      industry: parsed.data.industry,
      language,
    });
    metadata = { generatedPlan: plan };
  }

  const { data, error } = await createOrganization(auth.supabase, {
    user_id: auth.user!.id,
    name: parsed.data.name,
    description: parsed.data.description,
    industry: parsed.data.industry,
    metadata,
  });
  if (error) return databaseErrorResponse("business-manager.organizations.create", error);
  if (creditLease) await creditLease.settle(auth.supabase);
  return NextResponse.json({ organization: data });
}

export async function PATCH(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<{ action?: string; organizationId?: string }>(request);
  if (body instanceof NextResponse) return body;

  if (body.action === "list-departments" && body.organizationId) {
    const { data, error } = await listDepartments(auth.supabase, auth.user!.id, body.organizationId);
    if (error) return databaseErrorResponse("business-manager.departments.list", error);
    return NextResponse.json({ departments: data ?? [] });
  }

  return apiValidationError("Unknown action");
}
